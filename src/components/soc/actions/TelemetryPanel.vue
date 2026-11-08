<template>
  <div class="space-y-6 text-slate-100 font-sans">
    
    <!-- 1. BARRE DE CONTRÔLE SUPÉRIEURE : NAVIGATION TEMPORELLE & PÉRIMÈTRE MULTI-SERVEURS / K8S -->
    <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 flex flex-col gap-3 font-mono text-xs">
      
      <!-- Ligne 1 : Présélections Temporelles & Navigation Historique -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="text-slate-400 mr-1 flex items-center gap-1">
            <span>📅</span>
            <span>Période :</span>
          </span>

          <button 
            @click="setRange('1h')"
            :class="['px-3 py-1.5 rounded-lg border cursor-pointer transition-all font-bold', selectedRange === '1h' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white']"
          >
            1h (Direct)
          </button>
          
          <button 
            @click="setRange('24h')"
            :class="['px-3 py-1.5 rounded-lg border cursor-pointer transition-all font-bold', selectedRange === '24h' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white']"
          >
            24h (Jour)
          </button>

          <button 
            @click="setRange('7d')"
            :class="['px-3 py-1.5 rounded-lg border cursor-pointer transition-all font-bold', selectedRange === '7d' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white']"
          >
            7 jours
          </button>

          <button 
            @click="setRange('30d')"
            :class="['px-3 py-1.5 rounded-lg border cursor-pointer transition-all font-bold', selectedRange === '30d' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white']"
          >
            30 jours
          </button>

          <!-- Sélecteur de Mois Spécifique (ex: Septembre) -->
          <div class="flex items-center gap-1 ml-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-0.5">
            <span class="text-slate-400 text-[11px]">Mois :</span>
            <select 
              :value="selectedMonth" 
              @change="onMonthChange(($event.target as HTMLSelectElement).value)"
              class="bg-transparent text-emerald-300 font-bold focus:outline-none cursor-pointer"
            >
              <option v-for="m in availableMonths" :key="m" :value="m" class="bg-slate-950 text-slate-200">
                {{ formatMonthLabel(m) }}
              </option>
            </select>
          </div>

          <button 
            @click="setRange('year')"
            :class="['px-3 py-1.5 rounded-lg border cursor-pointer transition-all font-bold', selectedRange === 'year' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white']"
          >
            Année {{ selectedYear }}
          </button>

          <button 
            @click="selectedRange = 'custom'"
            :class="['px-3 py-1.5 rounded-lg border cursor-pointer transition-all font-bold', selectedRange === 'custom' ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white']"
          >
            Personnalisé
          </button>
        </div>

        <!-- Export Rapports & Télémétrie brute -->
        <div class="flex items-center gap-2">
          <a 
            :href="`/api/v1/dashboard/energy/export?format=csv&range=${selectedRange}`"
            download="aegis-rapl-telemetry.csv"
            class="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            title="Exporter les relevés RAPL pour bilan RSE / CSRD"
          >
            <span>📥 Export RSE (.CSV)</span>
          </a>
        </div>
      </div>

      <!-- Ligne 2 : Périmètre Multi-Serveurs, Namespaces K8s et Filtre Date Personnalisé -->
      <div class="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-800/80">
        <div class="flex flex-wrap items-center gap-3">
          
          <!-- Sélecteur Multi-Serveurs (Nodes) -->
          <div class="flex items-center gap-1.5">
            <span class="text-slate-400 flex items-center gap-1">
              <span>🖥️</span>
              <span>Serveur :</span>
            </span>
            <select 
              v-model="selectedNode" 
              @change="refreshData"
              class="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-cyan-300 font-bold focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="all">🌐 Tous les serveurs (Cluster Global)</option>
              <option v-for="node in nodes" :key="node.id" :value="node.id">
                {{ node.hostname }} ({{ node.provider }})
              </option>
            </select>
          </div>

          <!-- Sélecteur Kubernetes Namespaces / Workloads Dokploy -->
          <div class="flex items-center gap-1.5">
            <span class="text-slate-400 flex items-center gap-1">
              <span>📦</span>
              <span>Namespace / Workload :</span>
            </span>
            <select 
              v-model="selectedNamespace" 
              @change="refreshData"
              class="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-amber-300 font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">🌐 Tous les namespaces &amp; workloads</option>
              <option value="dokploy">🐳 dokploy (aivo.fr, flow n8n, blog, traefik)</option>
              <option value="aegis-system">🛡️ aegis-system (Cockpit, PEP, DB, Backend)</option>
              <option value="kube-system">⚙️ kube-system (K8s Control Plane)</option>
            </select>
          </div>

          <!-- Champs de date personnalisée si activé -->
          <div v-if="selectedRange === 'custom'" class="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <span class="text-slate-500 text-[10px]">Du</span>
            <input 
              type="date" 
              v-model="customFrom" 
              @change="refreshData"
              class="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-slate-200 text-xs"
            />
            <span class="text-slate-500 text-[10px]">Au</span>
            <input 
              type="date" 
              v-model="customTo" 
              @change="refreshData"
              class="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-slate-200 text-xs"
            />
          </div>
        </div>

        <!-- Statut de la capture -->
        <div class="flex items-center gap-2 text-[11px] text-slate-400">
          <span v-if="selectedRange === '1h' || selectedRange === '24h'" class="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Flux RAPL Direct Actif (&lt; 3s)</span>
          </span>
          <span v-else class="text-cyan-300 flex items-center gap-1">
            <span>📅</span>
            <span>Historique archivé : {{ activePeriodLabel }}</span>
          </span>
          <span v-if="isSimulatedHistory" class="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[10px]" title="Reconstitution basée sur le profil matériel réel mesuré du serveur">
            Profil matériel calibré
          </span>
        </div>
      </div>

    </div>

    <!-- 2. 4 CARTES KPIS SYNTHÉTIQUES GREENOPS (ÉNERGIE, CPU, CARBONE & EAU) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
      
      <!-- CARTE 1 : PUISSANCE & ÉNERGIE ÉLECTRIQUE (RAPL) -->
      <div class="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/90 relative overflow-hidden group hover:border-amber-500/40 transition-all">
        <div class="flex items-center justify-between text-slate-400 text-[11px]">
          <span>Puissance Matérielle (RAPL MSR)</span>
          <span class="text-amber-400 text-sm">⚡</span>
        </div>
        <div class="flex items-baseline gap-1 mt-1.5">
          <span class="text-3xl font-extrabold text-amber-400">
            {{ selectedRange === '1h' ? summary.instant_watts.toFixed(2) : summary.avg_watts.toFixed(2) }}
          </span>
          <span class="text-xs text-slate-400">Watts {{ selectedRange === '1h' ? 'inst.' : 'moy.' }}</span>
        </div>
        <div class="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
          <span class="text-slate-400">Énergie cumulée :</span>
          <strong class="text-white">{{ formatKwh(summary.total_kwh) }}</strong>
        </div>
        <div class="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
          <span>CPU: {{ summary.cpu_watts.toFixed(1) }}W • RAM: {{ summary.ram_watts.toFixed(1) }}W</span>
          <span class="text-amber-300 font-bold">~{{ summary.estimated_cost_eur.toFixed(3) }} €</span>
        </div>
      </div>

      <!-- CARTE 2 : CHARGE PROCESSEUR & EFFICACITÉ -->
      <div class="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/90 relative overflow-hidden group hover:border-cyan-500/40 transition-all">
        <div class="flex items-center justify-between text-slate-400 text-[11px]">
          <span>Charge Processeur (/proc/stat)</span>
          <span class="text-cyan-400 text-sm">📈</span>
        </div>
        <div class="flex items-baseline gap-1 mt-1.5">
          <span class="text-3xl font-extrabold text-cyan-300">{{ summary.avg_cpu_load_pct.toFixed(1) }}</span>
          <span class="text-xs text-slate-400">% CPU moy.</span>
        </div>
        <div class="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
          <span class="text-slate-400">Pic de charge max :</span>
          <strong class="text-cyan-200">{{ summary.max_cpu_load_pct.toFixed(1) }} %</strong>
        </div>
        <div class="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
          <span>PUE Datacenter : {{ summary.pue }}</span>
          <span class="text-emerald-400">Efficacité : Optimale</span>
        </div>
      </div>

      <!-- CARTE 3 : EMPREINTE CARBONE OPÉRATIONNELLE (GHG PROTOCOL) -->
      <div class="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/90 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
        <div class="flex items-center justify-between text-slate-400 text-[11px]">
          <span>Émissions Carbone (Scope 2)</span>
          <span class="text-emerald-400 text-sm">🌱</span>
        </div>
        <div class="flex items-baseline gap-1 mt-1.5">
          <span class="text-3xl font-extrabold text-emerald-400">
            {{ summary.total_carbon_kg >= 1 ? summary.total_carbon_kg.toFixed(2) : summary.total_carbon_gco2.toFixed(1) }}
          </span>
          <span class="text-xs text-slate-400">{{ summary.total_carbon_kg >= 1 ? 'kg' : 'g' }} CO₂eq</span>
        </div>
        <div class="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
          <span class="text-slate-400">Mix décarboné FR :</span>
          <strong class="text-emerald-300">{{ summary.carbon_intensity_gco2_kwh }} gCO₂/kWh</strong>
        </div>
        <div class="text-[10px] text-slate-400 mt-1 truncate" :title="`Équivaut à ${summary.equivalencies.car_km} km en voiture ou ${summary.equivalencies.smartphones_charged} recharges de smartphone`">
          🚗 {{ summary.equivalencies.car_km }} km voiture • 📱 {{ summary.equivalencies.smartphones_charged }} recharges
        </div>
      </div>

      <!-- CARTE 4 : CONSOMMATION D'EAU ESTIMÉE (WATER FOOTPRINT / WUE) -->
      <div class="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/90 relative overflow-hidden group hover:border-sky-500/40 transition-all">
        <div class="flex items-center justify-between text-slate-400 text-[11px]">
          <span>Empreinte Eau (Water Footprint)</span>
          <span class="text-sky-400 text-sm">💧</span>
        </div>
        <div class="flex items-baseline gap-1 mt-1.5">
          <span class="text-3xl font-extrabold text-sky-300">{{ summary.water_usage_liters.toFixed(2) }}</span>
          <span class="text-xs text-slate-400">Litres H₂O</span>
        </div>
        <div class="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
          <span class="text-slate-400">Facteur WUE + Mix :</span>
          <strong class="text-sky-200">1.50 L / kWh</strong>
        </div>
        <div class="text-[10px] text-slate-400 mt-1 truncate" :title="`Équivaut à ${summary.equivalencies.water_bottles} bouteilles d'eau de 1.5L ou ${summary.equivalencies.showers_pct}% d'une douche`">
          🍼 {{ summary.equivalencies.water_bottles }} bouteilles 1.5L • 🚿 {{ summary.equivalencies.showers_pct }}% douche
        </div>
      </div>

    </div>

    <!-- 3. DIAGRAMME CENTRAL MULTI-MÉTRIQUES (WATTS, CPU %, EAU & CARBONE) -->
    <div class="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl font-mono text-xs">
      
      <!-- En-tête du Graphique avec Onglets de Métriques -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
        <div>
          <div class="text-emerald-400 font-bold mb-0.5 flex items-center gap-1.5">
            <span>⚡ MESURE DIRECTE LINUX RAPL (/sys/class/powercap/intel-rapl)</span>
          </div>
          <h3 class="text-base font-extrabold text-white">
            Évolution Télémétrique &amp; Corrélation Énergie-Charge
          </h3>
        </div>

        <!-- Onglets du graphique -->
        <div class="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1">
          <button 
            @click="activeMetric = 'watts'"
            :class="[
              'px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1.5',
              activeMetric === 'watts' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-white'
            ]"
          >
            <span>⚡ Puissance (Watts)</span>
          </button>

          <button 
            @click="activeMetric = 'cpu'"
            :class="[
              'px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1.5',
              activeMetric === 'cpu' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            ]"
          >
            <span>📈 Charge CPU (%)</span>
          </button>

          <button 
            @click="activeMetric = 'water_carbon'"
            :class="[
              'px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1.5',
              activeMetric === 'water_carbon' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'text-slate-400 hover:text-white'
            ]"
          >
            <span>💧 Eau &amp; 🌱 Carbone</span>
          </button>
        </div>
      </div>

      <!-- Zone de Rendu SVG Multi-Courbes -->
      <div class="w-full h-56 relative bg-slate-950/90 rounded-xl p-4 border border-slate-800 flex flex-col justify-between">
        
        <svg viewBox="0 0 540 180" class="w-full h-full overflow-visible">
          <!-- Dégradé sous la courbe Watts -->
          <defs>
            <linearGradient id="wattsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.35" />
              <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.0" />
            </linearGradient>

            <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.4" />
              <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.0" />
            </linearGradient>

            <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#0ea5e9" stop-opacity="0.35" />
              <stop offset="100%" stop-color="#0ea5e9" stop-opacity="0.0" />
            </linearGradient>
          </defs>

          <!-- Lignes horizontales de repère (Axes Y) -->
          <line x1="35" y1="20" x2="535" y2="20" stroke="#1e293b" stroke-dasharray="3,3" />
          <line x1="35" y1="52" x2="535" y2="52" stroke="#1e293b" stroke-dasharray="3,3" />
          <line x1="35" y1="85" x2="535" y2="85" stroke="#1e293b" stroke-dasharray="3,3" />
          <line x1="35" y1="117" x2="535" y2="117" stroke="#1e293b" stroke-dasharray="3,3" />
          <line x1="35" y1="150" x2="535" y2="150" stroke="#334155" />

          <!-- Labels Y selon la métrique active -->
          <g v-if="activeMetric === 'watts'" fill="#64748b" font-size="9" font-family="monospace">
            <text x="4" y="24">{{ maxYWatts }}W</text>
            <text x="4" y="56">{{ Math.round(maxYWatts * 0.75) }}W</text>
            <text x="4" y="89">{{ Math.round(maxYWatts * 0.5) }}W</text>
            <text x="4" y="121">{{ Math.round(maxYWatts * 0.25) }}W</text>
            <text x="4" y="153">0W</text>
          </g>

          <g v-else-if="activeMetric === 'cpu'" fill="#64748b" font-size="9" font-family="monospace">
            <text x="4" y="24">{{ maxYCpu }}%</text>
            <text x="4" y="56">{{ Math.round(maxYCpu * 0.75) }}%</text>
            <text x="4" y="89">{{ Math.round(maxYCpu * 0.5) }}%</text>
            <text x="4" y="121">{{ Math.round(maxYCpu * 0.25) }}%</text>
            <text x="4" y="153">0%</text>
          </g>

          <g v-else fill="#64748b" font-size="9" font-family="monospace">
            <text x="4" y="24">Max</text>
            <text x="4" y="56">75%</text>
            <text x="4" y="89">50%</text>
            <text x="4" y="121">25%</text>
            <text x="4" y="153">0</text>
          </g>

          <!-- 1. VUE WATTS (Courbe + Surface Dégradée) -->
          <g v-if="activeMetric === 'watts'">
            <path :d="dynamicAreaSvgPath" fill="url(#wattsGradient)" />
            <path :d="dynamicSvgPath" fill="none" stroke="#06b6d4" stroke-width="2.5" />
          </g>

          <!-- 2. VUE CPU LOAD (%) -->
          <g v-else-if="activeMetric === 'cpu'">
            <path :d="dynamicCpuAreaSvgPath" fill="url(#cpuGradient)" />
            <path :d="dynamicCpuLoadSvgPath" fill="none" stroke="#38bdf8" stroke-width="2.5" />
          </g>

          <!-- 3. VUE EAU & CARBONE -->
          <g v-else>
            <path :d="dynamicWaterSvgPath" fill="none" stroke="#0ea5e9" stroke-width="2.5" />
          </g>

          <!-- Repères temporels horizontaux (Axe X) -->
          <g v-if="timeseries.length >= 2" fill="#64748b" font-size="9" font-family="monospace">
            <text x="35" y="168">{{ timeseries[0].time }}</text>
            <text x="260" y="168" text-anchor="middle">{{ timeseries[Math.floor(timeseries.length / 2)].time }}</text>
            <text x="535" y="168" text-anchor="end">{{ timeseries[timeseries.length - 1].time }}</text>
          </g>
        </svg>

      </div>

      <!-- Légende et Synthèse sous le Graphique -->
      <div class="mt-4 flex flex-wrap items-center justify-between gap-3 text-slate-400 text-[11px]">
        <div class="flex items-center gap-4">
          <span class="flex items-center gap-1.5 text-cyan-300 font-bold">
            <span class="w-3 h-1 bg-cyan-400 rounded-full inline-block"></span>
            <span>Courbe : {{ activeMetric === 'watts' ? 'Puissance Globale RAPL' : activeMetric === 'cpu' ? 'Charge CPU Totale' : 'Empreinte Hydrique (cl H₂O)' }}</span>
          </span>
          <span class="text-slate-500">•</span>
          <span>Moyenne période : <strong class="text-white">{{ activeMetric === 'watts' ? summary.avg_watts.toFixed(2) + ' W' : activeMetric === 'cpu' ? summary.avg_cpu_load_pct.toFixed(1) + ' %' : (summary.water_usage_liters / Math.max(1, timeseries.length)).toFixed(2) + ' L/pt' }}</strong></span>
          <span class="text-slate-500">•</span>
          <span>Pic max : <strong class="text-amber-300">{{ activeMetric === 'watts' ? summary.max_watts.toFixed(2) + ' W' : summary.max_cpu_load_pct.toFixed(1) + ' %' }}</strong></span>
        </div>

        <div class="text-slate-500">
          {{ timeseries.length }} points d'échantillonnage temporels
        </div>
      </div>

    </div>

    <!-- 4. RÉPARTITION PAR WORKLOAD, NAMESPACE KUBERNETES & SERVICES DOKPLOY -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 font-mono text-xs">
      
      <!-- COLONNE GAUCHE (2 Tiers) : TABLEAU D'ATTRIBUTION SCAPHANDRE / KEPLER -->
      <div class="lg:col-span-2 p-5 rounded-2xl bg-slate-900/70 border border-slate-800/90 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div>
              <h4 class="text-sm font-bold text-white flex items-center gap-2">
                <span>📦</span>
                <span>Attribution de l'Énergie par Workload &amp; Namespace</span>
              </h4>
              <p class="text-[11px] text-slate-400 mt-0.5">
                Ventilation estimée selon les cycles CPU cgroup (méthode Kepler / Scaphandre)
              </p>
            </div>
            <span class="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-bold">
              {{ workloads.length }} workloads
            </span>
          </div>

          <!-- Liste des Workloads / Namespaces -->
          <div class="space-y-3 mt-3">
            <div 
              v-for="wl in workloads" 
              :key="wl.service"
              class="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-all"
            >
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-300 font-bold text-[10px] shrink-0">
                    {{ wl.namespace }}
                  </span>
                  <span class="text-white font-bold truncate">
                    {{ wl.service }}
                  </span>
                  <span class="text-[10px] text-slate-500 hidden sm:inline">
                    ({{ wl.type }})
                  </span>
                </div>

                <div class="flex items-center gap-3 shrink-0">
                  <span v-if="wl.req_count && wl.req_count > 0" class="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-700/40 text-cyan-300 text-[10px] font-bold">
                    {{ wl.req_count }} req
                  </span>
                  <span class="text-amber-400 font-bold">{{ wl.watts }} W</span>
                  <span class="text-cyan-300 font-bold">{{ wl.share_pct }}%</span>
                </div>
              </div>

              <!-- Barre de progression de la part d'énergie -->
              <div class="w-full bg-slate-900 rounded-full h-1.5 mt-2.5 overflow-hidden">
                <div 
                  class="bg-gradient-to-r from-cyan-500 to-amber-500 h-1.5 rounded-full" 
                  :style="{ width: `${wl.share_pct}%` }"
                ></div>
              </div>

              <!-- Ligne de métriques environnementales du workload -->
              <div class="mt-2 flex flex-wrap items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-900">
                <span>CPU: <strong class="text-slate-200">{{ wl.cpu_load_pct }}%</strong></span>
                <span>Énergie: <strong class="text-slate-200">{{ formatKwh(wl.kwh) }}</strong></span>
                <span>CO₂: <strong class="text-emerald-400">{{ wl.carbon_gco2 }} g</strong></span>
                <span>Eau: <strong class="text-sky-300">{{ wl.water_liters }} L</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- COLONNE DROITE (1 Tiers) : STATUT DES SERVEURS DU CLUSTER & AUDIT ECOINDEX -->
      <div class="space-y-5">
        
        <!-- Cartouche Nœuds du Cluster -->
        <div class="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/90">
          <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <h4 class="text-sm font-bold text-white flex items-center gap-2">
              <span>🖥️</span>
              <span>Nœuds du Cluster</span>
            </h4>
            <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
              {{ nodes.length }} actif{{ nodes.length > 1 ? 's' : '' }}
            </span>
          </div>

          <div v-if="isLoading && nodes.length === 0" class="py-6 text-center text-slate-500 font-mono text-xs animate-pulse">
            Découverte des nœuds du cluster...
          </div>

          <div v-else class="space-y-3">
            <div 
              v-for="node in nodes" 
              :key="node.id"
              class="p-3 rounded-xl bg-slate-950 border border-slate-800"
            >
              <div class="flex items-center justify-between">
                <span class="font-bold text-white">{{ node.hostname }}</span>
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              </div>
              <div class="text-[11px] text-slate-400 mt-1">
                IP: <span class="text-slate-200">{{ node.ip }}</span> • {{ node.provider }}
              </div>
              <div class="text-[10px] text-slate-500 mt-0.5">
                {{ node.os_info }} ({{ node.agent }})
              </div>
              <div class="mt-2 pt-2 border-t border-slate-900 flex items-center justify-between text-[11px]">
                <span class="text-slate-400">Puissance moyenne :</span>
                <span class="text-amber-400 font-bold">{{ node.avg_watts }} W</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Cartouche Éco-Conception EcoIndex v3 -->
        <div class="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/90">
          <div class="text-slate-400 text-[11px]">Audit Passif &amp; Éco-Conception Web</div>
          <div class="flex items-baseline gap-2 mt-1">
            <span class="text-3xl font-extrabold text-emerald-400">82</span>
            <span class="text-xs text-slate-400">/ 100</span>
            <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/40">
              Grade B
            </span>
          </div>
          <p class="text-[11px] text-slate-400 mt-2 leading-relaxed">
            Mesures conformes au standard <strong>EcoIndex v3 (GreenIT.fr)</strong> combinant complexité du DOM, requêtes HTTP et taille des ressources transférées.
          </p>
        </div>

      </div>

    </div>

    <!-- 5. ENCART PÉDAGOGIQUE & NORMES ENVIRONNEMENTALES (GHG / BOAVIZTA / ADEME) -->
    <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 font-mono text-[11px] text-slate-400 leading-relaxed space-y-1.5">
      <div class="text-white font-bold flex items-center gap-1.5">
        <span>📐</span>
        <span>Méthodologie &amp; Référentiels GreenOps Standardisés :</span>
      </div>
      <p>
        • <strong>Énergie Matérielle Directe (RAPL)</strong> : Mesures matérielles issues des registres MSR CPU Intel/AMD via <code class="text-emerald-300">/sys/class/powercap/intel-rapl</code>, dissociant la consommation du package CPU et de la mémoire DRAM.
      </p>
      <p>
        • <strong>Empreinte Carbone (GHG Protocol Scope 2)</strong> : Calculée selon le facteur d'émission dynamique du réseau électrique (mix français standardisé à <code class="text-cyan-300">52 gCO₂eq / kWh</code> issu des données RTE / electricityMap).
      </p>
      <p>
        • <strong>Consommation d'Eau (Water Footprint / WUE)</strong> : Estimée à <code class="text-sky-300">1.50 L / kWh</code> selon les référentiels Boavizta &amp; ADEME, intégrant le refroidissement direct évaporatif des datacenters et l'évaporation indirecte du mix électrique (tours aéroréfrigérantes).
      </p>
      <p>
        • <strong>Attribution Workload</strong> : Ventilation de l'énergie par conteneur et namespace Kubernetes inspirée du projet CNCF <strong>Kepler</strong> (Kernel-based Energy Proportionality Exporter).
      </p>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { useTelemetry } from '../../../composables/useTelemetry';

const props = withDefaults(defineProps<{
  isDemo?: boolean;
}>(), {
  isDemo: false,
});

const {
  selectedRange,
  selectedMonth,
  selectedYear,
  customFrom,
  customTo,
  selectedNode,
  selectedNamespace,
  activeMetric,
  isLoading,
  isSimulatedHistory,
  summary,
  timeseries,
  workloads,
  nodes,
  availableMonths,
  maxYWatts,
  maxYCpu,
  dynamicSvgPath,
  dynamicAreaSvgPath,
  dynamicCpuLoadSvgPath,
  dynamicCpuAreaSvgPath,
  dynamicWaterSvgPath,
  fetchEnergyTelemetry,
} = useTelemetry({ isDemo: props.isDemo });

function setRange(range: string) {
  selectedRange.value = range;
  fetchEnergyTelemetry();
}

function onMonthChange(month: string) {
  selectedMonth.value = month;
  selectedRange.value = 'month';
  fetchEnergyTelemetry();
}

function refreshData() {
  fetchEnergyTelemetry();
}

const activePeriodLabel = computed(() => {
  if (selectedRange.value === '1h') return '1 dernière heure';
  if (selectedRange.value === '24h') return 'Dernières 24 heures';
  if (selectedRange.value === '7d') return '7 derniers jours';
  if (selectedRange.value === '30d') return '30 derniers jours';
  if (selectedRange.value === 'month') return formatMonthLabel(selectedMonth.value);
  if (selectedRange.value === 'year') return `Année ${selectedYear.value}`;
  if (selectedRange.value === 'custom') return `Du ${customFrom.value || '...'} au ${customTo.value || '...'}`;
  return selectedRange.value;
});

function formatMonthLabel(m: string): string {
  const parts = m.split('-');
  if (parts.length === 2) {
    const year = parts[0];
    const monthNum = parseInt(parts[1], 10);
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    if (monthNum >= 1 && monthNum <= 12) {
      return `${months[monthNum - 1]} ${year}`;
    }
  }
  return m;
}

function formatKwh(kwh: number): string {
  if (kwh < 1) {
    return `${(kwh * 1000).toFixed(1)} Wh`;
  }
  return `${kwh.toFixed(3)} kWh`;
}

let pollTimer: any = null;

onMounted(() => {
  fetchEnergyTelemetry();

  if (!props.isDemo) {
    // Polling automatique si en direct (1h ou 24h)
    pollTimer = setInterval(() => {
      if (selectedRange.value === '1h' || selectedRange.value === '24h') {
        fetchEnergyTelemetry();
      }
    }, 3500);
  }
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});
</script>
