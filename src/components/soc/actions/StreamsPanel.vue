<template>
  <div class="space-y-5">
    <!-- Sélecteur de Mode en haut : Double Flux Direct vs Mode Kanban SOC -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
      <div class="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 font-mono text-xs gap-1">
        <button 
          @click="streamMode = 'streams'"
          :class="[
            'px-4 py-2 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-2',
            streamMode === 'streams' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
          ]"
        >
          <span>📋 Double Flux Direct (Entrant ⇄ Sortant)</span>
        </button>
        
        <button 
          @click="streamMode = 'kanban'"
          :class="[
            'px-4 py-2 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-2',
            streamMode === 'kanban' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
          ]"
        >
          <span>🗂️ Mode Kanban SOC (Triage Menaces)</span>
        </button>
      </div>

      <div class="text-xs font-mono text-slate-400 flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
        <span>Aegis Gate PEP (:8000) &amp; Sinkhole (:5053) • Traefik ForwardAuth</span>
      </div>
    </div>

    <!-- SOUS-VUE A : MODE KANBAN INTÉGRÉ DIRECTEMENT -->
    <div v-if="streamMode === 'kanban'">
      <AegisTriageKanban />
    </div>

    <!-- SOUS-VUE B : DOUBLE FLUX DIRECT (INGRESS vs EGRESS + GEOIP À LA DEMANDE) -->
    <div v-else class="space-y-5">
      <!-- Barre d'outils & Filtres Avancés des Flux -->
      <div class="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/90 flex flex-col gap-3 font-mono text-xs">
        
        <!-- Ligne 1 : Boutons Catégories Ingress -->
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-slate-400 mr-1">Filtrer :</span>
            <button 
              @click="setStreamFilter('all')"
              :class="['px-3 py-1.5 rounded-lg border cursor-pointer transition-all', streamFilter === 'all' ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white']"
            >
              Tous ({{ ingressStream.length }})
            </button>
            <button 
              @click="setStreamFilter('probes')"
              :class="['px-3 py-1.5 rounded-lg border cursor-pointer transition-all', streamFilter === 'probes' ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white']"
            >
              🤖 Scans Bots PHP/WP ({{ probeEventsCount }})
            </button>
            <button 
              @click="setStreamFilter('exploits')"
              :class="['px-3 py-1.5 rounded-lg border cursor-pointer transition-all', streamFilter === 'exploits' ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white']"
            >
              💥 Exploits Critiques ({{ exploitEventsCount }})
            </button>
            <button 
              @click="setStreamFilter('clean')"
              :class="['px-3 py-1.5 rounded-lg border cursor-pointer transition-all', streamFilter === 'clean' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white']"
            >
              ✓ Trafic Légitime ({{ cleanEventsCount }})
            </button>
          </div>

          <!-- Actions de simulation & carte -->
          <div class="flex flex-wrap items-center gap-2">
            <button 
              @click="handleSimulate"
              :disabled="isSimulatingProbes"
              class="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold transition-all cursor-pointer flex items-center gap-1.5"
              title="Envoyer de vraies requêtes de scan (wp-login.php, wp-content, xmlrpc.php, .env) sur Aegis Gate (:8000)"
            >
              <span>⚡ {{ isSimulatingProbes ? 'Envoi...' : 'Simuler Scans Bots' }}</span>
            </button>

            <button 
              @click="showGeoMap = !showGeoMap"
              :class="[
                'px-3.5 py-1.5 rounded-xl border font-bold transition-all cursor-pointer flex items-center gap-1.5',
                showGeoMap ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200' : 'bg-slate-950 border-slate-700 text-slate-300 hover:text-white'
              ]"
            >
              <span>🗺️ {{ showGeoMap ? 'Masquer Carte' : 'Carte GeoIP' }}</span>
            </button>
          </div>
        </div>

        <!-- Ligne 2 : Filtres Domaine (Host), Date et Recherche -->
        <div class="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-800/80">
          <div class="flex flex-wrap items-center gap-3">
            
            <!-- Sélecteur de Domaine (Host / VirtualHost) -->
            <div class="flex items-center gap-1.5">
              <span class="text-slate-400 flex items-center gap-1">
                <span>🌐</span>
                <span>Domaine (Host) :</span>
              </span>
              <select 
                :value="selectedHost" 
                @change="handleHostChange(($event.target as HTMLSelectElement).value)"
                class="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-cyan-300 font-bold focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="all">🌐 Tous les domaines</option>
                <option v-for="h in allDomainOptions" :key="h" :value="h">
                  {{ h }}
                </option>
              </select>
            </div>

            <!-- Filtre par Date (Historique) -->
            <div class="flex items-center gap-1.5">
              <span class="text-slate-400 flex items-center gap-1">
                <span>📅</span>
                <span>Date :</span>
              </span>
              <input 
                type="date" 
                :value="selectedDate" 
                @change="handleDateChange(($event.target as HTMLInputElement).value)"
                class="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
              />
              <button 
                v-if="selectedDate"
                @click="handleDateChange('')"
                class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-bold cursor-pointer"
                title="Revenir au flux direct d'aujourd'hui"
              >
                Direct / Aujourd'hui
              </button>
            </div>
          </div>

          <!-- Barre de Recherche Rapide (IP, URI, Domaine) -->
          <div class="relative">
            <input 
              :value="searchQuery" 
              @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
              type="text" 
              placeholder="Rechercher IP, URI, hôte..."
              class="bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-1 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-56 text-xs"
            />
            <span class="absolute left-2.5 top-1 text-slate-500 text-[11px]">🔍</span>
          </div>
        </div>

      </div>

      <!-- CARTE GEOIP À LA DEMANDE -->
      <div v-if="showGeoMap" class="p-4 rounded-2xl bg-slate-900/70 border border-cyan-500/30 shadow-xl">
        <div class="flex items-center justify-between mb-3 font-mono text-xs">
          <span class="text-cyan-300 font-bold">🗺️ Cartographie GeoIP Temps Réel des Requêtes Interceptées</span>
          <span class="text-slate-400">{{ mapEvents.length }} points géolocalisés</span>
        </div>
        <AegisOsmMap :events="mapEvents" />
      </div>

      <!-- DOUBLE LISTE CÔTE À CÔTE : INGRESS (GAUCHE) vs EGRESS (DROITE) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        <!-- COLONNE GAUCHE : REQUÊTES ENTRANTES (INGRESS :8000) -->
        <div class="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5 flex flex-col">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-3 border-b border-slate-800 gap-2">
            <div>
              <h2 class="text-sm font-bold text-white flex items-center gap-2 font-mono">
                <span class="text-cyan-400">⬇️</span>
                <span>FLUX ENTRANT (INGRESS — Aegis Gate :8000)</span>
              </h2>
              <p class="text-[11px] text-slate-400 mt-0.5">
                Détection des scans bots (WordPress/PHP), OWASP Top 10 &amp; Buffer Overflows (413)
              </p>
            </div>
            
            <!-- Compteurs : 50 affichées & Total 24h -->
            <div class="flex items-center gap-2 shrink-0 font-mono text-xs">
              <span class="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">
                {{ filteredIngressStream.length }} affichées
              </span>
              <span class="px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-300 text-[11px]" title="Total des requêtes sur les dernières 24h">
                24h : <strong class="text-white">{{ totalIngress24h }}</strong> req (<strong class="text-rose-400">{{ blockedIngress24h }}</strong> bloquées)
              </span>
            </div>
          </div>

          <div v-if="isLoading && filteredIngressStream.length === 0" class="py-12 text-center text-slate-500 font-mono text-xs animate-pulse">
            Synchronisation du flux Ingress (:8000)...
          </div>

          <div v-else-if="filteredIngressStream.length === 0" class="py-12 text-center text-slate-500 font-mono text-xs">
            Aucune requête entrante correspondant aux filtres. Cliquez sur « ⚡ Simuler Scans Bots » ou ajustez la sélection.
          </div>

          <div v-else class="space-y-2.5 max-h-[580px] overflow-y-auto pr-1 font-mono text-xs">
            <div 
              v-for="item in filteredIngressStream" 
              :key="item.id"
              @click="openInspect(item, 'INGRESS')"
              class="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-cyan-500/40 hover:bg-slate-900/90 transition-all cursor-pointer group"
              title="Cliquez pour inspecter en détail"
            >
              <!-- Ligne Cible & Code retour -->
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 min-w-0">
                  <span 
                    :class="[
                      'px-2 py-0.5 rounded text-[10px] font-extrabold shrink-0',
                      item.decision === 'BLOCK' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      item.decision === 'BYPASS' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    ]"
                  >
                    {{ item.decision === 'BLOCK' ? `BLOQUÉ (${(item as any).http_status ?? item.status_code})` : item.decision === 'BYPASS' ? `COMPROMIS (${(item as any).http_status ?? item.status_code})` : `OK (${(item as any).http_status ?? item.status_code})` }}
                  </span>
                  
                  <span class="text-white font-bold truncate group-hover:text-cyan-200 transition-colors" :title="item.target">
                    {{ item.method }} {{ item.target }}
                  </span>
                </div>
                <span class="text-[10px] text-slate-500 shrink-0">{{ formatTime(item.timestamp) }}</span>
              </div>

              <!-- Ligne Domaine (Host) & IP source -->
              <div class="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div class="flex items-center gap-2 flex-wrap">
                  <!-- Badge Domaine Host ciblé -->
                  <span 
                    class="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 font-bold text-[10px] flex items-center gap-1 shadow-xs"
                    :title="`Domaine cible analysé : ${item.host || 'aegis.aivo.fr'}`"
                  >
                    <span>🌐</span>
                    <span>{{ item.host || 'aegis.aivo.fr' }}</span>
                  </span>

                  <span class="text-slate-400">IP: <strong class="text-slate-200">{{ item.client_ip }}</strong></span>
                  
                  <span v-if="item.country" class="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[10px]" :title="`Pays: ${item.country}`">
                    {{ item.country === 'FR' ? '🇫🇷' : item.country === 'DE' ? '🇩🇪' : item.country === 'US' ? '🇺🇸' : item.country === 'GB' ? '🇬🇧' : item.country === 'SG' ? '🇸🇬' : item.country === 'RU' ? '🇷🇺' : '🌐' }} {{ item.country }}
                  </span>

                  <span class="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[10px]">
                    {{ item.category || 'TRAFFIC' }}
                  </span>

                  <span v-if="item.metadata?.engine" class="hidden md:inline-flex px-1.5 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/40 text-cyan-300 text-[10px]">
                    🛡️ {{ item.metadata.engine }}
                  </span>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  <span 
                    :class="[
                      'text-[10px] font-bold px-1.5 py-0.5 rounded',
                      ((item as any).hack_probability ?? 95) >= 85 ? 'bg-rose-950/80 text-rose-300 border border-rose-500/30' : 'bg-slate-900 text-emerald-400'
                    ]"
                  >
                    Prob. Scan : {{ (item as any).hack_probability ?? (item.decision === 'ALLOW' ? 5 : 95) }}%
                  </span>

                  <span class="text-slate-500 text-[10px]">{{ (item as any).latency_ms ?? 0.3 }} ms</span>

                  <button 
                    @click.stop="openInspect(item, 'INGRESS')"
                    class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-[10px] font-bold cursor-pointer"
                    title="Inspecter les en-têtes et le détail de la requête"
                  >
                    🔍 Inspecter
                  </button>

                  <button 
                    v-if="item.decision !== 'ALLOW'"
                    @click.stop="$emit('quick-ban', item.client_ip, item.category || 'Exploit')"
                    class="px-2 py-0.5 rounded bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-[10px] font-bold cursor-pointer"
                    title="Bannir immédiatement cette IP sur Aegis Gate Proxy"
                  >
                    🚫 Bannir IP
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- COLONNE DROITE : REQUÊTES SORTANTES (EGRESS DNS & SOCKET :5053) -->
        <div class="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5 flex flex-col">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-3 border-b border-slate-800 gap-2">
            <div>
              <h2 class="text-sm font-bold text-white flex items-center gap-2 font-mono">
                <span class="text-amber-400">⬆️</span>
                <span>FLUX SORTANT (EGRESS — DNS Sinkhole &amp; Sockets :5053)</span>
              </h2>
              <p class="text-[11px] text-slate-400 mt-0.5">
                Interception des callbacks C2, Reverse Shells (/bin/sh) et tunnels DNS par Entropie
              </p>
            </div>
            
            <!-- Compteurs Egress -->
            <div class="flex items-center gap-2 shrink-0 font-mono text-xs">
              <span class="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold">
                {{ egressStream.length }} affichées
              </span>
              <span class="px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-300 text-[11px]" title="Total des requêtes sortantes sur 24h">
                24h : <strong class="text-white">{{ totalEgress24h }}</strong> req (<strong class="text-rose-400">{{ blockedEgress24h }}</strong> bloquées)
              </span>
            </div>
          </div>

          <div v-if="isLoading && egressStream.length === 0" class="py-12 text-center text-slate-500 font-mono text-xs animate-pulse">
            Synchronisation du flux Egress (:5053)...
          </div>

          <div v-else-if="egressStream.length === 0" class="py-12 text-center text-slate-500 font-mono text-xs">
            Aucun flux sortant enregistré. Lancez une batterie de test pour observer le blocage Sinkhole C2 (0.0.0.0).
          </div>

          <div v-else class="space-y-2.5 max-h-[580px] overflow-y-auto pr-1 font-mono text-xs">
            <div 
              v-for="eg in egressStream" 
              :key="eg.id"
              @click="openInspect(eg, 'EGRESS')"
              class="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-amber-500/40 hover:bg-slate-900/90 transition-all cursor-pointer group"
              title="Cliquez pour inspecter en détail"
            >
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 min-w-0">
                  <span 
                    :class="[
                      'px-2 py-0.5 rounded text-[10px] font-extrabold shrink-0',
                      eg.decision === 'BLOCK' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      eg.decision === 'BYPASS' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    ]"
                  >
                    {{ eg.decision === 'BLOCK' ? 'SINKHOLE 0.0.0.0' : eg.decision === 'BYPASS' ? 'EXFILTRÉ (BYPASS)' : eg.decision }}
                  </span>
                  <span class="text-white font-bold truncate group-hover:text-amber-200 transition-colors" :title="eg.domain || eg.target_ip">
                    DNS/TCP ➔ {{ eg.domain || eg.target_ip }}
                  </span>
                </div>
                <span class="text-[10px] text-slate-500 shrink-0">{{ formatTime(eg.timestamp) }}</span>
              </div>

              <div class="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div class="flex items-center gap-2 flex-wrap">
                  <!-- Domaine d'origine si disponible -->
                  <span 
                    v-if="eg.host || eg.domain"
                    class="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/50 text-amber-300 font-bold text-[10px] flex items-center gap-1"
                  >
                    <span>🌐</span>
                    <span>{{ eg.host || eg.domain }}</span>
                  </span>

                  <span class="text-slate-400">IP: <strong class="text-slate-200">{{ eg.client_ip || '127.0.0.1' }}</strong></span>
                  <span class="text-slate-400">Entropie : <strong class="text-cyan-300">H = {{ eg.entropy || 0 }}</strong></span>
                  <span class="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-300 text-[10px]">
                    {{ eg.threat_type || 'NORMAL' }}
                  </span>
                  <span v-if="eg.metadata?.engine" class="hidden md:inline-flex px-1.5 py-0.5 rounded bg-amber-950/40 border border-amber-800/40 text-amber-300 text-[10px]">
                    🛡️ {{ eg.metadata.engine }}
                  </span>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  <span 
                    :class="[
                      'text-[10px] font-bold px-1.5 py-0.5 rounded',
                      ((eg as any).exfil_probability ?? 90) >= 80 ? 'bg-rose-950/80 text-rose-300 border border-rose-500/30' : 'bg-slate-900 text-emerald-400'
                    ]"
                  >
                    Prob. Exfil : {{ (eg as any).exfil_probability ?? (eg.decision === 'ALLOW' ? 5 : 95) }}%
                  </span>

                  <button 
                    @click.stop="openInspect(eg, 'EGRESS')"
                    class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-[10px] font-bold cursor-pointer"
                  >
                    🔍 Inspecter
                  </button>

                  <span class="text-slate-500 text-[10px]">{{ (eg as any).latency_ms ?? 4 }} ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- MODAL D'INSPECTION DÉTAILLÉE DE REQUÊTE -->
    <transition enter-active-class="transition duration-150 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-100 ease-in" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
      <div v-if="selectedInspectItem" class="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
        <div class="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative font-mono text-xs flex flex-col max-h-[90vh]">
          
          <!-- En-tête Modal -->
          <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <h4 class="text-sm font-bold text-white flex items-center gap-2">
              <span class="text-cyan-400">🔍</span>
              <span>Analyse Approfondie de la Requête (SOC Forensics)</span>
            </h4>
            <button @click="selectedInspectItem = null" class="text-slate-400 hover:text-white text-base cursor-pointer p-1">✕</button>
          </div>

          <!-- Corps Modal -->
          <div class="space-y-3 overflow-y-auto pr-1 text-slate-300 flex-1">
            
            <!-- Synthèse Statut & Décision -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div class="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span class="text-[10px] text-slate-500 block">Décision</span>
                <span :class="['font-bold text-xs', selectedInspectItem.decision === 'BLOCK' ? 'text-rose-400' : selectedInspectItem.decision === 'BYPASS' ? 'text-amber-400' : 'text-emerald-400']">
                  {{ selectedInspectItem.decision }} ({{ (selectedInspectItem as any).http_status ?? selectedInspectItem.status_code ?? 200 }})
                </span>
              </div>

              <div class="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span class="text-[10px] text-slate-500 block">Direction</span>
                <span class="font-bold text-xs text-white">
                  {{ inspectDirection }}
                </span>
              </div>

              <div class="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span class="text-[10px] text-slate-500 block">Probabilité Menace</span>
                <span class="font-bold text-xs text-rose-300">
                  {{ (selectedInspectItem as any).hack_probability ?? (selectedInspectItem as any).exfil_probability ?? 95 }}%
                </span>
              </div>

              <div class="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span class="text-[10px] text-slate-500 block">Latence PEP</span>
                <span class="font-bold text-xs text-cyan-300">
                  {{ (selectedInspectItem as any).latency_ms ?? 0.24 }} ms
                </span>
              </div>
            </div>

            <!-- Paramètres de Requête -->
            <div class="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-slate-500">ID Événement :</span>
                <span class="text-cyan-400 font-bold select-all">{{ selectedInspectItem.id }}</span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-slate-500">Domaine Ciblé (Host) :</span>
                <span class="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold select-all">
                  🌐 {{ selectedInspectItem.host || (selectedInspectItem as any).domain || 'aegis.aivo.fr' }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-slate-500">Horodatage :</span>
                <span class="text-slate-300 select-all">{{ selectedInspectItem.timestamp }}</span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-slate-500">Cible &amp; Méthode :</span>
                <span class="text-white font-bold select-all">{{ (selectedInspectItem as any).method || 'GET' }} {{ (selectedInspectItem as any).target || (selectedInspectItem as any).request_uri || (selectedInspectItem as any).domain }}</span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-slate-500">Client IP :</span>
                <div class="flex items-center gap-2">
                  <span class="text-white font-bold select-all">{{ selectedInspectItem.client_ip }}</span>
                  <button 
                    @click="copyText(selectedInspectItem.client_ip)" 
                    class="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] cursor-pointer"
                  >
                    {{ copiedText === selectedInspectItem.client_ip ? '✓ Copié' : 'Copier' }}
                  </button>
                </div>
              </div>

              <div v-if="(selectedInspectItem as any).user_agent" class="flex flex-col gap-1 pt-1 border-t border-slate-900">
                <span class="text-slate-500">User-Agent HTTP :</span>
                <span class="text-slate-400 bg-slate-900/60 p-1.5 rounded select-all break-all text-[11px]">
                  {{ (selectedInspectItem as any).user_agent }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-slate-500">Classification SOC :</span>
                <span class="text-amber-300 font-bold">
                  {{ (selectedInspectItem as any).category || (selectedInspectItem as any).threat_type || 'WAF_INSPECTION' }}
                </span>
              </div>

              <div v-if="(selectedInspectItem as any).lat" class="flex items-center justify-between">
                <span class="text-slate-500">Localisation GeoIP :</span>
                <span class="text-slate-300">
                  Coords: {{ (selectedInspectItem as any).lat }}, {{ (selectedInspectItem as any).lon }}
                </span>
              </div>
            </div>

            <!-- Métadonnées JSON Complètes -->
            <div class="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span class="text-slate-500 block mb-1 text-[11px] font-bold">Métadonnées brutes de l'inspection :</span>
              <pre class="p-2.5 rounded bg-slate-900/80 border border-slate-800 text-[10px] text-slate-300 overflow-x-auto max-h-40 overflow-y-auto select-all">{{ JSON.stringify(selectedInspectItem.metadata || selectedInspectItem, null, 2) }}</pre>
            </div>

          </div>

          <!-- Pied de page Modal & Actions -->
          <div class="flex items-center justify-between pt-4 mt-3 border-t border-slate-800">
            <div class="text-[11px] text-slate-500">
              Protection Aegis Gate Zero-Trust • Traefik ForwardAuth
            </div>

            <div class="flex items-center gap-2">
              <button 
                v-if="selectedInspectItem.decision !== 'ALLOW' && selectedInspectItem.client_ip"
                @click="triggerBanFromModal"
                class="px-3.5 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold hover:bg-rose-500/30 transition-all cursor-pointer"
              >
                🚫 Bannir IP ({{ selectedInspectItem.client_ip }})
              </button>

              <button 
                @click="selectedInspectItem = null"
                class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer font-bold"
              >
                Fermer
              </button>
            </div>
          </div>

        </div>
      </div>
    </transition>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import AegisOsmMap from '../AegisOsmMap.vue';
import AegisTriageKanban from '../AegisTriageKanban.vue';
import { type IngressEvent, type EgressEvent } from '../../../services/api/streamsApi';

const props = withDefaults(defineProps<{
  ingressStream: IngressEvent[];
  egressStream: EgressEvent[];
  filteredIngressStream: IngressEvent[];
  probeEventsCount: number;
  exploitEventsCount: number;
  cleanEventsCount: number;
  totalIngress24h?: number;
  blockedIngress24h?: number;
  totalEgress24h?: number;
  blockedEgress24h?: number;
  availableHosts?: string[];
  streamFilter?: 'all' | 'probes' | 'exploits' | 'clean';
  selectedHost?: string;
  selectedDate?: string;
  searchQuery?: string;
  mapEvents: any[];
  isSimulatingProbes: boolean;
  isLoading?: boolean;
}>(), {
  totalIngress24h: 0,
  blockedIngress24h: 0,
  totalEgress24h: 0,
  blockedEgress24h: 0,
  availableHosts: () => [],
  streamFilter: 'all',
  selectedHost: 'all',
  selectedDate: '',
  searchQuery: '',
  isLoading: false,
});

const emit = defineEmits<{
  (e: 'simulate'): void;
  (e: 'quick-ban', ip: string, category: string): void;
  (e: 'update:streamFilter', val: 'all' | 'probes' | 'exploits' | 'clean'): void;
  (e: 'update:selectedHost', val: string): void;
  (e: 'update:selectedDate', val: string): void;
  (e: 'update:searchQuery', val: string): void;
  (e: 'filter-change'): void;
}>();

const streamMode = ref<'streams' | 'kanban'>('streams');
const showGeoMap = ref(false);

// Inspection Modal state
const selectedInspectItem = ref<IngressEvent | EgressEvent | null>(null);
const inspectDirection = ref<'INGRESS' | 'EGRESS'>('INGRESS');
const copiedText = ref<string>('');

// Combine available hosts from props with known system domains
const allDomainOptions = computed(() => {
  const set = new Set<string>();
  // Add default VPS domains
  set.add('nicolas.baud.dev');
  set.add('aegis.aivo.fr');
  
  if (props.availableHosts) {
    props.availableHosts.forEach(h => {
      if (h && !h.includes(':')) set.add(h);
    });
  }
  return Array.from(set).sort();
});

function setStreamFilter(filter: 'all' | 'probes' | 'exploits' | 'clean') {
  emit('update:streamFilter', filter);
}

function handleHostChange(host: string) {
  emit('update:selectedHost', host);
  emit('filter-change');
}

function handleDateChange(date: string) {
  emit('update:selectedDate', date);
  emit('filter-change');
}

function openInspect(item: IngressEvent | EgressEvent, direction: 'INGRESS' | 'EGRESS') {
  selectedInspectItem.value = item;
  inspectDirection.value = direction;
}

function triggerBanFromModal() {
  if (selectedInspectItem.value && selectedInspectItem.value.client_ip) {
    const cat = (selectedInspectItem.value as any).category || (selectedInspectItem.value as any).threat_type || 'Exploit';
    emit('quick-ban', selectedInspectItem.value.client_ip, cat);
    selectedInspectItem.value = null;
  }
}

function copyText(txt: string) {
  if (!txt) return;
  navigator.clipboard?.writeText(txt);
  copiedText.value = txt;
  setTimeout(() => {
    if (copiedText.value === txt) copiedText.value = '';
  }, 2500);
}

function formatTime(ts: string) {
  if (!ts) return '';
  const d = new Date(ts.replace(' ', 'T'));
  if (isNaN(d.getTime())) return ts.slice(11, 19);
  return d.toLocaleTimeString('fr-FR');
}

function handleSimulate() {
  emit('simulate');
}
</script>
