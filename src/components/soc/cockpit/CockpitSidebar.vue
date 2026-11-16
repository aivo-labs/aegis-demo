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
        <a :href="locale === 'fr' ? '/fr/' : '/'" class="flex items-center gap-3 group overflow-hidden" :title="t.cockpit.sidebar.backToSite">
          <AegisLogo size="sm" class="group-hover:scale-105 transition-transform shrink-0" />
          <div v-if="isSidebarExpanded" class="flex flex-col min-w-0">
            <span class="text-base font-extrabold text-white tracking-tight leading-none truncate">Aegis</span>
            <span class="text-[9px] text-emerald-400 font-mono tracking-wider uppercase font-semibold mt-0.5 truncate">
              {{ t.cockpit.sidebar.title }}
            </span>
          </div>
        </a>

        <!-- Bouton Rétraction Sidebar ◀ / ▶ -->
        <button 
          @click="$emit('toggle-expand')"
          class="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-white flex items-center justify-center font-mono text-xs cursor-pointer transition-colors shrink-0"
          :title="isSidebarExpanded ? t.cockpit.sidebar.collapse : t.cockpit.sidebar.expand"
        >
          <span>{{ isSidebarExpanded ? '◀' : '▶' }}</span>
        </button>
      </div>
    </div>

    <!-- 2. Navigation Principale (3 Piliers 100% Réels & Interactifs) -->
    <nav class="flex-1 min-h-0 overflow-y-auto space-y-1 py-1 pr-0.5 font-mono text-xs">
      <!-- Item 1 : Vue d'ensemble (Cockpit & Replay Matériel) -->
      <button 
        @click="$emit('switch-nav', 'dashboard')"
        :class="[
          'w-full flex items-center rounded-xl transition-all cursor-pointer font-bold',
          isSidebarExpanded ? 'px-3 py-2.5 gap-3' : 'w-11 h-11 justify-center mx-auto',
          activeNav === 'dashboard'
            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
        ]"
        :title="t.cockpit.sidebar.overviewDesc"
      >
        <span class="text-base shrink-0">📊</span>
        <span v-if="isSidebarExpanded" class="truncate">{{ t.cockpit.sidebar.overview }}</span>
      </button>

      <!-- Item 2 : Fuzzer Interactif & Laboratoire d'Entropie -->
      <button 
        @click="$emit('switch-nav', 'fuzzer')"
        :class="[
          'w-full flex items-center rounded-xl transition-all cursor-pointer font-bold relative',
          isSidebarExpanded ? 'px-3 py-2.5 gap-3' : 'w-11 h-11 justify-center mx-auto',
          activeNav === 'fuzzer'
            ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-200 border border-cyan-400/50 shadow-md shadow-cyan-500/10'
            : 'text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent'
        ]"
        :title="t.cockpit.sidebar.fuzzerDesc"
      >
        <span class="text-base shrink-0">🔬</span>
        <span v-if="isSidebarExpanded" class="truncate">{{ t.cockpit.sidebar.fuzzer }}</span>
        <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
      </button>

      <!-- Item 3 : Triage SOC (Kanban des Flux) -->
      <button 
        @click="$emit('switch-nav', 'triage')"
        :class="[
          'w-full flex items-center rounded-xl transition-all cursor-pointer font-bold relative',
          isSidebarExpanded ? 'px-3 py-2.5 gap-3' : 'w-11 h-11 justify-center mx-auto',
          activeNav === 'triage'
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
        ]"
        :title="t.cockpit.sidebar.triageDesc"
      >
        <span class="text-base shrink-0">📋</span>
        <span v-if="isSidebarExpanded" class="truncate">{{ t.cockpit.sidebar.triage }}</span>
      </button>

      <!-- SÉPARATION : RESSOURCES & PRODUCTION -->
      <div v-if="isSidebarExpanded" class="pt-5 pb-1 px-3 text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider">
        {{ t.cockpit.sidebar.resourcesTitle }}
      </div>
      <div v-else class="my-3 border-t border-slate-800/80 w-8 mx-auto"></div>

      <!-- Lien Externe 1 : Documentation Technique -->
      <a 
        href="https://aegis.aivo.fr" 
        target="_blank" 
        rel="noopener noreferrer"
        :class="[
          'w-full flex items-center rounded-xl transition-all cursor-pointer text-slate-400 hover:text-cyan-300 hover:bg-slate-900/80 border border-transparent',
          isSidebarExpanded ? 'px-3 py-2 gap-3' : 'w-11 h-11 justify-center mx-auto'
        ]"
        :title="t.cockpit.sidebar.docsDesc"
      >
        <span class="text-base shrink-0">📖</span>
        <div v-if="isSidebarExpanded" class="flex items-center justify-between min-w-0 flex-1">
          <span class="truncate">{{ t.cockpit.sidebar.docs }}</span>
          <span class="text-[10px] text-slate-500">↗</span>
        </div>
      </a>

      <!-- Lien Externe 2 : Scanner de Production -->
      <a 
        href="https://aegis.aivo.fr/get-started/" 
        target="_blank" 
        rel="noopener noreferrer"
        :class="[
          'w-full flex items-center rounded-xl transition-all cursor-pointer text-slate-400 hover:text-emerald-300 hover:bg-slate-900/80 border border-transparent',
          isSidebarExpanded ? 'px-3 py-2 gap-3' : 'w-11 h-11 justify-center mx-auto'
        ]"
        :title="t.cockpit.sidebar.liveAuditDesc"
      >
        <span class="text-base shrink-0">⚡</span>
        <div v-if="isSidebarExpanded" class="flex items-center justify-between min-w-0 flex-1">
          <span class="truncate">{{ t.cockpit.sidebar.liveAudit }}</span>
          <span class="text-[10px] text-slate-500">↗</span>
        </div>
      </a>

      <!-- Lien Externe 3 : GitHub AGPLv3 -->
      <a 
        href="https://github.com/aivo-labs/aegis" 
        target="_blank" 
        rel="noopener noreferrer"
        :class="[
          'w-full flex items-center rounded-xl transition-all cursor-pointer text-slate-400 hover:text-white hover:bg-slate-900/80 border border-transparent',
          isSidebarExpanded ? 'px-3 py-2 gap-3' : 'w-11 h-11 justify-center mx-auto'
        ]"
        :title="t.cockpit.sidebar.githubDesc"
      >
        <span class="text-base shrink-0">🐙</span>
        <div v-if="isSidebarExpanded" class="flex items-center justify-between min-w-0 flex-1">
          <span class="truncate">{{ t.cockpit.sidebar.github }}</span>
          <span class="text-[10px] text-slate-500">↗</span>
        </div>
      </a>
    </nav>

    <!-- 3. Bas de Sidebar : Retour au site -->
    <div class="shrink-0 pt-3 border-t border-slate-800/80 space-y-1.5 font-mono text-xs">
      <a 
        :href="locale === 'fr' ? '/fr/' : '/'"
        :class="[
          'w-full flex items-center rounded-xl transition-all cursor-pointer text-slate-400 hover:text-cyan-300 hover:bg-slate-900',
          isSidebarExpanded ? 'px-3 py-2 gap-3' : 'w-11 h-11 justify-center mx-auto'
        ]"
        :title="t.cockpit.sidebar.backToSite"
      >
        <span class="text-base shrink-0">🌐</span>
        <span v-if="isSidebarExpanded" class="truncate font-semibold">{{ t.cockpit.sidebar.backToSite }}</span>
      </a>

      <div v-if="isSidebarExpanded" class="px-3 pt-2 text-[10px] text-slate-500 font-mono flex items-center justify-between border-t border-slate-900">
        <span>AGPLv3 Community</span>
        <span class="text-emerald-400 font-bold">v1.1.0</span>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import AegisLogo from '../AegisLogo.vue';
import { useI18n } from '../../../composables/useI18n';

const { t, locale } = useI18n();

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
