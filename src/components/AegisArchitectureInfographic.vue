<template>
  <section class="relative py-20 md:py-28 border-b border-slate-800/80 overflow-hidden bg-[#080d18]">
    <!-- Grille subtile d'arrière-plan -->
    <div class="absolute inset-0 bg-[linear-gradient(to_right,#10b9810a_1px,transparent_1px),linear-gradient(to_bottom,#10b9810a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
      
      <!-- En-tête de section -->
      <div class="max-w-3xl mx-auto text-center space-y-3">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs font-mono text-emerald-300">
          <span>{{ isFr ? 'ARCHITECTURE DE PROTECTION & MESURE UNIFIÉE' : 'UNIFIED PROTECTION & MEASUREMENT ARCHITECTURE' }}</span>
        </div>
        <h2 class="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          {{ isFr ? 'Un Dôme Zero-Trust transparent au-dessus de votre SI' : 'A Transparent Zero-Trust Dome over your Infrastructure' }}
        </h2>
        <p class="text-sm sm:text-base text-slate-300 leading-relaxed">
          {{ isFr 
            ? 'Trois modules autonomes et complémentaires qui filtrent les flux entrants, verrouillent les exfiltrations sortantes et mesurent la consommation électrique réelle de vos serveurs.' 
            : 'Three autonomous, complementary modules that filter inbound traffic, lock down outbound exfiltration, and measure real server hardware power consumption.' }}
        </p>
      </div>

      <!-- SCÈNE VISUELLE : LE DÔME TRANSPARENT + LE SI PROTÉGÉ -->
      <div class="relative rounded-3xl bg-slate-950/80 border border-slate-800/90 p-5 sm:p-8 shadow-2xl overflow-hidden">
        
        <!-- Halo du Dôme -->
        <div class="absolute top-12 left-1/2 -translate-x-1/2 w-[760px] h-[360px] bg-gradient-to-b from-emerald-500/12 via-teal-500/5 to-transparent rounded-t-full blur-2xl pointer-events-none"></div>

        <!-- DIAGRAMME SVG ANIMÉ DU DÔME ET DU SI -->
        <div class="relative w-full max-w-5xl mx-auto">
          <!-- Logo Aegis au Sommet du Dôme -->
          <div class="flex flex-col items-center justify-center relative z-20 mb-2">
            <div class="p-3 rounded-2xl bg-slate-900/90 border border-emerald-400/50 shadow-[0_0_30px_rgba(16,185,129,0.3)] flex flex-col items-center">
              <AegisLogo size="lg" />
              <span class="mt-1 text-[11px] font-mono font-bold text-emerald-300 tracking-wider uppercase">
                {{ isFr ? 'Dôme Aegis Actif' : 'Active Aegis Dome' }}
              </span>
            </div>
          </div>

          <!-- SVG du Dôme Transparent & Flux Animés -->
          <div class="w-full overflow-x-auto">
            <svg viewBox="0 0 960 430" class="w-full min-w-[680px] h-auto overflow-visible select-none">
              <defs>
                <!-- Dégradé du Dôme Transparent -->
                <linearGradient id="domeGlass" x1="480" y1="20" x2="480" y2="390" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="#10b981" stop-opacity="0.18" />
                  <stop offset="50%" stop-color="#34d399" stop-opacity="0.07" />
                  <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.02" />
                </linearGradient>
                <linearGradient id="domeRim" x1="110" y1="360" x2="850" y2="360" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="#06b6d4" />
                  <stop offset="50%" stop-color="#6ee7b7" />
                  <stop offset="100%" stop-color="#f59e0b" />
                </linearGradient>
              </defs>

              <!-- 1. ARCHE DU DÔME TRANSPARENT EN MAILLAGE -->
              <path
                d="M 120,370 C 120,105 300,25 480,25 C 660,25 840,105 840,370 Z"
                fill="url(#domeGlass)"
                stroke="url(#domeRim)"
                stroke-width="2.5"
              />
              <!-- Lignes de maillage internes du Dôme (effet géodésique transparent) -->
              <path d="M 165,370 C 180,155 320,65 480,65 C 640,65 780,155 795,370" fill="none" stroke="#6ee7b7" stroke-opacity="0.28" stroke-width="1.2" stroke-dasharray="5 4" />
              <path d="M 240,370 C 260,195 360,110 480,110 C 600,110 700,195 720,370" fill="none" stroke="#10b981" stroke-opacity="0.22" stroke-width="1" stroke-dasharray="3 3" />
              <line x1="480" y1="25" x2="480" y2="370" stroke="#6ee7b7" stroke-opacity="0.2" stroke-width="1" stroke-dasharray="4 4" />
              <line x1="120" y1="370" x2="840" y2="370" stroke="#334155" stroke-width="2" />

              <!-- 2. FLUX ENTRANT À GAUCHE -> INTERCEPTION MODULE 1 (AEGIS GATE) -->
              <!-- Requête légitime (Verte) qui traverse le dôme -->
              <path id="cleanFlow" d="M 20,175 Q 110,175 185,205 T 335,265" fill="none" stroke="#10b981" stroke-width="2" stroke-dasharray="6 4">
                <animate attributeName="stroke-dashoffset" from="40" to="0" dur="2.5s" repeatCount="indefinite" />
              </path>
              <circle r="4" fill="#6ee7b7">
                <animateMotion dur="2.5s" repeatCount="indefinite" path="M 20,175 Q 110,175 185,205 T 335,265" />
              </circle>
              <text x="22" y="162" fill="#6ee7b7" font-size="11" font-family="monospace" font-weight="bold">
                {{ isFr ? '✓ Trafic Légitime (HTTPS)' : '✓ Legitimate Traffic (HTTPS)' }}
              </text>

              <!-- Attaque entrante (Rouge) bloquée sur la paroi du Dôme -->
              <path d="M 20,235 L 152,235" fill="none" stroke="#f43f5e" stroke-width="2.2" stroke-dasharray="5 3">
                <animate attributeName="stroke-dashoffset" from="32" to="0" dur="1.4s" repeatCount="indefinite" />
              </path>
              <circle cx="156" cy="235" r="7" fill="#f43f5e" fill-opacity="0.25" stroke="#f43f5e" stroke-width="1.5">
                <animate attributeName="r" values="5;10;5" dur="1.6s" repeatCount="indefinite" />
              </circle>
              <text x="22" y="255" fill="#fda4af" font-size="10" font-family="monospace">
                {{ isFr ? '✗ SQLi / RCE / Scan wp-login (403)' : '✗ SQLi / RCE / wp-login Scan (403)' }}
              </text>

              <!-- Badge Module 1 sur la paroi gauche du Dôme (Interactif) -->
              <g 
                transform="translate(125, 110)" 
                class="cursor-pointer transition-transform hover:scale-105"
                @click="activeModule = 'gate'"
              >
                <rect 
                  x="0" y="0" width="185" height="54" rx="12" 
                  :fill="activeModule === 'gate' ? '#082f49' : '#0f172a'" 
                  :stroke="activeModule === 'gate' ? '#38bdf8' : '#06b6d4'" 
                  :stroke-width="activeModule === 'gate' ? 2.5 : 1.8" 
                />
                <text x="14" y="22" fill="#22d3ee" font-size="12" font-family="monospace" font-weight="bold">① AEGIS GATE (Ingress)</text>
                <text x="14" y="40" fill="#cbd5e1" font-size="10" font-family="monospace">WAF &amp; Virtual Patch &lt; 1.5 ms</text>
              </g>

              <!-- 3. REPRÉSENTATION DU SI SOUS LE DÔME (CENTRE) -->
              <g transform="translate(295, 225)">
                <!-- Socle du SI -->
                <rect x="0" y="0" width="370" height="128" rx="16" fill="#090e1a" fill-opacity="0.92" stroke="#1e293b" stroke-width="2" />
                <text x="185" y="22" text-anchor="middle" fill="#94a3b8" font-size="10" font-family="monospace" font-weight="bold">
                  {{ isFr ? "SYSTÈME D'INFORMATION PROTÉGÉ (VPS / BARE-METAL / K8S)" : "PROTECTED INFORMATION SYSTEM (VPS / BARE-METAL / K8S)" }}
                </text>

                <!-- Nœud 1 : Serveurs Web / Apps -->
                <rect x="18" y="34" width="102" height="76" rx="10" fill="#0f172a" stroke="#10b981" stroke-opacity="0.5" stroke-width="1.4" />
                <text x="69" y="56" text-anchor="middle" fill="#ecfdf5" font-size="11" font-family="monospace" font-weight="bold">Apps &amp; API</text>
                <text x="69" y="73" text-anchor="middle" fill="#6ee7b7" font-size="9" font-family="monospace">Nginx / Go / PHP</text>
                <text x="69" y="94" text-anchor="middle" fill="#34d399" font-size="10" font-family="monospace" font-weight="bold">⚡ 3.4 W</text>

                <!-- Nœud 2 : Base de Données -->
                <rect x="134" y="34" width="102" height="76" rx="10" fill="#0f172a" stroke="#06b6d4" stroke-opacity="0.5" stroke-width="1.4" />
                <text x="185" y="56" text-anchor="middle" fill="#ecfdf5" font-size="11" font-family="monospace" font-weight="bold">
                  {{ isFr ? 'Bases SQL' : 'SQL Databases' }}
                </text>
                <text x="185" y="73" text-anchor="middle" fill="#67e8f9" font-size="9" font-family="monospace">PostgreSQL</text>
                <text x="185" y="94" text-anchor="middle" fill="#22d3ee" font-size="10" font-family="monospace" font-weight="bold">⚡ 2.8 W</text>

                <!-- Nœud 3 : Conteneurs / Workers -->
                <rect x="250" y="34" width="102" height="76" rx="10" fill="#0f172a" stroke="#10b981" stroke-opacity="0.5" stroke-width="1.4" />
                <text x="301" y="56" text-anchor="middle" fill="#ecfdf5" font-size="11" font-family="monospace" font-weight="bold">Clusters / VM</text>
                <text x="301" y="73" text-anchor="middle" fill="#6ee7b7" font-size="9" font-family="monospace">Docker / K8s</text>
                <text x="301" y="94" text-anchor="middle" fill="#34d399" font-size="10" font-family="monospace" font-weight="bold">⚡ 3.1 W</text>
              </g>

              <!-- Badge Module 3 (Aegis Green) relié au cœur du SI (Interactif) -->
              <g 
                transform="translate(380, 128)" 
                class="cursor-pointer transition-transform hover:scale-105"
                @click="activeModule = 'green'"
              >
                <rect 
                  x="0" y="0" width="200" height="54" rx="12" 
                  :fill="activeModule === 'green' ? '#064e3b' : '#0f172a'" 
                  :stroke="activeModule === 'green' ? '#34d399' : '#10b981'" 
                  :stroke-width="activeModule === 'green' ? 2.5 : 1.8" 
                />
                <text x="14" y="22" fill="#6ee7b7" font-size="12" font-family="monospace" font-weight="bold">③ AEGIS GREEN (RAPL)</text>
                <text x="14" y="40" fill="#cbd5e1" font-size="10" font-family="monospace">
                  {{ isFr ? 'Watts/Joules Réels & EcoIndex' : 'Real Watts/Joules & EcoIndex' }}
                </text>
              </g>
              <line x1="480" y1="182" x2="480" y2="225" stroke="#10b981" stroke-width="1.8" stroke-dasharray="3 3" />

              <!-- 4. FLUX SORTANT À DROITE -> INTERCEPTION MODULE 2 (AEGIS EGRESS) -->
              <path d="M 665,265 Q 735,235 795,220" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-dasharray="5 3">
                <animate attributeName="stroke-dashoffset" from="32" to="0" dur="1.5s" repeatCount="indefinite" />
              </path>
              <circle cx="798" cy="220" r="8" fill="#f43f5e" fill-opacity="0.3" stroke="#f59e0b" stroke-width="1.8">
                <animate attributeName="r" values="6;11;6" dur="1.5s" repeatCount="indefinite" />
              </circle>
              <text x="815" y="216" fill="#fcd34d" font-size="11" font-family="monospace" font-weight="bold">🚫 Sinkhole 0.0.0.0</text>
              <text x="815" y="233" fill="#fda4af" font-size="10" font-family="monospace">
                {{ isFr ? 'Exfiltration DNS / C2 coupée' : 'DNS / C2 Exfiltration Blocked' }}
              </text>

              <!-- Badge Module 2 sur la paroi droite du Dôme (Interactif) -->
              <g 
                transform="translate(650, 110)" 
                class="cursor-pointer transition-transform hover:scale-105"
                @click="activeModule = 'egress'"
              >
                <rect 
                  x="0" y="0" width="195" height="54" rx="12" 
                  :fill="activeModule === 'egress' ? '#451a03' : '#0f172a'" 
                  :stroke="activeModule === 'egress' ? '#fbbf24' : '#f59e0b'" 
                  :stroke-width="activeModule === 'egress' ? 2.5 : 1.8" 
                />
                <text x="14" y="22" fill="#fbbf24" font-size="12" font-family="monospace" font-weight="bold">
                  {{ isFr ? '② AEGIS EGRESS (Sortant)' : '② AEGIS EGRESS (Outbound)' }}
                </text>
                <text x="14" y="40" fill="#cbd5e1" font-size="10" font-family="monospace">
                  {{ isFr ? 'Sinkhole DNS/TCP & IA Nimble' : 'DNS/TCP Sinkhole & Local AI' }}
                </text>
              </g>
            </svg>
          </div>
        </div>
      </div>

      <!-- SÉLECTEUR D'INTERCALAIRES & FICHE EXPLICATIVE FUSIONNÉE -->
      <div class="relative w-full max-w-5xl mx-auto pt-4">
        
        <!-- SÉLECTEUR : LES 3 ONGLETS / INTERCALAIRES RELIÉS À LA CARTE EN DESSOUS -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3 items-end">
          
          <!-- Intercalaire 1 : Aegis Gate -->
          <button
            type="button"
            @click="activeModule = 'gate'"
            :class="[
              'w-full text-left p-4 sm:p-5 rounded-t-2xl transition-all cursor-pointer relative',
              activeModule === 'gate'
                ? 'bg-slate-900 border-t-2 border-x border-cyan-400 text-white z-20 shadow-[0_-8px_20px_-5px_rgba(6,182,212,0.25)] md:pb-6'
                : 'bg-slate-950/70 hover:bg-slate-900/60 border-t border-x border-slate-800/80 text-slate-400 hover:text-slate-200 z-0 opacity-80 hover:opacity-100 rounded-b-xl md:rounded-b-none'
            ]"
          >
            <!-- Ligne lumineuse active pour l'onglet actif -->
            <div 
              v-if="activeModule === 'gate'"
              class="absolute -top-[2px] inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
            ></div>

            <div class="flex items-center justify-between font-mono text-xs mb-2">
              <span :class="['font-bold tracking-wider', activeModule === 'gate' ? 'text-cyan-400' : 'text-slate-400']">
                MODULE 01 • INGRESS
              </span>
              <span :class="['px-2 py-0.5 rounded text-[11px] font-semibold border', activeModule === 'gate' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-800/80 text-slate-400 border-slate-700/60']">
                &lt; 1.5 ms
              </span>
            </div>
            <div class="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span class="text-lg">🛡️</span>
              <span>Aegis Gate (WAF &amp; Virtual Patching)</span>
            </div>
            <div class="text-[11px] text-slate-400 mt-1">
              {{ isFr ? 'Inspection in-line, OWASP Top 10, anti-scans < 25 Mo RAM' : 'In-line inspection, OWASP Top 10, anti-scanners < 25 MB RAM' }}
            </div>
          </button>

          <!-- Intercalaire 2 : Aegis Egress -->
          <button
            type="button"
            @click="activeModule = 'egress'"
            :class="[
              'w-full text-left p-4 sm:p-5 rounded-t-2xl transition-all cursor-pointer relative',
              activeModule === 'egress'
                ? 'bg-slate-900 border-t-2 border-x border-amber-400 text-white z-20 shadow-[0_-8px_20px_-5px_rgba(245,158,11,0.25)] md:pb-6'
                : 'bg-slate-950/70 hover:bg-slate-900/60 border-t border-x border-slate-800/80 text-slate-400 hover:text-slate-200 z-0 opacity-80 hover:opacity-100 rounded-b-xl md:rounded-b-none'
            ]"
          >
            <!-- Ligne lumineuse active pour l'onglet actif -->
            <div 
              v-if="activeModule === 'egress'"
              class="absolute -top-[2px] inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent"
            ></div>

            <div class="flex items-center justify-between font-mono text-xs mb-2">
              <span :class="['font-bold tracking-wider', activeModule === 'egress' ? 'text-amber-400' : 'text-slate-400']">
                MODULE 02 • EGRESS
              </span>
              <span :class="['px-2 py-0.5 rounded text-[11px] font-semibold border', activeModule === 'egress' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-800/80 text-slate-400 border-slate-700/60']">
                Zero-Exfiltration
              </span>
            </div>
            <div class="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span class="text-lg">🦅</span>
              <span>{{ isFr ? 'Aegis Egress (Sinkhole & IA Locale)' : 'Aegis Egress (Sinkhole & Local AI)' }}</span>
            </div>
            <div class="text-[11px] text-slate-400 mt-1">
              {{ isFr ? 'CoreDNS durci, sinkhole 0.0.0.0 & modèle SLM Nimble 9B' : 'Hardened CoreDNS, 0.0.0.0 sinkhole & Nimble 9B SLM' }}
            </div>
          </button>

          <!-- Intercalaire 3 : Aegis Green -->
          <button
            type="button"
            @click="activeModule = 'green'"
            :class="[
              'w-full text-left p-4 sm:p-5 rounded-t-2xl transition-all cursor-pointer relative',
              activeModule === 'green'
                ? 'bg-slate-900 border-t-2 border-x border-emerald-400 text-white z-20 shadow-[0_-8px_20px_-5px_rgba(16,185,129,0.25)] md:pb-6'
                : 'bg-slate-950/70 hover:bg-slate-900/60 border-t border-x border-slate-800/80 text-slate-400 hover:text-slate-200 z-0 opacity-80 hover:opacity-100 rounded-b-xl md:rounded-b-none'
            ]"
          >
            <!-- Ligne lumineuse active pour l'onglet actif -->
            <div 
              v-if="activeModule === 'green'"
              class="absolute -top-[2px] inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
            ></div>

            <div class="flex items-center justify-between font-mono text-xs mb-2">
              <span :class="['font-bold tracking-wider', activeModule === 'green' ? 'text-emerald-400' : 'text-slate-400']">
                MODULE 03 • GREEN IT
              </span>
              <span :class="['px-2 py-0.5 rounded text-[11px] font-semibold border', activeModule === 'green' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800/80 text-slate-400 border-slate-700/60']">
                RAPL &amp; EcoIndex v3
              </span>
            </div>
            <div class="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span class="text-lg">🌿</span>
              <span>{{ isFr ? 'Aegis Green (Télémétrie Matérielle)' : 'Aegis Green (Hardware Telemetry)' }}</span>
            </div>
            <div class="text-[11px] text-slate-400 mt-1">
              {{ isFr ? 'Watts/Joules réels /sys, PUE datacenters & Norme VS EFRAG' : 'Real /sys Watts/Joules, datacenter PUE & EFRAG VS standard' }}
            </div>
          </button>

        </div>

        <!-- CARTE EXPLICATIVE DÉTAILLÉE : DIRECTEMENT RELIÉE À L'INTERCALAIRE ACTIF -->
        <div 
          :class="[
            'bg-slate-900 border border-slate-800 rounded-b-2xl md:rounded-tr-2xl shadow-2xl relative z-10 -mt-px overflow-hidden transition-all',
            activeModule === 'gate' ? 'md:rounded-tl-none border-t-cyan-500/30' : '',
            activeModule === 'egress' ? 'border-t-amber-500/30' : '',
            activeModule === 'green' ? 'md:rounded-tr-none border-t-emerald-500/30' : ''
          ]"
        >
          
          <!-- 1. En-tête explicatif détaillé du module actif -->
          <div class="p-6 sm:p-8 border-b border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950/60">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div class="space-y-2">
                <div class="flex items-center gap-2.5">
                  <span class="text-2xl">{{ currentModuleData.icon }}</span>
                  <h3 class="text-xl sm:text-2xl font-extrabold text-white">
                    {{ currentModuleData.title }}
                  </h3>
                  <span :class="['px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border', currentModuleData.badgeClass]">
                    {{ currentModuleData.tag }}
                  </span>
                </div>
                <p class="text-sm text-slate-300 leading-relaxed max-w-3xl">
                  {{ currentModuleData.detailedDescription }}
                </p>
              </div>

              <!-- Métriques clés d'empreinte -->
              <div class="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 bg-slate-950/70 p-3 sm:p-4 rounded-xl border border-slate-800 text-xs font-mono">
                <div class="text-slate-400">
                  {{ isFr ? 'Empreinte RAM :' : 'RAM Footprint:' }} <strong class="text-emerald-400 font-bold">{{ currentRamSpec }}</strong>
                </div>
                <div class="text-slate-400">
                  {{ isFr ? 'Impact latence :' : 'Latency Impact:' }} <strong class="text-cyan-400 font-bold">{{ currentLatencySpec }}</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. Grille des 3 caractéristiques techniques approfondies -->
          <div class="p-6 sm:p-8 bg-slate-900/60 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs border-b border-slate-800/80">
            
            <div class="space-y-2.5 p-4 rounded-xl bg-slate-950/60 border border-slate-800/70">
              <div class="font-bold text-white flex items-center gap-2 font-mono text-xs">
                <span :class="currentModuleData.stepColor">01.</span>
                <span>{{ isFr ? 'Interception & Décision' : 'Interception & Decision' }}</span>
              </div>
              <p class="text-slate-300 leading-relaxed">
                {{ currentCardSpecs.interception }}
              </p>
            </div>

            <div class="space-y-2.5 p-4 rounded-xl bg-slate-950/60 border border-slate-800/70">
              <div class="font-bold text-white flex items-center gap-2 font-mono text-xs">
                <span :class="currentModuleData.stepColor">02.</span>
                <span>{{ isFr ? 'Conformité & Métriques' : 'Compliance & Metrics' }}</span>
              </div>
              <p class="text-slate-300 leading-relaxed">
                {{ currentCardSpecs.compliance }}
              </p>
            </div>

            <div class="space-y-2.5 p-4 rounded-xl bg-slate-950/60 border border-slate-800/70 flex flex-col justify-between">
              <div>
                <div class="font-bold text-white flex items-center gap-2 font-mono text-xs mb-2">
                  <span :class="currentModuleData.stepColor">03.</span>
                  <span>{{ isFr ? 'Déploiement Express' : 'Quick Deployment' }}</span>
                </div>
                <div class="font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-slate-200 text-[11px] select-all break-all">
                  {{ currentCardSpecs.command }}
                </div>
              </div>
              <div class="mt-2 text-[10px] text-slate-400 font-mono">
                {{ isFr ? 'Sans agent lourd • Conteneur OCI frugal' : 'No heavy agent • Frugal OCI container' }}
              </div>
            </div>

          </div>

          <!-- 3. ZONE SCHÉMA ASCII SUR DEMANDE & DIMENSIONNEMENT D'INFRASTRUCTURE -->
          <div class="p-6 sm:p-8 bg-slate-950/90 space-y-5">
            
            <!-- Barre de contrôle : Bouton afficher/masquer schéma ASCII + Sélecteur de Dimensionnement -->
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
              
              <!-- Bouton d'affichage du schéma ASCII à la demande -->
              <button
                type="button"
                @click="showAscii = !showAscii"
                class="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-white border border-slate-700 transition-all cursor-pointer font-semibold shadow-sm w-full sm:w-auto justify-center"
              >
                <span>{{ showAscii 
                  ? (isFr ? '▼ Masquer le schéma technique (ASCII)' : '▼ Hide technical diagram (ASCII)') 
                  : (isFr ? '▶ Afficher le schéma technique détaillé (ASCII)' : '▶ Show detailed technical diagram (ASCII)') }}</span>
                <span class="px-1.5 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {{ showAscii ? (isFr ? 'Replier' : 'Collapse') : (isFr ? 'Interactif' : 'Interactive') }}
                </span>
              </button>

              <!-- Sélecteur de Dimensionnement d'Infrastructure -->
              <div class="flex flex-col sm:flex-row items-center gap-2">
                <span class="text-slate-400 text-xs shrink-0">{{ isFr ? 'Dimensionnement :' : 'Sizing:' }}</span>
                <div class="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 w-full sm:w-auto">
                  <button
                    type="button"
                    @click="companySize = 'vps'"
                    :class="[
                      'px-3 py-1.5 rounded transition-all cursor-pointer flex-1 sm:flex-initial text-center text-xs',
                      companySize === 'vps'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
                        : 'text-slate-400 hover:text-slate-200 border border-transparent'
                    ]"
                  >
                    {{ isFr ? 'TPE/PME (VPS)' : 'SMB / Startup (VPS)' }}
                  </button>

                  <button
                    type="button"
                    @click="companySize = 'baremetal'"
                    :class="[
                      'px-3 py-1.5 rounded transition-all cursor-pointer flex-1 sm:flex-initial text-center text-xs',
                      companySize === 'baremetal'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                        : 'text-slate-400 hover:text-slate-200 border border-transparent'
                    ]"
                  >
                    {{ isFr ? 'ETI (Bare-Metal)' : 'Mid-Market (Bare-Metal)' }}
                  </button>

                  <button
                    type="button"
                    @click="companySize = 'k8s'"
                    :class="[
                      'px-3 py-1.5 rounded transition-all cursor-pointer flex-1 sm:flex-initial text-center text-xs',
                      companySize === 'k8s'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold'
                        : 'text-slate-400 hover:text-slate-200 border border-transparent'
                    ]"
                  >
                    {{ isFr ? 'Grand Compte (K8s)' : 'Enterprise (K8s)' }}
                  </button>
                </div>
              </div>

            </div>

            <!-- BLOC ASCII DÉPLIABLE -->
            <div 
              v-if="showAscii"
              class="border border-slate-800 rounded-xl overflow-hidden shadow-2xl transition-all animate-fadeIn"
            >
              <!-- Barre d'état du terminal ASCII -->
              <div class="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span class="text-white font-bold">{{ currentSchemaTitle }}</span>
                </div>
                <div class="flex items-center gap-2 text-slate-400">
                  <button 
                    type="button" 
                    @click="copyAscii" 
                    class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-all cursor-pointer text-[11px]"
                  >
                    {{ copied ? (isFr ? 'Copié !' : 'Copied!') : (isFr ? 'Copier ASCII' : 'Copy ASCII') }}
                  </button>
                </div>
              </div>

              <!-- Contenu ASCII -->
              <div class="p-5 bg-[#090d16] font-mono text-xs overflow-x-auto text-slate-300 leading-relaxed">
                <pre class="text-cyan-300/90 whitespace-pre font-mono select-all">{{ currentAsciiDiagram }}</pre>
              </div>
            </div>

          </div>

          <!-- 4. Pied de fiche explicative : Garanties et lien documentation -->
          <div class="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
            <div class="flex flex-wrap items-center gap-2 text-slate-400">
              <span>{{ isFr ? 'Garanties :' : 'Guarantees:' }}</span>
              <span class="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">OWASP Top 10</span>
              <span class="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">{{ isFr ? 'Durcissement ANSSI' : 'ANSSI Hardening' }}</span>
              <span class="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">{{ isFr ? 'Norme VS EFRAG' : 'EFRAG VS Standard' }}</span>
            </div>

            <a 
              :href="currentDocLink" 
              class="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5 font-semibold hover:underline"
            >
              <span>{{ isFr ? 'Consulter le guide technique dans la doc' : 'Read technical guide in documentation' }}</span>
              <span>➔</span>
            </a>
          </div>

        </div>

      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import AegisLogo from './soc/AegisLogo.vue';

const props = defineProps({
  lang: {
    type: String,
    default: 'en'
  }
});

const isFr = computed(() => props.lang === 'fr');

const activeModule = ref('gate'); // 'gate' | 'egress' | 'green'
const companySize = ref('vps');   // 'vps' | 'baremetal' | 'k8s'
const showAscii = ref(false);     // Affichable à la demande
const copied = ref(false);

const modulesInfo = computed(() => {
  if (isFr.value) {
    return {
      gate: {
        icon: '🛡️',
        title: 'Aegis Gate (WAF & Virtual Patching)',
        tag: 'INGRESS PEP',
        badgeClass: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
        stepColor: 'text-cyan-400 font-bold',
        detailedDescription: 'Inspecte chaque requête entrante (décodage multi-passes URL/SQL, anti-overflow HTTP 413) et bloque les scans automatisés (wp-login.php, .env) ainsi que les exploits RCE avant qu\'ils n\'atteignent votre serveur d\'application.',
      },
      egress: {
        icon: '🦅',
        title: 'Aegis Egress (Sinkhole & IA Locale)',
        tag: 'EGRESS & SINKHOLE',
        badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        stepColor: 'text-amber-400 font-bold',
        detailedDescription: 'Analyse l\'entropie de Shannon et les requêtes DNS/TCP sortantes pour couper net les callbacks Command & Control (C2), le tunneling DNS et les téléchargements de malwares post-exploitation via le modèle SLM Nimble 9B Air-Gapped.',
      },
      green: {
        icon: '🌿',
        title: 'Aegis Green (Télémétrie Matérielle)',
        tag: 'GREEN IT & RAPL',
        badgeClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
        stepColor: 'text-emerald-400 font-bold',
        detailedDescription: 'Lit directement les registres matériels Linux RAPL (/sys/class/powercap) en Watts et Joules réels et audite l\'EcoIndex v3 de vos pages web pour certifier votre sobriété numérique selon la norme européenne VS (EFRAG 2026).',
      }
    };
  }
  return {
    gate: {
      icon: '🛡️',
      title: 'Aegis Gate (WAF & Virtual Patching)',
      tag: 'INGRESS PEP',
      badgeClass: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
      stepColor: 'text-cyan-400 font-bold',
      detailedDescription: 'Inspects every inbound request (multi-pass URL/SQL decoding, anti-overflow HTTP 413) and blocks automated scanning tools (wp-login.php, .env) and RCE payloads before reaching your application.',
    },
    egress: {
      icon: '🦅',
      title: 'Aegis Egress (Sinkhole & Local AI)',
      tag: 'EGRESS & SINKHOLE',
      badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      stepColor: 'text-amber-400 font-bold',
      detailedDescription: 'Analyzes Shannon entropy and outbound DNS/TCP requests to drop Command & Control (C2) callbacks, DNS tunneling, and post-exploit stagers using the local Nimble 9B Air-Gapped SLM.',
    },
    green: {
      icon: '🌿',
      title: 'Aegis Green (Hardware Telemetry)',
      tag: 'GREEN IT & RAPL',
      badgeClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      stepColor: 'text-emerald-400 font-bold',
      detailedDescription: 'Directly reads Linux RAPL hardware energy registers (/sys/class/powercap) in true Watts and Joules and continuously computes EcoIndex v3 scores for verifiable EFRAG VS (2026) compliance.',
    }
  };
});

const currentModuleData = computed(() => modulesInfo.value[activeModule.value]);

const currentSchemaTitle = computed(() => {
  const modNames = isFr.value ? {
    gate: 'Aegis Gate — Ingress PEP WAF',
    egress: 'Aegis Egress — DNS & IA Nimble 9B',
    green: 'Aegis Green — Télémétrie Énergétique RAPL',
  } : {
    gate: 'Aegis Gate — Ingress PEP WAF',
    egress: 'Aegis Egress — DNS & Nimble 9B AI',
    green: 'Aegis Green — RAPL Hardware Telemetry',
  };
  const sizeNames = isFr.value ? {
    vps: 'Mono-Serveur / VPS (Docker Compose)',
    baremetal: 'Serveur Dédié Bare-Metal (Accès direct /sys)',
    k8s: 'Cluster Kubernetes (Helm & Kepler eBPF par Namespace)',
  } : {
    vps: 'Single-Server / VPS (Docker Compose)',
    baremetal: 'Bare-Metal Dedicated (Direct /sys access)',
    k8s: 'Kubernetes Cluster (Helm & Kepler eBPF by Namespace)',
  };
  return `${modNames[activeModule.value]} • ${sizeNames[companySize.value]}`;
});

const currentRamSpec = computed(() => {
  if (activeModule.value === 'gate') return isFr.value ? '< 25 Mo RAM' : '< 25 MB RAM';
  if (activeModule.value === 'egress') return isFr.value ? '< 35 Mo RAM (+ Nimble 9B)' : '< 35 MB RAM (+ Nimble 9B)';
  return isFr.value ? '< 15 Mo RAM' : '< 15 MB RAM';
});

const currentLatencySpec = computed(() => {
  if (activeModule.value === 'gate') return '< 1.5 ms';
  if (activeModule.value === 'egress') return isFr.value ? '< 4.2 ms (DNS) / < 45 ms (IA)' : '< 4.2 ms (DNS) / < 45 ms (AI)';
  return isFr.value ? 'Télémétrie passive 0 ms impact' : 'Passive telemetry 0 ms impact';
});

const currentDocLink = computed(() => {
  const prefix = isFr.value ? '/docs/fr' : '/docs';
  if (activeModule.value === 'gate') return `${prefix}/security/ingress-pep/`;
  if (activeModule.value === 'egress') return `${prefix}/security/egress-gateway/`;
  return `${prefix}/esg/telemetry/`;
});

const currentAsciiDiagram = computed(() => {
  // 1. KUBERNETES COMBINED ATTRIBUTION PAR NAMESPACE
  if (companySize.value === 'k8s') {
    return `[ CLIENT EXTERNE / BOTNET ]
               │
               ▼  (Port 80 / 443 Ingress)
┌──────────────┴─────────────────────────────────────────────────────────────────────────┐
│ ⎈ CLUSTER KUBERNETES (NAMESPACE aegis-system)                                          │
│                                                                                        │
│   ┌───────────────────────────────┐        ┌────────────────────────────────────────┐  │
│   │  Aegis Gate PEP (Envoy / WAF) │ ──▶─── │  Pod Métier Protégé (Ingress OK 200)   │  │
│   │  Rejets Nikto/SQLi/RCE (403)  │        │  (Service target-service:80)           │  │
│   └──────────────┬────────────────┘        └───────────────────┬────────────────────┘  │
│                  │ (Audit Ingress)                             │ (Requête Sortante)    │
│                  ▼                                             ▼                       │
│   ┌───────────────────────────────┐        ┌────────────────────────────────────────┐  │
│   │   Aegis Egress CoreDNS :53    │ ◀──────┤  CoreDNS Sinkhole (Interception C2)    │  │
│   │   Analyse IA System One Local │        │  Nimble 9B Air-Gapped (0 token Cloud)  │  │
│   └──────────────┬────────────────┘        └────────────────────────────────────────┘  │
│                  │                                                                     │
│                  ▼ (Télémétrie eBPF par Namespace)                                     │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│   │  SONDE KEPLER eBPF DAEMONSET (Attribution Énergétique Granulaire)               │  │
│   │  • Namespace "production"  ──▶ 142.5 Joules/s (Watts) [SLA Limit: 200W]        │  │
│   │  • Namespace "staging"     ──▶  38.2 Joules/s (Watts) [SLA Limit:  80W]        │  │
│   │  • Namespace "monitoring"  ──▶  19.1 Joules/s (Watts) [SLA Limit:  40W]        │  │
│   └────────────────────────────────────────┬────────────────────────────────────────┘  │
└────────────────────────────────────────────┼───────────────────────────────────────────┘
                                             ▼
                 [ PUSH API SÉCURISÉ /api/v1/telemetry/push ]
                 [ COCKPIT ESG NORME VS (EFRAG) & SOC UNIFIÉ ]`;
  }

  // 2. BARE-METAL SERVEUR DÉDIÉ
  if (companySize.value === 'baremetal') {
    return `[ RÉSEAU PHYSIQUE ] ──▶ [ INTERFACE HÔTE (eth0 / hostNetwork) ]
                                      │
        ┌─────────────────────────────┴─────────────────────────────┐
        │ SERVEUR DÉDIÉ BARE-METAL (ACCÈS DIRECT REGISTRES RAPL)    │
        │                                                           │
        │   ┌───────────────────────────┐                           │
        │   │ Aegis Gate PEP (:8000)    │ ──▶ Filtrage in-line      │
        │   │ Interception OWASP & LFI  │     < 0.8 ms de surcoût   │
        │   └─────────────┬─────────────┘                           │
        │                 ▼                                         │
        │   ┌───────────────────────────┐                           │
        │   │ Aegis Egress DNS (:5053)  │ ──▶ Moteur Nimble 9B      │
        │   │ Cache local CrowdSec CTI  │     Bloquage Ransomware   │
        │   └─────────────┬─────────────┘                           │
        │                 ▼                                         │
        │   ┌───────────────────────────────────────────────────┐   │
        │   │ SONDE RUST PHYSIQUE (/sys/class/powercap/intel-rapl)  │
        │   │ Compteur matériel CPU + DRAM physique (0 émulation)│  │
        │   └─────────────────────────┬─────────────────────────┘   │
        └─────────────────────────────┼─────────────────────────────┘
                                      ▼
             [ AUDIT CERTIFIABLE SCOPES 1 & 2 POUR COMMISSAIRES RSE ]`;
  }

  // 3. MONO-SERVEUR / VPS
  if (activeModule.value === 'gate') {
    return `[ REQUÊTE ENTRANTE (Ingress) ]
               │
               ▼
┌────────────────────────────────────────────────────────┐
│  Aegis Gate PEP / WAF (Port 8000 - Frugal < 25 Mo RAM) │
│  Analyse in-line des en-têtes, query params et payload │
└──────────────────────────┬─────────────────────────────┘
              ┌────────────┴────────────┐
              ▼                         ▼
   [ MENACE DÉTECTÉE ]         [ TRAFIC CONFORME ]
   • Nikto/SQLmap UA           • Navigateurs réels
   • Injection SQL UNION       • Requêtes API authentifiées
   • Traversal ../etc/passwd   • Latence ajoutée < 1.5 ms
              │                         │
              ▼                         ▼
   [ 403 FORBIDDEN ]           [ REVERSE-PROXY VERS APP ]
   (Payload bloqué net)        Web (:4321) / Backend (:8080)
              │                         │
              └────────────┬────────────┘
                           ▼
          [ LOG D'AUDIT SOUVERAIN TIMESCALEDB ]
          [ ALIMENTATION DU KANBAN DE TRIAGE EN DIRECT ]`;
  }

  if (activeModule.value === 'egress') {
    return `[ APPLICATION INTERNE / CONTAINER ]
               │
               ▼  (Requête DNS sortante UDP 53)
┌────────────────────────────────────────────────────────┐
│  Aegis Egress Gateway (Port 5053 - CoreDNS durci)      │
└──────────────────────────┬─────────────────────────────┘
              ┌────────────┴────────────┐
              ▼                         ▼
   [ DOMAINE CTI CONNU ]       [ FQDN INCONNU / DGA ]
   Blacklist CrowdSec CTI      Analyse d'entropie Shannon
              │                         │
              │                         ▼
              │                [ SYSTEM ONE LOCAL IA ]
              │                Nimble 9B (Ollama Air-Gapped)
              │                Décision d'intention < 45 ms
              │                         │
              └────────────┬────────────┘
                           ▼
          ┌────────────────┴────────────────┐
          ▼                                 ▼
   [ ACTION: BLOCK ]                 [ ACTION: ALLOW ]
   Sinkhole 0.0.0.0                  Résolution DNS chiffrée
   Alerte exfiltration C2            Sortie autorisée`;
  }

  // Green / VPS
  return `[ HÔTE VIRTUELISÉ (KVM / VPS) ]
               │
               ▼
┌────────────────────────────────────────────────────────┐
│  Aegis Telemetry Agent (Rust < 15 Mo RAM, 0% CPU idle) │
│  Lecture passive /proc/stat & /sys toutes les 5 sec    │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  Normalisation Énergétique & Calcul d'Impact           │
│  • PUE Datacenter appliqué (ex: 1.15 Scaleway/OVH)     │
│  • Conversion continue Watts ──▶ Joules cumulés        │
│  • Facteur d'émission temps réel RTE EcoWatt           │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  Rapport RSE Conforme Norme VS (EFRAG 2026)            │
│  • Données physiques auditables (pas de ratios €/$ )  │
│  • Export certifiable pour auditeurs CSRD & DSI        │
└────────────────────────────────────────────────────────┘`;
});

const currentCardSpecs = computed(() => {
  if (isFr.value) {
    if (activeModule.value === 'gate') {
      return {
        interception: 'Détection par expressions régulières compilées en mémoire et vérification d\'en-têtes. Bloque instantanément scanners automatisés (Nikto, Nuclei, sqlmap), injections SQL et traversées de répertoires.',
        compliance: 'Conforme aux recommandations de durcissement ANSSI et au guide OWASP Top 10. Taux de faux positifs mesuré inférieur à 3%.',
        command: 'docker compose up -d gate-proxy'
      };
    }
    if (activeModule.value === 'egress') {
      return {
        interception: 'Filtrage sortant DNS couplé à un cache CTI et au modèle SLM Nimble 9B. Détecte les domaines à haute entropie générés par malware (DGA) et les canaux de commande & contrôle (C2).',
        compliance: 'Zero-Log sur la vie privée des employés. 0 token transmis à des tiers américains (protection totale contre le Cloud Act).',
        command: 'docker compose up -d egress-gateway'
      };
    }
    return {
      interception: 'Sonde matérielle en Rust prélevant les Joules bruts via RAPL (Running Average Power Limit) ou Kepler eBPF sous Linux. Aucun ralentissement de vos applications.',
      compliance: 'Conforme à la norme européenne VS (EFRAG) pour l\'ESG et au RGESN 2024 pour l\'éco-conception logicielle.',
      command: companySize.value === 'k8s' ? 'helm install aegis ./deploy/kubernetes/helm/aegis' : 'docker compose up -d telemetry-agent'
    };
  }

  // English
  if (activeModule.value === 'gate') {
    return {
      interception: 'In-memory compiled regex pattern matching and header sanitization. Instantly blocks automated scanning tools (Nikto, Nuclei, sqlmap), SQL injections, and directory traversals.',
      compliance: 'Compliant with ANSSI hardening standards and OWASP Top 10 guidelines. Empirically measured false-positive rate under 3%.',
      command: 'docker compose up -d gate-proxy'
    };
  }
  if (activeModule.value === 'egress') {
    return {
      interception: 'Outbound DNS filtering backed by local CTI cache and Nimble 9B SLM. Detects algorithmic high-entropy domains (DGA) and Command & Control (C2) callbacks.',
      compliance: 'Zero-Log employee privacy design. 0 tokens sent to third-party US cloud providers (strict isolation against US Cloud Act).',
      command: 'docker compose up -d egress-gateway'
    };
  }
  return {
    interception: 'Lightweight Rust hardware daemon polling raw Joules via RAPL (Running Average Power Limit) or Linux Kepler eBPF. Zero runtime overhead on running applications.',
    compliance: 'Fully aligned with European EFRAG VS standards for ESG reporting and RGESN guidelines for software eco-design.',
    command: companySize.value === 'k8s' ? 'helm install aegis ./deploy/kubernetes/helm/aegis' : 'docker compose up -d telemetry-agent'
  };
});

function copyAscii() {
  if (!currentAsciiDiagram.value) return;
  navigator.clipboard.writeText(currentAsciiDiagram.value).then(() => {
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  });
}
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
