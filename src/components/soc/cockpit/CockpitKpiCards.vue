<template>
  <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
    <!-- CARD 1: FLUX RÉSEAU GLOBAL -->
    <div class="bg-slate-900/60 border border-slate-800/90 hover:border-cyan-500/40 rounded-2xl p-5 backdrop-blur-xl relative overflow-hidden transition-all">
      <div class="flex items-center justify-between text-xs text-slate-400 font-medium mb-2 font-mono">
        <span class="tracking-wide">{{ t.cockpit.kpi.trafficObserved }}</span>
        <span class="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">{{ t.cockpit.kpi.livePostgres }}</span>
      </div>
      <div class="flex items-baseline gap-1.5 mt-1">
        <span class="text-3xl font-extrabold text-white tracking-tight font-mono">{{ formatNumber(traffic.total_requests_24h) }}</span>
        <span class="text-xs text-slate-400 font-medium">{{ t.cockpit.kpi.events }}</span>
      </div>
      <div class="mt-3 flex items-center justify-between text-xs font-mono">
        <span class="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          {{ traffic.clean_traffic_pct ?? 100 }}% {{ t.cockpit.kpi.clean }}
        </span>
        <span class="text-slate-400">In: {{ traffic.ingress_total || 0 }} • Out: {{ traffic.egress_total || 0 }}</span>
        <span class="text-slate-500">{{ traffic.avg_latency_ms || 0 }}ms</span>
      </div>
    </div>

    <!-- CARD 2: TAUX D'INTERCEPTION -->
    <div class="bg-slate-900/60 border border-slate-800/90 hover:border-cyan-500/40 rounded-2xl p-5 backdrop-blur-xl relative overflow-hidden transition-all">
      <div class="flex items-center justify-between text-xs text-slate-400 font-medium mb-2 font-mono">
        <span class="tracking-wide">{{ t.cockpit.kpi.interceptionRate }}</span>
        <span class="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{{ t.cockpit.kpi.blockedOverTotal }}</span>
      </div>
      <div class="flex items-baseline gap-1 mt-1">
        <span class="text-3xl font-extrabold text-white tracking-tight font-mono">{{ interceptionRate }}</span>
        <span class="text-xs text-slate-400 font-medium">%</span>
      </div>
      <div class="mt-3 flex items-center justify-between text-xs font-mono">
        <span class="text-slate-300">{{ t.cockpit.kpi.blocked }} <strong class="text-emerald-400">{{ traffic.blocked_threats_total || 0 }}</strong></span>
        <span :class="(traffic.compromised_bypass_total || 0) > 0 ? 'text-rose-400 font-bold' : 'text-slate-500'">
          {{ t.cockpit.kpi.bypassed }} {{ traffic.compromised_bypass_total || 0 }}
        </span>
      </div>
    </div>

    <!-- CARD 3: PUISSANCE MATÉRIELLE (RAPL) -->
    <div class="bg-slate-900/60 border border-slate-800/90 hover:border-amber-500/40 rounded-2xl p-5 backdrop-blur-xl relative overflow-hidden transition-all">
      <div class="flex items-center justify-between text-xs text-slate-400 font-medium mb-1 font-mono">
        <span class="tracking-wide">{{ t.cockpit.kpi.hardwarePower }}</span>
        <span class="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">{{ t.cockpit.kpi.linuxProbe }}</span>
      </div>
      
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-baseline gap-1 mt-1">
            <span class="text-3xl font-extrabold text-white tracking-tight font-mono">{{ (instantWatts || 0).toFixed(2) }}</span>
            <span class="text-xs text-slate-400 font-medium">{{ t.cockpit.kpi.watts }}</span>
          </div>
          <div class="text-[11px] text-slate-400 font-mono mt-2">
            CPU: {{ green.cpu_watts || 0 }}W • RAM: {{ green.ram_watts || 0 }}W
          </div>
        </div>

        <div class="text-right font-mono">
          <div class="text-xs font-bold text-emerald-400">{{ green.carbon_intensity_gco2_h || 0 }} gCO2/h</div>
          <div class="text-[10px] text-slate-500 mt-0.5">{{ t.cockpit.kpi.mixFr }}</div>
        </div>
      </div>
    </div>

    <!-- CARD 4: MENACES & SCANS BOTS NEUTRALISÉS -->
    <div class="bg-slate-900/60 border border-slate-800/90 hover:border-rose-400/40 rounded-2xl p-5 backdrop-blur-xl relative overflow-hidden transition-all">
      <div class="flex items-center justify-between text-xs text-slate-400 font-medium mb-2 font-mono">
        <span class="tracking-wide">{{ t.cockpit.kpi.threatsNeutralized }}</span>
        <span class="text-[10px] font-mono text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">{{ t.cockpit.kpi.gateEgress }}</span>
      </div>
      <div class="flex items-baseline gap-1.5 mt-1">
        <span class="text-3xl font-extrabold text-white tracking-tight font-mono">{{ formatNumber(traffic.blocked_threats_total) }}</span>
        <span class="text-xs text-slate-400 font-medium">{{ t.cockpit.kpi.neutralized }}</span>
      </div>
      <div class="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span class="text-cyan-400 font-bold">{{ t.cockpit.kpi.waf }} {{ traffic.ingress_blocked || 0 }}</span>
        <span class="text-amber-400 font-bold">{{ t.cockpit.kpi.cmsBots }} {{ traffic.bot_probes_total || 0 }}</span>
        <span class="text-rose-400 font-bold">{{ t.cockpit.kpi.c2 }} {{ traffic.egress_blocked || 0 }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n';

const { t, locale } = useI18n();

withDefaults(defineProps<{
  traffic: {
    total_requests_24h: number;
    clean_traffic_pct: number;
    ingress_total: number;
    egress_total: number;
    avg_latency_ms: number;
    blocked_threats_total: number;
    compromised_bypass_total: number;
    ingress_blocked?: number;
    bot_probes_total?: number;
    egress_blocked?: number;
  };
  green: {
    cpu_watts: number;
    ram_watts: number;
    carbon_intensity_gco2_h: number;
  };
  instantWatts: number;
  interceptionRate: number;
  isLoading?: boolean;
}>(), {
  isLoading: false,
});

function formatNumber(n: number) {
  return new Intl.NumberFormat(locale.value === 'fr' ? 'fr-FR' : 'en-US').format(n || 0);
}
</script>
