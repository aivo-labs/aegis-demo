<template>
  <section class="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-6 items-stretch">
    <!-- COLONNE 1 : FLUX INGRESS/EGRESS & NŒUDS ACTIFS (4 COLS) -->
    <div class="lg:col-span-4 bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5 backdrop-blur-xl flex flex-col justify-between shadow-xl">
      <div>
        <div class="flex items-center justify-between pb-3.5 border-b border-slate-800/80">
          <div class="flex items-center gap-2">
            <span class="text-cyan-400 font-bold">🛡️</span>
            <h2 class="text-sm font-bold text-white tracking-tight">{{ t.cockpit.columns.supervisionTitle }}</h2>
          </div>
          <button @click="$emit('switch-nav', 'triage')" class="text-xs font-mono text-cyan-400 hover:text-cyan-300 cursor-pointer font-bold">
            {{ t.cockpit.columns.dualStreamBtn }}
          </button>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-3 font-mono">
          <div class="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div class="text-[10px] text-cyan-400 uppercase font-bold">{{ t.cockpit.columns.ingressIn }}</div>
            <div class="text-2xl font-extrabold text-white mt-1">{{ traffic.ingress_total || 0 }}</div>
            <div class="text-[11px] text-slate-400 mt-1">
              <span class="text-rose-400 font-bold">{{ traffic.ingress_blocked || 0 }}</span> {{ t.cockpit.columns.ingressBlocked }}
            </div>
          </div>

          <div class="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div class="text-[10px] text-amber-400 uppercase font-bold">{{ t.cockpit.columns.egressOut }}</div>
            <div class="text-2xl font-extrabold text-white mt-1">{{ traffic.egress_total || 0 }}</div>
            <div class="text-[11px] text-slate-400 mt-1">
              <span class="text-rose-400 font-bold">{{ traffic.egress_blocked || 0 }}</span> {{ t.cockpit.columns.egressCut }}
            </div>
          </div>
        </div>

        <div class="mt-3 p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between gap-3">
          <div class="text-xs text-slate-300 leading-relaxed font-sans">
            {{ t.cockpit.columns.kanbanNotice }}
          </div>
          <button
            @click="$emit('switch-nav', 'triage')"
            class="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-extrabold shrink-0 cursor-pointer transition-all shadow-md active:scale-95"
          >
            {{ t.cockpit.columns.openBtn }}
          </button>
        </div>

        <!-- Nœuds Surveillés -->
        <div class="mt-4 bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5">
          <div class="flex items-center justify-between text-xs mb-2.5">
            <span class="text-slate-300 font-semibold flex items-center gap-1.5 font-mono">
              <span class="text-emerald-400">🖥️</span>
              <span>{{ t.cockpit.columns.monitoredServices }}</span>
            </span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              {{ (monitoredNodes || []).length }} {{ t.cockpit.columns.activeCount }}
            </span>
          </div>

          <div v-if="monitoredNodes && monitoredNodes.length > 0" class="space-y-1.5 max-h-40 overflow-y-auto">
            <div 
              v-for="(node, idx) in monitoredNodes" 
              :key="idx"
              class="flex items-center justify-between text-xs font-mono p-2 rounded-lg bg-slate-900/60 border border-slate-800/60"
            >
              <div class="flex items-center gap-2 min-w-0">
                <span class="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                <span class="text-slate-200 text-[11px] font-semibold truncate">{{ node.service_name || node.hostname || node.service || node.name || 'Service Aegis' }}</span>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <span class="text-amber-300 text-[11px] font-bold">{{ Number(node.watts || node.avg_watts || 0).toFixed(2) }} W</span>
                <span class="text-emerald-400 text-[10px]">{{ node.status || 'RAPL Live' }}</span>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-3 text-slate-500 text-xs font-mono">
            Aucun nœud actif connecté
          </div>
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>Architecture :</span>
        <span class="text-cyan-400 font-bold">PEP (:8000) ⇄ Sinkhole (:5053)</span>
      </div>
    </div>

    <!-- COLONNE 2 : PUISSANCE MATÉRIELLE RAPL & SCORE ÉCO-CONCEPTION (5 COLS) -->
    <div class="lg:col-span-5 bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5 backdrop-blur-xl flex flex-col justify-between shadow-xl">
      <div>
        <div class="flex items-center justify-between pb-3.5 border-b border-slate-800/80">
          <div class="flex items-center gap-2">
            <span class="text-emerald-400 font-bold">🌿</span>
            <h2 class="text-sm font-bold text-white tracking-tight">{{ t.cockpit.columns.greenTitle }}</h2>
          </div>
          <a href="https://aegis.aivo.fr/docs/" target="_blank" rel="noopener noreferrer" class="text-xs font-mono text-emerald-400 hover:text-emerald-300 cursor-pointer font-bold flex items-center gap-1">
            <span>{{ t.cockpit.columns.greenDetailsBtn }}</span>
            <span class="text-[10px]">↗</span>
          </a>
        </div>

        <!-- GRAPHIQUE EN COURBE SVG TEMPS RÉEL (RAPL JOULES/WATTS) -->
        <div class="mt-4 p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl relative overflow-hidden">
          <div class="flex items-center justify-between text-xs font-mono mb-2">
            <span class="text-slate-300 font-bold flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>{{ t.cockpit.columns.measuredPower }}</span>
            </span>
            <span class="text-emerald-400 font-bold text-[10px]">{{ powerHistoryCount }} {{ t.cockpit.columns.pts }}</span>
          </div>

          <div class="relative h-44 w-full">
            <svg class="w-full h-full overflow-visible" viewBox="0 0 500 180" preserveAspectRatio="none">
              <!-- Repères Horizontaux -->
              <line x1="40" y1="30" x2="480" y2="30" stroke="#1e293b" stroke-dasharray="3,3" />
              <text x="8" y="34" fill="#64748b" font-size="9" font-family="monospace">20W</text>

              <line x1="40" y1="70" x2="480" y2="70" stroke="#1e293b" stroke-dasharray="3,3" />
              <text x="8" y="74" fill="#64748b" font-size="9" font-family="monospace">15W</text>

              <line x1="40" y1="115" x2="480" y2="115" stroke="#1e293b" stroke-dasharray="3,3" />
              <text x="8" y="119" fill="#64748b" font-size="9" font-family="monospace">10W</text>

              <line x1="40" y1="155" x2="480" y2="155" stroke="#1e293b" stroke-dasharray="3,3" />
              <text x="8" y="159" fill="#64748b" font-size="9" font-family="monospace">5W</text>

              <path 
                :d="dynamicPowerPath" 
                fill="none" 
                stroke="#06b6d4" 
                stroke-width="2.5" 
              />
            </svg>

            <div class="absolute right-3 top-2 px-2 py-0.5 rounded bg-slate-900/90 border border-cyan-500/40 text-[10px] font-mono text-cyan-300">
              {{ t.cockpit.columns.liveDirect }} {{ instantWatts.toFixed(2) }} W
            </div>
          </div>
        </div>

        <!-- CARTE DE SYNTHÈSE DIAGNOSTIC PASSIVE AVEC LIEN HONNÊTE ET TRANSPARENT -->
        <div class="mt-4 bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex flex-col items-center justify-center shrink-0 font-mono">
                <span class="text-lg font-black text-emerald-300 leading-none">🔍</span>
                <span class="text-[8px] text-slate-400 mt-0.5">5 Pages</span>
              </div>
              <div>
                <div class="text-xs font-bold text-white font-mono">{{ t.cockpit.columns.diagTitle }}</div>
                <div class="text-[11px] text-slate-400 mt-0.5 font-sans leading-relaxed">
                  {{ t.cockpit.columns.diagDesc }}
                </div>
              </div>
            </div>

            <a
              href="https://aegis.aivo.fr/get-started/"
              target="_blank"
              rel="noopener noreferrer"
              class="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold shrink-0 cursor-pointer flex items-center justify-center gap-1.5 transition-colors shadow-sm active:scale-95"
            >
              <span>{{ t.cockpit.columns.openDiagBtn }}</span>
            </a>
          </div>
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>{{ t.cockpit.columns.measureLabel }}</span>
        <span class="text-emerald-300 font-bold">{{ t.cockpit.columns.measureValue }}</span>
      </div>
    </div>

    <!-- COLONNE 3 : GOUVERNANCE & RÉTENTION ANSSI / RGPD (3 COLS) -->
    <div class="lg:col-span-3 bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5 backdrop-blur-xl flex flex-col justify-between shadow-xl">
      <div>
        <div class="flex items-center justify-between pb-3.5 border-b border-slate-800/80">
          <div class="flex items-center gap-2">
            <span class="text-purple-400 font-bold">⚖️</span>
            <h2 class="text-sm font-bold text-white tracking-tight">{{ t.cockpit.columns.governanceTitle }}</h2>
          </div>
          <a href="https://aegis.aivo.fr/docs/" target="_blank" rel="noopener noreferrer" class="text-xs font-mono text-purple-400 hover:text-purple-300 cursor-pointer font-bold flex items-center gap-1">
            <span>{{ t.cockpit.columns.controlsBtn }}</span>
          </a>
        </div>

        <div class="mt-4 space-y-3 font-mono">
          <div class="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-white">{{ t.cockpit.columns.retentionTitle }}</span>
              <span class="text-[10px] px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">ANSSI / RGPD</span>
            </div>
            <div class="mt-2.5 space-y-1 text-[11px] text-slate-300">
              <div class="flex justify-between">
                <span class="text-slate-400">{{ t.cockpit.columns.hotWindow }}</span>
                <span class="text-cyan-300 font-bold">{{ retention?.hot_window_days || 30 }} {{ t.cockpit.columns.days }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">{{ t.cockpit.columns.forensicAnssi }}</span>
                <span class="text-amber-300 font-bold">{{ retention?.anssi_forensic_days || 180 }} {{ t.cockpit.columns.days }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">{{ t.cockpit.columns.purgeRgpd }}</span>
                <span class="text-emerald-400 font-bold">{{ retention?.rgpd_clean_ip_days || 7 }} {{ t.cockpit.columns.days }}</span>
              </div>
            </div>
          </div>

          <div class="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-white">{{ t.cockpit.columns.virtualPatching }}</span>
              <span class="text-emerald-400 text-xs font-bold">{{ t.cockpit.columns.rulesCount }}</span>
            </div>
            <div class="mt-2 text-[10px] text-slate-400 leading-relaxed">
              • {{ t.cockpit.columns.rule1 }}<br/>
              • {{ t.cockpit.columns.rule2 }}<br/>
              • {{ t.cockpit.columns.rule3 }}
            </div>
          </div>
        </div>
      </div>

      <!-- Export JSON Brut -->
      <div class="mt-4 pt-3 border-t border-slate-800/80">
        <button 
          @click="$emit('export-report')"
          class="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-extrabold text-xs tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <span>{{ t.cockpit.columns.exportReportBtn }}</span>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n';

const { t } = useI18n();

defineProps<{
  traffic: any;
  monitoredNodes: any[];
  powerHistoryCount: number;
  dynamicPowerPath: string;
  instantWatts: number;
  retention: any;
}>();

defineEmits<{
  (e: 'switch-nav', nav: string): void;
  (e: 'export-report'): void;
}>();
</script>
