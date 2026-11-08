import { apiRequest } from './client';

export interface IngressEvent {
  id: string;
  client_ip: string;
  method: string;
  target: string;
  host?: string;
  domain?: string;
  user_agent?: string;
  threat_type?: string;
  category?: string;
  decision: 'ALLOW' | 'BLOCK' | 'BYPASS';
  status_code: number;
  timestamp: string;
  lat?: number;
  lon?: number;
  country?: string;
  entropy?: number;
  latency_ms?: number;
  metadata?: Record<string, any>;
}

export interface EgressEvent {
  id: string;
  protocol?: 'DNS' | 'TCP';
  domain?: string;
  target?: string;
  target_ip?: string;
  host?: string;
  client_ip?: string;
  port?: number;
  decision: 'ALLOW' | 'BLOCK' | 'BYPASS';
  threat_type?: string;
  entropy?: number;
  timestamp: string;
  latency_ms?: number;
  exfil_probability?: number;
  metadata?: Record<string, any>;
}

export interface LiveStreamsResponse {
  ingress_stream: IngressEvent[];
  egress_stream: EgressEvent[];
  total_ingress_24h?: number;
  blocked_ingress_24h?: number;
  total_egress_24h?: number;
  blocked_egress_24h?: number;
  timestamp: string;
}

export const streamsApi = {
  async getLiveStreams(params?: { date?: string; host?: string; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.date) query.set('date', params.date);
    if (params?.host) query.set('host', params.host);
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    const endpoint = `/api/v1/dashboard/live-streams${qs ? `?${qs}` : ''}`;
    return apiRequest<LiveStreamsResponse>(endpoint, { method: 'GET' });
  },

  async simulateBotProbes() {
    try {
      const res = await fetch('/_aegis/simulate', { method: 'POST' });
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    // Fallback direct relatif
    const probes = [
      '/wp-login.php',
      '/wp-content/plugins/revslider/temp/update_extract/revslider/db.php',
      '/xmlrpc.php',
      '/.env',
      '/phpmyadmin/index.php',
      '/api/v1/search?q=1+UNION+SELECT+username,password+FROM+users--',
    ];
    for (const p of probes) {
      await fetch(p, { method: 'GET' }).catch(() => {});
    }
  },
};
