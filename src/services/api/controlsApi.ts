import { apiRequest } from './client';

export interface BannedIp {
  ip: string;
  reason: string;
  banned_at: string;
}

export interface RetentionPolicy {
  hot_window_days: number;
  anssi_forensic_days: number;
  rgpd_clean_ip_days: number;
}

export const controlsApi = {
  async getBans() {
    return apiRequest<{ bans: BannedIp[]; max_payload_bytes?: number }>('/api/v1/dashboard/bans', { method: 'GET' });
  },

  async addBan(ip: string, reason: string) {
    return apiRequest<{ status: string; message: string }>('/api/v1/dashboard/bans', {
      method: 'POST',
      body: JSON.stringify({ ip_address: ip, reason }),
    });
  },

  async removeBan(ip: string) {
    return apiRequest<{ status: string; message: string }>(`/api/v1/dashboard/bans?ip=${encodeURIComponent(ip)}`, {
      method: 'DELETE',
    });
  },

  async updatePayloadLimit(maxBytes: number) {
    return apiRequest<{ status: string; message: string }>('/api/v1/dashboard/retention', {
      method: 'POST',
      body: JSON.stringify({ max_payload_bytes: maxBytes }),
    });
  },

  async getRetention() {
    return apiRequest<{ status: string; retention: RetentionPolicy } | RetentionPolicy>('/api/v1/dashboard/retention', { method: 'GET' });
  },

  async saveRetention(policy: RetentionPolicy) {
    return apiRequest<{ status: string; message: string }>('/api/v1/dashboard/retention', {
      method: 'POST',
      body: JSON.stringify(policy),
    });
  },

  async purgeCleanLogs() {
    return apiRequest<{ status: string; message: string }>('/api/v1/dashboard/retention/purge', {
      method: 'POST',
      body: JSON.stringify({ scope: 'clean_only' }),
    });
  },
};
