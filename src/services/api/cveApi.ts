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

export interface CveFeedResponse {
  status: string;
  count: number;
  cves: CveItem[];
  active_rules_count?: number;
  blocked_by_virtual_patch_count?: number;
  catalog_cves?: CveItem[];
  exposed_cves?: CveItem[];
  updated_at: string;
  source: string;
}

export const cveApi = {
  async getFeed() {
    return apiRequest<CveFeedResponse>('/api/v1/cve/feed', { method: 'GET' });
  },
};
