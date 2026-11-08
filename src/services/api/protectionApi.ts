import { apiRequest } from './client';

export interface ProtectionStatus {
  status: string;
  protection_enabled: boolean;
  max_payload_bytes?: number;
  message?: string;
  timestamp?: string;
}

export const protectionApi = {
  async getStatus() {
    return apiRequest<ProtectionStatus>('/api/v1/protection/status', { method: 'GET' });
  },

  async setProtection(enabled: boolean) {
    return apiRequest<ProtectionStatus>('/api/v1/protection/toggle', {
      method: 'POST',
      body: JSON.stringify({ protection_enabled: enabled }),
    });
  },
};
