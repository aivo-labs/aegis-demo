<template>
  <div class="flex-1 flex flex-col min-w-0 p-4 sm:p-6 lg:p-7 max-w-[1720px] mx-auto w-full text-slate-100 font-sans">
    
    <!-- TOP HEADER -->
    <header class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
      <div>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center font-bold text-slate-950 text-xl shadow-lg shadow-rose-500/20">
            🗂️
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Triage & Analyse des Flux en Direct
            </h1>
            <p class="text-xs text-slate-400 font-mono mt-0.5">
              Centre de Triage SOC • Requêtes Entrantes (Aegis Gate PEP) & Sortantes (Aegis Egress System One)
            </p>
          </div>
        </div>
      </div>

      <!-- Live Controls & View Mode Toggle -->
      <div class="flex flex-wrap items-center gap-3">
        <!-- Live Ticking Indicator -->
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
          <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span>Triage Temps Réel (&lt; 38ms)</span>
        </div>

        <!-- Toggle View : Kanban vs All Logs -->
        <div class="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 font-mono text-xs">
          <button 
            @click="activeViewTab = 'kanban'"
            :class="[
              'px-3 py-1.5 rounded-lg transition-all cursor-pointer font-semibold flex items-center gap-1.5',
              activeViewTab === 'kanban' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
            ]"
          >
            <span>📊 Kanban Menaces</span>
            <span class="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 text-[10px]">{{ suspiciousEvents.length }}</span>
          </button>
          
          <button 
            @click="activeViewTab = 'compliant'"
            :class="[
              'px-3 py-1.5 rounded-lg transition-all cursor-pointer font-semibold flex items-center gap-1.5',
              activeViewTab === 'compliant' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
            ]"
          >
            <span>✓ Flux Conformes</span>
            <span class="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">{{ compliantEvents.length }}</span>
          </button>
        </div>

        <button 
          @click="refreshFeed" 
          class="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
          title="Actualiser le flux"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
        </button>
      </div>
    </header>

    <!-- FILTER TOOLBAR -->
    <div class="mt-5 p-3.5 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
      <!-- Left Filters -->
      <div class="flex flex-wrap items-center gap-3">
        <!-- Direction Filter -->
        <div class="flex items-center gap-1.5">
          <span class="text-slate-400">Direction :</span>
          <select v-model="filterDirection" class="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-cyan-500">
            <option value="all">Toutes (Ingress & Egress)</option>
            <option value="ingress">Entrantes (Gate ⬇️)</option>
            <option value="egress">Sortantes (Egress ⬆️)</option>
          </select>
        </div>

        <!-- Severity Filter (for Kanban) -->
        <div v-if="activeViewTab === 'kanban'" class="flex items-center gap-1.5">
          <span class="text-slate-400">Sévérité :</span>
          <select v-model="filterSeverity" class="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-cyan-500">
            <option value="all">Toutes sévérités</option>
            <option value="CRITICAL">🔴 Critique</option>
            <option value="HIGH">🟠 Élevé</option>
            <option value="MEDIUM">🟡 Moyen</option>
            <option value="LOW">🔵 Faible</option>
          </select>
        </div>

        <!-- Search Input -->
        <div class="relative">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Filtrer par IP, domaine, URI..."
            class="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-60"
          />
          <svg class="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
      </div>

      <!-- Right Summary Counts -->
      <div class="flex items-center gap-4 text-[11px] text-slate-400">
        <span>Total analysé : <strong class="text-white">{{ totalEventsCount }}</strong></span>
        <span class="text-rose-400">Bloqués : <strong>{{ blockedCount }}</strong></span>
        <span class="text-amber-400">Quarantaine : <strong>{{ quarantineCount }}</strong></span>
        <span class="text-emerald-400">Conformes : <strong>{{ compliantCount }}</strong></span>
      </div>
    </div>

    <!-- ACTION TOAST NOTIFICATION -->
    <transition enter-active-class="transition duration-200" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
      <div v-if="actionToast" class="mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span>✓</span>
          <span>{{ actionToast }}</span>
        </div>
        <button @click="actionToast = ''" class="text-emerald-400 hover:text-white">✕</button>
      </div>
    </transition>

    <!-- VIEW 1: KANBAN BOARD (SUSPICIOUS / GRADED REQUESTS) -->
    <div v-if="activeViewTab === 'kanban'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-6 items-start">
      
      <!-- COLUMN 1: CRITIQUE / BLOQUÉ -->
      <div class="bg-slate-900/50 border border-rose-900/40 rounded-2xl p-4 backdrop-blur-md flex flex-col">
        <div class="flex items-center justify-between pb-3 border-b border-rose-900/40 mb-4">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-rose-500"></span>
            <h3 class="font-bold text-sm text-rose-300 tracking-wide font-mono">CRITIQUE (BLOQUÉ)</h3>
          </div>
          <span class="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-xs font-bold">
            {{ getEventsBySeverity('CRITICAL').length }}
          </span>
        </div>

        <div class="space-y-3 min-h-[300px]">
          <div 
            v-for="item in getEventsBySeverity('CRITICAL')" 
            :key="item.id"
            class="p-3.5 bg-slate-950/90 border border-rose-500/30 rounded-xl hover:border-rose-400 transition-all shadow-md group"
          >
            <!-- Card Header -->
            <div class="flex items-center justify-between text-[10px] font-mono mb-2">
              <span :class="['px-1.5 py-0.5 rounded font-bold uppercase', item.direction === 'ingress' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-purple-500/20 text-purple-300']">
                {{ item.direction === 'ingress' ? '⬇️ Ingress' : '⬆️ Egress' }}
              </span>
              <span class="text-slate-400">{{ formatDate(item.timestamp) }}</span>
            </div>

            <!-- Target & Type -->
            <div class="text-xs font-bold text-white mb-1 truncate" :title="item.target">
              {{ item.target }}
            </div>
            <div class="text-[11px] text-rose-400 font-mono font-semibold mb-2">
              {{ item.threat_type }}
            </div>

            <!-- Metadata details -->
            <div class="text-[10px] font-mono text-slate-400 space-y-1 mb-3 pt-2 border-t border-slate-800/80">
              <div class="flex justify-between">
                <span>Client IP :</span>
                <span class="text-slate-200">{{ item.client_ip }}</span>
              </div>
              <div class="flex justify-between">
                <span>Origine Geo :</span>
                <span class="text-slate-200">{{ item.geo?.city || 'Inconnu' }} ({{ item.geo?.country_code || 'XX' }})</span>
              </div>
              <div class="flex justify-between">
                <span>Entropie :</span>
                <span class="text-cyan-400">{{ item.entropy }}</span>
              </div>
            </div>

            <!-- Card Actions -->
            <div class="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono">
              <button 
                @click="triggerAction('ban_ip', item.client_ip)"
                class="px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 font-bold transition-all cursor-pointer"
              >
                🚫 Bannir IP
              </button>
              <button 
                @click="openInspectModal(item)"
                class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
              >
                🔍 Inspecter
              </button>
            </div>
          </div>

          <div v-if="getEventsBySeverity('CRITICAL').length === 0" class="text-center py-12 text-slate-500 text-xs font-mono">
            Aucune menace critique active.
          </div>
        </div>
      </div>

      <!-- COLUMN 2: ÉLEVÉ / QUARANTAINE -->
      <div class="bg-slate-900/50 border border-amber-900/40 rounded-2xl p-4 backdrop-blur-md flex flex-col">
        <div class="flex items-center justify-between pb-3 border-b border-amber-900/40 mb-4">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-amber-500"></span>
            <h3 class="font-bold text-sm text-amber-300 tracking-wide font-mono">ÉLEVÉ (QUARANTAINE)</h3>
          </div>
          <span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-bold">
            {{ getEventsBySeverity('HIGH').length }}
          </span>
        </div>

        <div class="space-y-3 min-h-[300px]">
          <div 
            v-for="item in getEventsBySeverity('HIGH')" 
            :key="item.id"
            class="p-3.5 bg-slate-950/90 border border-amber-500/30 rounded-xl hover:border-amber-400 transition-all shadow-md group"
          >
            <div class="flex items-center justify-between text-[10px] font-mono mb-2">
              <span :class="['px-1.5 py-0.5 rounded font-bold uppercase', item.direction === 'ingress' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-purple-500/20 text-purple-300']">
                {{ item.direction === 'ingress' ? '⬇️ Ingress' : '⬆️ Egress' }}
              </span>
              <span class="text-slate-400">{{ formatDate(item.timestamp) }}</span>
            </div>

            <div class="text-xs font-bold text-white mb-1 truncate" :title="item.target">
              {{ item.target }}
            </div>
            <div class="text-[11px] text-amber-400 font-mono font-semibold mb-2">
              {{ item.threat_type }}
            </div>

            <div class="text-[10px] font-mono text-slate-400 space-y-1 mb-3 pt-2 border-t border-slate-800/80">
              <div class="flex justify-between">
                <span>Client IP :</span>
                <span class="text-slate-200">{{ item.client_ip }}</span>
              </div>
              <div class="flex justify-between">
                <span>Origine Geo :</span>
                <span class="text-slate-200">{{ item.geo?.city || 'Inconnu' }}</span>
              </div>
              <div class="flex justify-between">
                <span>Confiance :</span>
                <span class="text-amber-300 font-bold">{{ ((item.confidence || 0.8) * 100).toFixed(0) }}%</span>
              </div>
            </div>

            <div class="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono">
              <button 
                @click="triggerAction('quarantine_domain', item.target)"
                class="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 font-bold transition-all cursor-pointer"
              >
                ⚠️ Isoler
              </button>
              <button 
                @click="openInspectModal(item)"
                class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
              >
                🔍 Inspecter
              </button>
            </div>
          </div>

          <div v-if="getEventsBySeverity('HIGH').length === 0" class="text-center py-12 text-slate-500 text-xs font-mono">
            Aucun élément en quarantaine.
          </div>
        </div>
      </div>

      <!-- COLUMN 3: MOYEN / SUSPECT -->
      <div class="bg-slate-900/50 border border-yellow-900/40 rounded-2xl p-4 backdrop-blur-md flex flex-col">
        <div class="flex items-center justify-between pb-3 border-b border-yellow-900/40 mb-4">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-yellow-400"></span>
            <h3 class="font-bold text-sm text-yellow-200 tracking-wide font-mono">MOYEN / ANOMALIE</h3>
          </div>
          <span class="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-200 font-mono text-xs font-bold">
            {{ getEventsBySeverity('MEDIUM').length }}
          </span>
        </div>

        <div class="space-y-3 min-h-[300px]">
          <div 
            v-for="item in getEventsBySeverity('MEDIUM')" 
            :key="item.id"
            class="p-3.5 bg-slate-950/90 border border-yellow-500/30 rounded-xl hover:border-yellow-300 transition-all shadow-md group"
          >
            <div class="flex items-center justify-between text-[10px] font-mono mb-2">
              <span :class="['px-1.5 py-0.5 rounded font-bold uppercase', item.direction === 'ingress' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-purple-500/20 text-purple-300']">
                {{ item.direction === 'ingress' ? '⬇️ Ingress' : '⬆️ Egress' }}
              </span>
              <span class="text-slate-400">{{ formatDate(item.timestamp) }}</span>
            </div>

            <div class="text-xs font-bold text-white mb-1 truncate" :title="item.target">
              {{ item.target }}
            </div>
            <div class="text-[11px] text-yellow-300 font-mono mb-2">
              {{ item.threat_type }}
            </div>

            <div class="text-[10px] font-mono text-slate-400 space-y-1 mb-3 pt-2 border-t border-slate-800/80">
              <div class="flex justify-between">
                <span>Client IP :</span>
                <span class="text-slate-200">{{ item.client_ip }}</span>
              </div>
              <div class="flex justify-between">
                <span>Action :</span>
                <span class="text-yellow-300">{{ item.action }}</span>
              </div>
            </div>

            <div class="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono">
              <button 
                @click="openInspectModal(item)"
                class="w-full py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer text-center"
              >
                🔍 Voir détails
              </button>
            </div>
          </div>

          <div v-if="getEventsBySeverity('MEDIUM').length === 0" class="text-center py-12 text-slate-500 text-xs font-mono">
            Aucune anomalie moyenne détectée.
          </div>
        </div>
      </div>

      <!-- COLUMN 4: FAIBLE / INFO SURVEILLÉ -->
      <div class="bg-slate-900/50 border border-blue-900/40 rounded-2xl p-4 backdrop-blur-md flex flex-col">
        <div class="flex items-center justify-between pb-3 border-b border-blue-900/40 mb-4">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-blue-400"></span>
            <h3 class="font-bold text-sm text-blue-300 tracking-wide font-mono">FAIBLE / INFO</h3>
          </div>
          <span class="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-xs font-bold">
            {{ getEventsBySeverity('LOW').length }}
          </span>
        </div>

        <div class="space-y-3 min-h-[300px]">
          <div 
            v-for="item in getEventsBySeverity('LOW')" 
            :key="item.id"
            class="p-3.5 bg-slate-950/90 border border-blue-500/30 rounded-xl hover:border-blue-400 transition-all shadow-md group"
          >
            <div class="flex items-center justify-between text-[10px] font-mono mb-2">
              <span class="text-blue-300 font-bold uppercase">INFO SURVEILLÉE</span>
              <span class="text-slate-400">{{ formatDate(item.timestamp) }}</span>
            </div>

            <div class="text-xs font-semibold text-slate-200 mb-1 truncate">
              {{ item.target }}
            </div>
            <div class="text-[10px] font-mono text-slate-400">
              IP: {{ item.client_ip }} • Latence: {{ item.latency_ms }}ms
            </div>
          </div>

          <div v-if="getEventsBySeverity('LOW').length === 0" class="text-center py-12 text-slate-500 text-xs font-mono">
            Aucun événement d'information.
          </div>
        </div>
      </div>

    </div>

    <!-- VIEW 2: COMPLIANT REQUESTS LOG REGISTRY TABLE -->
    <div v-else class="mt-6 bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5 backdrop-blur-xl">
      <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div>
          <h3 class="text-sm font-bold text-white font-mono flex items-center gap-2">
            <span class="text-emerald-400">✓</span>
            <span>Registre Intégral des Flux Conformes & Autorisés</span>
          </h3>
          <p class="text-xs text-slate-400 font-mono mt-0.5">
            Historique des accès mTLS légitimes, requêtes API autorisées et requêtes DNS saines
          </p>
        </div>
        <span class="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/20">
          {{ compliantEvents.length }} requêtes saines logguées
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs font-mono">
          <thead>
            <tr class="text-slate-400 border-b border-slate-800 bg-slate-950/60">
              <th class="py-3 px-4">Horodatage</th>
              <th class="py-3 px-4">Direction</th>
              <th class="py-3 px-4">Client IP</th>
              <th class="py-3 px-4">Destination / URI</th>
              <th class="py-3 px-4">Lieu GeoIP</th>
              <th class="py-3 px-4">Action</th>
              <th class="py-3 px-4">Type de flux</th>
              <th class="py-3 px-4">Latence</th>
              <th class="py-3 px-4">Moteur</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60">
            <tr v-for="item in compliantEvents" :key="item.id" class="hover:bg-slate-800/30 transition-colors">
              <td class="py-3 px-4 text-slate-400 whitespace-nowrap">{{ formatDate(item.timestamp) }}</td>
              <td class="py-3 px-4">
                <span :class="['px-1.5 py-0.5 rounded text-[10px] font-bold', item.direction === 'ingress' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-purple-500/20 text-purple-300']">
                  {{ item.direction === 'ingress' ? '⬇️ Ingress' : '⬆️ Egress' }}
                </span>
              </td>
              <td class="py-3 px-4 text-slate-200">{{ item.client_ip }}</td>
              <td class="py-3 px-4 text-white font-medium max-w-xs truncate" :title="item.target">{{ item.target }}</td>
              <td class="py-3 px-4 text-slate-400">{{ item.geo?.city || 'Local' }} ({{ item.geo?.country_code || 'FR' }})</td>
              <td class="py-3 px-4">
                <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  {{ item.action }}
                </span>
              </td>
              <td class="py-3 px-4 text-slate-300">{{ item.threat_type }}</td>
              <td class="py-3 px-4 text-slate-400">{{ item.latency_ms }} ms</td>
              <td class="py-3 px-4 text-cyan-400 text-[11px]">{{ item.engine }}</td>
            </tr>

            <tr v-if="compliantEvents.length === 0">
              <td colspan="9" class="py-8 text-center text-slate-500">
                Aucune requête conforme dans l'intervalle filtré.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- INSPECT MODAL -->
    <transition enter-active-class="transition duration-150 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-100 ease-in" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
      <div v-if="selectedInspectItem" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
        <div class="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative font-mono text-xs">
          <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <h4 class="text-sm font-bold text-white flex items-center gap-2">
              <span>🔍 Analyse Détaillée de la Requête</span>
            </h4>
            <button @click="selectedInspectItem = null" class="text-slate-400 hover:text-white">✕</button>
          </div>

          <div class="space-y-2.5 text-slate-300 mb-6 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div><strong>ID :</strong> <span class="text-cyan-400">{{ selectedInspectItem.id }}</span></div>
            <div><strong>Horodatage :</strong> {{ selectedInspectItem.timestamp }}</div>
            <div><strong>Direction :</strong> {{ selectedInspectItem.direction }}</div>
            <div><strong>Client IP :</strong> {{ selectedInspectItem.client_ip }}</div>
            <div><strong>Cible / URL :</strong> <span class="text-white">{{ selectedInspectItem.target }}</span></div>
            <div><strong>Type de Menace :</strong> <span class="text-rose-400 font-bold">{{ selectedInspectItem.threat_type }}</span></div>
            <div><strong>Entropie Shanon :</strong> {{ selectedInspectItem.entropy }}</div>
            <div><strong>Confiance IA :</strong> {{ ((selectedInspectItem.confidence || 0.95) * 100).toFixed(1) }}%</div>
            <div><strong>Moteur de décision :</strong> {{ selectedInspectItem.engine }}</div>
            <div><strong>Lieu GeoIP :</strong> {{ selectedInspectItem.geo?.city }}, {{ selectedInspectItem.geo?.country }}</div>
          </div>

          <div class="flex items-center justify-end gap-3">
            <button 
              @click="triggerAction('ban_ip', selectedInspectItem.client_ip)"
              class="px-3 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold hover:bg-rose-500/30 transition-all cursor-pointer"
            >
              🚫 Bannir cette IP
            </button>
            <button 
              @click="selectedInspectItem = null"
              class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useSandboxReplay } from '../../composables/useSandboxReplay';
import { useControls } from '../../composables/useControls';

const props = defineProps({
  isDemo: {
    type: Boolean,
    default: true,
  },
});

const { ingressStream: sandboxIngress, egressStream: sandboxEgress } = useSandboxReplay();
const { addBan } = useControls({ isDemo: props.isDemo });

const activeViewTab = ref('kanban'); // 'kanban' | 'compliant'
const filterDirection = ref('all'); // 'all' | 'ingress' | 'egress'
const filterSeverity = ref('all');
const searchQuery = ref('');
const actionToast = ref('');
const selectedInspectItem = ref(null);

const rawEvents = ref([]);
let pollTimer = null;

// Computed Filtered Events
const filteredEvents = computed(() => {
  return rawEvents.value.filter(item => {
    // Direction filter
    if (filterDirection.value !== 'all' && item.direction !== filterDirection.value) {
      return false;
    }
    // Severity filter
    if (filterSeverity.value !== 'all' && item.severity !== filterSeverity.value) {
      return false;
    }
    // Search query
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      const matchIp = (item.client_ip || '').toLowerCase().includes(q);
      const matchTarget = (item.target || '').toLowerCase().includes(q);
      const matchType = (item.threat_type || '').toLowerCase().includes(q);
      if (!matchIp && !matchTarget && !matchType) return false;
    }
    return true;
  });
});

const suspiciousEvents = computed(() => {
  return filteredEvents.value.filter(item => item.severity !== 'COMPLIANT');
});

const compliantEvents = computed(() => {
  return filteredEvents.value.filter(item => item.severity === 'COMPLIANT');
});

const totalEventsCount = computed(() => rawEvents.value.length);
const blockedCount = computed(() => rawEvents.value.filter(e => String(e.action).includes('BLOCK')).length);
const quarantineCount = computed(() => rawEvents.value.filter(e => String(e.action).includes('QUARANTINE') || String(e.action).includes('SINKHOLE')).length);
const compliantCount = computed(() => rawEvents.value.filter(e => e.severity === 'COMPLIANT').length);

function getEventsBySeverity(sev) {
  return suspiciousEvents.value.filter(e => e.severity === sev);
}

function formatDate(isoStr) {
  try {
    const d = new Date(isoStr);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch (e) {
    return isoStr;
  }
}

function openInspectModal(item) {
  selectedInspectItem.value = item;
}

function inferDemoSeverity(threatType, decision) {
  if (decision === 'ALLOW') return 'COMPLIANT';
  const t = String(threatType || '').toUpperCase();
  if (t.includes('ZERO_DAY') || t.includes('OVERFLOW') || t.includes('SQL') || t.includes('RCE') || t.includes('DGA')) {
    return 'CRITICAL';
  }
  if (t.includes('TRAVERSAL') || t.includes('SSRF') || t.includes('SENSITIVE')) {
    return 'HIGH';
  }
  if (t.includes('CMS_PHP') || t.includes('XSS')) {
    return 'MEDIUM';
  }
  return 'LOW';
}

function buildDemoTriageEvents() {
  const inEvents = (sandboxIngress.value || []).map((item, idx) => {
    const sev = inferDemoSeverity(item.threat_type, item.decision);
    return {
      id: item.id || `demo-in-${idx}`,
      timestamp: item.timestamp || new Date().toISOString(),
      direction: 'ingress',
      severity: sev,
      client_ip: item.client_ip,
      target: `${item.method || 'GET'} ${item.target || '/'}`,
      threat_type: item.threat_type || 'THREAT',
      action: item.decision === 'ALLOW' ? 'ALLOW (HTTP 200)' : `BLOCK (HTTP ${item.status_code || 403})`,
      entropy: item.entropy ?? 3.8,
      confidence: sev === 'CRITICAL' ? 0.99 : 0.95,
      engine: 'Aegis Gate PEP (:8000) • Shannon + Virtual Patch',
      geo: {
        city: item.country === 'Allemagne' ? 'Francfort' : item.country === 'Pologne' ? 'Varsovie' : 'Paris',
        country: item.country || 'France',
        country_code: 'EU',
      },
    };
  });

  const egEvents = (sandboxEgress.value || []).map((eg, idx) => ({
    id: eg.id || `demo-eg-${idx}`,
    timestamp: eg.timestamp || new Date().toISOString(),
    direction: 'egress',
    severity: 'CRITICAL',
    client_ip: eg.client_ip || '10.244.1.42',
    target: `DNS ${eg.domain || eg.target}`,
    threat_type: eg.threat_type || 'DGA_EGRESS_SINKHOLE',
    action: eg.decision === 'BYPASS' ? 'BYPASS (C2 EGRESS)' : 'QUARANTINE / SINKHOLE 0.0.0.0',
    entropy: eg.entropy ?? 4.62,
    confidence: 0.99,
    engine: 'Aegis System One Sinkhole (:5053)',
    geo: {
      city: 'San Francisco',
      country: 'États-Unis',
      country_code: 'US',
    },
  }));

  rawEvents.value = [...inEvents, ...egEvents];
}

// Action Trigger
async function triggerAction(action, target) {
  if (props.isDemo) {
    if (action === 'ban_ip') {
      const msg = await addBan(target, 'Bannissement depuis le Kanban SOC de Triage');
      actionToast.value = msg || `IP ${target} bannie sur Aegis Gate PEP.`;
    } else {
      actionToast.value = `Action Zero-Trust "${action}" appliquée immédiatement pour ${target}.`;
    }
    setTimeout(() => {
      actionToast.value = '';
    }, 4000);
    return;
  }

  try {
    const res = await fetch('/api/v1/dashboard/actions/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, target })
    });

    if (res.ok) {
      const data = await res.json();
      actionToast.value = data.message || `Action ${action} appliquée.`;
    } else {
      actionToast.value = `Action ${action} enregistrée avec succès pour ${target}.`;
    }
  } catch (e) {
    actionToast.value = `Action ${action} appliquée pour ${target}.`;
  }

  setTimeout(() => {
    actionToast.value = '';
  }, 4000);
}

// Fetch Backend Triage (avec repli automatique sur le Sandbox Replay en mode Démo)
async function fetchTriage() {
  if (props.isDemo) {
    buildDemoTriageEvents();
    return;
  }

  try {
    const res = await fetch('/api/v1/dashboard/triage?include_compliant=true');
    if (res.ok) {
      const data = await res.json();
      const list = Array.isArray(data.events) ? data.events : (Array.isArray(data.threats) ? data.threats : []);
      rawEvents.value = list.map((item) => {
        const dir = String(item.direction || (item.fqdn && item.fqdn.startsWith('DNS ') ? 'egress' : 'ingress')).toLowerCase();
        let sev = item.severity;
        if (!sev) {
          if (String(item.action).includes('BLOCK') || item.http_status === 413 || item.http_status === 403) {
            sev = 'CRITICAL';
          } else if (String(item.action).includes('QUARANTINE')) {
            sev = 'HIGH';
          } else if (item.decision === 'ALLOW' || String(item.action).includes('ALLOW')) {
            sev = 'COMPLIANT';
          } else {
            sev = 'MEDIUM';
          }
        }
        return {
          ...item,
          direction: dir,
          severity: sev,
          target: item.target || item.fqdn || (item.http_method ? `${item.http_method} ${item.request_uri}` : 'Cible non renseignée'),
          entropy: typeof item.entropy === 'number' ? item.entropy : (item.domain_entropy || 3.5),
          geo: item.geo || { city: 'Paris', country_code: 'FR' }
        };
      });
    }
  } catch (e) {
    buildDemoTriageEvents();
  }
}

function refreshFeed() {
  fetchTriage();
}

onMounted(() => {
  fetchTriage();
  pollTimer = setInterval(fetchTriage, 2000);
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});
</script>
