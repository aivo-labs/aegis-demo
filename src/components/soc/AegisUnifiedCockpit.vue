<template>
  <div class="h-screen w-screen overflow-hidden flex flex-col bg-slate-950 font-sans text-slate-100">
    
    <!-- 1. ÉTAT TRANSITOIRE OU REDIRECTION VERS /login/ (DÉSACTIVÉ EN MODE DEMO) -->
    <div v-if="!isAuthenticated && !isDemo" class="h-full w-full flex items-center justify-center p-6 bg-slate-950">
      <div class="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center font-mono space-y-4 shadow-2xl">
        <AegisLogo size="lg" class="mx-auto" />
        <h2 class="text-xl font-bold text-white font-sans">Session Non Autorisée</h2>
        <p class="text-xs text-slate-400 font-sans">Redirection sécurisée vers la page de connexion...</p>
        <a href="/login/" class="inline-block px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs">
          Connexion Immédiate ➔
        </a>
      </div>
    </div>

    <!-- 2. MODE CONNECTÉ OU DÉMO : COCKPIT AVEC SIDEBAR FIXE PERMANENTE -->
    <div v-else class="h-full w-full flex flex-col overflow-hidden">
      
      <!-- BANDEAU HAUT EN MODE DÉMO (SANDBOX REPLAY) -->
      <div v-if="isDemo" class="shrink-0 px-4 py-2.5 bg-gradient-to-r from-cyan-950 via-slate-900 to-emerald-950 border-b border-cyan-500/40 text-xs font-mono flex flex-col sm:flex-row items-center justify-between gap-2 shadow-lg z-20">
        <div class="flex items-center gap-2.5 text-cyan-300">
          <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span class="font-extrabold tracking-wide">MODE DÉMONSTRATEUR INTERACTIF</span>
          <span class="hidden sm:inline text-slate-500">•</span>
          <span class="hidden sm:inline text-slate-300 text-[11px]">Moteur Zero-Trust exécuté en local (&lt; 0.25 ms) • Télémétrie 24h anonymisée</span>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="switchNav('fuzzer')"
            class="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 font-bold text-[11px] flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm active:scale-95"
          >
            <span>🔬</span>
            <span>Tester un payload (Fuzzer)</span>
          </button>
          <button
            @click="toggleReplay"
            class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
            :title="isPlaying ? 'Mettre en pause le replayer' : 'Relancer le replayer'"
          >
            <span>{{ isPlaying ? '⏸️ Pause Replay' : '▶️ Replay' }}</span>
          </button>
        </div>
      </div>

      <div class="flex-1 flex overflow-hidden">
        <!-- SIDEBAR GAUCHE PERMANENTE -->
        <CockpitSidebar
          :isSidebarExpanded="isSidebarExpanded"
          :activeNav="activeNav"
          @toggle-expand="isSidebarExpanded = !isSidebarExpanded"
          @switch-nav="switchNav"
          @open-account="showAccountModal = true"
          @logout="logout"
        />

        <!-- ZONE CENTRALE : DÉFILEMENT INDÉPENDANT À DROITE -->
        <div class="flex-1 flex flex-col min-w-0 h-full overflow-y-auto overflow-x-hidden">
          
          <!-- VUE A : KANBAN SOC DE TRIAGE DÉDIÉ (SI activeNav === 'triage') -->
          <div v-if="activeNav === 'triage'" class="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
            <AegisTriageKanban />
          </div>

          <!-- VUE B : ACTION CENTER DÉDIÉ (DIAGNOSTIC, FLUX, TÉLÉMÉTRIE, CVE, CONTRÔLES, ROADMAP, FUZZER) -->
          <AegisActionCenter 
            v-else-if="['audit', 'streams', 'telemetry', 'cve', 'controls', 'roadmap', 'security', 'green', 'compliance', 'fuzzer'].includes(activeNav)"
            :initialTab="activeNav === 'security' ? 'streams' : activeNav === 'green' ? 'telemetry' : activeNav === 'compliance' ? 'controls' : activeNav"
            :initialDomain="initialScanDomain"
            :isDemo="isDemoMode"
            :key="activeNav"
            @logout="logout"
          />

          <!-- VUE C : COCKPIT PRINCIPAL VUE D'ENSEMBLE (100% MÉTRIQUES RÉELLES) -->
          <div v-else class="flex-1 flex flex-col min-w-0 p-4 sm:p-6 lg:p-7 max-w-[1720px] mx-auto w-full">
          
          <!-- TOP HEADER BAR -->
          <CockpitHeader
            :protectionEnabled="protectionEnabled"
            :isTogglingProtection="isTogglingProtection"
            :isLightMode="isLightMode"
            @toggle-protection="toggleProtectionMode"
            @enroll-vps="showEnrollModal = true"
            @toggle-theme="toggleCockpitTheme"
            @logout="logout"
          />

          <!-- TOP 4 EXECUTIVE KPI CARDS -->
          <CockpitKpiCards
            :traffic="activeMetrics.traffic"
            :green="activeMetrics.green"
            :instantWatts="activeWatts"
            :interceptionRate="activeMetrics.soc.interception_rate_pct ?? 100"
            :isLoading="isLoadingSummary"
          />

          <!-- GRILLE PRINCIPALE 3 COLONNES DU COCKPIT -->
          <CockpitColumnsGrid
            :traffic="activeMetrics.traffic"
            :monitoredNodes="activeMetrics.soc.monitored_nodes || []"
            :powerHistoryCount="(activeMetrics.green.power_history || []).length"
            :dynamicPowerPath="activeDynamicPowerPath"
            :instantWatts="activeWatts"
            :retention="activeMetrics.retention"
            @switch-nav="switchNav"
            @export-report="exportVSReport"
          />

          <!-- TIROIR DES LOGS DE MENACES EN BAS DE PAGE -->
          <CockpitThreatLogsDrawer
            :show="showLogDrawer"
            :threats="activeThreats"
            @switch-nav="switchNav"
            @close="showLogDrawer = false"
          />

          <!-- COCKPIT FOOTER -->
          <footer class="mt-7 pt-4 border-t border-slate-800/80 text-[11px] font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <span>Aegis Unified Cockpit v5.3 • Go Control Plane &amp; Open-Core Éthique (AGPLv3)</span>
            </div>
            <div class="flex items-center gap-4 text-slate-400">
              <span>🇫🇷 Zéro Donnée Fictive</span>
              <span>•</span>
              <span>PostgreSQL &amp; Sonde Linux RAPL Temps Réel</span>
            </div>
          </footer>

        </div>
      </div>
      </div>

      <!-- MODALE MON COMPTE -->
      <CockpitAccountModal
        :show="showAccountModal"
        @close="showAccountModal = false"
        @switch-nav="switchNav"
        @logout="logout"
      />

      <!-- MODALE D'EXPORT DU RAPPORT TECHNIQUE -->
      <CockpitExportModal
        :show="showExportModal"
        :downloadUrl="downloadUrl"
        @close="showExportModal = false"
      />

      <!-- MODALE DE CONNEXION D'UN VPS -->
      <AegisNodeEnrollModal 
        v-if="showEnrollModal" 
        @close="showEnrollModal = false"
        @node-connected="handleNodeConnected"
      />

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import AegisLogo from './AegisLogo.vue';
import AegisActionCenter from './AegisActionCenter.vue';
import AegisTriageKanban from './AegisTriageKanban.vue';
import AegisNodeEnrollModal from './AegisNodeEnrollModal.vue';
import CockpitSidebar from './cockpit/CockpitSidebar.vue';
import CockpitHeader from './cockpit/CockpitHeader.vue';
import CockpitKpiCards from './cockpit/CockpitKpiCards.vue';
import CockpitColumnsGrid from './cockpit/CockpitColumnsGrid.vue';
import CockpitThreatLogsDrawer, { type ThreatEvent } from './cockpit/CockpitThreatLogsDrawer.vue';
import CockpitAccountModal from './cockpit/CockpitAccountModal.vue';
import CockpitExportModal from './cockpit/CockpitExportModal.vue';
import { useAegisTheme } from '../../composables/useAegisTheme';
import { useAuth } from '../../composables/useAuth';
import { useSandboxReplay } from '../../composables/useSandboxReplay';

const props = withDefaults(defineProps<{
  initialView?: string;
  isDemo?: boolean;
}>(), {
  initialView: 'dashboard',
  isDemo: true,
});

// Replayer Sandbox Interactif (Mode Démo)
const {
  isPlaying,
  toggleReplay,
  metrics: sandboxMetrics,
  animatedWatts: sandboxWatts,
  dynamicPowerPath: sandboxPowerPath,
  threats: sandboxThreats,
} = useSandboxReplay();

// Authentication state (Pure BFF)
const { isAuthenticated, currentUser, checkSession, logout: bffLogout } = useAuth();
const isPublicMode = ref(false);

async function checkDeployMode() {
  try {
    const res = await fetch('/api/v1/config/mode');
    if (res.ok) {
      const data = await res.json();
      isPublicMode.value = data.mode === 'public';
    }
  } catch (e) {
    isPublicMode.value = false;
  }
}

// Sidebar state
const isSidebarExpanded = ref(true);

// Navigation state
const activeNav = ref(props.initialView || 'dashboard');
const initialScanDomain = ref('');
const showLogDrawer = ref(true);
const isExporting = ref(false);
const isTogglingProtection = ref(false);
const protectionEnabled = ref(true);
const showExportModal = ref(false);
const showEnrollModal = ref(false);
const showAccountModal = ref(false);
const downloadUrl = ref('');

// Theme composable
const { isLightMode, toggleTheme: toggleCockpitTheme } = useAegisTheme();

// Cache restoration for instantaneous render without 0 flicker
let cachedMetrics: any = null;
let cachedWatts = 0;
if (typeof window !== 'undefined') {
  try {
    const raw = localStorage.getItem('aegis_cached_summary');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.metrics) cachedMetrics = parsed.metrics;
      if (typeof parsed.watts === 'number') cachedWatts = parsed.watts;
    }
  } catch {}
}

const isLoadingSummary = ref(!cachedMetrics);

// Hardware RAPL Watts
const animatedWatts = ref(cachedWatts);
let pollTimer: any = null;

// Dashboard Metrics
const metrics = ref(cachedMetrics || {
  traffic: {
    total_requests_24h: 0,
    clean_traffic_pct: 100,
    blocked_threats_total: 0,
    compromised_bypass_total: 0,
    ingress_total: 0,
    ingress_blocked: 0,
    ingress_bypassed: 0,
    egress_total: 0,
    egress_blocked: 0,
    egress_bypassed: 0,
    bot_probes_total: 0,
    avg_latency_ms: 0,
  },
  soc: {
    si_health_score: 100,
    interception_rate_pct: 100,
    c2_callbacks_blocked_total: 0,
    monitored_nodes: [] as any[],
  },
  green: {
    instant_power_watts: 0,
    cpu_watts: 0,
    ram_watts: 0,
    carbon_intensity_gco2_h: 0,
    eco_index_score: null,
    eco_index_grade: 'N/A',
    power_history: [] as any[],
  },
  retention: {
    hot_window_days: 30,
    anssi_forensic_days: 180,
    rgpd_clean_ip_days: 7,
  },
});

const threats = ref<ThreatEvent[]>([]);

// Variables actives selon le mode (Production vs Démonstrateur Sandbox)
const isDemoMode = computed(() => props.isDemo);
const activeMetrics = computed(() => (isDemoMode.value ? (sandboxMetrics.value as any) : metrics.value));
const activeWatts = computed(() => (isDemoMode.value ? sandboxWatts.value : animatedWatts.value));
const activeThreats = computed(() => (isDemoMode.value ? sandboxThreats.value : threats.value));
const activeDynamicPowerPath = computed(() => (isDemoMode.value ? sandboxPowerPath.value : dynamicPowerPath.value));

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

async function logout() {
  showAccountModal.value = false;
  await bffLogout();
}

function getPathForNav(view: string): string {
  const prefix = props.isDemo ? '/demo' : '/app';
  if (view === 'dashboard') return props.isDemo ? '/demo' : '/app/';
  if (view === 'triage') return `${prefix}/triage`;
  if (view === 'streams' || view === 'security') return `${prefix}/actions/security`;
  if (view === 'telemetry' || view === 'green') return `${prefix}/actions/green`;
  if (view === 'controls' || view === 'compliance') return `${prefix}/actions/compliance`;
  return `${prefix}/?tab=${view}`;
}

function switchNav(view: string, updateHistory = true) {
  activeNav.value = view;
  if (updateHistory && typeof window !== 'undefined') {
    const targetUrl = getPathForNav(view);
    if (window.location.pathname + window.location.search !== targetUrl) {
      window.history.pushState({ nav: view }, '', targetUrl);
    }
  }
}

function handleNodeConnected() {
  showEnrollModal.value = false;
  fetchSummary();
}

async function fetchSummary() {
  try {
    const res = await fetch('/api/v1/dashboard/summary');
    if (res.ok) {
      const data = await res.json();
      if (typeof data.protection_enabled === 'boolean') {
        protectionEnabled.value = data.protection_enabled;
      }
      if (data.traffic) metrics.value.traffic = { ...metrics.value.traffic, ...data.traffic };
      if (data.soc) metrics.value.soc = { ...metrics.value.soc, ...data.soc };
      if (data.green) {
        metrics.value.green = { ...metrics.value.green, ...data.green };
        const realWatts = Number(data.green.instant_power_watts) || 0;
        animatedWatts.value = realWatts;
      }
      if (data.retention) {
        metrics.value.retention = { ...metrics.value.retention, ...data.retention };
      }

      // Save to localStorage for instant subsequent loads
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('aegis_cached_summary', JSON.stringify({
            metrics: metrics.value,
            watts: animatedWatts.value,
          }));
        } catch {}
      }
    }
  } catch (e) {
  } finally {
    isLoadingSummary.value = false;
  }
}

async function toggleProtectionMode() {
  isTogglingProtection.value = true;
  try {
    const nextState = !protectionEnabled.value;
    const res = await fetch('/api/v1/dashboard/protection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ protection_enabled: nextState }),
    });
    if (res.ok) {
      const data = await res.json();
      if (typeof data.protection_enabled === 'boolean') {
        protectionEnabled.value = data.protection_enabled;
      }
      await Promise.all([fetchSummary(), fetchThreats()]);
    }
  } catch (e) {
  } finally {
    isTogglingProtection.value = false;
  }
}

async function fetchThreats() {
  try {
    const res = await fetch('/api/v1/dashboard/egress-threats');
    if (res.ok) {
      const data = await res.json();
      threats.value = Array.isArray(data.threats) ? data.threats : [];
    }
  } catch (e) {}
}

async function exportVSReport() {
  isExporting.value = true;
  try {
    const reportData = {
      horodatage_utc: new Date().toISOString(),
      moteur: 'Aegis Go Control Plane v5.3',
      traffic: metrics.value.traffic,
      green_rapl: metrics.value.green,
      retention_policy: metrics.value.retention,
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    downloadUrl.value = URL.createObjectURL(blob);
    showExportModal.value = true;
  } finally {
    isExporting.value = false;
  }
}

onMounted(async () => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);

    if (!props.isDemo) {
      const isAuthed = await checkSession();

      if (!isAuthed) {
        const hasAuthParam = urlParams.get('mode') === 'login' || urlParams.get('auth') === 'true';
        if (hasAuthParam) {
          window.location.href = '/api/auth/login';
          return;
        }
        window.location.href = '/login/';
        return;
      }
    }

    // Détection de la vue selon l'URL (pathname ou query param)
    const pathname = window.location.pathname.replace(/\/$/, '');
    if (pathname.endsWith('/triage')) {
      activeNav.value = 'triage';
    } else if (pathname.endsWith('/actions/security')) {
      activeNav.value = 'streams';
    } else if (pathname.endsWith('/actions/green')) {
      activeNav.value = 'telemetry';
    } else if (pathname.endsWith('/actions/compliance')) {
      activeNav.value = 'controls';
    } else {
      const tabParam = urlParams.get('tab');
      if (tabParam) {
        activeNav.value = tabParam;
      } else if (props.initialView) {
        activeNav.value = props.initialView;
      }
    }

    if (!props.isDemo) {
      checkDeployMode();
    }

    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.nav) {
        activeNav.value = e.state.nav;
      } else {
        const curPath = window.location.pathname.replace(/\/$/, '');
        if (curPath.endsWith('/triage')) activeNav.value = 'triage';
        else if (curPath.endsWith('/actions/security')) activeNav.value = 'streams';
        else if (curPath.endsWith('/actions/green')) activeNav.value = 'telemetry';
        else if (curPath.endsWith('/actions/compliance')) activeNav.value = 'controls';
        else activeNav.value = 'dashboard';
      }
    };
    window.addEventListener('popstate', handlePopState);
  }

  if (!props.isDemo) {
    fetchSummary();
    fetchThreats();

    pollTimer = setInterval(() => {
      if (isAuthenticated.value) {
        fetchSummary();
        fetchThreats();
      }
    }, 2500);
  }
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
  if (downloadUrl.value) URL.revokeObjectURL(downloadUrl.value);
});
</script>
