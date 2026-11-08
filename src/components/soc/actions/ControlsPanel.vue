<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
    <!-- 1. BANNISSEMENT IP TEMPS RÉEL -->
    <div class="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between space-y-4">
      <div>
        <div class="text-rose-400 font-bold mb-1">🚫 LISTE NOIRE IP ACTIVE (AEGIS GATE :8000)</div>
        <h3 class="text-base font-bold text-white font-sans mb-2">Bannissement d'IP en Temps Réel</h3>
        <p class="text-slate-400 text-[11px] font-sans leading-relaxed mb-4">
          Toute adresse IP ajoutée ici est immédiatement synchronisée en mémoire dans <code class="text-cyan-300">gate-proxy</code> et rejetée avec HTTP <code class="text-rose-400">403 BANNED_IP_BLACKLIST</code>.
        </p>

        <form @submit.prevent="handleAddBan" class="space-y-2.5 mb-4">
          <input 
            v-model="newBanIp" 
            type="text" 
            required
            placeholder="Ex: 185.220.101.99" 
            class="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
          />
          <input 
            v-model="newBanReason" 
            type="text" 
            placeholder="Motif (ex: Scan WordPress / Brute-force)" 
            class="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
          />
          <button type="submit" class="w-full py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold cursor-pointer">
            + Ajouter à la Liste Noire Edge
          </button>
        </form>

        <div class="space-y-2 max-h-48 overflow-y-auto">
          <div v-if="bannedIps.length === 0" class="text-slate-500 text-center py-3">
            Aucune IP bannie actuellement (0 entrée).
          </div>
          <div 
            v-for="b in bannedIps" 
            :key="(b as any).ip_address ?? b.ip"
            class="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
          >
            <div>
              <div class="text-rose-300 font-bold">{{ (b as any).ip_address ?? b.ip }}</div>
              <div class="text-[10px] text-slate-400">{{ b.reason }}</div>
            </div>
            <button @click="$emit('remove-ban', (b as any).ip_address ?? b.ip)" class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] cursor-pointer">
              Débannir
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. CALIBRAGE DU COUPE-CIRCUIT VOLUMÉTRIQUE (413 BUFFER OVERFLOW) -->
    <div class="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between space-y-4">
      <div>
        <div class="text-cyan-400 font-bold mb-1">🛡️ VIRTUAL PATCHING VOLUMÉTRIQUE (HTTP 413)</div>
        <h3 class="text-base font-bold text-white font-sans mb-2">Seuil Anti-Buffer / Heap Overflow</h3>
        <p class="text-slate-400 text-[11px] font-sans leading-relaxed mb-4">
          Définit la taille maximale autorisée par requête entrante sur <code class="text-cyan-300">gate-proxy</code> avant coupure immédiate du stream TCP (protection contre PHP2Shell <code class="text-amber-300">CVE-2026-109618</code>).
        </p>

        <div class="p-3.5 rounded-xl bg-slate-950 border border-slate-800 mb-4">
          <div class="text-slate-400 text-[11px]">Seuil actif dans Aegis Gate Proxy :</div>
          <div class="text-2xl font-extrabold text-cyan-300 mt-1">{{ (maxPayloadBytes / 1024).toFixed(0) }} Ko ({{ maxPayloadBytes }} octets)</div>
        </div>

        <div class="grid grid-cols-3 gap-2 mb-4">
          <button @click="$emit('update-payload-limit', 16384)" :class="['py-2 rounded-xl border font-bold cursor-pointer', maxPayloadBytes === 16384 ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-400']">
            16 Ko (Strict)
          </button>
          <button @click="$emit('update-payload-limit', 32768)" :class="['py-2 rounded-xl border font-bold cursor-pointer', maxPayloadBytes === 32768 ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-400']">
            32 Ko (Défaut)
          </button>
          <button @click="$emit('update-payload-limit', 65536)" :class="['py-2 rounded-xl border font-bold cursor-pointer', maxPayloadBytes === 65536 ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-400']">
            64 Ko (Souple)
          </button>
        </div>
      </div>

      <div class="pt-4 border-t border-slate-800">
        <div class="text-emerald-400 font-bold mb-2">⚡ EXPORT TÉLÉMÉTRIE ÉNERGÉTIQUE RAPL</div>
        <a 
          href="/api/v1/dashboard/energy/export?format=csv"
          download="aegis-rapl-telemetry.csv"
          class="w-full py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>📥 Télécharger les Mesures RAPL Réelles (.CSV)</span>
        </a>
      </div>
    </div>

    <!-- 3. POLITIQUE DE RÉTENTION DES LOGS (ANSSI / CROWDSEC / CNIL RGPD) -->
    <div class="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between space-y-4">
      <div>
        <div class="text-purple-400 font-bold mb-1">📋 RÉTENTION DES JOURNAUX (ANSSI &amp; CNIL)</div>
        <h3 class="text-base font-bold text-white font-sans mb-2">Cycle de Vie &amp; Minimisation RGPD</h3>
        <p class="text-slate-400 text-[11px] font-sans leading-relaxed mb-4">
          Aligné sur les bonnes pratiques de l'<strong>ANSSI</strong> (6 mois d'archivage forensique des attaques), de <strong>CrowdSec</strong> (30 jours opérationnels) et de la <strong>CNIL</strong> (purge rapide des IP sur le trafic légitime).
        </p>

        <div class="space-y-3 mb-4">
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span>Fenêtre Chaude SOC (CrowdSec)</span>
            <input v-model.number="retention.hot_window_days" type="number" class="w-20 text-right bg-slate-900 border border-slate-700 rounded px-2 py-1 text-cyan-300 font-bold" />
          </div>
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span>Conservation Forensique ANSSI (Jours)</span>
            <input v-model.number="retention.anssi_forensic_days" type="number" class="w-20 text-right bg-slate-900 border border-slate-700 rounded px-2 py-1 text-purple-300 font-bold" />
          </div>
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span>Purge IP Trafic Sain RGPD (Jours)</span>
            <input v-model.number="retention.rgpd_clean_ip_days" type="number" class="w-20 text-right bg-slate-900 border border-slate-700 rounded px-2 py-1 text-emerald-300 font-bold" />
          </div>
        </div>

        <button @click="$emit('save-retention')" class="w-full py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-bold cursor-pointer mb-2">
          Enregistrer &amp; Appliquer la Rétention
        </button>
      </div>

      <button @click="$emit('purge-clean')" class="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-cyan-300 font-bold cursor-pointer">
        🧹 Purger Immédiatement les Logs Légitimes (ALLOW)
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { type BannedIp, type RetentionPolicy } from '../../../services/api/controlsApi';

defineProps<{
  bannedIps: BannedIp[];
  maxPayloadBytes: number;
  retention: RetentionPolicy;
}>();

const emit = defineEmits<{
  (e: 'add-ban', ip: string, reason: string): void;
  (e: 'remove-ban', ip: string): void;
  (e: 'update-payload-limit', limit: number): void;
  (e: 'save-retention'): void;
  (e: 'purge-clean'): void;
}>();

const newBanIp = ref('');
const newBanReason = ref('');

function handleAddBan() {
  if (!newBanIp.value) return;
  emit('add-ban', newBanIp.value, newBanReason.value);
  newBanIp.value = '';
  newBanReason.value = '';
}
</script>
