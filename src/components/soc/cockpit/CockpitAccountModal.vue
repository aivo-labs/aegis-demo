<template>
  <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
    <div v-if="show" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-left font-sans">
        <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-slate-950 font-bold text-lg">
              👤
            </div>
            <div>
              <h4 class="text-base font-extrabold text-white">Espace Administrateur SOC</h4>
              <p class="text-xs text-slate-400 font-mono">Périmètre Souverain On-Premise</p>
            </div>
          </div>
          <button @click="$emit('close')" class="text-slate-400 hover:text-white cursor-pointer text-lg font-bold">✕</button>
        </div>

        <div class="space-y-3 font-mono text-xs">
          <div class="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div class="flex justify-between">
              <span class="text-slate-400">Rôle :</span>
              <span class="text-emerald-400 font-bold">Admin SOC / RSSI</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Licence :</span>
              <span class="text-cyan-300 font-bold">Open-Core AGPLv3 (Illimité)</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Jeton API VPS :</span>
              <span class="text-slate-300 font-bold">aegis_node_sec_7f9914</span>
            </div>
          </div>

          <div class="space-y-2 pt-2">
            <a 
              href="https://aegis.aivo.fr/partenaires/" 
              target="_blank"
              rel="noopener noreferrer"
              class="block p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all font-semibold"
            >
              🤝 Programme Partenaire &amp; Audit d'Urgence ↗
            </a>
            <a 
              href="https://aegis.aivo.fr" 
              target="_blank"
              rel="noopener noreferrer"
              class="block p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-purple-300 hover:text-white transition-all font-semibold"
            >
              🗺️ Documentation &amp; Roadmap Officielle ↗
            </a>
          </div>

          <div class="pt-4 border-t border-slate-800 flex justify-end items-center">
            <button 
              @click="$emit('close')"
              class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'switch-nav', nav: string): void;
  (e: 'logout'): void;
}>();
</script>
