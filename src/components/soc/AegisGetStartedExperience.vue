<template>
  <div class="w-full text-slate-100 font-sans">
    
    <!-- ========================================================================= -->
    <!-- SECTION 1 : PLEINE LARGEUR — HERO & SCANNER PASSIF AVEC EFFET GLASSMORPHISM -->
    <!-- ========================================================================= -->
    <section class="relative pt-8 pb-12 sm:pt-12 sm:pb-16 overflow-hidden">
      <!-- Halos lumineux en arrière-plan -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-500/10 via-cyan-500/5 to-transparent blur-3xl pointer-events-none"></div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <!-- En-tête de Section -->
        <div class="text-center max-w-3xl mx-auto mb-10 space-y-4">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold">
            <span>🛡️</span>
            <span>{{ isFr ? 'ÉTAT DES LIEUX & DÉPLOIEMENT • MODÈLE OPEN-CORE ÉTHIQUE' : 'ASSESSMENT & DEPLOYMENT • ETHICAL OPEN-CORE MODEL' }}</span>
          </div>
          
          <h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            {{ isFr ? 'Diagnostic Passif & Déploiement Souverain' : 'Passive Diagnostic & Sovereign Deployment' }}
          </h1>
          
          <p class="text-base sm:text-lg text-slate-300 leading-relaxed">
            {{ isFr 
              ? "Évaluez l'exposition de votre infrastructure, vérifiez vos en-têtes et votre score EcoIndex v3 sans aucun engagement. Choisissez ensuite le mode de déploiement qui répond à vos besoins."
              : "Assess your infrastructure exposure, inspect security headers and EcoIndex v3 score with zero commitment. Then choose the deployment path tailored to your needs." }}
          </p>
        </div>

        <!-- BLOC DE DIAGNOSTIC PASSIF — EFFET GLASSMORPHISM -->
        <div class="w-full rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-emerald-500/30 p-6 sm:p-9 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.18)] text-left relative overflow-hidden">
          <div class="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div class="relative z-10">
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
              <div class="space-y-1.5 max-w-2xl">
                <div class="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
                  <span>{{ isFr ? '🔍 MOTEUR CONCURRENT GO — ANALYSE EN TEMPS RÉEL (5 PAGES MAX)' : '🔍 CONCURRENT GO ENGINE — REAL-TIME ANALYSIS (5 PAGES MAX)' }}</span>
                </div>
                <h2 class="text-xl sm:text-2xl font-extrabold text-white">
                  {{ isFr ? 'Auditez votre domaine en 1 clic' : 'Audit your domain in 1 click' }}
                </h2>
                <p class="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  {{ isFr 
                    ? 'Détection des versions logicielles exposées (PHP, WordPress, Nginx, Apache), corrélation CVE en direct, vérification des en-têtes HTTP de sécurité et calcul du score EcoIndex v3.'
                    : 'Detection of exposed software versions (PHP, WordPress, Nginx, Apache), live CVE correlation, HTTP security headers verification, and EcoIndex v3 calculation.' }}
                </p>
              </div>

              <!-- Formulaire de saisie du domaine -->
              <form @submit.prevent="runPassiveScan" class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <div class="relative flex items-center min-w-[300px]">
                  <span class="absolute left-3.5 text-slate-400 font-mono text-xs font-bold">https://</span>
                  <input 
                    v-model="scanDomainInput"
                    type="text"
                    required
                    :placeholder="isFr ? 'mon-entreprise.fr ou localhost' : 'my-company.com or localhost'"
                    class="w-full pl-18 pr-4 py-3 rounded-xl bg-slate-950/90 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-400 shadow-inner"
                  />
                </div>
                <button 
                  type="submit"
                  :disabled="isScanning"
                  class="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-mono text-xs font-extrabold cursor-pointer transition-all shadow-lg shadow-emerald-500/20 active:scale-95 shrink-0 flex items-center justify-center gap-2"
                >
                  <span v-if="isScanning" class="animate-spin">⏳</span>
                  <span>{{ isScanning ? (isFr ? 'Analyse des 5 pages...' : 'Analyzing 5 pages...') : (isFr ? '⚡ Lancer le Diagnostic Gratuit' : '⚡ Run Free Diagnostic') }}</span>
                </button>
              </form>
            </div>

            <!-- Note d'engagement éthique sous le champ -->
            <div class="pt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
              <div class="flex items-center gap-2">
                <span class="text-emerald-400 font-bold">✓</span>
                <span>{{ isFr ? 'Scan 100 % passif, non-intrusif et respectueux de la charge serveur' : '100% passive, non-intrusive scan respecting server load' }}</span>
              </div>
              <div class="flex items-center gap-2 text-slate-500">
                <span>{{ isFr ? '🔒 Aucune inscription requise' : '🔒 No registration required' }}</span>
                <span>•</span>
                <span>{{ isFr ? 'Conforme RGPD & ANSSI' : 'GDPR & ANSSI Compliant' }}</span>
              </div>
            </div>
          </div>

          <!-- ========================================================================= -->
          <!-- RÉSULTATS DÉTAILLÉS DU SCAN (S'AFFICHE DIRECTEMENT SOUS LE BLOC AUDIT)      -->
          <!-- ========================================================================= -->
          <div v-if="auditResult" id="audit-results-anchor" class="mt-8 pt-8 border-t border-slate-800/80 space-y-6">
            
            <!-- Bandeau de succès du scan -->
            <div class="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
              <div class="flex items-center gap-2.5">
                <span class="text-base font-bold">✓</span>
                <span v-if="isFr">
                  Diagnostic passif terminé sur <strong class="text-white">{{ auditResult.domain }}</strong> : 
                  <strong>{{ auditResult.pages_scanned }} pages analysées</strong> en <strong>{{ auditResult.scan_duration_ms || 120 }} ms</strong> par Goroutines Go.
                </span>
                <span v-else>
                  Passive diagnostic completed on <strong class="text-white">{{ auditResult.domain }}</strong>: 
                  <strong>{{ auditResult.pages_scanned }} pages scanned</strong> in <strong>{{ auditResult.scan_duration_ms || 120 }} ms</strong> via Go Goroutines.
                </span>
              </div>
              <a href="#action-choices-anchor" class="text-emerald-400 hover:text-white underline font-bold shrink-0">
                {{ isFr ? 'Passer au déploiement ↓' : 'Proceed to deployment ↓' }}
              </a>
            </div>

            <!-- 4 CARTES DE SYNTHÈSE RÉELLES -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
              <div class="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div class="text-[11px] text-slate-400 mb-1">
                  {{ isFr ? `Domaine Audité (${auditResult.pages_scanned} pages)` : `Audited Domain (${auditResult.pages_scanned} pages)` }}
                </div>
                <div class="text-xl font-extrabold text-white truncate">{{ auditResult.domain }}</div>
                <div class="text-[10px] text-cyan-400 mt-1">
                  {{ isFr ? "Temps d'exécution :" : "Execution time:" }} {{ auditResult.scan_duration_ms || 120 }} ms
                </div>
              </div>

              <div class="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div class="text-[11px] text-slate-400 mb-1">
                  {{ isFr ? 'Score Sécurité & Headers' : 'Security & Headers Score' }}
                </div>
                <div class="flex items-baseline gap-2">
                  <span :class="['text-2xl font-extrabold', auditResult.security_score >= 75 ? 'text-emerald-400' : 'text-amber-400']">
                    {{ auditResult.security_score }} / 100
                  </span>
                  <span class="px-2 py-0.5 rounded bg-slate-800 text-white text-xs font-bold">Grade {{ auditResult.security_grade }}</span>
                </div>
                <div class="text-[10px] text-rose-400 mt-1 font-semibold">
                  ⚠️ {{ (auditResult.cve_warnings || []).length }} {{ isFr ? 'alerte(s) de vulnérabilité' : 'vulnerability warning(s)' }}
                </div>
              </div>

              <div class="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div class="text-[11px] text-slate-400 mb-1">
                  {{ isFr ? 'Score EcoIndex Moyen (v3)' : 'Average EcoIndex Score (v3)' }}
                </div>
                <div class="flex items-baseline gap-2">
                  <span class="text-2xl font-extrabold text-emerald-400">{{ auditResult.overall_eco_score }} / 100</span>
                  <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                    Grade {{ auditResult.overall_eco_grade }}
                  </span>
                </div>
                <div class="text-[10px] text-slate-400 mt-1">
                  ~{{ auditResult.avg_gco2e_per_visit || 1.35 }} {{ isFr ? 'gCO2e / page vue' : 'gCO2e / page view' }}
                </div>
              </div>

              <div class="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div class="text-[11px] text-slate-400 mb-1">
                  {{ isFr ? 'Statut Propriétaire & Niveau 2' : 'Owner Status & Level 2' }}
                </div>
                <div v-if="auditResult.is_verified_owner" class="text-base font-extrabold text-emerald-400">
                  {{ isFr ? '✓ Domaine Homologué' : '✓ Domain Certified' }}
                </div>
                <div v-else class="text-base font-extrabold text-amber-300">
                  {{ isFr ? '🔒 Niveau 1 (Passif)' : '🔒 Level 1 (Passive)' }}
                </div>
                <div class="text-[10px] text-slate-400 mt-1">
                  <span v-if="auditResult.is_verified_owner">
                    {{ isFr ? 'Export complet & sondes débloqués' : 'Full export & active probes unlocked' }}
                  </span>
                  <span v-else>
                    {{ isFr ? 'Homologation DNS disponible ci-dessous' : 'DNS verification available below' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- GRILLE : VULNÉRABILITÉS CVE & STACK TECHNIQUE -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              <!-- Colonne Gauche (8 cols) : Alertes CVE & Vulnérabilités Détectées -->
              <div class="lg:col-span-8 bg-slate-950/80 border border-rose-500/30 rounded-2xl p-5">
                <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                  <div class="flex items-center gap-2">
                    <span class="text-rose-400 text-base">🚨</span>
                    <h3 class="text-sm font-bold text-white font-mono">
                      {{ isFr 
                        ? `ALERTES DE MENACES, VERSIONS EXPOSÉES & CVE ASSOCIÉES (${(auditResult.cve_warnings || []).length})`
                        : `THREAT ALERTS, EXPOSED VERSIONS & ASSOCIATED CVES (${(auditResult.cve_warnings || []).length})` }}
                    </h3>
                  </div>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {{ isFr ? 'Action Requise' : 'Action Required' }}
                  </span>
                </div>

                <div v-if="(auditResult.cve_warnings || []).length > 0" class="space-y-3 font-mono text-xs">
                  <div 
                    v-for="(cve, idx) in auditResult.cve_warnings" 
                    :key="idx"
                    class="p-4 rounded-xl bg-slate-900/90 border border-rose-500/30 space-y-1.5"
                  >
                    <div class="flex flex-wrap items-center justify-between gap-2">
                      <div class="flex items-center gap-2">
                        <span 
                          :class="[
                            'px-2 py-0.5 rounded text-[10px] font-extrabold',
                            cve.severity === 'CRITICAL' ? 'bg-rose-500 text-slate-950' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          ]"
                        >
                          {{ cve.severity }} • CVSS {{ cve.cvss }}
                        </span>
                        <span class="text-rose-300 font-bold">{{ cve.id }}</span>
                        <span class="text-slate-400">({{ cve.component }})</span>
                      </div>
                      <span v-if="cve.blocked_by_aegis" class="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        {{ isFr ? '🛡️ Protégé par Virtual Patch Aegis' : '🛡️ Protected by Aegis Virtual Patch' }}
                      </span>
                    </div>
                    <div class="text-white font-bold text-sm pt-0.5">{{ cve.title }}</div>
                    <p class="text-slate-400 text-[11px] leading-relaxed font-sans">{{ cve.description }}</p>
                    <div class="pt-1 text-[11px] text-cyan-300">
                      <strong>{{ isFr ? 'Remédiation recommandée :' : 'Recommended remediation:' }}</strong> {{ cve.remediation }}
                    </div>
                  </div>
                </div>
                <div v-else class="p-6 text-center text-slate-400 text-xs font-mono">
                  {{ isFr ? '✓ Aucune CVE critique immédiatement corrélée sur les composants détectés.' : '✓ No critical CVEs immediately correlated on detected components.' }}
                </div>
              </div>

              <!-- Colonne Droite (4 cols) : Stack Détectée & En-têtes HTTP / DNS -->
              <div class="lg:col-span-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-5 font-mono text-xs">
                <div>
                  <h3 class="text-sm font-bold text-white pb-2.5 mb-3 border-b border-slate-800">
                    {{ isFr ? '🔬 Stack & Versions Détectées' : '🔬 Detected Stack & Versions' }}
                  </h3>
                  <div class="space-y-2">
                    <div 
                      v-for="(tech, idx) in auditResult.tech_stack" 
                      :key="idx"
                      class="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div class="text-white font-bold">{{ tech.name }}</div>
                        <div class="text-[10px] text-slate-400">{{ tech.category }} • {{ tech.source }}</div>
                      </div>
                      <span class="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                        {{ tech.version }}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 class="text-sm font-bold text-white pb-2.5 mb-3 border-b border-slate-800">
                    {{ isFr ? '🔒 En-têtes HTTP & DNS (SPF/DMARC)' : '🔒 HTTP & DNS Headers (SPF/DMARC)' }}
                  </h3>
                  <div class="space-y-2">
                    <div 
                      v-for="(hdr, idx) in auditResult.headers_analysis" 
                      :key="idx"
                      class="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800/80"
                    >
                      <span class="text-slate-300 text-[11px]">{{ hdr.header }}</span>
                      <span :class="['text-[10px] font-bold px-1.5 py-0.5 rounded', hdr.present ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300']">
                        {{ hdr.present ? (isFr ? '✓ Actif' : '✓ Present') : (isFr ? '✕ Manquant' : '✕ Missing') }}
                      </span>
                    </div>
                    <div class="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                      <span class="text-slate-300 text-[11px]">DNS SPF / DMARC</span>
                      <span :class="['text-[10px] font-bold px-1.5 py-0.5 rounded', auditResult.dns_analysis?.has_spf ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300']">
                        SPF: {{ auditResult.dns_analysis?.has_spf ? 'OK' : (isFr ? 'Absent' : 'Missing') }} • DMARC: {{ auditResult.dns_analysis?.has_dmarc ? 'OK' : (isFr ? 'Absent' : 'Missing') }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <!-- TABLEAU DÉTAILLÉ DES 5 PAGES SCANNÉES (ECOINDEX V3) -->
            <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-5">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-800 font-mono">
                <h3 class="text-sm font-bold text-white">
                  {{ isFr 
                    ? `🌿 Détail Éco-Conception (EcoIndex v3) sur l'échantillon des ${auditResult.pages_scanned} pages`
                    : `🌿 Eco-Design Breakdown (EcoIndex v3) on sample of ${auditResult.pages_scanned} pages` }}
                </h3>
                <span class="text-xs text-emerald-400 font-bold">
                  {{ isFr ? 'Moyenne :' : 'Average:' }} {{ auditResult.overall_eco_score }}/100 (Grade {{ auditResult.overall_eco_grade }})
                </span>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs font-mono">
                  <thead>
                    <tr class="text-slate-400 border-b border-slate-800 bg-slate-900/60">
                      <th class="py-2.5 px-3">{{ isFr ? 'URL de la Page' : 'Page URL' }}</th>
                      <th class="py-2.5 px-3">{{ isFr ? 'Statut' : 'Status' }}</th>
                      <th class="py-2.5 px-3">{{ isFr ? 'Temps (TTFB)' : 'Time (TTFB)' }}</th>
                      <th class="py-2.5 px-3">{{ isFr ? 'Poids' : 'Weight' }}</th>
                      <th class="py-2.5 px-3">{{ isFr ? 'Nœuds DOM' : 'DOM Nodes' }}</th>
                      <th class="py-2.5 px-3">{{ isFr ? 'Requêtes' : 'Requests' }}</th>
                      <th class="py-2.5 px-3">{{ isFr ? 'Score EcoIndex' : 'EcoIndex Score' }}</th>
                      <th class="py-2.5 px-3">{{ isFr ? 'Empreinte / Visite' : 'Footprint / Visit' }}</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-800/60">
                    <tr v-for="(pg, idx) in auditResult.pages_detail" :key="idx" class="hover:bg-slate-900/50">
                      <td class="py-2.5 px-3 text-white font-semibold">{{ pg.url }}</td>
                      <td class="py-2.5 px-3 text-emerald-400">{{ pg.status_code }} OK</td>
                      <td class="py-2.5 px-3 text-slate-300">{{ pg.response_time_ms }} ms</td>
                      <td class="py-2.5 px-3 text-cyan-300">{{ pg.weight_kb }} {{ isFr ? 'Ko' : 'KB' }}</td>
                      <td class="py-2.5 px-3 text-slate-300">{{ pg.dom_elements }} {{ isFr ? 'balises' : 'tags' }}</td>
                      <td class="py-2.5 px-3 text-slate-300">{{ pg.http_requests }} {{ isFr ? 'req' : 'reqs' }}</td>
                      <td class="py-2.5 px-3">
                        <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                          Grade {{ pg.eco_grade }} ({{ pg.eco_score }}/100)
                        </span>
                      </td>
                      <td class="py-2.5 px-3 text-slate-400">{{ pg.gco2e_per_visit }} gCO2e • {{ pg.water_cl }} {{ isFr ? 'cl eau' : 'cl water' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- NIVEAU 2 : HOMOLOGATION DNS & MANDAT LÉGAL ARTICLE 323-1 -->
            <div class="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 border border-cyan-500/40 shadow-2xl">
              <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono text-[11px] font-bold mb-2">
                    <span>🛡️ {{ isFr ? 'NIVEAU 2 — HOMOLOGATION PROPRIÉTAIRE & MANDAT LÉGAL' : 'LEVEL 2 — OWNER CERTIFICATION & LEGAL MANDATE' }}</span>
                    <span>•</span>
                    <span class="text-emerald-300">{{ isFr ? 'Gratuit & Ouvert' : 'Free & Open' }}</span>
                  </div>
                  <h3 class="text-lg font-extrabold text-white">
                    {{ isFr 
                      ? "Débloquez l'Audit Approfondi (Sondes /.env, /.git) & Téléchargez le Rapport Certifié" 
                      : "Unlock In-Depth Audit (Active Probes /.env, /.git) & Download Certified Report" }}
                  </h3>
                  <p class="text-xs text-slate-300 mt-1">
                    {{ isFr 
                      ? "Conformément à l'Article 323-1 du Code pénal, l'exécution de sondes actives et l'export complet requièrent de valider la propriété de votre domaine par un jeton DNS TXT et de signer le mandat d'autorisation."
                      : "In accordance with legal security testing standards, running active attack-surface probes and downloading the full audit report require domain ownership validation via a DNS TXT token and legal mandate authorization." }}
                  </p>
                </div>

                <button 
                  v-if="auditResult.is_verified_owner"
                  @click="downloadFullAuditReport"
                  class="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-400 text-slate-950 font-mono text-xs font-extrabold shadow-lg cursor-pointer shrink-0"
                >
                  {{ isFr ? '📥 Télécharger le Rapport Certifié (JSON)' : '📥 Download Certified Report (JSON)' }}
                </button>
              </div>

              <!-- Formulaire DNS Challenge si non vérifié -->
              <div v-if="!auditResult.is_verified_owner" class="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">
                <div class="space-y-3">
                  <div class="text-cyan-300 font-bold">
                    {{ isFr ? '1. Génération du Jeton DNS TXT' : '1. Generate DNS TXT Token' }}
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input 
                      v-model="verifyEmail" 
                      type="email" 
                      :placeholder="isFr ? 'contact@mon-entreprise.fr' : 'security@company.com'" 
                      class="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                    />
                    <input 
                      v-model="verifyCompany" 
                      type="text" 
                      :placeholder="isFr ? 'Nom de l\'entreprise (Optionnel)' : 'Company Name (Optional)'" 
                      class="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <button 
                    @click="requestDnsToken"
                    class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-bold cursor-pointer transition-all"
                  >
                    {{ isFr ? 'Générer mon Enregistrement DNS TXT' : 'Generate DNS TXT Record' }}
                  </button>

                  <div v-if="dnsChallenge" class="p-3.5 rounded-xl bg-slate-900 border border-cyan-500/40 space-y-1.5">
                    <div class="text-[11px] text-slate-400">
                      {{ isFr ? 'Ajoutez cet enregistrement' : 'Add this' }} <strong class="text-white">TXT</strong> {{ isFr ? 'dans la zone DNS de' : 'record to the DNS zone of' }} <strong class="text-cyan-300">{{ auditResult.domain }}</strong> :
                    </div>
                    <div class="p-2 rounded bg-slate-950 border border-slate-800 text-emerald-300 font-bold select-all break-all">
                      {{ dnsChallenge.dns_record_value }}
                    </div>
                  </div>
                </div>

                <div class="space-y-3">
                  <div class="text-emerald-300 font-bold">
                    {{ isFr ? '2. Mandat Légal d\'Autorisation' : '2. Legal Authorization Mandate' }}
                  </div>
                  <label class="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-emerald-500/40 transition-colors">
                    <input v-model="contractAccepted" type="checkbox" class="mt-1 w-4 h-4 accent-emerald-400" />
                    <span class="text-[11px] text-slate-300 leading-relaxed font-sans">
                      <strong v-if="isFr">Mandat d'Audit :</strong>
                      <strong v-else>Audit Mandate:</strong>
                      {{ isFr 
                        ? ` Je certifie sur l'honneur être le propriétaire légitime ou l'administrateur dûment habilité du domaine ${auditResult.domain}, et mandate expressément Aegis (AIVO) pour exécuter une analyse approfondie de sécurité et d'éco-conception sur ce périmètre (Conformité Article 323-1 du Code pénal).`
                        : ` I hereby certify under penalty of perjury that I am the authorized owner or administrator of ${auditResult.domain}, and expressly authorize Aegis (AIVO) to run an in-depth security and eco-design diagnostic on this scope.` }}
                    </span>
                  </label>

                  <button 
                    @click="verifyAndUnlockDeepAudit"
                    :disabled="isVerifyingDns"
                    class="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold cursor-pointer shadow-lg transition-all"
                  >
                    {{ isVerifyingDns 
                      ? (isFr ? '⏳ Vérification DNS & Sondes Niveau 2...' : '⏳ Verifying DNS & Level 2 Probes...') 
                      : (isFr ? '✓ Vérifier le DNS, Signer le Mandat & Débloquer le Rapport' : '✓ Verify DNS, Sign Mandate & Unlock Report') }}
                  </button>
                </div>
              </div>

              <!-- Résultats Approfondis Niveau 2 une fois débloqué -->
              <div v-if="deepFindings.length > 0" class="mt-5 pt-4 border-t border-slate-800 font-mono text-xs">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-emerald-400 font-bold">
                    {{ isFr ? '🔓 RÉSULTATS DE L\'AUDIT APPROFONDI NIVEAU 2 (SONDES DE SURFACE CRITIQUE)' : '🔓 LEVEL 2 IN-DEPTH AUDIT RESULTS (CRITICAL ATTACK SURFACE PROBES)' }}
                  </span>
                  <span v-if="contractSha256" class="text-[10px] text-slate-400">
                    {{ isFr ? 'Empreinte Contrat :' : 'Contract Hash:' }} {{ contractSha256.slice(0, 20) }}...
                  </span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div 
                    v-for="(df, idx) in deepFindings" 
                    :key="idx"
                    class="p-3 rounded-xl bg-slate-900 border border-slate-800"
                  >
                    <div class="text-white font-bold">{{ df.path }}</div>
                    <div class="text-[10px] text-slate-400 mt-0.5">{{ df.check_name }}</div>
                    <div class="mt-2 text-[11px] font-bold text-emerald-400">{{ df.verdict }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- BANNIÈRE DE TRANSITION VERS LES SECTIONS 2 & 3 -->
            <div class="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
              <div class="flex items-center gap-3">
                <span class="text-2xl">👇</span>
                <div>
                  <div class="text-white font-bold text-sm">
                    {{ isFr ? 'Prêt à corriger ces points et sécuriser votre serveur ?' : 'Ready to remediate these issues and secure your infrastructure?' }}
                  </div>
                  <div class="text-slate-300 text-[11px]">
                    {{ isFr 
                      ? "Choisissez la méthode adaptée à votre organisation : en totale autonomie ou avec notre équipe d'ingénieurs."
                      : "Choose the method suited to your organization: full self-hosted autonomy or tailored onboarding with our team." }}
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <a href="#section-autonome" class="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold transition-all">
                  {{ isFr ? 'Installation Rapide' : 'Quick Install' }}
                </a>
                <a href="#section-accompagnement" class="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold transition-all">
                  {{ isFr ? 'Être Accompagné' : 'Expert Assistance' }}
                </a>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>

    <!-- ========================================================================= -->
    <!-- SECTIONS 2 & 3 : LES 2 VOIES (AUTONOMIE VS ACCOMPAGNEMENT) — TOUJOURS VISIBLES -->
    <!-- ========================================================================= -->
    <section id="action-choices-anchor" class="pb-24 pt-4">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          <!-- SECTION 2 : INSTALLATION RAPIDE & LIEN VERS LA DOCUMENTATION (VOIE AUTONOME) -->
          <div id="section-autonome" class="flex flex-col rounded-3xl bg-slate-900/50 border border-slate-800 p-6 sm:p-8 relative overflow-hidden shadow-xl">
            <div class="flex items-center justify-between gap-3 mb-4">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold">
                <span>📦</span>
                <span>{{ isFr ? 'VOIE AUTONOME • OPEN-CORE (AGPLv3)' : 'SELF-HOSTED PATH • OPEN-CORE (AGPLv3)' }}</span>
              </div>
              <span class="text-xs font-mono text-slate-400">{{ isFr ? '100% Gratuit' : '100% Free' }}</span>
            </div>

            <h3 class="text-2xl font-extrabold text-white mb-2">
              {{ isFr ? '1. Déployer en Autonomie' : '1. Deploy Autonomously' }}
            </h3>
            
            <p class="text-sm text-slate-300 leading-relaxed mb-6 font-sans">
              {{ isFr 
                ? 'Vous êtes administrateur système, développeur ou ingénieur DevOps ? Installez et configurez Aegis Gate Proxy devant votre serveur web en moins de deux minutes.'
                : 'Are you a system administrator, developer, or DevOps engineer? Install and configure Aegis Gate Proxy in front of your web server in under two minutes.' }}
            </p>

            <!-- Onglets de sélection du type d'installation rapide -->
            <div class="space-y-3 font-mono text-xs">
              <div class="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
                <button 
                  v-for="tab in installTabs"
                  :key="tab.id"
                  @click="activeInstallTab = tab.id"
                  :class="[
                    'px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer',
                    activeInstallTab === tab.id
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  ]"
                >
                  {{ tab.label }}
                </button>
              </div>

              <!-- Boîte Terminal de la commande avec Copier -->
              <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 relative">
                <div class="flex items-center justify-between gap-3 mb-2 pb-2 border-b border-slate-900">
                  <span class="text-[11px] text-slate-400">{{ currentInstallInfo.subtitle }}</span>
                  <button 
                    @click="copyCommand(currentInstallInfo.cmd)"
                    class="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 border border-slate-800 text-[11px] flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <span>{{ copiedCmd ? (isFr ? '✓ Copié !' : '✓ Copied!') : (isFr ? 'Copier' : 'Copy') }}</span>
                  </button>
                </div>
                <div class="text-emerald-300 font-semibold select-all break-all text-xs leading-relaxed">
                  {{ currentInstallInfo.cmd }}
                </div>
              </div>
            </div>

            <!-- ENCADRÉ DOCUMENTATION TECHNIQUE -->
            <div class="mt-8 pt-6 border-t border-slate-800/80 flex-1 flex flex-col justify-between">
              <div class="space-y-3">
                <div class="flex items-center gap-2 text-white font-bold text-sm">
                  <span>📖</span>
                  <span>{{ isFr ? "Documentation Complète pour Tous Types d'Installations" : "Complete Documentation for All Deployment Types" }}</span>
                </div>
                <p class="text-xs text-slate-300 leading-relaxed font-sans">
                  {{ isFr 
                    ? 'Chaque infrastructure possède ses spécificités. Tous les détails, architectures recommandées et guides pas-à-pas sont disponibles dans notre documentation :'
                    : 'Every infrastructure has unique requirements. Complete architectures, reference setups, and step-by-step guides are in our documentation:' }}
                </p>

                <div class="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                  <a :href="`${docPrefix}/quickstart/`" class="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-emerald-400 transition-colors flex items-center justify-between">
                    <span>{{ isFr ? '→ Démarrage Rapide' : '→ Quickstart' }}</span>
                    <span class="text-slate-500">↗</span>
                  </a>
                  <a :href="`${docPrefix}/guides/vps/`" class="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-emerald-400 transition-colors flex items-center justify-between">
                    <span>→ Docker &amp; Swarm</span>
                    <span class="text-slate-500">↗</span>
                  </a>
                  <a :href="`${docPrefix}/guides/kubernetes/`" class="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-emerald-400 transition-colors flex items-center justify-between">
                    <span>→ Kubernetes (Helm)</span>
                    <span class="text-slate-500">↗</span>
                  </a>
                  <a :href="`${docPrefix}/guides/baremetal/`" class="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-emerald-400 transition-colors flex items-center justify-between">
                    <span>{{ isFr ? '→ Serveur Dédié Bare-Metal' : '→ Bare-Metal Dedicated Server' }}</span>
                    <span class="text-slate-500">↗</span>
                  </a>
                </div>
              </div>

              <div class="pt-6">
                <a 
                  :href="`${docPrefix}/`" 
                  class="w-full py-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>{{ isFr ? 'Explorer la Documentation Technique' : 'Explore Technical Documentation' }}</span>
                  <span>➔</span>
                </a>
              </div>
            </div>
          </div>

          <!-- SECTION 3 : ÊTRE ACCOMPAGNÉ (CTA & SERVICES EXPERTS AIVO) -->
          <div id="section-accompagnement" class="flex flex-col rounded-3xl bg-gradient-to-b from-slate-900/80 to-slate-950 border border-cyan-500/40 p-6 sm:p-8 relative overflow-hidden shadow-xl">
            <div class="absolute -top-16 -right-16 w-56 h-56 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div class="flex items-center justify-between gap-3 mb-4 relative z-10">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-semibold">
                <span>🤝</span>
                <span>{{ isFr ? 'SERVICES PROFESSIONNELS AIVO' : 'AIVO PROFESSIONAL SERVICES' }}</span>
              </div>
              <span class="text-xs font-mono text-cyan-400 font-bold">{{ isFr ? 'Sur-Mesure' : 'Custom' }}</span>
            </div>

            <h3 class="text-2xl font-extrabold text-white mb-2 relative z-10">
              {{ isFr ? '2. Être Accompagné par nos Experts' : '2. Expert-Guided Onboarding' }}
            </h3>
            
            <p class="text-sm text-slate-300 leading-relaxed mb-6 font-sans relative z-10">
              {{ isFr 
                ? "Vous manquez de temps ou de ressources expertes en interne ? Nos ingénieurs SecOps certifiés réalisent votre audit d'intrusion approfondi et prennent en charge l'intégration d'Aegis sur mesure."
                : "Need faster deployment or specialized SecOps expertise? Our certified engineers perform in-depth penetration audits and manage full turnkey Aegis integration." }}
            </p>

            <!-- Liste des bénéfices de l'accompagnement -->
            <div class="space-y-3 font-mono text-xs mb-8 relative z-10">
              <div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-3">
                <span class="text-emerald-400 font-bold text-sm">✓</span>
                <div>
                  <div class="text-white font-bold">
                    {{ isFr ? "Audit d'intrusion approfondi (Niveau 2) & Homologation DNS" : "In-Depth Penetration Audit (Level 2) & DNS Verification" }}
                  </div>
                  <div class="text-[11px] text-slate-400 mt-0.5">
                    {{ isFr 
                      ? 'Validation de votre zone DNS, recherche de failles complexes et remise d\'un rapport certifié.'
                      : 'DNS zone validation, complex vulnerability assessment, and official certified audit report.' }}
                  </div>
                </div>
              </div>

              <div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-3">
                <span class="text-emerald-400 font-bold text-sm">✓</span>
                <div>
                  <div class="text-white font-bold">
                    {{ isFr ? 'Déploiement et intégration clé en main sans interruption' : 'Turnkey Zero-Downtime Deployment & Integration' }}
                  </div>
                  <div class="text-[11px] text-slate-400 mt-0.5">
                    {{ isFr 
                      ? 'Configuration personnalisée du filtrage Ingress Zero-Trust adaptée à vos stacks applicatives.'
                      : 'Tailored Zero-Trust Ingress filtering configured specifically for your application stacks.' }}
                  </div>
                </div>
              </div>

              <div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-3">
                <span class="text-emerald-400 font-bold text-sm">✓</span>
                <div>
                  <div class="text-white font-bold">
                    {{ isFr ? 'Bilan d\'Éco-Conception & Rapport ESG Opposable' : 'Eco-Design Assessment & Audit-Ready ESG Report' }}
                  </div>
                  <div class="text-[11px] text-slate-400 mt-0.5">
                    {{ isFr 
                      ? 'Mesures RAPL en temps réel et indicateurs conformes aux normes VS EFRAG et RGESN 2024.'
                      : 'Real-time RAPL hardware energy metrics aligned with EFRAG VS standards and RGESN guidelines.' }}
                  </div>
                </div>
              </div>

              <div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-3">
                <span class="text-emerald-400 font-bold text-sm">✓</span>
                <div>
                  <div class="text-white font-bold">
                    {{ isFr ? 'Support prioritaire & Accompagnement Conformité NIS 2' : 'Priority SLA Support & NIS 2 Compliance Guidance' }}
                  </div>
                  <div class="text-[11px] text-slate-400 mt-0.5">
                    {{ isFr 
                      ? 'SLA garanti, maintien en conditions de sécurité et durcissement ANSSI.'
                      : 'Guaranteed SLA, continuous security maintenance, and ANSSI-grade hardening.' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- CTA PRINCIPAL D'ACCOMPAGNEMENT -->
            <div class="mt-auto pt-6 border-t border-slate-800/80 relative z-10 space-y-3">
              <div v-if="auditResult" class="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 font-mono text-xs flex items-center gap-2">
                <span>💡</span>
                <span v-if="isFr">Votre diagnostic sur <strong>{{ auditResult.domain }}</strong> sera automatiquement transmis à l'équipe.</span>
                <span v-else>Your diagnostic on <strong>{{ auditResult.domain }}</strong> will be automatically attached to your request.</span>
              </div>

              <button 
                @click="openAssistanceModal"
                class="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-mono text-xs font-extrabold cursor-pointer transition-all shadow-lg shadow-cyan-500/20 active:scale-95 flex items-center justify-center gap-2"
              >
                <span>{{ isFr ? 'Demander un Accompagnement / Devis' : 'Request Assistance / Quote' }}</span>
                <span>➔</span>
              </button>

              <div class="text-center text-[11px] font-mono text-slate-400">
                {{ isFr ? 'Réponse sous 24h ouvrées • Échange direct avec un ingénieur SecOps' : 'Response within 24 business hours • Direct discussion with a SecOps engineer' }}
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>

    <!-- ========================================================================= -->
    <!-- MODALE DE DEMANDE D'ACCOMPAGNEMENT (PRÉ-REMPLIE AVEC L'AUDIT)              -->
    <!-- ========================================================================= -->
    <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
      <div v-if="showAssistanceModal" class="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
        <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-left font-sans my-8">
          
          <div class="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-slate-950 font-bold text-lg shadow-md">
                🤝
              </div>
              <div>
                <h3 class="text-lg font-extrabold text-white">
                  {{ isFr ? "Demande d'Accompagnement AIVO" : "AIVO Professional Support Request" }}
                </h3>
                <p class="text-xs text-slate-400 font-mono">
                  {{ isFr ? "Audit approfondi ou Déploiement clé en main" : "In-depth penetration audit or turnkey deployment" }}
                </p>
              </div>
            </div>
            <button @click="showAssistanceModal = false" class="text-slate-400 hover:text-white cursor-pointer text-lg font-bold">✕</button>
          </div>

          <div v-if="assistanceSubmitted" class="p-6 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-center space-y-3 font-mono">
            <div class="text-3xl">✓</div>
            <h4 class="text-base font-bold text-white">
              {{ isFr ? 'Demande enregistrée avec succès !' : 'Request successfully submitted!' }}
            </h4>
            <p class="text-xs text-emerald-300 font-sans leading-relaxed">
              {{ isFr 
                ? `Merci ${leadForm.name}. Votre demande concernant ${leadForm.domain || 'votre infrastructure'} a été transmise à nos ingénieurs SecOps. Nous vous recontacterons sous 24 heures.`
                : `Thank you ${leadForm.name}. Your request regarding ${leadForm.domain || 'your infrastructure'} has been sent to our SecOps engineers. We will get back to you within 24 hours.` }}
            </p>
            <button 
              @click="showAssistanceModal = false; assistanceSubmitted = false;" 
              class="mt-4 px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs cursor-pointer"
            >
              {{ isFr ? 'Fermer' : 'Close' }}
            </button>
          </div>

          <form v-else @submit.prevent="submitAssistanceLead" class="space-y-4 font-mono text-xs">
            <div v-if="auditResult" class="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 text-[11px] text-emerald-300">
              📌 <strong>{{ isFr ? 'Périmètre rattaché :' : 'Attached Scope:' }}</strong> {{ auditResult.domain }} ({{ isFr ? 'Score Sécurité :' : 'Security Score:' }} {{ auditResult.security_score }}/100, EcoIndex : {{ auditResult.overall_eco_score }}/100)
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-300 mb-1 font-bold">{{ isFr ? 'Nom & Prénom *' : 'Full Name *' }}</label>
                <input 
                  v-model="leadForm.name" 
                  type="text" 
                  required 
                  :placeholder="isFr ? 'Alexandre Martin' : 'Alex Martin'" 
                  class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label class="block text-slate-300 mb-1 font-bold">{{ isFr ? 'Email professionnel *' : 'Work Email *' }}</label>
                <input 
                  v-model="leadForm.email" 
                  type="email" 
                  required 
                  :placeholder="isFr ? 'a.martin@entreprise.fr' : 'alex@company.com'" 
                  class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-300 mb-1 font-bold">{{ isFr ? 'Société / Organisation' : 'Company / Organization' }}</label>
                <input 
                  v-model="leadForm.company" 
                  type="text" 
                  placeholder="Acme Corp" 
                  class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label class="block text-slate-300 mb-1 font-bold">{{ isFr ? 'Téléphone' : 'Phone' }}</label>
                <input 
                  v-model="leadForm.phone" 
                  type="tel" 
                  :placeholder="isFr ? '06 12 34 56 78' : '+1 (555) 012-3456'" 
                  class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label class="block text-slate-300 mb-1 font-bold">{{ isFr ? 'Domaine concerné' : 'Target Domain' }}</label>
              <input 
                v-model="leadForm.domain" 
                type="text" 
                :placeholder="isFr ? 'mon-domaine.fr' : 'my-domain.com'" 
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label class="block text-slate-300 mb-1 font-bold">{{ isFr ? 'Précisez votre besoin ou infrastructure' : 'Describe your infrastructure or requirements' }}</label>
              <textarea 
                v-model="leadForm.message" 
                rows="3" 
                :placeholder="isFr 
                  ? 'Ex : Nous souhaitons déployer Aegis devant 3 applications web sur Kubernetes avec assistance pour l\'homologation DNS...' 
                  : 'E.g. We want to deploy Aegis in front of 3 Kubernetes web apps with assistance for DNS certification...'"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 font-sans text-xs"
              ></textarea>
            </div>

            <button 
              type="submit"
              class="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs cursor-pointer shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
            >
              {{ isFr ? 'Envoyer ma Demande d\'Accompagnement' : 'Submit Support Request' }}
            </button>
          </form>

        </div>
      </div>
    </transition>

    <!-- TOAST DE NOTIFICATION FLOTTANT -->
    <transition enter-active-class="transition duration-200" enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-2">
      <div v-if="actionToast" class="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-3 shadow-2xl">
        <span class="text-base">✓</span>
        <span>{{ actionToast }}</span>
        <button @click="actionToast = ''" class="text-slate-400 hover:text-white font-bold ml-2 cursor-pointer">✕</button>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { sendLeadToAivoControlCenter } from '../../utils/aivoControlApi';

const props = defineProps({
  lang: {
    type: String,
    default: 'en'
  }
});

const isFr = computed(() => props.lang === 'fr');
const docPrefix = computed(() => isFr.value ? '/docs/fr' : '/docs');

// État du Scan Passif
const scanDomainInput = ref('');
const isScanning = ref(false);
const auditResult = ref(null);
const actionToast = ref('');

// État Homologation DNS Niveau 2
const verifyEmail = ref('');
const verifyCompany = ref('');
const dnsChallenge = ref(null);
const contractAccepted = ref(false);
const isVerifyingDns = ref(false);
const deepFindings = ref([]);
const contractSha256 = ref('');

// État Onglets Installation Rapide
const activeInstallTab = ref('vps');
const copiedCmd = ref(false);

const installTabs = computed(() => [
  { id: 'vps', label: isFr.value ? 'VPS / Mono-Serveur' : 'VPS / Single Server' },
  { id: 'docker', label: 'Docker Compose' },
  { id: 'go', label: isFr.value ? 'Binaire Go Autonome' : 'Standalone Go Binary' },
  { id: 'git', label: isFr.value ? 'Dépôt Git Source' : 'Git Source Repo' }
]);

const currentInstallInfo = computed(() => {
  if (activeInstallTab.value === 'docker') {
    return {
      subtitle: isFr.value ? 'Déploiement conteneurisé standard :' : 'Standard container deployment:',
      cmd: 'git clone https://github.com/aivo-labs/aegis.git && cd aegis && docker compose up -d aegis-gate-proxy'
    };
  }
  if (activeInstallTab.value === 'go') {
    return {
      subtitle: isFr.value ? 'Installation directe via toolchain Go :' : 'Direct installation via Go toolchain:',
      cmd: 'go install github.com/aivo-labs/aegis/cmd/aegis-gate@latest && aegis-gate --listen :8000'
    };
  }
  if (activeInstallTab.value === 'git') {
    return {
      subtitle: isFr.value ? "Clonage et banc d'essai local :" : 'Clone and local testbench:',
      cmd: 'git clone https://github.com/aivo-labs/aegis.git && cd aegis && pnpm install && pnpm dev'
    };
  }
  return {
    subtitle: isFr.value ? 'Script bash 1-clic recommandé pour Ubuntu / Debian / Rocky :' : 'Recommended 1-click bash script for Ubuntu / Debian / Rocky:',
    cmd: 'curl -sSL https://aegis.aivo.fr/install.sh | sudo bash -s -- --profile vps'
  };
});

function copyCommand(cmd) {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(cmd);
    copiedCmd.value = true;
    setTimeout(() => {
      copiedCmd.value = false;
    }, 2500);
  }
}

function showToast(msg) {
  actionToast.value = msg;
  setTimeout(() => {
    if (actionToast.value === msg) actionToast.value = '';
  }, 4000);
}

// Méthode de lancement du Scan Passif
async function runPassiveScan() {
  if (!scanDomainInput.value || isScanning.value) return;
  isScanning.value = true;
  dnsChallenge.value = null;
  deepFindings.value = [];
  try {
    const res = await fetch('/api/v1/audit/passive-scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain: scanDomainInput.value })
    });
    if (res.ok) {
      const data = await res.json();
      const audit = data.audit || data;
      auditResult.value = audit;
      if (audit?.domain) {
        leadForm.value.domain = audit.domain;
      }
      showToast(
        isFr.value
          ? `Diagnostic passif terminé sur ${audit.domain || 'le domaine'} (${audit.pages_scanned || 1} pages analysées en ${audit.scan_duration_ms || 120} ms).`
          : `Passive diagnostic completed on ${audit.domain || 'domain'} (${audit.pages_scanned || 1} pages scanned in ${audit.scan_duration_ms || 120} ms).`
      );
      
      // Défilement doux vers les résultats
      setTimeout(() => {
        const el = document.getElementById('audit-results-anchor');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      showToast(isFr.value ? "Erreur lors de l'exécution du scan passif." : "Error while running passive scan.");
    }
  } catch (e) {
    showToast(isFr.value ? "Erreur réseau lors de la communication avec le moteur Go." : "Network error communicating with Go engine.");
  } finally {
    isScanning.value = false;
  }
}

// Méthodes Homologation DNS Niveau 2
async function requestDnsToken() {
  if (!auditResult.value?.domain) return;
  if (!verifyEmail.value) {
    showToast(isFr.value ? "Veuillez saisir votre adresse email professionnelle." : "Please enter your work email address.");
    return;
  }
  try {
    const res = await fetch('/api/v1/audit/request-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        domain: auditResult.value.domain,
        email: verifyEmail.value,
        company: verifyCompany.value
      })
    });
    const data = await res.json();
    if (res.ok) {
      dnsChallenge.value = data;
      // Transmission discrète du lead qualifié au Centre de Contrôle AIVO
      sendLeadToAivoControlCenter({
        source: 'aegis_dns_challenge_request',
        offerType: 'HOMOLOGATION_PROPRIETAIRE_DNS',
        contact: {
          email: verifyEmail.value,
          company: verifyCompany.value,
          domain: auditResult.value.domain,
        },
        contextTrigger: 'dns_token_generated',
        auditReport: auditResult.value,
      }).catch(() => {});

      showToast(
        isFr.value 
          ? `Jeton DNS TXT généré pour ${auditResult.value.domain}.` 
          : `DNS TXT token generated for ${auditResult.value.domain}.`
      );
    } else {
      showToast(data.message || (isFr.value ? "Erreur lors de la génération du jeton DNS." : "Error generating DNS token."));
    }
  } catch (e) {
    showToast(isFr.value ? "Erreur de communication." : "Communication error.");
  }
}

async function verifyAndUnlockDeepAudit() {
  if (!auditResult.value?.domain) return;
  if (!contractAccepted.value) {
    showToast(isFr.value ? "Vous devez cocher la case d'acceptation du Mandat d'Audit." : "You must accept the Audit Mandate agreement.");
    return;
  }
  isVerifyingDns.value = true;
  try {
    const res = await fetch('/api/v1/audit/verify-ownership', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        domain: auditResult.value.domain,
        email: verifyEmail.value || 'admin@' + auditResult.value.domain,
        contract_accepted: true
      })
    });
    const data = await res.json();
    if (res.ok) {
      auditResult.value = data.audit || data;
      deepFindings.value = data.deep_findings || [];
      contractSha256.value = data.contract_sha256 || '';

      // Mise à jour du lead AIVO avec signature du mandat légal
      sendLeadToAivoControlCenter({
        source: 'aegis_deep_audit_unlocked',
        offerType: 'AUDIT_APPROFONDI_CERTIFIE',
        contact: {
          email: verifyEmail.value || 'admin@' + auditResult.value.domain,
          company: verifyCompany.value,
          domain: auditResult.value.domain,
        },
        contextTrigger: 'legal_mandate_signed',
        auditReport: auditResult.value,
      }).catch(() => {});

      showToast(
        isFr.value
          ? `✓ Domaine ${auditResult.value.domain} homologué (${data.verification_method}) et Audit Niveau 2 débloqué !`
          : `✓ Domain ${auditResult.value.domain} verified (${data.verification_method}) and Level 2 Audit unlocked!`
      );
    } else {
      showToast(data.message || (isFr.value ? "Échec de la vérification DNS." : "DNS verification failed."));
    }
  } catch (e) {
    showToast(isFr.value ? "Erreur lors de la vérification." : "Verification error.");
  } finally {
    isVerifyingDns.value = false;
  }
}

function downloadFullAuditReport() {
  if (!auditResult.value) return;
  const payload = {
    report_type: 'AEGIS_CERTIFIED_SECURITY_AND_ECOINDEX_AUDIT',
    generated_at: new Date().toISOString(),
    contract_sha256: contractSha256.value || 'VERIFIED_OWNER_MANDATE',
    audit: auditResult.value,
    deep_findings: deepFindings.value
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `aegis-audit-${auditResult.value.domain}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// État Modale Assistance Lead AIVO
const showAssistanceModal = ref(false);
const assistanceSubmitted = ref(false);
const leadForm = ref({
  name: '',
  email: '',
  company: '',
  phone: '',
  domain: '',
  message: ''
});

function openAssistanceModal() {
  if (auditResult.value?.domain) {
    leadForm.value.domain = auditResult.value.domain;
  }
  showAssistanceModal.value = true;
}

async function submitAssistanceLead() {
  try {
    await sendLeadToAivoControlCenter({
      source: 'aegis_onboarding_assistance',
      offerType: 'ACCOMPAGNEMENT_SUR_MESURE',
      contact: { ...leadForm.value },
      contextTrigger: 'assistance_modal_submitted',
      auditReport: auditResult.value,
    });
  } catch (err) {
    console.warn('[Aegis Lead] Fallback local:', err);
  }

  assistanceSubmitted.value = true;
}
</script>
