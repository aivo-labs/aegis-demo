<template>
  <div class="space-y-6">
    <!-- Bandeau CVE Feed Synthèse -->
    <div class="p-6 rounded-2xl bg-slate-900/80 border border-rose-500/30 shadow-xl">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 text-xs font-mono text-rose-400 font-bold mb-1">
            <span>🛡️ CVE FEED &amp; VIRTUAL PATCHING INTELLIGENCE</span>
            <span>•</span>
            <span class="text-emerald-400">PostgreSQL Live Sync</span>
          </div>
          <h2 class="text-lg font-extrabold text-white">
            Surveillance continue des failles exposées et catalogue des protections actives
          </h2>
        </div>

        <div class="flex items-center gap-3 font-mono text-xs">
          <div class="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
            Règles actives : <strong class="text-cyan-300">{{ activeRulesCount }}</strong>
          </div>
          <div class="px-3.5 py-2 rounded-xl bg-slate-950 border border-rose-500/30 text-rose-300">
            Exploits bloqués : <strong class="text-rose-400">{{ blockedByPatchCount }}</strong>
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
            CVE EXPOSÉES SUR VOTRE SURFACE ATTELÉE ({{ exposedCves.length }})
          </h3>
        </div>
        <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
          {{ exposedCves.length > 0 ? 'Action Requise' : 'Aucune faille critique détectée' }}
        </span>
      </div>

      <div v-if="exposedCves.length === 0" class="py-8 text-center text-slate-400 font-mono text-xs">
        ✓ Aucune faille non corrigée détectée sur le domaine audité. Lancez un diagnostic dans l'onglet <strong>Diagnostic (5 Pages)</strong> pour rafraîchir l'analyse de surface.
      </div>

      <div v-else class="space-y-3 font-mono text-xs">
        <div 
          v-for="(cve, idx) in exposedCves" 
          :key="idx"
          class="p-4 rounded-xl bg-slate-950/90 border border-rose-500/30 space-y-1.5"
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
              🛡️ Protégé par Virtual Patch Aegis
            </span>
          </div>
          <div class="text-white font-bold text-sm pt-0.5">{{ cve.title || cve.name }}</div>
          <p class="text-slate-400 text-[11px] leading-relaxed font-sans">{{ cve.description }}</p>
          <div class="pt-1 text-[11px] text-cyan-300">
            <strong>Remédiation :</strong> {{ (cve as any).remediation || 'Mise à niveau ou Virtual Patching Aegis recommandé' }}
          </div>
        </div>
      </div>
    </div>

    <!-- SECTION 2 : CATALOGUE COMPLET DES PROTECTIONS & VIRTUAL PATCHING -->
    <div class="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
      <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 font-mono">
        <div>
          <h3 class="text-sm font-bold text-white">
            🛡️ Catalogue des CVE Surveillées &amp; Neutralisées par Aegis Gate &amp; Egress
          </h3>
          <p class="text-[11px] text-slate-400 mt-0.5">
            Ces signatures sont actives en mémoire dans <code class="text-cyan-300">gate-proxy</code> et le sinkhole DNS <code class="text-amber-300">:5053</code>.
          </p>
        </div>
        <span class="text-xs text-cyan-400 font-bold">{{ catalogCves.length }} protections actives</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
        <div 
          v-for="cat in catalogCves" 
          :key="cat.id"
          class="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
        >
          <div>
            <div class="flex items-center justify-between gap-2 mb-1.5">
              <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {{ cat.severity }} • CVSS {{ cat.cvss }}
              </span>
              <span class="text-slate-500 text-[10px]">{{ cat.component }}</span>
            </div>
            <div class="text-white font-bold text-sm mt-1">{{ cat.id }}</div>
            <div class="text-slate-300 font-sans text-xs mt-0.5">{{ (cat as any).title ?? cat.name }}</div>
            <p class="text-[11px] text-slate-400 font-sans mt-2 leading-relaxed">
              <strong class="text-slate-300">Vecteur :</strong> {{ (cat as any).vector ?? cat.description }}
            </p>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span class="text-emerald-400 font-semibold">✓ Virtual Patch Actif</span>
            <span class="text-[10px] text-slate-500">Aegis Ingress PEP</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type CveItem } from '../../../services/api/cveApi';

defineProps<{
  activeRulesCount: number;
  blockedByPatchCount: number;
  exposedCves: any[];
  catalogCves: CveItem[];
}>();
</script>
