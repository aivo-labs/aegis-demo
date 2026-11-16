<template>
  <div class="relative group/lang" ref="selectorRef">
    <!-- Bouton Sélecteur de Langue (FR / EN) -->
    <button 
      type="button" 
      @click="toggleDropdown"
      class="h-9 px-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 text-xs font-mono text-slate-200 transition-colors cursor-pointer shadow-sm select-none"
      :aria-label="locale === 'fr' ? 'Changer de langue' : 'Switch language'"
      :title="locale === 'fr' ? 'Changer de langue (FR / EN)' : 'Switch language (FR / EN)'"
    >
      <span class="text-sm leading-none">{{ locale === 'fr' ? '🇫🇷' : '🇬🇧' }}</span>
      <span class="font-bold">{{ locale === 'fr' ? 'FR' : 'EN' }}</span>
      <svg 
        :class="[
          'w-3.5 h-3.5 text-slate-400 transition-transform duration-200',
          isOpen ? 'rotate-180' : 'group-hover/lang:rotate-180'
        ]" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Menu Déroulant Bilingue avec Drapeaux (🇬🇧 English / 🇫🇷 Français) -->
    <div 
      :class="[
        'absolute right-0 top-full pt-2 w-36 transition-all duration-200 z-50',
        isOpen ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none group-hover/lang:opacity-100 group-hover/lang:visible group-hover/lang:pointer-events-auto'
      ]"
    >
      <div class="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-1.5 shadow-2xl space-y-1 font-mono text-xs">
        <!-- Option English -->
        <button 
          type="button"
          @click="select('en')"
          :class="[
            'w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors cursor-pointer text-left',
            locale === 'en' 
              ? 'bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30' 
              : 'text-slate-300 hover:bg-slate-800 hover:text-white border border-transparent'
          ]"
        >
          <span class="flex items-center gap-2">
            <span class="text-base leading-none">🇬🇧</span>
            <span>English</span>
          </span>
          <span v-if="locale === 'en'" class="text-emerald-400 text-xs font-bold">✓</span>
        </button>

        <!-- Option Français -->
        <button 
          type="button"
          @click="select('fr')"
          :class="[
            'w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors cursor-pointer text-left',
            locale === 'fr' 
              ? 'bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30' 
              : 'text-slate-300 hover:bg-slate-800 hover:text-white border border-transparent'
          ]"
        >
          <span class="flex items-center gap-2">
            <span class="text-base leading-none">🇫🇷</span>
            <span>Français</span>
          </span>
          <span v-if="locale === 'fr'" class="text-emerald-400 text-xs font-bold">✓</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from '../../../composables/useI18n';
import type { Locale } from '../../../i18n/translations';

const { locale, setLocale } = useI18n();
const isOpen = ref(false);
const selectorRef = ref<HTMLElement | null>(null);

function toggleDropdown() {
  isOpen.value = !isOpen.value;
}

function select(lang: Locale) {
  setLocale(lang);
  isOpen.value = false;
}

function handleClickOutside(event: MouseEvent) {
  if (selectorRef.value && !selectorRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('click', handleClickOutside);
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('click', handleClickOutside);
  }
});
</script>
