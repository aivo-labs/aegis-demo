<template>
  <section class="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-6 items-stretch">
    <!-- COLONNE 1 : FLUX INGRESS/EGRESS & NŒUDS ACTIFS (4 COLS) -->
    <div class="lg:col-span-4 bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5 backdrop-blur-xl flex flex-col justify-between shadow-xl">
      <div>
        <div class="flex items-center justify-between pb-3.5 border-b border-slate-800/80">
          <div class="flex items-center gap-2">
            <span class="text-cyan-400 font-bold">🛡️</span>
            <h2 class="text-sm font-bold text-white tracking-tight">Supervision Réseau Ingress ⇄ Egress</h2>
          </div>
          <button @click="$emit('switch-nav', 'streams')" class="text-xs font-mono text-cyan-400 hover:text-cyan-300 cursor-pointer font-bold">
            Double Flux ➔
          </button>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-3 font-mono">
          <div class="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div class="text-[10px] text-cyan-400 uppercase font-bold">⬇️ Ingress Entrant</div>
            <div class="text-2xl font-extrabold text-white mt-1">{{ traffic.ingress_total || 0 }}</div>
            <div class="text-[11px] text-slate-400 mt-1">
              <span class="text-rose-400 font-bold">{{ traffic.ingress_blocked || 0 }}</span> bloqués
            </div>
          </div>

          <div class="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div class="text-[10px] text-amber-400 uppercase font-bold">⬆️ Egress Sortant</div>
            <div class="text-2xl font-extrabold text-white mt-1">{{ traffic.egress_total || 0 }}</div>
            <div class="text-[11px] text-slate-400 mt-1">
              <span class="text-rose-400 font-bold">{{ traffic.egress_blocked || 0 }}</span> C2 coupés
            </div>
          </div>
        </div>

        <div class="mt-3 p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between gap-3">
          <div class="text-xs text-slate-300 leading-relaxed font-sans">
            Visualisez les requêtes <code class="text-amber-300 font-mono">wp-login.php</code>, <code class="text-amber-300 font-mono">.env</code> en direct avec la bascule <strong>Mode Kanban SOC</strong>.
          </div>
          <button
            @click="$emit('switch-nav', 'streams')"
            class="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-extrabold shrink-0 cursor-pointer transition-all"
          >
            📡 Ouvrir
          </button>
        </div>

        <!-- Nœuds Surveillés -->
        <div class="mt-4 bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5">
          <div class="flex items-center justify-between text-xs mb-2.5">
            <span class="text-slate-300 font-semibold flex items-center gap-1.5 font-mono">
              <span class="text-emerald-400">🖥️</span>
              <span>Services Surveillés (Télémétrie)</span>
            </span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              {{ (monitoredNodes || []).length }} actifs
            </span>
          </div>

          <div v-if="monitoredNodes && monitoredNodes.length > 0" class="space-y-1.5 max-h-40 overflow-y-auto">
            <div 
              v-for="(node, idx) in monitoredNodes" 
              :key="idx"
              class="flex items-center justify-between text-xs font-mono p-2 rounded-lg bg-slate-900/60 border border-slate-800/60"
            >
              <div class="flex items-center gap-2 min-w-0">
                <span :class="['w-2 h-2 rounded-full shrink-0', node.status === 'warning' ? 'bg-red-500 animate-ping' : 'bg-emerald-400']"></span>
                <span class="text-slate-200 text-[11px] font-semibold truncate">{{ node.service_name || node.hostname }}</span>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <span v-if="node.cpu_load_pct !== undefined" :class="['text-[10px] px-1.5 py-0.5 rounded border', Number(node.cpu_load_pct) > 100 ? 'bg-red-500/20 text-red-300 border-red-500/40 font-bold' : 'bg-slate-800 text-slate-400 border-slate-700']">
                  CPU {{ Number(node.cpu_load_pct).toFixed(1) }}%
                </span>
                <span class="text-amber-300 text-[11px] font-bold">{{ Number(node.watts ?? node.rapl_watts ?? 0).toFixed(2) }} W</span>
                <span :class="['text-[10px]', node.status === 'warning' ? 'text-red-400 font-bold' : 'text-emerald-400']">{{ node.status }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>Architecture :</span>
        <span class="text-cyan-300 font-bold">Gate PEP (:8000) + Sinkhole (:5053)</span>
      </div>
    </div>

    <!-- COLONNE 2 : TÉLÉMÉTRIE MATÉRIELLE & DIAGNOSTIC RAPIDE (5 COLS) -->
    <div class="lg:col-span-5 bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5 backdrop-blur-xl flex flex-col justify-between shadow-xl">
      <div>
        <div class="flex items-center justify-between pb-3.5 border-b border-slate-800/80">
          <div class="flex items-center gap-2">
            <span class="text-emerald-400 font-bold">🌿</span>
            <h2 class="text-sm font-bold text-white tracking-tight">Télémétrie RAPL &amp; Éco-Conception</h2>
          </div>
          <button 
            @click="$emit('switch-nav', 'telemetry')"
            class="text-xs font-mono text-emerald-400 hover:text-emerald-300 cursor-pointer font-bold"
          >
            Détails RAPL &amp; EcoIndex ➔
          </button>
        </div>

        <div class="mt-3 flex items-center justify-between text-[11px] font-mono">
          <span class="flex items-center gap-1.5 text-cyan-400">
            <span class="w-3 h-0.5 bg-cyan-400 inline-block"></span>
            Puissance Électrique Mesurée (Watts - Sonde RAPL)
          </span>
          <span class="text-slate-400">
            {{ powerHistoryCount }} pts
          </span>
        </div>

        <!-- REALTIME HARDWARE WATTS SVG CHART -->
        <div class="mt-2.5 bg-slate-950/80 border border-slate-800/90 rounded-xl p-3 relative">
          <div class="w-full h-40 relative">
            <svg viewBox="0 0 500 180" class="w-full h-full overflow-visible">
              <line x1="40" y1="25" x2="480" y2="25" stroke="#1e293b" stroke-dasharray="3,3" />
              <text x="8" y="29" fill="#64748b" font-size="9" font-family="monospace">20W</text>

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
              Direct: {{ instantWatts.toFixed(2) }} W
            </div>
          </div>
        </div>

        <!-- CARTE DE SYNTHÈSE DIAGNOSTIC 5 PAGES -->
        <div class="mt-4 bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex flex-col items-center justify-center shrink-0 font-mono">
                <span class="text-lg font-black text-emerald-300 leading-none">🔍</span>
                <span class="text-[8px] text-slate-400 mt-0.5">5 Pages</span>
              </div>
              <div>
                <div class="text-xs font-bold text-white font-mono">Diagnostic Passif (CVE &amp; EcoIndex)</div>
                <div class="text-[11px] text-slate-400 mt-0.5 font-sans">
                  Analyse instantanée des failles, versions exposées et score d'éco-conception.
                </div>
              </div>
            </div>

            <button
              @click="$emit('switch-nav', 'audit')"
              class="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold shrink-0 cursor-pointer"
            >
              Ouvrir Diagnostic ➔
            </button>
          </div>
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>Mesure :</span>
        <span class="text-emerald-300 font-bold">Linux RAPL (/sys) + Scanner 5 Pages</span>
      </div>
    </div>

    <!-- COLONNE 3 : GOUVERNANCE & RÉTENTION ANSSI / RGPD (3 COLS) -->
    <div class="lg:col-span-3 bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5 backdrop-blur-xl flex flex-col justify-between shadow-xl">
      <div>
        <div class="flex items-center justify-between pb-3.5 border-b border-slate-800/80">
          <div class="flex items-center gap-2">
            <span class="text-purple-400 font-bold">⚖️</span>
            <h2 class="text-sm font-bold text-white tracking-tight">Gouvernance &amp; Rétention</h2>
          </div>
          <button @click="$emit('switch-nav', 'controls')" class="text-xs font-mono text-purple-400 hover:text-purple-300 cursor-pointer font-bold">
            Contrôles ➔
          </button>
        </div>

        <div class="mt-4 space-y-3 font-mono">
          <div class="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-white">Rétention des Logs</span>
              <span class="text-[10px] px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">ANSSI / RGPD</span>
            </div>
            <div class="mt-2.5 space-y-1 text-[11px] text-slate-300">
              <div class="flex justify-between">
                <span class="text-slate-400">Fenêtre Chaude SOC :</span>
                <span class="text-cyan-300 font-bold">{{ retention?.hot_window_days || 30 }} jours</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Forensic ANSSI :</span>
                <span class="text-amber-300 font-bold">{{ retention?.anssi_forensic_days || 180 }} jours</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Purge IP RGPD :</span>
                <span class="text-emerald-400 font-bold">{{ retention?.rgpd_clean_ip_days || 7 }} jours</span>
              </div>
            </div>
          </div>

          <div class="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-white">Virtual Patching Actif</span>
              <span class="text-emerald-400 text-xs font-bold">6 / 6 Règles</span>
            </div>
            <div class="mt-2 text-[10px] text-slate-400 leading-relaxed">
              • Anti-Overflow <code class="text-cyan-300">HTTP 413</code><br/>
              • Détection scans bots (<code class="text-amber-300">wp-login</code>, <code class="text-amber-300">.env</code>)<br/>
              • Sinkhole DNS C2 (<code class="text-amber-300">0.0.0.0</code>)
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
          <span>📥 Exporter Rapport Technique (JSON)</span>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
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
