import { ref, computed, watch } from 'vue';
import { cveApi, type CveItem } from '../services/api/cveApi';
import { SANDBOX_CVE_FEED } from '../data/sandboxFixtures';
import { useI18n } from './useI18n';

export function useCveFeed(options?: { isDemo?: boolean }) {
  const { locale } = useI18n();
  const cves = ref<CveItem[]>([]);
  const activeRulesCount = ref(6);
  const blockedByPatchCount = ref(0);
  const catalogCves = ref<CveItem[]>([]);
  const exposedCves = ref<CveItem[]>([]);
  const updatedAt = ref('');

  const activeDefenses = computed(() => cves.value.filter(c => c.is_active_defense || (c as any).blocked_by_aegis));
  const isSyncing = ref(false);
  const lastSyncReport = ref<any>(null);

  function loadSandboxCveData() {
    catalogCves.value = [...SANDBOX_CVE_FEED.catalog_cves];
    cves.value = [...SANDBOX_CVE_FEED.catalog_cves];
    exposedCves.value = [...SANDBOX_CVE_FEED.exposed_cves];
    activeRulesCount.value = SANDBOX_CVE_FEED.active_rules_count;
    blockedByPatchCount.value = SANDBOX_CVE_FEED.blocked_by_virtual_patch_count;
    updatedAt.value = new Date().toISOString();
  }

  async function fetchCveFeed(lang?: string) {
    if (options?.isDemo) {
      loadSandboxCveData();
      return;
    }

    const targetLang = lang || locale?.value || 'fr';
    try {
      const res = await cveApi.getFeed(targetLang);
      if (res.ok && res.data) {
        cves.value = res.data.cves || [];
        catalogCves.value = res.data.catalog_cves || res.data.cves || [];
        activeRulesCount.value = res.data.active_rules_count ?? (res.data.cves ? res.data.cves.length : 6);
        if (res.data.blocked_by_virtual_patch_count !== undefined) blockedByPatchCount.value = res.data.blocked_by_virtual_patch_count;
        if (res.data.exposed_cves) exposedCves.value = res.data.exposed_cves;
        if (res.data.last_sync_report) lastSyncReport.value = res.data.last_sync_report;
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

  async function syncCertFr(lang?: string) {
    isSyncing.value = true;
    try {
      if (options?.isDemo) {
        lastSyncReport.value = {
          synced_at: new Date().toISOString(),
          feed_source: 'https://www.cert.cyber.gouv.fr/alerte/feed/',
          alerts_parsed: 10,
          new_ingested: 0,
          already_curated: catalogCves.value.length,
          duration_ms: 110,
        };
        return;
      }
      const targetLang = lang || locale?.value || 'fr';
      const res = await cveApi.syncCertFr(targetLang);
      if (res.ok && res.data) {
        lastSyncReport.value = res.data.sync_report;
        await fetchCveFeed(targetLang);
      }
    } catch (e) {
      console.warn('CERT-FR sync error:', e);
    } finally {
      isSyncing.value = false;
    }
  }

  if (locale) {
    watch(locale, (newLang) => {
      fetchCveFeed(newLang);
    });
  }

  return {
    cves,
    activeRulesCount,
    blockedByPatchCount,
    catalogCves,
    exposedCves,
    updatedAt,
    activeDefenses,
    isSyncing,
    lastSyncReport,
    fetchCveFeed,
    syncCertFr,
  };
}
