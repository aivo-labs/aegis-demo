/**
 * Aegis Sandbox Replay Composable
 * Fournit un replayer de trafic et télémétrie en boucle (100% in-browser, zéro dépendance API)
 * Simule l'activité du VPS, anime la carte Leaflet et les compteurs d'énergie RAPL.
 */

import { ref, computed, onMounted, onUnmounted } from 'vue';
import {
  SANDBOX_INITIAL_METRICS,
  REPLAY_ATTACK_SEEDS,
  type SandboxSummaryMetrics,
  type ReplaySeedEvent,
} from '../data/sandboxFixtures';
import type { IngressEvent, EgressEvent } from '../services/api/streamsApi';
import type { ThreatEvent } from '../components/soc/cockpit/CockpitThreatLogsDrawer.vue';
import type { SandboxInspectionResult, SandboxRequest } from '../services/sandboxEngine';

export function useSandboxReplay() {
  const isPlaying = ref(true);
  const metrics = ref<SandboxSummaryMetrics>(JSON.parse(JSON.stringify(SANDBOX_INITIAL_METRICS)));
  const animatedWatts = ref(8.84);
  const threats = ref<ThreatEvent[]>([]);
  const ingressStream = ref<IngressEvent[]>([]);
  const egressStream = ref<EgressEvent[]>([]);
  const mapEvents = ref<any[]>([]);

  let intervalTimer: any = null;
  let seedIndex = 0;

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

  // Convertit un seed en ThreatEvent pour le tiroir
  function seedToThreat(seed: ReplaySeedEvent, id: string, isoDate: string): ThreatEvent {
    return {
      id,
      timestamp: isoDate,
      client_ip: seed.client_ip,
      fqdn: seed.target,
      action: seed.decision === 'SINKHOLE' ? 'BLOCK' : seed.decision,
      threat_type: seed.threat_type,
      latency_ms: seed.latency_ms,
    };
  }

  // Convertit un seed en IngressEvent
  function seedToIngress(seed: ReplaySeedEvent, id: string, isoDate: string): IngressEvent {
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
      decision: seed.decision === 'SINKHOLE' ? 'BLOCK' : seed.decision,
      status_code: seed.status_code,
      timestamp: isoDate,
      lat: seed.lat,
      lon: seed.lon,
      country: seed.country,
      entropy: seed.entropy,
      latency_ms: seed.latency_ms,
    };
  }

  // Convertit un seed en EgressEvent si c'est un flux sortant / DGA
  function seedToEgress(seed: ReplaySeedEvent, id: string, isoDate: string): EgressEvent {
    return {
      id,
      protocol: 'DNS',
      domain: seed.target.replace('/dns-query?name=', '').replace('&type=A', ''),
      target: seed.target,
      target_ip: '0.0.0.0',
      client_ip: seed.client_ip,
      port: 53,
      decision: 'BLOCK',
      threat_type: seed.threat_type,
      entropy: seed.entropy,
      timestamp: isoDate,
      latency_ms: seed.latency_ms,
      exfil_probability: 0.98,
    };
  }

  // Génère un nouveau battement de flux (tick de replay)
  function emitReplayTick() {
    const seed = REPLAY_ATTACK_SEEDS[seedIndex % REPLAY_ATTACK_SEEDS.length];
    seedIndex++;

    const now = new Date();
    const isoDate = now.toISOString();
    const id = `sandbox-evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const threatItem = seedToThreat(seed, id, isoDate);
    const ingressItem = seedToIngress(seed, id, isoDate);

    // Mise à jour de la liste de menaces du tiroir (garde les 30 derniers)
    threats.value = [threatItem, ...threats.value].slice(0, 30);

    // Mise à jour des flux Ingress
    ingressStream.value = [ingressItem, ...ingressStream.value].slice(0, 40);

    // Si flux sortant / DNS DGA, ajouter aussi à l'Egress
    if (seed.decision === 'SINKHOLE' || seed.category.includes('Egress')) {
      const egressItem = seedToEgress(seed, id, isoDate);
      egressStream.value = [egressItem, ...egressStream.value].slice(0, 40);
    }

    // Mise à jour de la carte Leaflet
    const mapItem = {
      client_ip: seed.client_ip,
      target: seed.target,
      threat_type: seed.threat_type,
      action: seed.decision,
      lat: seed.lat,
      lon: seed.lon,
      city: seed.city,
      country: seed.country,
    };
    mapEvents.value = [mapItem, ...mapEvents.value].slice(0, 25);

    // Mise à jour incrémentale fluide des compteurs
    metrics.value.traffic.total_requests_24h += 1;
    if (seed.decision === 'BLOCK' || seed.decision === 'SINKHOLE') {
      metrics.value.traffic.blocked_threats_total += 1;
      metrics.value.traffic.ingress_blocked += 1;
      if (seed.threat_type.includes('CMS_PHP') || seed.threat_type.includes('SCANNER')) {
        metrics.value.traffic.bot_probes_total += 1;
      }
      if (seed.decision === 'SINKHOLE') {
        metrics.value.soc.c2_callbacks_blocked_total += 1;
        metrics.value.traffic.egress_blocked += 1;
      }
    }

    // Fluctuation micro-organique de la consommation RAPL (8.6W à 9.1W)
    const jitter = (Math.sin(Date.now() / 1500) * 0.22) + ((Math.random() - 0.5) * 0.12);
    const newWatts = parseFloat((8.75 + jitter).toFixed(2));
    animatedWatts.value = newWatts;
    metrics.value.green.instant_power_watts = newWatts;
  }

  // Permet d'injecter immédiatement le résultat d'un test Fuzzer dans le replayer !
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
    if (result.verdict !== 'ALLOW') {
      metrics.value.traffic.blocked_threats_total += 1;
      metrics.value.traffic.ingress_blocked += 1;
    }
  }

  function startReplay() {
    if (intervalTimer) clearInterval(intervalTimer);
    intervalTimer = setInterval(() => {
      if (isPlaying.value) {
        emitReplayTick();
      }
    }, 2200);
  }

  function stopReplay() {
    if (intervalTimer) {
      clearInterval(intervalTimer);
      intervalTimer = null;
    }
  }

  function toggleReplay() {
    isPlaying.value = !isPlaying.value;
  }

  onMounted(() => {
    // Pré-remplir les 6 premiers événements pour affichage immédiat
    for (let i = 0; i < 6; i++) {
      emitReplayTick();
    }
    startReplay();
  });

  onUnmounted(() => {
    stopReplay();
  });

  return {
    isPlaying,
    metrics,
    animatedWatts,
    dynamicPowerPath,
    threats,
    ingressStream,
    egressStream,
    mapEvents,
    toggleReplay,
    emitReplayTick,
    injectCustomInspectionEvent,
  };
}
