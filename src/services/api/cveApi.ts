import { apiRequest } from './client';

export interface CveItem {
  id: string;
  name: string;
  component: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  cvss: number;
  description: string;
  status: string;
  is_active_defense: boolean;
}

export interface CertFrSyncReport {
  synced_at: string;
  feed_source: string;
  alerts_parsed: number;
  new_ingested: number;
  already_curated: number;
  duration_ms: number;
}

export interface CveFeedResponse {
  status: string;
  count: number;
  cves: CveItem[];
  active_rules_count?: number;
  blocked_by_virtual_patch_count?: number;
  catalog_cves?: CveItem[];
  exposed_cves?: CveItem[];
  last_sync_report?: CertFrSyncReport;
  updated_at: string;
  source: string;
}

export const cveApi = {
  async getFeed(lang?: string) {
    const query = lang ? `?lang=${encodeURIComponent(lang)}` : '';
    return apiRequest<CveFeedResponse>(`/api/v1/cve/feed${query}`, { method: 'GET' });
  },
  async syncCertFr(lang?: string) {
    const query = lang ? `?lang=${encodeURIComponent(lang)}` : '';
    return apiRequest<{
      status: string;
      sync_report: CertFrSyncReport;
      total_cves: number;
      coverage_report: any;
    }>(`/api/v1/cve/sync/certfr${query}`, { method: 'POST' });
  },
};
