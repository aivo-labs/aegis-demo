import { ref, computed } from 'vue';
import { cveApi, type CveItem } from '../services/api/cveApi';
import { SANDBOX_CVE_FEED } from '../data/sandboxFixtures';

export function useCveFeed(options?: { isDemo?: boolean }) {
  const cves = ref<CveItem[]>([]);
  const activeRulesCount = ref(6);
  const blockedByPatchCount = ref(0);
  const catalogCves = ref<CveItem[]>([]);
  const exposedCves = ref<CveItem[]>([]);
  const updatedAt = ref('');

  const activeDefenses = computed(() => cves.value.filter(c => c.is_active_defense || (c as any).blocked_by_aegis));

  function loadSandboxCveData() {
    catalogCves.value = [...SANDBOX_CVE_FEED.catalog_cves];
    cves.value = [...SANDBOX_CVE_FEED.catalog_cves];
    exposedCves.value = [...SANDBOX_CVE_FEED.exposed_cves];
    activeRulesCount.value = SANDBOX_CVE_FEED.active_rules_count;
    blockedByPatchCount.value = SANDBOX_CVE_FEED.blocked_by_virtual_patch_count;
    updatedAt.value = new Date().toISOString();
  }

  async function fetchCveFeed() {
    if (options?.isDemo) {
      loadSandboxCveData();
      return;
    }

    try {
      const res = await cveApi.getFeed();
      if (res.ok && res.data) {
        cves.value = res.data.cves || [];
        catalogCves.value = res.data.catalog_cves || res.data.cves || [];
        activeRulesCount.value = res.data.active_rules_count ?? (res.data.cves ? res.data.cves.length : 6);
        if (res.data.blocked_by_virtual_patch_count !== undefined) blockedByPatchCount.value = res.data.blocked_by_virtual_patch_count;
        if (res.data.exposed_cves) exposedCves.value = res.data.exposed_cves;
        updatedAt.value = res.data.updated_at || '';
      } else if (catalogCves.value.length === 0) {
        loadSandboxCveData();
      }
    } catch (e) {
      if (catalogCves.value.length === 0) {
        loadSandboxCveData();
      }
    }
  }

  return {
    cves,
    activeRulesCount,
    blockedByPatchCount,
    catalogCves,
    exposedCves,
    updatedAt,
    activeDefenses,
    fetchCveFeed,
  };
}
