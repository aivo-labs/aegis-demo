import { apiRequest } from './client';

export interface PageScanResult {
  url: string;
  status_code: number;
  weight_kb: number;
  dom_elements: number;
  http_requests: number;
  eco_score: number;
  eco_grade: string;
  gco2: number;
  water_cl: number;
}

export interface AuditReport {
  audit_id?: string;
  domain: string;
  scanned_at: string;
  pages_scanned: number;
  scan_duration_ms?: number;
  security_score: number;
  security_grade: string;
  eco_index_score: number;
  eco_index_grade: string;
  avg_gco2_grams: number;
  avg_water_cl?: number;
  ownership_verified: boolean;
  detected_tech: Array<{ name: string; version?: string; category: string }>;
  cve_warnings: Array<{ cve_id: string; title: string; severity: string; score: number }>;
  security_headers: Record<string, string>;
  headers_analysis: Array<{ name: string; status: 'present' | 'missing' | 'weak'; recommendation?: string }>;
  dns_checks: Record<string, boolean>;
  dns_analysis: Record<string, any>;
  pages: PageScanResult[];
  verification_token?: string;
}

export interface DnsChallengeResponse {
  domain: string;
  token: string;
  record_name: string;
  record_type: string;
  expected_value: string;
  message?: string;
}

export interface VerifyOwnershipResponse {
  verified: boolean;
  verification_method?: string;
  contract_sha256?: string;
  audit?: AuditReport;
  deep_findings?: any[];
  message?: string;
}

export const auditApi = {
  async getLatestAudit(domain?: string) {
    const q = domain ? `?domain=${encodeURIComponent(domain)}` : '';
    return apiRequest<{ has_audit: boolean; audit: AuditReport }>(`/api/v1/audit/latest${q}`, { method: 'GET' });
  },

  async runPassiveScan(domain: string) {
    return apiRequest<{ status: string; audit: AuditReport }>('/api/v1/audit/passive-scan', {
      method: 'POST',
      body: JSON.stringify({ domain }),
    });
  },

  async requestVerification(domain: string, email: string, company?: string) {
    return apiRequest<DnsChallengeResponse>('/api/v1/audit/request-verification', {
      method: 'POST',
      body: JSON.stringify({ domain, email, company }),
    });
  },

  async verifyOwnership(domain: string, email: string, contractAccepted: boolean) {
    return apiRequest<VerifyOwnershipResponse>('/api/v1/audit/verify-ownership', {
      method: 'POST',
      body: JSON.stringify({ domain, email, contract_accepted: contractAccepted }),
    });
  },
};
