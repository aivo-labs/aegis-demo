/**
 * Aegis Sandbox Replay Composable (Singleton Store & PHP2Shell Replay Engine)
 * Fournit un replayer de trafic et télémétrie en boucle (100% in-browser, zéro dépendance API)
 * Inclut le Replay Comparatif Matériel de l'attaque PHP2Shell (CVE-2024-4577 & CVE-2026-109618) :
 * - Avec Bouclier Aegis : 602/602 HTTP 403, 0% CPU cible, 5.81 W moyen (101.04 J)
 * - Sans Bouclier (PHP-FPM 8.3 exposé) : 126/126 HTTP 200 compromis, 743.4% CPU pic, 24.14 W moyen (438.91 J)
 */

import { ref, computed, onMounted, onUnmounted, getCurrentInstance } from 'vue';
import {
  SANDBOX_INITIAL_METRICS,
  REPLAY_ATTACK_SEEDS,
  PHP2SHELL_BENCHMARK_DATASET,
  type SandboxSummaryMetrics,
  type ReplaySeedEvent,
  type Php2ShellBenchmarkSeriesPoint,
} from '../data/sandboxFixtures';
import type { IngressEvent, EgressEvent } from '../services/api/streamsApi';
import type { ThreatEvent } from '../components/soc/cockpit/CockpitThreatLogsDrawer.vue';
import type { SandboxInspectionResult, SandboxRequest } from '../services/sandboxEngine';

export interface Php2ShellReplayState {
  isRunning: boolean;
  isCompleted: boolean;
  activeSimMode: 'with_shield' | 'without_shield';
  currentSecond: number;
  totalSeconds: number;
  progressPct: number;
  withShieldLive: {
    watts: number;
    cpuPct: number;
    blocked403: number;
    joules: number;
  };
  withoutShieldLive: {
    watts: number;
    cpuPct: number;
    compromised200: number;
    joules: number;
  };
  history: Php2ShellBenchmarkSeriesPoint[];
}

// État réactif partagé (Singleton pour synchroniser Cockpit, Flux Live, Kanban et Fuzzer)
const isPlaying = ref(true);
const sandboxProtectionEnabled = ref(true);
const metrics = ref<SandboxSummaryMetrics>(JSON.parse(JSON.stringify(SANDBOX_INITIAL_METRICS)));
const animatedWatts = ref(8.84);
const threats = ref<ThreatEvent[]>([]);
const ingressStream = ref<IngressEvent[]>([]);
const egressStream = ref<EgressEvent[]>([]);
const mapEvents = ref<any[]>([]);

const php2ShellReplay = ref<Php2ShellReplayState>({
  isRunning: false,
  isCompleted: true,
  activeSimMode: 'with_shield',
  currentSecond: 15,
  totalSeconds: PHP2SHELL_BENCHMARK_DATASET.durationSeconds,
  progressPct: 100,
  withShieldLive: {
    watts: PHP2SHELL_BENCHMARK_DATASET.withShield.raplAvgWatts,
    cpuPct: PHP2SHELL_BENCHMARK_DATASET.withShield.targetCpuAvgPct,
    blocked403: PHP2SHELL_BENCHMARK_DATASET.withShield.http403Blocked,
    joules: PHP2SHELL_BENCHMARK_DATASET.withShield.totalEnergyJoules,
  },
  withoutShieldLive: {
    watts: PHP2SHELL_BENCHMARK_DATASET.withoutShield.raplAvgWatts,
    cpuPct: PHP2SHELL_BENCHMARK_DATASET.withoutShield.targetCpuPeakPct,
    compromised200: PHP2SHELL_BENCHMARK_DATASET.withoutShield.http200Compromised,
    joules: PHP2SHELL_BENCHMARK_DATASET.withoutShield.totalEnergyJoules,
  },
  history: [...PHP2SHELL_BENCHMARK_DATASET.timeline],
});

let intervalTimer: ReturnType<typeof setInterval> | null = null;
let php2ShellTimer: ReturnType<typeof setInterval> | null = null;
let seedIndex = 0;
let initialized = false;
let activeSubscribers = 0;

// Convertit un seed en ThreatEvent pour le tiroir
function seedToThreat(seed: ReplaySeedEvent, id: string, isoDate: string, isShieldActive: boolean): ThreatEvent {
  const isAttack = seed.decision !== 'ALLOW';
  const effectiveAction = !isShieldActive && isAttack
    ? 'BYPASS'
    : (seed.decision === 'SINKHOLE' ? 'BLOCK' : seed.decision);
  return {
    id,
    timestamp: isoDate,
    client_ip: seed.client_ip,
    fqdn: seed.target,
    action: effectiveAction,
    threat_type: seed.threat_type,
    latency_ms: !isShieldActive && isAttack ? 2619.57 : seed.latency_ms,
  };
}

// Convertit un seed en IngressEvent
function seedToIngress(seed: ReplaySeedEvent, id: string, isoDate: string, isShieldActive: boolean): IngressEvent {
  const isAttack = seed.decision !== 'ALLOW';
  const effectiveDecision = !isShieldActive && isAttack
    ? 'BYPASS'
    : (seed.decision === 'SINKHOLE' ? 'BLOCK' : seed.decision);
  return {
    id,
    client_ip: seed.client_ip,
    method: seed.method,
    target: seed.target,
    host: seed.host,
    domain: seed.host,
    user_agent: seed.user_agent,
    threat_type: seed.threat_type,
    category: seed.category,
    decision: effectiveDecision,
    status_code: !isShieldActive && isAttack ? 200 : seed.status_code,
    timestamp: isoDate,
    lat: seed.lat,
    lon: seed.lon,
    country: seed.country,
    entropy: seed.entropy,
    latency_ms: !isShieldActive && isAttack ? 2619.57 : seed.latency_ms,
  };
}

// Convertit un seed en EgressEvent si c'est un flux sortant / DGA
function seedToEgress(seed: ReplaySeedEvent, id: string, isoDate: string, isShieldActive: boolean): EgressEvent {
  return {
    id,
    protocol: 'DNS',
    domain: seed.target.replace('/dns-query?name=', '').replace('&type=A', ''),
    target: seed.target,
    target_ip: isShieldActive ? '0.0.0.0' : '185.220.101.33',
    client_ip: seed.client_ip,
    port: isShieldActive ? 53 : 4444,
    decision: isShieldActive ? 'BLOCK' : 'BYPASS',
    threat_type: seed.threat_type,
    entropy: seed.entropy,
    timestamp: isoDate,
    latency_ms: seed.latency_ms,
    exfil_probability: 0.98,
  };
}

// Génère un nouveau battement de flux (tick de replay)
function emitReplayTick(forcedSeed?: ReplaySeedEvent) {
  const seed = forcedSeed || REPLAY_ATTACK_SEEDS[seedIndex % REPLAY_ATTACK_SEEDS.length];
  if (!forcedSeed) seedIndex++;

  const isShieldActive = sandboxProtectionEnabled.value;
  const now = new Date();
  const isoDate = now.toISOString();
  const id = `sandbox-evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const threatItem = seedToThreat(seed, id, isoDate, isShieldActive);
  const ingressItem = seedToIngress(seed, id, isoDate, isShieldActive);

  threats.value = [threatItem, ...threats.value].slice(0, 30);
  ingressStream.value = [ingressItem, ...ingressStream.value].slice(0, 40);

  if (seed.decision === 'SINKHOLE' || seed.category.includes('Egress') || seed.category.includes('PHP2Shell')) {
    const egressSeed: ReplaySeedEvent = seed.decision === 'SINKHOLE'
      ? seed
      : {
          ...seed,
          target: '/dns-query?name=c2-php2shell-reverse.a8f93bc01d9f4e2a.xyz&type=A',
          threat_type: 'DGA_EGRESS_SINKHOLE',
        };
    const egressItem = seedToEgress(egressSeed, `${id}-egress`, isoDate, isShieldActive);
    egressStream.value = [egressItem, ...egressStream.value].slice(0, 40);
  }

  const mapItem = {
    client_ip: seed.client_ip,
    target: seed.target,
    threat_type: seed.threat_type,
    action: !isShieldActive && seed.decision !== 'ALLOW' ? 'BYPASS' : seed.decision,
    lat: seed.lat,
    lon: seed.lon,
    city: seed.city,
    country: seed.country,
  };
  mapEvents.value = [mapItem, ...mapEvents.value].slice(0, 25);

  metrics.value.traffic.total_requests_24h += 1;
  metrics.value.traffic.ingress_total += 1;

  if (seed.decision === 'BLOCK' || seed.decision === 'SINKHOLE') {
    if (isShieldActive) {
      metrics.value.traffic.blocked_threats_total += 1;
      metrics.value.traffic.ingress_blocked += 1;
      if (seed.threat_type.includes('CMS_PHP') || seed.threat_type.includes('SCANNER')) {
        metrics.value.traffic.bot_probes_total += 1;
      }
      if (seed.decision === 'SINKHOLE' || seed.category.includes('PHP2Shell')) {
        metrics.value.soc.c2_callbacks_blocked_total += 1;
        metrics.value.traffic.egress_blocked += 1;
      }
    } else {
      metrics.value.traffic.compromised_bypass_total += 1;
      metrics.value.traffic.ingress_bypassed += 1;
      metrics.value.traffic.egress_bypassed += 1;
    }
  }

  if (!php2ShellReplay.value.isRunning) {
    if (isShieldActive) {
      const jitter = (Math.sin(Date.now() / 1500) * 0.22) + ((Math.random() - 0.5) * 0.12);
      const newWatts = parseFloat((8.75 + jitter).toFixed(2));
      animatedWatts.value = newWatts;
      metrics.value.green.instant_power_watts = newWatts;
    } else {
      const jitter = (Math.sin(Date.now() / 600) * 3.4) + ((Math.random() - 0.5) * 2.1);
      const newWatts = parseFloat((24.14 + jitter).toFixed(2));
      animatedWatts.value = newWatts;
      metrics.value.green.instant_power_watts = newWatts;
    }
  }
}

// Bascule entre Bouclier ACTIF (5.81 W / 8.84 W) et DÉSACTIVÉ (compromission PHP2Shell 24.14 W)
function setSandboxProtectionMode(enabled: boolean) {
  sandboxProtectionEnabled.value = enabled;
  php2ShellReplay.value.activeSimMode = enabled ? 'with_shield' : 'without_shield';

  if (enabled) {
    metrics.value.traffic.compromised_bypass_total = 0;
    metrics.value.traffic.ingress_bypassed = 0;
    metrics.value.traffic.egress_bypassed = 0;
    metrics.value.soc.si_health_score = 99.4;
    metrics.value.soc.interception_rate_pct = 99.98;
    metrics.value.green.instant_power_watts = 8.84;
    metrics.value.green.cpu_watts = 6.12;
    metrics.value.green.ram_watts = 2.72;
    metrics.value.green.eco_index_score = 92.4;
    metrics.value.green.eco_index_grade = 'A';
    animatedWatts.value = 8.84;
    metrics.value.soc.monitored_nodes = metrics.value.soc.monitored_nodes.map((n, idx) => ({
      ...n,
      status: 'active',
      cpu_load_pct: idx === 0 ? 3.2 : 4.8,
      rapl_watts: idx === 0 ? 8.78 : 9.15,
      watts: idx === 0 ? 8.78 : 9.15,
      pep_enabled: true,
    }));
  } else {
    // Simulation de l'état Sans Bouclier sous attaque PHP2Shell (CVE-2024-4577)
    metrics.value.traffic.compromised_bypass_total = 126;
    metrics.value.traffic.ingress_bypassed = 126;
    metrics.value.traffic.egress_bypassed = 42;
    metrics.value.soc.si_health_score = 18.5;
    metrics.value.soc.interception_rate_pct = 0.0;
    metrics.value.green.instant_power_watts = 24.14;
    metrics.value.green.cpu_watts = 20.42;
    metrics.value.green.ram_watts = 3.72;
    metrics.value.green.eco_index_score = 24.0;
    metrics.value.green.eco_index_grade = 'F';
    animatedWatts.value = 24.14;
    metrics.value.soc.monitored_nodes = metrics.value.soc.monitored_nodes.map((n, idx) => ({
      ...n,
      status: 'warning',
      cpu_load_pct: idx === 0 ? 743.4 : 537.9,
      rapl_watts: idx === 0 ? 37.58 : 24.14,
      watts: idx === 0 ? 37.58 : 24.14,
      pep_enabled: false,
    }));
    // Émettre immédiatement la salve PHP2Shell en mode compromis
    emitReplayTick(REPLAY_ATTACK_SEEDS[0]);
    emitReplayTick(REPLAY_ATTACK_SEEDS[1]);
    metrics.value.green.instant_power_watts = 24.14;
    animatedWatts.value = 24.14;
    metrics.value.traffic.compromised_bypass_total = 126;
  }
}

// Lance le Replay Comparatif Matériel PHP2Shell (15 secondes accélérées en temps réel)
function startPhp2ShellBenchmarkReplay(simMode?: 'with_shield' | 'without_shield') {
  if (php2ShellTimer) {
    clearInterval(php2ShellTimer);
    php2ShellTimer = null;
  }

  if (simMode) {
    setSandboxProtectionMode(simMode === 'with_shield');
  }

  const timeline = PHP2SHELL_BENCHMARK_DATASET.timeline;
  let stepIdx = 0;

  php2ShellReplay.value = {
    isRunning: true,
    isCompleted: false,
    activeSimMode: sandboxProtectionEnabled.value ? 'with_shield' : 'without_shield',
    currentSecond: 0,
    totalSeconds: PHP2SHELL_BENCHMARK_DATASET.durationSeconds,
    progressPct: 0,
    withShieldLive: {
      watts: 5.42,
      cpuPct: 0,
      blocked403: 0,
      joules: 0,
    },
    withoutShieldLive: {
      watts: 14.80,
      cpuPct: 210.4,
      compromised200: 0,
      joules: 0,
    },
    history: [],
  };

  let accWithJoules = 0;
  let accWithoutJoules = 0;

  php2ShellTimer = setInterval(() => {
    if (stepIdx >= timeline.length) {
      if (php2ShellTimer) {
        clearInterval(php2ShellTimer);
        php2ShellTimer = null;
      }
      php2ShellReplay.value.isRunning = false;
      php2ShellReplay.value.isCompleted = true;
      php2ShellReplay.value.progressPct = 100;
      php2ShellReplay.value.withShieldLive = {
        watts: PHP2SHELL_BENCHMARK_DATASET.withShield.raplAvgWatts,
        cpuPct: PHP2SHELL_BENCHMARK_DATASET.withShield.targetCpuAvgPct,
        blocked403: PHP2SHELL_BENCHMARK_DATASET.withShield.http403Blocked,
        joules: PHP2SHELL_BENCHMARK_DATASET.withShield.totalEnergyJoules,
      };
      php2ShellReplay.value.withoutShieldLive = {
        watts: PHP2SHELL_BENCHMARK_DATASET.withoutShield.raplAvgWatts,
        cpuPct: PHP2SHELL_BENCHMARK_DATASET.withoutShield.targetCpuPeakPct,
        compromised200: PHP2SHELL_BENCHMARK_DATASET.withoutShield.http200Compromised,
        joules: PHP2SHELL_BENCHMARK_DATASET.withoutShield.totalEnergyJoules,
      };
      return;
    }

    const pt = timeline[stepIdx];
    stepIdx++;

    accWithJoules = parseFloat(
      Math.min(PHP2SHELL_BENCHMARK_DATASET.withShield.totalEnergyJoules, accWithJoules + pt.withShieldWatts * 1.1).toFixed(2)
    );
    accWithoutJoules = parseFloat(
      Math.min(PHP2SHELL_BENCHMARK_DATASET.withoutShield.totalEnergyJoules, accWithoutJoules + pt.withoutShieldWatts * 1.2).toFixed(2)
    );

    php2ShellReplay.value.currentSecond = pt.second;
    php2ShellReplay.value.progressPct = Math.round((pt.second / PHP2SHELL_BENCHMARK_DATASET.durationSeconds) * 100);
    php2ShellReplay.value.withShieldLive = {
      watts: pt.withShieldWatts,
      cpuPct: pt.withShieldCpuPct,
      blocked403: pt.withShieldBlocked,
      joules: accWithJoules,
    };
    php2ShellReplay.value.withoutShieldLive = {
      watts: pt.withoutShieldWatts,
      cpuPct: pt.withoutShieldCpuPct,
      compromised200: pt.withoutShieldCompromised,
      joules: accWithoutJoules,
    };
    php2ShellReplay.value.history = [...php2ShellReplay.value.history, pt];

    // Injecter les vecteurs PHP2Shell (CVE-2024-4577 & CVE-2026-109618) dans le flux live et la carte
    const phpSeed = stepIdx % 2 === 1 ? REPLAY_ATTACK_SEEDS[0] : REPLAY_ATTACK_SEEDS[1];
    emitReplayTick(phpSeed);

    // Mettre à jour la jauge RAPL principale selon le mode actif
    const activeWatts = sandboxProtectionEnabled.value ? pt.withShieldWatts : pt.withoutShieldWatts;
    animatedWatts.value = activeWatts;
    metrics.value.green.instant_power_watts = activeWatts;
  }, 550);
}

function stopPhp2ShellBenchmarkReplay() {
  if (php2ShellTimer) {
    clearInterval(php2ShellTimer);
    php2ShellTimer = null;
  }
  php2ShellReplay.value.isRunning = false;
}

// Permet d'injecter immédiatement le résultat d'un test Fuzzer dans le replayer partagé !
function injectCustomInspectionEvent(result: SandboxInspectionResult, req: SandboxRequest) {
  const now = new Date();
  const isoDate = now.toISOString();
  const id = `fuzzer-live-${Date.now()}`;

  const clientIp = '127.0.0.1 (Fuzzer)';
  const threatItem: ThreatEvent = {
    id,
    timestamp: isoDate,
    client_ip: clientIp,
    fqdn: req.url || '/',
    action: result.verdict === 'SINKHOLE' ? 'BLOCK' : result.verdict,
    threat_type: result.threatType,
    latency_ms: result.latencyMs,
  };

  const ingressItem: IngressEvent = {
    id,
    client_ip: clientIp,
    method: req.method,
    target: req.url || '/',
    host: 'demo.aegis.aivo.fr',
    domain: 'demo.aegis.aivo.fr',
    user_agent: req.headers['User-Agent'] || req.headers['user-agent'] || 'Aegis Interactive Fuzzer',
    threat_type: result.threatType,
    category: result.ruleName,
    decision: result.verdict === 'SINKHOLE' ? 'BLOCK' : result.verdict,
    status_code: result.httpStatus,
    timestamp: isoDate,
    lat: 48.8566,
    lon: 2.3522,
    country: 'France',
    entropy: result.entropy.value,
    latency_ms: result.latencyMs,
  };

  threats.value = [threatItem, ...threats.value].slice(0, 30);
  ingressStream.value = [ingressItem, ...ingressStream.value].slice(0, 40);

  if (result.verdict === 'SINKHOLE') {
    const egressItem: EgressEvent = {
      id: `${id}-egress`,
      protocol: 'DNS',
      domain: (req.url || '').replace('/dns-query?name=', '').replace('&type=A', ''),
      target: req.url || '/',
      target_ip: '0.0.0.0',
      client_ip: clientIp,
      port: 53,
      decision: 'BLOCK',
      threat_type: result.threatType,
      entropy: result.entropy.value,
      timestamp: isoDate,
      latency_ms: result.latencyMs,
      exfil_probability: 0.99,
    };
    egressStream.value = [egressItem, ...egressStream.value].slice(0, 40);
  }

  const mapItem = {
    client_ip: clientIp,
    target: req.url || '/',
    threat_type: result.threatType,
    action: result.verdict,
    lat: 48.8566 + (Math.random() - 0.5) * 0.1,
    lon: 2.3522 + (Math.random() - 0.5) * 0.1,
    city: 'Paris (Fuzzer Lab)',
    country: 'France',
  };
  mapEvents.value = [mapItem, ...mapEvents.value].slice(0, 25);

  metrics.value.traffic.total_requests_24h += 1;
  metrics.value.traffic.ingress_total += 1;
  if (result.verdict !== 'ALLOW') {
    metrics.value.traffic.blocked_threats_total += 1;
    metrics.value.traffic.ingress_blocked += 1;
  }
}

function ensureInitialized() {
  if (!initialized) {
    initialized = true;
    for (let i = 0; i < 8; i++) {
      emitReplayTick();
    }
  }
}

export function useSandboxReplay() {
  ensureInitialized();

  // Calcul du tracé SVG de la courbe de puissance (compatible CockpitColumnsGrid)
  const dynamicPowerPath = computed(() => {
    const history = metrics.value.green.power_history || [];
    if (history.length >= 2) {
      const stepX = 440 / (history.length - 1);
      const points = history.map((pt, idx) => {
        const x = Math.round(40 + idx * stepX);
        const w = Number(pt.watts) || 0;
        const y = Math.max(25, Math.min(155, Math.round(160 - (w * 6))));
        return `${x},${y}`;
      });
      return `M ${points.join(' L ')}`;
    }
    const w = animatedWatts.value || 0;
    const y = w > 0 ? Math.max(25, Math.min(155, Math.round(160 - (w * 6)))) : 150;
    return `M 40,${y} L 480,${y}`;
  });

  function startReplay() {
    if (intervalTimer) return;
    intervalTimer = setInterval(() => {
      if (isPlaying.value && !php2ShellReplay.value.isRunning) {
        emitReplayTick();
      }
    }, 2200);
  }

  function stopReplay() {
    if (intervalTimer && activeSubscribers <= 0) {
      clearInterval(intervalTimer);
      intervalTimer = null;
    }
  }

  function toggleReplay() {
    isPlaying.value = !isPlaying.value;
  }

  if (getCurrentInstance()) {
    onMounted(() => {
      activeSubscribers++;
      startReplay();
    });

    onUnmounted(() => {
      activeSubscribers = Math.max(0, activeSubscribers - 1);
      stopReplay();
    });
  }

  return {
    isPlaying,
    sandboxProtectionEnabled,
    metrics,
    animatedWatts,
    dynamicPowerPath,
    threats,
    ingressStream,
    egressStream,
    mapEvents,
    php2ShellReplay,
    php2ShellDataset: PHP2SHELL_BENCHMARK_DATASET,
    toggleReplay,
    emitReplayTick,
    injectCustomInspectionEvent,
    setSandboxProtectionMode,
    startPhp2ShellBenchmarkReplay,
    stopPhp2ShellBenchmarkReplay,
  };
}

