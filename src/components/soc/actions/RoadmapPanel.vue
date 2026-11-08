<template>
  <div class="space-y-6 font-mono text-xs">
    <div class="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
      <div class="text-purple-400 font-bold mb-1">🗺️ TRANSPARENCE COMMUNAUTAIRE AGPLv3</div>
      <h2 class="text-xl font-extrabold text-white font-sans">
        Ce qui est 100 % Opérationnel Aujourd'hui vs En Développement (Roadmap v2.0)
      </h2>
      <p class="text-slate-400 font-sans text-xs mt-1">
        Chez Aegis, nous refusons le « Vaporware » et les tableaux de bord fictifs. Voici l'état exact des briques techniques du dépôt Open-Source.
      </p>

      <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <!-- Colonne 1 : Opérationnel Aujourd'hui -->
        <div class="p-5 rounded-2xl bg-slate-950/90 border border-emerald-500/30 space-y-3">
          <div class="text-emerald-400 font-bold text-sm">✅ EN PRODUCTION DANS CE DÉPÔT (v1.5)</div>
          <ul class="space-y-2.5 text-slate-300 font-sans text-xs">
            <li>• <strong>Control Plane en Go 1.22+ (Zéro dépendance externe)</strong> : Protocole binaire PostgreSQL v3 natif &amp; Scanner Passif 5 pages via Goroutines.</li>
            <li>• <strong>Aegis Gate Proxy (:8000)</strong> : Coupe-circuit Buffer Overflow (<code class="text-cyan-300">HTTP 413</code>), canonisation multi-encodage, détection sondes WordPress/PHP &amp; Ban IP dynamique.</li>
            <li>• <strong>Aegis Egress Gateway (:5053)</strong> : Serveur DNS Sinkhole (<code class="text-amber-300">0.0.0.0</code>), calcul d'Entropie de Shannon ($H \ge 3.95$) &amp; détection de callbacks Reverse Shell.</li>
            <li>• <strong>Agent Rust de Télémétrie Matérielle</strong> : Lecture directe des registres processeur Intel/AMD RAPL (<code class="text-emerald-300">/sys/class/powercap</code>) et charge CPU <code class="text-emerald-300">/proc/stat</code>.</li>
            <li>• <strong>Homologation DNS TXT &amp; Mandat Légal</strong> : Vérification de propriété DNS et signature SHA-256 horodatée.</li>
          </ul>
        </div>

        <!-- Colonne 2 : Roadmap v2.0 -->
        <div class="p-5 rounded-2xl bg-slate-950/90 border border-purple-500/30 space-y-3">
          <div class="text-purple-300 font-bold text-sm">🚧 ROADMAP PUBLIQUE (PROCHAINES RELEASES v2.0)</div>
          <ul class="space-y-2.5 text-slate-300 font-sans text-xs">
            <li>• <strong>Verrou n°1 — Isolation Réseau Conteneur &amp; Hook Kernel eBPF (<code class="text-purple-300">cgroup/connect4</code>)</strong> : Blocage au niveau du noyau Linux des Reverse Shells TCP sortants vers des IP codées en dur sans résolution DNS préalable.</li>
            <li>• <strong>Flux CTI Collaboratif Automatisé (50 000+ domaines C2)</strong> : Synchronisation horaire en RAM des listes Abuse.ch ThreatFox, URLhaus et CrowdSec CTI.</li>
            <li>• <strong>Authentification Multi-Tenant OIDC / Keycloak &amp; RBAC</strong> : Délégation d'authentification SSO pour les équipes SOC et ESN.</li>
            <li>• <strong>Connecteur OpenSCAP &amp; Audit CIS/ANSSI OS</strong> : Analyse automatisée de la configuration SSH/Sysctl du serveur hôte Linux.</li>
          </ul>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Stateless informational panel
</script>
