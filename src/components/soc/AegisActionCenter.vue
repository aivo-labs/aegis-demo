<template>
  <div class="flex-1 flex flex-col min-w-0 p-4 sm:p-6 lg:p-7 max-w-[1720px] mx-auto w-full text-slate-100 font-sans">
    
    <!-- TOP HEADER -->
    <ActionCenterHeader
      :icon="headerIcon"
      :title="headerTitle"
      :subtitle="headerSubtitle"
      :isLightMode="isLightMode"
      @toggle-theme="toggleTheme"
      @logout="emitLogout"
    />

    <!-- TOAST DE CONFIRMATION D'ACTION RÉELLE -->
    <transition enter-active-class="transition duration-200" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
      <div v-if="actionToast" class="mt-4 p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center justify-between shadow-lg">
        <div class="flex items-center gap-2.5">
          <span class="text-base font-bold">✓</span>
          <span>{{ actionToast }}</span>
        </div>
        <button @click="actionToast = ''" class="text-emerald-400 hover:text-white font-bold cursor-pointer">✕</button>
      </div>
    </transition>

    <!-- PANELS SELON L'ONGLET ACTIF -->
    <div class="mt-6">
      <AuditPanel 
        v-if="activeTab === 'audit'"
        :initialDomain="initialDomain"
        :isDemo="props.isDemo"
        @toast="showToast"
        @scan-completed="fetchCveFeed"
      />

      <StreamsPanel 
        v-else-if="activeTab === 'streams'"
        :ingressStream="ingressStream"
        :egressStream="filteredEgressStream"
        :filteredIngressStream="filteredIngressStream"
        :probeEventsCount="probeEventsCount"
        :exploitEventsCount="exploitEventsCount"
        :cleanEventsCount="cleanEventsCount"
        :totalIngress24h="totalIngress24h"
        :blockedIngress24h="blockedIngress24h"
        :totalEgress24h="totalEgress24h"
        :blockedEgress24h="blockedEgress24h"
        :availableHosts="availableHosts"
        v-model:streamFilter="streamFilter"
        v-model:selectedHost="selectedHost"
        v-model:selectedDate="selectedDate"
        v-model:searchQuery="searchQuery"
        :mapEvents="mapEvents"
        :isSimulatingProbes="isSimulatingProbes"
        :isLoading="isLoadingStreams"
        @filter-change="() => fetchLiveStreams()"
        @simulate="handleSimulateProbes"
        @quick-ban="handleQuickBan"
      />

      <TelemetryPanel 
        v-else-if="activeTab === 'telemetry'"
        :isDemo="props.isDemo"
      />

      <CveFeedPanel 
        v-else-if="activeTab === 'cve'"
        :activeRulesCount="activeRulesCount"
        :blockedByPatchCount="blockedByPatchCount"
        :exposedCves="exposedCves"
        :catalogCves="catalogCves"
        :isSyncing="isSyncing"
        @sync-certfr="handleSyncCertFr"
      />

      <ControlsPanel 
        v-else-if="activeTab === 'controls'"
        :bannedIps="bannedIps"
        :maxPayloadBytes="maxPayloadBytes"
        :retention="retention"
        @add-ban="handleAddBan"
        @remove-ban="handleRemoveBan"
        @update-payload-limit="handleUpdatePayloadLimit"
        @save-retention="handleSaveRetention"
        @purge-clean="handlePurgeClean"
      />

      <AegisInteractiveFuzzer
        v-else-if="activeTab === 'fuzzer'"
        @payload-evaluated="handleFuzzerEvaluated"
      />

      <RoadmapPanel v-else />
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import ActionCenterHeader from './actions/ActionCenterHeader.vue';
import AuditPanel from './actions/AuditPanel.vue';
import StreamsPanel from './actions/StreamsPanel.vue';
import TelemetryPanel from './actions/TelemetryPanel.vue';
import CveFeedPanel from './actions/CveFeedPanel.vue';
import ControlsPanel from './actions/ControlsPanel.vue';
import RoadmapPanel from './actions/RoadmapPanel.vue';
import AegisInteractiveFuzzer from './AegisInteractiveFuzzer.vue';
import type { SandboxInspectionResult, SandboxRequest } from '../../services/sandboxEngine';

import { useAegisTheme } from '../../composables/useAegisTheme';
import { useLiveStreams } from '../../composables/useLiveStreams';
import { useCveFeed } from '../../composables/useCveFeed';
import { useControls } from '../../composables/useControls';
import { useSandboxReplay } from '../../composables/useSandboxReplay';

const props = withDefaults(defineProps<{
  initialTab?: string;
  initialDomain?: string;
  isDemo?: boolean;
}>(), {
  initialTab: 'audit',
  initialDomain: '',
  isDemo: true,
});

const emit = defineEmits<{
  (e: 'logout'): void;
}>();

const { injectCustomInspectionEvent } = useSandboxReplay();

const actionToast = ref('');
function showToast(msg: string) {
  actionToast.value = msg;
  setTimeout(() => {
    if (actionToast.value === msg) actionToast.value = '';
  }, 4500);
}

function handleFuzzerEvaluated(result: SandboxInspectionResult, req: SandboxRequest) {
  injectCustomInspectionEvent(result, req);
  fetchLiveStreams();
  showToast(`Verdict PEP : ${result.verdict === 'ALLOW' ? '✅ HTTP 200 AUTORISÉ' : result.verdict === 'SINKHOLE' ? '🌐 DNS SINKHOLE' : `❌ HTTP ${result.httpStatus} BLOQUÉ`} (${result.threatType} en ${result.latencyMs} ms) • Injecté dans les flux SOC`);
}

// Composables
const { isLightMode, toggleTheme } = useAegisTheme();
const { 
  ingressStream, egressStream, filteredIngressStream, filteredEgressStream,
  probeEventsCount, exploitEventsCount, cleanEventsCount, 
  totalIngress24h, blockedIngress24h, totalEgress24h, blockedEgress24h,
  availableHosts, selectedHost, selectedDate, searchQuery, streamFilter,
  mapEvents, isSimulatingProbes, isLoading: isLoadingStreams, fetchLiveStreams, simulateBotProbes 
} = useLiveStreams({ isDemo: props.isDemo });

const { 
  activeRulesCount, blockedByPatchCount, exposedCves, catalogCves, isSyncing, fetchCveFeed, syncCertFr 
} = useCveFeed({ isDemo: props.isDemo });

const { 
  bannedIps, maxPayloadBytes, retention, fetchControls, 
  addBan, removeBan, updatePayloadLimit, saveRetention, purgeCleanLogs 
} = useControls({ isDemo: props.isDemo });

// Navigation Tabs
const activeTab = ref(
  ['audit', 'streams', 'telemetry', 'cve', 'controls', 'roadmap', 'security', 'green', 'compliance', 'fuzzer'].includes(props.initialTab)
    ? (props.initialTab === 'security' ? 'streams' : props.initialTab === 'green' ? 'telemetry' : props.initialTab === 'compliance' ? 'controls' : props.initialTab)
    : 'audit'
);

const headerIcon = computed(() => {
  if (activeTab.value === 'fuzzer') return '🔬';
  if (activeTab.value === 'audit') return '🔍';
  if (activeTab.value === 'streams') return '📡';
  if (activeTab.value === 'telemetry') return '🌿';
  if (activeTab.value === 'cve') return '🛡️';
  if (activeTab.value === 'controls') return '⚙️';
  return '🗺️';
});

const headerTitle = computed(() => {
  if (activeTab.value === 'fuzzer') return "Fuzzer Interactif & Laboratoire d'Entropie de Shannon";
  if (activeTab.value === 'audit') return 'Diagnostic Passif (5 Pages), CVE & Homologation DNS';
  if (activeTab.value === 'streams') return 'Flux Ingress ⇄ Egress (Direct & Kanban)';
  if (activeTab.value === 'telemetry') return 'Télémétrie RAPL & Éco-Conception EcoIndex v3';
  if (activeTab.value === 'cve') return 'Intelligence Vulnérabilités & CVE Feed';
  if (activeTab.value === 'controls') return 'Contrôles Edge, Ban IP & Rétention ANSSI / RGPD';
  return 'Roadmap Publique & Architecture Open-Core';
});

const headerSubtitle = computed(() => {
  if (activeTab.value === 'fuzzer') return "Évaluation Zero-Trust en temps réel dans votre navigateur : canonicalisation multi-passes, calcul d'entropie H(X) et décision PEP (< 0.25 ms)";
  if (activeTab.value === 'audit') return "Analyse réelle par Goroutines : versions exposées, alertes CVE, EcoIndex v3 et contrat d'autorisation DNS TXT";
  if (activeTab.value === 'streams') return 'Visibilité complète sur les requêtes entrantes (scans wp-login, .env, exploits) et sortantes (DNS C2 / Sockets)';
  if (activeTab.value === 'telemetry') return 'Mesures en temps réel de puissance matérielle (/sys/class/powercap) et registres CPU Linux';
  if (activeTab.value === 'cve') return 'Surveillance continue des failles exposées sur votre périmètre et des règles actives en production';
  if (activeTab.value === 'controls') return 'Actions réelles synchronisées avec Aegis Gate Proxy (:8000) et PostgreSQL / TimescaleDB';
  return 'État transparent des fonctionnalités en production (v1.5) et des chantiers communautaires (v2.0)';
});

const emitLogout = async () => {
  emit('logout');
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data && data.logout_url) {
          window.location.href = data.logout_url;
          return;
        }
      }
    } catch {}
    window.location.href = '/login/';
  }
};

async function handleSimulateProbes() {
  await simulateBotProbes();
  showToast('6 sondes bots (wp-login.php, wp-content, xmlrpc.php, .env, phpmyadmin, SQLi) envoyées et interceptées par Aegis Gate !');
}

async function handleQuickBan(ip: string, category: string) {
  const msg = await addBan(ip, `Blocage SOC suite à : ${category}`);
  if (msg) showToast(msg);
}

async function handleAddBan(ip: string, reason: string) {
  const msg = await addBan(ip, reason);
  if (msg) showToast(msg);
}

async function handleRemoveBan(ip: string) {
  const msg = await removeBan(ip);
  if (msg) showToast(msg);
}

async function handleUpdatePayloadLimit(limit: number) {
  const msg = await updatePayloadLimit(limit);
  if (msg) showToast(msg);
}

async function handleSaveRetention() {
  const msg = await saveRetention();
  if (msg) showToast(msg);
}

async function handlePurgeClean() {
  const msg = await purgeCleanLogs();
  if (msg) {
    showToast(msg);
    fetchLiveStreams();
  }
}

async function handleSyncCertFr() {
  await syncCertFr();
  showToast('✓ Synchronisation souveraine CERT-FR effectuée.');
}

let pollTimer: any = null;

onMounted(() => {
  fetchLiveStreams();
  fetchCveFeed();
  fetchControls();

  pollTimer = setInterval(() => {
    fetchLiveStreams();
    if (activeTab.value === 'cve') fetchCveFeed();
  }, 3000);
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});
</script>
