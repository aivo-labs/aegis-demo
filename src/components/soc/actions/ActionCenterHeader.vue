<template>
  <header class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
    <div>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-emerald-400 flex items-center justify-center font-bold text-slate-950 text-xl shadow-lg shadow-cyan-500/20">
          {{ icon }}
        </div>
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            {{ title }}
          </h1>
          <p class="text-xs text-slate-400 font-mono mt-0.5">
            {{ subtitle }}
          </p>
        </div>
      </div>
    </div>

    <!-- Contrôles Haut-Droite : GitHub + Toggle Clair/Sombre + Déconnexion -->
    <div class="flex items-center gap-2.5">
      <!-- 1. Icône GitHub menant au dépôt -->
      <a 
        href="https://github.com/aivo-labs/aegis" 
        target="_blank" 
        rel="noopener noreferrer" 
        class="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-sm"
        title="Code source sur GitHub (AGPLv3)"
      >
        <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      </a>

      <!-- 2. Toggle Clair / Sombre avec Tooltip RGESN -->
      <div class="relative flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
        <button
          type="button"
          @click="$emit('toggle-theme')"
          class="w-8 h-8 rounded-lg text-sm text-slate-300 hover:text-emerald-400 flex items-center justify-center transition-colors cursor-pointer"
          :title="isLightMode ? 'Passer en mode sombre (recommandé RGESN)' : 'Passer en mode clair'"
          aria-label="Basculer de thème"
        >
          <span>{{ isLightMode ? '☀️' : '🌙' }}</span>
        </button>

        <!-- Point d'interrogation (?) avec Tooltip -->
        <div class="relative group/tooltip">
          <button
            type="button"
            class="w-5 h-5 rounded-md bg-slate-800/80 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-300 font-mono text-[10px] font-bold flex items-center justify-center transition-colors cursor-help mr-0.5"
            aria-label="Pourquoi le mode sombre est-il préconisé ?"
          >
            ?
          </button>

          <div class="absolute right-0 top-full mt-2.5 w-72 p-3.5 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-emerald-500/40 shadow-2xl text-left opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-50 pointer-events-none font-sans">
            <div class="flex items-center gap-2 text-xs font-bold text-emerald-300 font-mono mb-1">
              <span>🍃</span>
              <span>Mode Sombre Préconisé (RGESN 4.15)</span>
            </div>
            <p class="text-[11px] text-slate-300 leading-relaxed">
              Le thème sombre est activé par défaut car il réduit de <strong>15 % à 30 % la consommation électrique</strong> des écrans OLED/AMOLED.
            </p>
          </div>
        </div>
      </div>

      <!-- 3. Bouton Déconnexion -->
      <button 
        @click="$emit('logout')"
        class="w-9 h-9 rounded-xl bg-slate-900 hover:bg-rose-500/15 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 transition-all cursor-pointer flex items-center justify-center shadow-sm"
        title="Se déconnecter du Cockpit"
        aria-label="Déconnexion"
      >
        <span class="text-base">🚪</span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  icon: string;
  title: string;
  subtitle: string;
  isLightMode: boolean;
}>();

defineEmits<{
  (e: 'toggle-theme'): void;
  (e: 'logout'): void;
}>();
</script>
