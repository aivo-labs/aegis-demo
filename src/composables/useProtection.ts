import { ref } from 'vue';
import { protectionApi } from '../services/api/protectionApi';

export function useProtection() {
  const protectionEnabled = ref(true);
  const isTogglingProtection = ref(false);
  const errorMessage = ref('');

  async function fetchProtectionStatus() {
    const res = await protectionApi.getStatus();
    if (res.ok && res.data) {
      protectionEnabled.value = res.data.protection_enabled;
    }
  }

  async function toggleProtection() {
    if (isTogglingProtection.value) return;
    isTogglingProtection.value = true;
    errorMessage.value = '';
    const nextState = !protectionEnabled.value;

    const res = await protectionApi.setProtection(nextState);
    if (res.ok && res.data) {
      protectionEnabled.value = res.data.protection_enabled;
    } else {
      errorMessage.value = res.error || 'Erreur lors de la bascule de protection';
    }
    isTogglingProtection.value = false;
  }

  return {
    protectionEnabled,
    isTogglingProtection,
    errorMessage,
    fetchProtectionStatus,
    toggleProtection,
  };
}
