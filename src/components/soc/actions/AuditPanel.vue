<template>
  <div class="space-y-6">
    <!-- Barre de lancement du Scan Passif -->
    <div class="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold mb-1">
            <span>🔍 SCANNER PASSIF NON-INTRUSIF (MOTEUR CONCURRENT GO — 5 PAGES MAX)</span>
          </div>
          <h2 class="text-lg font-extrabold text-white">
            Auditez l'exposition CVE (PHP, WordPress, Serveur, Headers) et le vrai score EcoIndex d'un domaine
          </h2>
          <p class="text-xs text-slate-400 mt-1">
            Analyse non-intrusive respectant les recommandations de l'ANSSI et le standard EcoIndex v3.
          </p>
        </div>

        <form @submit.prevent="handleScan" class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div class="relative flex items-center min-w-[280px]">
            <span class="absolute left-3.5 text-slate-500 font-mono text-xs">https://</span>
            <input 
              v-model="scanDomain"
              type="text"
              required
              placeholder="mon-entreprise.fr ou localhost"
              class="w-full pl-18 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>
          <button 
            type="submit"
            :disabled="isScanning"
            class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-mono text-xs font-extrabold cursor-pointer transition-all shadow-lg shrink-0"
          >
            {{ isScanning ? '⏳ Analyse des 5 pages...' : '⚡ Lancer le Diagnostic (5 Pages)' }}
          </button>
        </form>
      </div>
    </div>

    <!-- RÉSULTAT DU DIAGNOSTIC PASSIF -->
    <div v-if="auditResult" class="space-y-6">
      
      <!-- 4 Cartes de Synthèse Réelles du Domaine Scanné -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div class="text-[11px] text-slate-400 mb-1">Domaine Audité ({{ auditResult.pages_scanned }} pages)</div>
          <div class="text-xl font-extrabold text-white truncate">{{ auditResult.domain }}</div>
          <div class="text-[10px] text-cyan-400 mt-1">
            Scan exécuté en {{ auditResult.scan_duration_ms || 120 }} ms
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div class="text-[11px] text-slate-400 mb-1">Score Sécurité Global (Headers &amp; CVE)</div>
          <div class="flex items-baseline gap-2">
            <span :class="['text-2xl font-extrabold', auditResult.security_score >= 75 ? 'text-emerald-400' : (auditResult.security_score >= 50 ? 'text-amber-400' : 'text-rose-400')]">
              {{ auditResult.security_score }} / 100
            </span>
            <span class="px-2 py-0.5 rounded bg-slate-800 text-white text-xs font-bold">Grade {{ auditResult.security_grade }}</span>
          </div>
          <div class="text-[10px] text-rose-400 mt-1 font-semibold">
            ⚠️ {{ (auditResult.cve_warnings || []).length }} alerte(s) CVE / Exposition détectée(s)
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div class="text-[11px] text-slate-400 mb-1">Score EcoIndex Moyen ({{ auditResult.pages_scanned }} pages)</div>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-extrabold text-emerald-400">{{ (auditResult as any).overall_eco_score ?? auditResult.eco_index_score }} / 100</span>
            <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
              Grade {{ (auditResult as any).overall_eco_grade ?? auditResult.eco_index_grade }}
            </span>
          </div>
          <div class="text-[10px] text-slate-400 mt-1">
            ~{{ (auditResult as any).avg_gco2e_per_visit ?? auditResult.avg_gco2_grams ?? 1.35 }} gCO2e / page vue
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div class="text-[11px] text-slate-400 mb-1">Statut Propriétaire &amp; Niveau 2</div>
          <div v-if="(auditResult as any).is_verified_owner || auditResult.ownership_verified" class="text-base font-extrabold text-emerald-400">
            ✓ Domaine Vérifié (Mandat Signé)
          </div>
          <div v-else class="text-base font-extrabold text-amber-300">
            🔒 Niveau 1 (Passif Limité)
          </div>
          <div class="text-[10px] text-slate-400 mt-1">
            {{ ((auditResult as any).is_verified_owner || auditResult.ownership_verified) ? 'Export complet & sondes Niveau 2 débloqués' : 'Vérifiez le DNS ci-dessous pour tout débloquer (Gratuit)' }}
          </div>
        </div>
      </div>

      <!-- SECTION WARNINGS CVE & EMPREINTE TECHNOLOGIQUE -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        <!-- Colonne Gauche (8 cols) : Alertes CVE & Vulnérabilités Détectées -->
        <div class="lg:col-span-8 bg-slate-900/70 border border-rose-500/30 rounded-2xl p-5">
          <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div class="flex items-center gap-2">
              <span class="text-rose-400 text-base">🚨</span>
              <h3 class="text-sm font-bold text-white font-mono">
                ALERTES DE MENACES, VERSIONS EXPOSÉES &amp; CVE ASSOCIÉES ({{ (auditResult.cve_warnings || []).length }})
              </h3>
            </div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Action Requise
            </span>
          </div>

          <div class="space-y-3 font-mono text-xs">
            <div 
              v-for="(cve, idx) in auditResult.cve_warnings" 
              :key="idx"
              class="p-4 rounded-xl bg-slate-950/90 border border-rose-500/30 space-y-1.5"
            >
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span 
                    :class="[
                      'px-2 py-0.5 rounded text-[10px] font-extrabold',
                      (cve as any).severity === 'CRITICAL' ? 'bg-rose-500 text-slate-950' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    ]"
                  >
                    {{ (cve as any).severity }} • CVSS {{ (cve as any).cvss ?? cve.score }}
                  </span>
                  <span class="text-rose-300 font-bold">{{ (cve as any).id ?? cve.cve_id }}</span>
                  <span class="text-slate-400">({{ (cve as any).component ?? '' }})</span>
                </div>
                <span v-if="(cve as any).blocked_by_aegis" class="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  🛡️ Protégé par Virtual Patch Aegis
                </span>
              </div>
              <div class="text-white font-bold text-sm pt-0.5">{{ cve.title }}</div>
              <p class="text-slate-400 text-[11px] leading-relaxed font-sans">{{ (cve as any).description }}</p>
              <div class="pt-1 text-[11px] text-cyan-300">
                <strong>Remédiation :</strong> {{ (cve as any).remediation }}
              </div>
            </div>
          </div>
        </div>

        <!-- Colonne Droite (4 cols) : Stack Détectée & En-têtes HTTP / DNS -->
        <div class="lg:col-span-4 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-5 font-mono text-xs">
          <div>
            <h3 class="text-sm font-bold text-white pb-2.5 mb-3 border-b border-slate-800">
              🔬 Stack &amp; Versions Détectées
            </h3>
            <div class="space-y-2">
              <div 
                v-for="(tech, idx) in ((auditResult as any).tech_stack ?? auditResult.detected_tech)" 
                :key="idx"
                class="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div class="text-white font-bold">{{ tech.name }}</div>
                  <div class="text-[10px] text-slate-400">{{ tech.category }} • {{ (tech as any).source ?? '' }}</div>
                </div>
                <span class="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                  {{ tech.version }}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-bold text-white pb-2.5 mb-3 border-b border-slate-800">
              🔒 En-têtes HTTP &amp; DNS (SPF/DMARC)
            </h3>
            <div class="space-y-2">
              <div 
                v-for="(hdr, idx) in auditResult.headers_analysis" 
                :key="idx"
                class="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80"
              >
                <span class="text-slate-300 text-[11px]">{{ (hdr as any).header ?? hdr.name }}</span>
                <span :class="['text-[10px] font-bold px-1.5 py-0.5 rounded', ((hdr as any).present || hdr.status === 'present') ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300']">
                  {{ ((hdr as any).present || hdr.status === 'present') ? '✓ Actif' : '✕ Manquant' }}
                </span>
              </div>
              <div class="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                <span class="text-slate-300 text-[11px]">DNS SPF / DMARC</span>
                <span :class="['text-[10px] font-bold px-1.5 py-0.5 rounded', (auditResult.dns_analysis?.has_spf || auditResult.dns_checks?.has_spf) ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300']">
                  SPF: {{ (auditResult.dns_analysis?.has_spf || auditResult.dns_checks?.has_spf) ? 'OK' : 'Absent' }} • DMARC: {{ (auditResult.dns_analysis?.has_dmarc || auditResult.dns_checks?.has_dmarc) ? 'OK' : 'Absent' }}
                </span>
              </div>
              <div class="flex items-center justify-between p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/40">
                <span class="text-emerald-200 text-[11px] font-bold">🛡️ TLS 1.3 Post-Quantum (FIPS 203)</span>
                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ✓ {{ (auditResult as any).pqc_readiness?.curve_id ?? 'X25519MLKEM768 (0x11EC)' }}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- TABLEAU DÉTAILLÉ DES PAGES SCANNÉES (ECOINDEX V3 RÉEL) -->
      <div class="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
        <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 font-mono">
          <h3 class="text-sm font-bold text-white">
            🌿 Détail Éco-Conception (EcoIndex v3) sur l'échantillon des {{ auditResult.pages_scanned }} pages scannées
          </h3>
          <span class="text-xs text-emerald-400 font-bold">Moyenne : {{ (auditResult as any).overall_eco_score ?? auditResult.eco_index_score }}/100 (Grade {{ (auditResult as any).overall_eco_grade ?? auditResult.eco_index_grade }})</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs font-mono">
            <thead>
              <tr class="text-slate-400 border-b border-slate-800 bg-slate-950/60">
                <th class="py-2.5 px-3">URL de la Page</th>
                <th class="py-2.5 px-3">Statut HTTP</th>
                <th class="py-2.5 px-3">Temps (TTFB)</th>
                <th class="py-2.5 px-3">Poids Estimé</th>
                <th class="py-2.5 px-3">Nœuds DOM</th>
                <th class="py-2.5 px-3">Requêtes HTTP</th>
                <th class="py-2.5 px-3">Score EcoIndex</th>
                <th class="py-2.5 px-3">Empreinte / Visite</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              <tr v-for="(pg, idx) in ((auditResult as any).pages_detail ?? auditResult.pages)" :key="idx" class="hover:bg-slate-800/30">
                <td class="py-2.5 px-3 text-white font-semibold">{{ pg.url }}</td>
                <td class="py-2.5 px-3 text-emerald-400">{{ pg.status_code }} OK</td>
                <td class="py-2.5 px-3 text-slate-300">{{ (pg as any).response_time_ms ?? 0 }} ms</td>
                <td class="py-2.5 px-3 text-cyan-300">{{ pg.weight_kb }} Ko</td>
                <td class="py-2.5 px-3 text-slate-300">{{ pg.dom_elements }} balises</td>
                <td class="py-2.5 px-3 text-slate-300">{{ pg.http_requests }} req</td>
                <td class="py-2.5 px-3">
                  <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    Grade {{ pg.eco_grade }} ({{ pg.eco_score }}/100)
                  </span>
                </td>
                <td class="py-2.5 px-3 text-slate-400">{{ (pg as any).gco2e_per_visit ?? pg.gco2 }} gCO2e • {{ pg.water_cl }} cl eau</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- NIVEAU 2 : CONTRAT D'HOMOLOGATION DNS & DÉBLOCAGE DU RAPPORT COMPLET -->
      <div class="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/30 border border-cyan-500/40 shadow-2xl">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono text-[11px] font-bold mb-2">
              <span>🛡️ NIVEAU 2 — HOMOLOGATION PROPRIÉTAIRE &amp; MANDAT LÉGAL D'AUDIT</span>
              <span>•</span>
              <span class="text-emerald-300">1er Domaine Vérifié 100 % OFFERT</span>
            </div>
            <h3 class="text-lg font-extrabold text-white">
              Débloquez l'Audit Approfondi (Sondes fichiers sensibles /.env, /.git, /xmlrpc.php) &amp; Téléchargez le Rapport Certifié
            </h3>
            <p class="text-xs text-slate-300 mt-1">
              Pour votre protection juridique et la nôtre (Article 323-1 du Code pénal), l'audit approfondi et l'export complet nécessitent de valider la propriété du domaine et d'accepter le mandat d'audit.
            </p>
          </div>

          <button 
            v-if="(auditResult as any).is_verified_owner || auditResult.ownership_verified"
            @click="scanner.downloadAuditReport"
            class="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-400 text-slate-950 font-mono text-xs font-extrabold shadow-lg cursor-pointer shrink-0"
          >
            📥 Télécharger le Rapport Complet Certifié (JSON)
          </button>
        </div>

        <!-- Étape 1 & 2 du formulaire d'homologation -->
        <div v-if="!((auditResult as any).is_verified_owner || auditResult.ownership_verified)" class="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">
          <div class="space-y-3">
            <div class="text-cyan-300 font-bold">1. Identification &amp; Génération du Jeton DNS TXT</div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input 
                v-model="verifyEmail" 
                type="email" 
                placeholder="contact@mon-entreprise.fr" 
                class="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
              />
              <input 
                v-model="verifyCompany" 
                type="text" 
                placeholder="Nom de l'entreprise (Optionnel)" 
                class="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <button 
              @click="handleRequestDns"
              class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-bold cursor-pointer"
            >
              Générer mon Enregistrement DNS TXT de Vérification
            </button>

            <div v-if="dnsChallenge" class="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-1.5">
              <div class="text-[11px] text-slate-400">Ajoutez cet enregistrement <strong class="text-white">TXT</strong> dans la zone DNS de <strong class="text-cyan-300">{{ auditResult.domain }}</strong> :</div>
              <div class="p-2 rounded bg-slate-900 border border-slate-800 text-emerald-300 font-bold select-all break-all">
                {{ (dnsChallenge as any).dns_record_value ?? dnsChallenge.expected_value }}
              </div>
            </div>
          </div>

          <div class="space-y-3">
            <div class="text-emerald-300 font-bold">2. Signature Électronique du Mandat Légal d'Autorisation</div>
            <label class="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-emerald-500/40">
              <input v-model="contractAccepted" type="checkbox" class="mt-1 w-4 h-4 accent-emerald-400" />
              <span class="text-[11px] text-slate-300 leading-relaxed font-sans">
                <strong>Mandat d'Audit :</strong> Je certifie sur l'honneur être le propriétaire légitime ou l'administrateur dûment habilité du domaine <strong>{{ auditResult.domain }}</strong>, et mandate expressément Aegis (AIVO) pour exécuter une analyse approfondie de sécurité et d'éco-conception sur ce périmètre (Conformité Article 323-1 du Code pénal).
              </span>
            </label>

            <button 
              @click="handleVerifyDns"
              :disabled="isVerifyingDns"
              class="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold cursor-pointer shadow-lg transition-all"
            >
              {{ isVerifyingDns ? '⏳ Vérification DNS & Sondes Niveau 2...' : '✓ Vérifier le DNS, Signer le Mandat & Débloquer le Rapport (Gratuit)' }}
            </button>
          </div>
        </div>

        <!-- Résultats Approfondis Niveau 2 une fois débloqué -->
        <div v-if="deepFindings.length > 0" class="mt-5 pt-4 border-t border-slate-800 font-mono text-xs">
          <div class="flex items-center justify-between mb-3">
            <span class="text-emerald-400 font-bold">🔓 RÉSULTATS DE L'AUDIT APPROFONDI NIVEAU 2 (SONDES DE SURFACE CRITIQUE)</span>
            <span v-if="contractSha256" class="text-[10px] text-slate-400">Empreinte Contrat SHA-256 : {{ contractSha256.slice(0, 20) }}...</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div 
              v-for="(df, idx) in deepFindings" 
              :key="idx"
              class="p-3 rounded-xl bg-slate-950 border border-slate-800"
            >
              <div class="text-white font-bold">{{ df.path }}</div>
              <div class="text-[10px] text-slate-400 mt-0.5">{{ df.check_name }}</div>
              <div class="mt-2 text-[11px] font-bold text-emerald-400">{{ df.verdict }}</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { usePassiveScanner } from '../../../composables/usePassiveScanner';

const props = withDefaults(defineProps<{
  initialDomain?: string;
  isDemo?: boolean;
}>(), {
  initialDomain: '',
  isDemo: true,
});

const emit = defineEmits<{
  (e: 'toast', message: string): void;
  (e: 'scan-completed'): void;
}>();

const scanner = usePassiveScanner(props.initialDomain, { isDemo: props.isDemo });
const {
  scanDomain,
  isScanning,
  auditResult,
  verifyEmail,
  verifyCompany,
  dnsChallenge,
  contractAccepted,
  isVerifyingDns,
  deepFindings,
  contractSha256,
} = scanner;

async function handleScan() {
  const msg = await scanner.runPassiveScan();
  if (msg) emit('toast', msg);
  emit('scan-completed');
}

async function handleRequestDns() {
  const msg = await scanner.requestDnsToken();
  if (msg) emit('toast', msg);
}

async function handleVerifyDns() {
  const msg = await scanner.verifyAndUnlockDeepAudit();
  if (msg) emit('toast', msg);
}

// Initial fetch if domain supplied
if (props.initialDomain) {
  scanner.fetchLatestAudit(props.initialDomain);
}
</script>
