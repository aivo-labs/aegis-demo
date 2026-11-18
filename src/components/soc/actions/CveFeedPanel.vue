<template>
  <div class="space-y-6">
    <!-- Bandeau CVE Feed Synthèse -->
    <div class="p-6 rounded-2xl bg-slate-900/80 border border-rose-500/30 shadow-xl">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 text-xs font-mono text-rose-400 font-bold mb-1">
            <span>{{ cveT?.banner?.badge || '🛡️ CVE FEED & VIRTUAL PATCHING INTELLIGENCE' }}</span>
            <span>•</span>
            <span class="text-emerald-400">{{ cveT?.banner?.sync || 'PostgreSQL Live Sync' }}</span>
          </div>
          <h2 class="text-lg font-extrabold text-white">
            {{ cveT?.banner?.title || 'Surveillance continue des failles exposées et catalogue des protections actives' }}
          </h2>
        </div>

        <div class="flex items-center gap-3 font-mono text-xs">
          <div class="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
            {{ cveT?.banner?.activeRules || 'Règles actives :' }} <strong class="text-cyan-300">{{ activeRulesCount }}</strong>
          </div>
          <div class="px-3.5 py-2 rounded-xl bg-slate-950 border border-rose-500/30 text-rose-300">
            {{ cveT?.banner?.blockedExploits || 'Exploits bloqués :' }} <strong class="text-rose-400">{{ blockedByPatchCount }}</strong>
          </div>
        </div>
      </div>
    </div>

    <!-- SECTION 1 : VULNÉRABILITÉS EXPOSÉES SUR LE PÉRIMÈTRE ACTUEL -->
    <div class="bg-slate-900/70 border border-rose-500/30 rounded-2xl p-5">
      <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div class="flex items-center gap-2">
          <span class="text-rose-400 text-base">🚨</span>
          <h3 class="text-sm font-bold text-white font-mono">
            {{ cveT?.exposedSection?.title || 'CVE EXPOSÉES SUR VOTRE SURFACE ATTELÉE' }} ({{ exposedCves.length }})
          </h3>
        </div>
        <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
          {{ exposedCves.length > 0 
            ? (cveT?.exposedSection?.actionRequired || 'Action Requise') 
            : (cveT?.exposedSection?.noCritFound || 'Aucune faille critique détectée') }}
        </span>
      </div>

      <div v-if="exposedCves.length === 0" class="py-8 text-center text-slate-400 font-mono text-xs">
        {{ cveT?.exposedSection?.emptyMsg || '✓ Aucune faille non corrigée détectée sur le domaine audité. Lancez un diagnostic dans l\'onglet Diagnostic (5 Pages) pour rafraîchir l\'analyse de surface.' }}
      </div>

      <div v-else class="space-y-3 font-mono text-xs">
        <div 
          v-for="(cve, idx) in exposedCves" 
          :key="idx"
          class="p-4 rounded-xl bg-slate-950/90 border border-rose-500/30 space-y-2"
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
            <span class="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              🛡️ {{ (cve as any).virtual_patch_rule_id 
                ? `${cveT?.exposedSection?.virtualPatchBadge || 'Virtual Patch :'} ${(cve as any).virtual_patch_rule_id}` 
                : (cveT?.exposedSection?.virtualPatchProtected || 'Protégé par Virtual Patch Aegis') }}
            </span>
          </div>
          <div class="text-white font-bold text-sm pt-0.5">{{ cve.title || cve.name }}</div>
          <p class="text-slate-400 text-[11px] leading-relaxed font-sans">{{ cve.description }}</p>

          <div v-if="(cve as any).virtual_patch_summary" class="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/25 text-[11px] text-emerald-200 font-sans">
            <strong class="text-emerald-300 font-mono">{{ cveT?.exposedSection?.immediateProtection || '1. Protection Immédiate (Virtual Patch Aegis) :' }}</strong> {{ (cve as any).virtual_patch_summary }}
          </div>

          <div v-if="(cve as any).root_fix_procedure && (cve as any).root_fix_procedure.length" class="p-2.5 rounded-lg bg-slate-900 border border-cyan-500/25 text-[11px] text-slate-300 space-y-1">
            <div class="text-cyan-300 font-bold">{{ cveT?.exposedSection?.rootProcedureTitle || '2. Procédure de Remédiation Racine (Correctif Définitif Serveur) :' }}</div>
            <ol class="list-decimal list-inside space-y-1 text-[11px] font-sans text-slate-300">
              <li v-for="(step, sIdx) in (cve as any).root_fix_procedure" :key="sIdx">{{ step }}</li>
            </ol>
          </div>
          <div v-else class="pt-1 text-[11px] text-cyan-300">
            <strong>{{ cveT?.exposedSection?.remediationFallback || 'Remédiation :' }}</strong> {{ (cve as any).remediation || (cveT?.exposedSection?.remediationDefault || 'Mise à niveau ou Virtual Patching Aegis recommandé') }}
          </div>
        </div>
      </div>
    </div>

    <!-- SECTION 2 : CATALOGUE COMPLET DES PROTECTIONS, COUVERTURE & REMÉDIATION RACINE -->
    <div class="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-800 font-mono">
        <div>
          <h3 class="text-sm font-bold text-white">
            {{ cveT?.catalogSection?.title || '🛡️ Catalogue des CVE Surveillées, Statut de Couverture & Procédures de Remédiation Racine' }}
          </h3>
          <p class="text-[11px] text-slate-400 mt-0.5">
            {{ cveT?.catalogSection?.subtitle || 'Chaque faille indique sa règle de Virtual Patching en mémoire (gate-proxy / :5053), sa sonde de vérification et sa procédure de correction définitive.' }}
          </p>
        </div>
        <div class="flex items-center gap-3 shrink-0">
          <span class="text-xs text-cyan-400 font-bold">
            {{ (cveT?.catalogSection?.cveReferenced || '{count} CVE référencées & vérifiées').replace('{count}', catalogCves.length.toString()) }}
          </span>
          <button
            type="button"
            :disabled="isSyncing"
            @click="emit('sync-certfr')"
            class="px-2.5 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-200 text-[11px] font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <span v-if="isSyncing" class="inline-block animate-spin">⟳</span>
            <span v-else>🔄</span>
            <span>{{ isSyncing ? (cveT?.catalogSection?.syncingCertFr || 'Synchronisation...') : (cveT?.catalogSection?.syncCertFrBtn || 'Synchroniser CERT-FR') }}</span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 font-mono text-xs">
        <div 
          v-for="cat in catalogCves" 
          :key="cat.id"
          class="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
        >
          <div class="space-y-2">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {{ cat.severity }} • CVSS {{ cat.cvss }}
                </span>
                <span v-if="(cat as any).cisa_kev" class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  CISA KEV
                </span>
              </div>
              <span 
                :class="[
                  'px-2 py-0.5 rounded text-[10px] font-bold border',
                  (cat as any).coverage_status === 'HOST_PATCH_REQUIRED'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : (cat as any).coverage_status === 'MITIGATED_EGRESS_ONLY'
                      ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                      : (cat as any).coverage_status === 'PENDING_VERIFICATION'
                        ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                        : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                ]"
              >
                {{ (cat as any).coverage_status === 'HOST_PATCH_REQUIRED'
                  ? (cveT?.catalogSection?.hostPatchRequired || '⚠️ Patch OS Hôte Requis (+ Egress)')
                  : (cat as any).coverage_status === 'MITIGATED_EGRESS_ONLY'
                    ? (cveT?.catalogSection?.mitigatedEgress || '🔒 Bloquée en Egress (Sinkhole C2)')
                    : (cat as any).coverage_status === 'PENDING_VERIFICATION'
                      ? (cveT?.catalogSection?.pendingVerification || '⏳ Procédure en cours de vérification (Aegis Lab)')
                      : (cveT?.catalogSection?.coveredVirtualPatch || '🛡️ Couverte par Virtual Patch Aegis') }}
              </span>
            </div>

            <div>
              <div class="flex items-baseline gap-2">
                <span class="text-white font-bold text-sm">{{ cat.id }}</span>
                <span class="text-slate-400 text-[11px]">({{ cat.component }})</span>
              </div>
              <div class="text-slate-200 font-sans font-semibold text-xs mt-0.5">{{ (cat as any).title ?? cat.name }}</div>
            </div>

            <p class="text-[11px] text-slate-400 font-sans leading-relaxed">
              {{ cat.description }}
            </p>

            <!-- 1. Couverture Virtual Patching -->
            <div v-if="(cat as any).virtual_patch_summary" class="p-2.5 rounded-lg bg-slate-900/90 border border-emerald-500/20 text-[11px] space-y-1">
              <div class="flex items-center justify-between text-emerald-300 font-bold">
                <span>{{ cveT?.catalogSection?.hotShield || '1. Bouclier Aegis à Chaud :' }}</span>
                <code class="text-[10px] text-cyan-300">{{ (cat as any).virtual_patch_rule_id }}</code>
              </div>
              <p class="text-slate-300 font-sans leading-relaxed">{{ (cat as any).virtual_patch_summary }}</p>
            </div>

            <!-- 2. Procédure de Remédiation Racine -->
            <details v-if="(cat as any).root_fix_procedure && (cat as any).root_fix_procedure.length" class="group rounded-lg bg-slate-900/90 border border-slate-800 p-2.5">
              <summary class="cursor-pointer text-cyan-300 font-bold text-[11px] flex items-center justify-between select-none">
                <span>{{ (cveT?.catalogSection?.viewRootProcedure || '🔧 2. Voir la Procédure de Correction Définitive ({count} étapes)').replace('{count}', (cat as any).root_fix_procedure.length.toString()) }}</span>
                <span class="text-slate-500 group-open:rotate-90 transition-transform">▸</span>
              </summary>
              <ol class="mt-2 pt-2 border-t border-slate-800 list-decimal list-inside space-y-1.5 text-[11px] font-sans text-slate-300">
                <li v-for="(step, sIdx) in (cat as any).root_fix_procedure" :key="sIdx" class="leading-relaxed">
                  {{ step }}
                </li>
              </ol>
              <div v-if="(cat as any).verification_probe" class="mt-2.5 pt-2 border-t border-slate-800/80">
                <div class="text-[10px] text-amber-300 font-mono font-bold mb-1">{{ cveT?.catalogSection?.verificationProbe || '🧪 Sonde de vérification de couverture :' }}</div>
                <pre class="p-2 rounded bg-slate-950 border border-slate-800 text-[10px] text-emerald-300 overflow-x-auto whitespace-pre-wrap">{{ (cat as any).verification_probe }}</pre>
              </div>
            </details>
          </div>

          <div class="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span>{{ cveT?.catalogSection?.versions || 'Versions :' }} {{ (cat as any).affected_versions || (cveT?.catalogSection?.multiVersions || 'Multi-versions') }}</span>
            <span 
              :class="[
                'font-semibold',
                (cat as any).coverage_status === 'PENDING_VERIFICATION' ? 'text-purple-400' : 'text-emerald-400'
              ]"
            >
              {{ (cat as any).coverage_status === 'PENDING_VERIFICATION'
                ? (cveT?.catalogSection?.procedureUnderReview || '⏳ En cours de qualification')
                : (cveT?.catalogSection?.procedureVerified || '✓ Procédure Vérifiée') }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { type CveItem } from '../../../services/api/cveApi';
import { useI18n } from '../../../composables/useI18n';

const { t } = useI18n();

const cveT = computed(() => {
  const root = (t && (t.value || t)) || {};
  return (root as any).cveFeed || (root as any).cockpit?.cveFeed || {};
});

const emit = defineEmits<{
  (e: 'sync-certfr'): void;
}>();

withDefaults(defineProps<{
  activeRulesCount: number;
  blockedByPatchCount: number;
  exposedCves: any[];
  catalogCves: CveItem[];
  isSyncing?: boolean;
}>(), {
  isSyncing: false,
});
</script>
