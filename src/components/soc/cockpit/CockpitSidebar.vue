<template>
  <aside 
    :class="[
      'bg-slate-950/95 border-r border-slate-800/80 flex flex-col justify-between shrink-0 z-30 backdrop-blur-xl transition-all duration-300 py-4 h-full max-h-screen overflow-hidden select-none',
      isSidebarExpanded ? 'w-64 px-4' : 'w-18 px-2 items-center'
    ]"
  >
    <!-- 1. Haut de Sidebar : Logo + Toggle Rétraction -->
    <div class="shrink-0">
      <div class="flex items-center justify-between pb-4 mb-3 border-b border-slate-800/80">
        <a href="/" class="flex items-center gap-3 group overflow-hidden" title="Retour au site public">
          <AegisLogo size="sm" class="group-hover:scale-105 transition-transform shrink-0" />
          <div v-if="isSidebarExpanded" class="flex flex-col min-w-0">
            <span class="text-base font-extrabold text-white tracking-tight leading-none truncate">Aegis</span>
            <span class="text-[9px] text-emerald-400 font-mono tracking-wider uppercase font-semibold mt-0.5 truncate">
              Cockpit SOC
            </span>
          </div>
        </a>

        <!-- Bouton Rétraction Sidebar ◀ / ▶ -->
        <button 
          @click="$emit('toggle-expand')"
          class="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-white flex items-center justify-center font-mono text-xs cursor-pointer transition-colors shrink-0"
          :title="isSidebarExpanded ? 'Réduire la barre latérale' : 'Déplier la barre latérale'"
        >
          <span>{{ isSidebarExpanded ? '◀' : '▶' }}</span>
        </button>
      </div>
    </div>

    <!-- 2. Navigation Principale -->
    <nav class="flex-1 min-h-0 overflow-y-auto space-y-1 py-1 pr-0.5 font-mono text-xs">
      <!-- Item 1 : Vue d'ensemble (Cockpit) -->
      <button 
        @click="$emit('switch-nav', 'dashboard')"
        :class="[
          'w-full flex items-center rounded-xl transition-all cursor-pointer font-bold',
          isSidebarExpanded ? 'px-3 py-2.5 gap-3' : 'w-11 h-11 justify-center mx-auto',
          activeNav === 'dashboard'
            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
        ]"
        title="Vue d'ensemble du Cockpit (Métriques réelles)"
      >
        <span class="text-base shrink-0">📊</span>
        <span v-if="isSidebarExpanded" class="truncate">Vue d'ensemble</span>
      </button>

      <!-- Item 1b : Fuzzer Interactif & Laboratoire d'Entropie -->
      <button 
        @click="$emit('switch-nav', 'fuzzer')"
        :class="[
          'w-full flex items-center rounded-xl transition-all cursor-pointer font-bold relative',
          isSidebarExpanded ? 'px-3 py-2.5 gap-3' : 'w-11 h-11 justify-center mx-auto',
          activeNav === 'fuzzer'
            ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-200 border border-cyan-400/50 shadow-md shadow-cyan-500/10'
            : 'text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent'
        ]"
        title="Fuzzer Interactif & Calculateur d'Entropie de Shannon (Test In-Browser)"
      >
        <span class="text-base shrink-0">🔬</span>
        <span v-if="isSidebarExpanded" class="truncate">Fuzzer &amp; Entropie</span>
        <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
      </button>

      <!-- Item 2 : Diagnostic (5 Pages) -->
      <button 
        @click="$emit('switch-nav', 'audit')"
        :class="[
          'w-full flex items-center rounded-xl transition-all cursor-pointer font-bold',
          isSidebarExpanded ? 'px-3 py-2.5 gap-3' : 'w-11 h-11 justify-center mx-auto',
          activeNav === 'audit'
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
        ]"
        title="Diagnostic Passif (5 Pages), CVE & Homologation DNS"
      >
        <span class="text-base shrink-0">🔍</span>
        <span v-if="isSidebarExpanded" class="truncate">Diagnostic</span>
      </button>

      <!-- Item 3 : Flux Ingress / Egress -->
      <button 
        @click="$emit('switch-nav', 'streams')"
        :class="[
          'w-full flex items-center rounded-xl transition-all cursor-pointer font-bold relative',
          isSidebarExpanded ? 'px-3 py-2.5 gap-3' : 'w-11 h-11 justify-center mx-auto',
          activeNav === 'streams' || activeNav === 'security'
            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
        ]"
        title="Flux Ingress / Egress (Double Flux & Triage Kanban)"
      >
        <span class="text-base shrink-0">📡</span>
        <span v-if="isSidebarExpanded" class="truncate">Flux Ingress / Egress</span>
        <span v-if="!isSidebarExpanded" class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
      </button>

      <!-- Item 4 : Télémétrie Temps Réel RAPL & EcoIndex -->
      <button 
        @click="$emit('switch-nav', 'telemetry')"
        :class="[
          'w-full flex items-center rounded-xl transition-all cursor-pointer font-bold',
          isSidebarExpanded ? 'px-3 py-2.5 gap-3' : 'w-11 h-11 justify-center mx-auto',
          activeNav === 'telemetry' || activeNav === 'green'
            ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
        ]"
        title="Télémétrie Temps Réel RAPL & EcoIndex v3"
      >
        <span class="text-base shrink-0">🌿</span>
        <span v-if="isSidebarExpanded" class="truncate">Télémétrie RAPL</span>
      </button>

      <!-- Item 5 : Intelligence Vulnérabilités & CVE Feed -->
      <button 
        @click="$emit('switch-nav', 'cve')"
        :class="[
          'w-full flex items-center rounded-xl transition-all cursor-pointer font-bold',
          isSidebarExpanded ? 'px-3 py-2.5 gap-3' : 'w-11 h-11 justify-center mx-auto',
          activeNav === 'cve'
            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
        ]"
        title="Intelligence Vulnérabilités & CVE Feed"
      >
        <span class="text-base shrink-0">🛡️</span>
        <span v-if="isSidebarExpanded" class="truncate">CVE Feed</span>
      </button>

      <!-- Item 6 : Configuration & Contrôles Rapides -->
      <button 
        @click="$emit('switch-nav', 'controls')"
        :class="[
          'w-full flex items-center rounded-xl transition-all cursor-pointer font-bold',
          isSidebarExpanded ? 'px-3 py-2.5 gap-3' : 'w-11 h-11 justify-center mx-auto',
          activeNav === 'controls' || activeNav === 'compliance'
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
        ]"
        title="Contrôle Edge & Rétention ANSSI/RGPD"
      >
        <span class="text-base shrink-0">⚙️</span>
        <span v-if="isSidebarExpanded" class="truncate">Contrôles &amp; Rétention</span>
      </button>
    </nav>

    <!-- 3. Bas de Sidebar : Compte & Déconnexion -->
    <div class="shrink-0 pt-3 border-t border-slate-800/80 space-y-1.5 font-mono text-xs">
      <button 
        @click="$emit('open-account')"
        :class="[
          'w-full flex items-center rounded-xl transition-all cursor-pointer text-slate-300 hover:text-white hover:bg-slate-900',
          isSidebarExpanded ? 'px-3 py-2 gap-3' : 'w-11 h-11 justify-center mx-auto'
        ]"
        title="Mon Compte &amp; Paramètres"
      >
        <span class="text-base shrink-0">👤</span>
        <div v-if="isSidebarExpanded" class="flex flex-col text-left min-w-0">
          <span class="font-bold truncate">Mon Compte</span>
          <span class="text-[10px] text-slate-500 truncate">Admin SOC Souverain</span>
        </div>
      </button>

      <button 
        @click="$emit('logout')"
        :class="[
          'w-full flex items-center rounded-xl transition-all cursor-pointer text-slate-400 hover:text-rose-400 hover:bg-rose-500/10',
          isSidebarExpanded ? 'px-3 py-2 gap-3' : 'w-11 h-11 justify-center mx-auto'
        ]"
        title="Se déconnecter"
      >
        <span class="text-base shrink-0">🚪</span>
        <span v-if="isSidebarExpanded" class="font-bold truncate">Déconnexion</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import AegisLogo from '../AegisLogo.vue';

defineProps<{
  isSidebarExpanded: boolean;
  activeNav: string;
}>();

defineEmits<{
  (e: 'toggle-expand'): void;
  (e: 'switch-nav', nav: string): void;
  (e: 'open-account'): void;
  (e: 'logout'): void;
}>();
</script>
