<template>
  <transition enter-active-class="transition duration-300 ease-out" enter-from-class="transform opacity-0 -translate-y-2" enter-to-class="transform opacity-100 translate-y-0" leave-active-class="transition duration-200 ease-in" leave-from-class="transform opacity-100 translate-y-0" leave-to-class="transform opacity-0 -translate-y-2">
    <section v-if="show" class="mt-6 bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 shadow-2xl backdrop-blur-xl">
      <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div class="flex items-center gap-2">
          <span :class="['w-2.5 h-2.5 rounded-full', threats.length > 0 ? 'bg-rose-400 animate-ping' : 'bg-emerald-400']"></span>
          <h3 class="text-sm font-bold text-white font-mono">{{ t.cockpit.drawer.title }}</h3>
          <span class="px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 text-[10px] font-mono">{{ threats.length }} {{ t.cockpit.drawer.eventsCount }}</span>
        </div>
        <div class="flex items-center gap-3 font-mono text-xs">
          <button @click="$emit('switch-nav', 'streams')" class="text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer">
            {{ t.cockpit.drawer.openStreamsBtn }}
          </button>
          <button @click="$emit('close')" class="text-slate-400 hover:text-white cursor-pointer">{{ t.cockpit.drawer.collapseBtn }}</button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs font-mono">
          <thead>
            <tr class="text-slate-400 border-b border-slate-800 bg-slate-950/50">
              <th class="py-2.5 px-3">{{ t.cockpit.drawer.colTimestamp }}</th>
              <th class="py-2.5 px-3">{{ t.cockpit.drawer.colClientIp }}</th>
              <th class="py-2.5 px-3">{{ t.cockpit.drawer.colTarget }}</th>
              <th class="py-2.5 px-3">{{ t.cockpit.drawer.colAction }}</th>
              <th class="py-2.5 px-3">{{ t.cockpit.drawer.colThreatType }}</th>
              <th class="py-2.5 px-3">{{ t.cockpit.drawer.colLatency }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60">
            <tr v-if="threats.length === 0">
              <td colspan="6" class="py-6 px-3 text-center text-slate-500">
                {{ t.cockpit.drawer.empty }}
              </td>
            </tr>
            <tr v-for="threat in threats" :key="threat.id" class="hover:bg-slate-800/40">
              <td class="py-2.5 px-3 text-slate-400">{{ formatDate(threat.timestamp) }}</td>
              <td class="py-2.5 px-3 text-slate-300">{{ threat.client_ip }}</td>
              <td class="py-2.5 px-3 text-white font-semibold max-w-xs truncate" :title="threat.fqdn">{{ threat.fqdn }}</td>
              <td class="py-2.5 px-3">
                <span :class="['px-2 py-0.5 rounded text-[10px] font-extrabold', (threat.action && threat.action.includes('BLOCK')) ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30']">
                  {{ threat.action }}
                </span>
              </td>
              <td class="py-2.5 px-3 text-slate-300">{{ threat.threat_type }}</td>
              <td class="py-2.5 px-3 text-slate-400">{{ threat.latency_ms }} ms</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </transition>
</template>

<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n';

const { t, locale } = useI18n();

export interface ThreatEvent {
  id: string;
  timestamp: string;
  client_ip: string;
  fqdn: string;
  action: string;
  threat_type: string;
  latency_ms: number;
}

defineProps<{
  show: boolean;
  threats: ThreatEvent[];
}>();

defineEmits<{
  (e: 'switch-nav', nav: string): void;
  (e: 'close'): void;
}>();

function formatDate(ts: string) {
  if (!ts) return '';
  const d = new Date(ts.replace(' ', 'T'));
  if (isNaN(d.getTime())) return ts.slice(11, 19);
  return d.toLocaleTimeString(locale.value === 'fr' ? 'fr-FR' : 'en-US');
}
</script>
