<template>
  <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
    <div v-if="show" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div class="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-left">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-lg">
            ✓
          </div>
          <div>
            <h4 class="text-base font-bold text-white">Rapport Technique Réel Généré</h4>
            <p class="text-xs text-slate-400 font-mono">Données réelles extraites de PostgreSQL &amp; RAPL</p>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 font-mono text-xs">
          <button 
            @click="$emit('close')"
            class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
          >
            Fermer
          </button>
          <a 
            :href="downloadUrl" 
            download="AEGIS-TELEMETRY-AUDIT.json"
            @click="$emit('close')"
            class="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold shadow-lg flex items-center gap-1.5 cursor-pointer"
          >
            <span>📥 Télécharger (.JSON)</span>
          </a>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean;
  downloadUrl: string;
}>();

defineEmits<{
  (e: 'close'): void;
}>();
</script>
