import { apiRequest } from './client';

export interface PowerPoint {
  time: string;
  watts: number;
}

export interface EnergyEquivalencies {
  car_km: number;
  smartphones_charged: number;
  water_bottles: number;
  showers_pct: number;
}

export interface EnergySummary {
  instant_watts: number;
  cpu_watts: number;
  ram_watts: number;
  avg_watts: number;
  max_watts: number;
  min_watts: number;
  total_joules: number;
  total_kwh: number;
  avg_cpu_load_pct: number;
  max_cpu_load_pct: number;
  carbon_intensity_gco2_kwh: number;
  total_carbon_gco2: number;
  total_carbon_kg: number;
  water_usage_liters: number;
  estimated_cost_eur: number;
  pue: number;
  equivalencies: EnergyEquivalencies;
}

export interface EnergyTimePoint {
  time: string;
  timestamp: string;
  watts: number;
  cpu_watts: number;
  ram_watts: number;
  cpu_load_pct: number;
  carbon_gco2: number;
  water_cl: number;
}

export interface WorkloadEnergy {
  namespace: string;
  service: string;
  type: string;
  share_pct: number;
  watts: number;
  cpu_load_pct: number;
  kwh: number;
  carbon_gco2: number;
  water_liters: number;
}

export interface NodeEnergy {
  id: string;
  hostname: string;
  ip: string;
  provider: string;
  os_info: string;
  agent: string;
  status: string;
  avg_watts: number;
  kwh: number;
  carbon_kg: number;
  share_pct: number;
}

export interface EnergyTelemetryResponse {
  status: string;
  range: string;
  time_window: {
    from: string;
    to: string;
  };
  is_simulated_history: boolean;
  sample_count: number;
  summary: EnergySummary;
  timeseries: EnergyTimePoint[];
  nodes: NodeEnergy[];
  workloads: WorkloadEnergy[];
  available_ranges: string[];
  available_months: string[];
  available_namespaces: string[];
}

export interface TelemetrySummary {
  green?: {
    instant_power_watts: number;
    cpu_watts: number;
    ram_watts: number;
    cpu_load_pct: number;
    carbon_intensity_gco2_h: number;
    power_history: PowerPoint[];
    total_joules?: number;
    pue?: number;
  };
  security?: {
    total_blocked?: number;
    interception_rate?: number;
    active_threats?: number;
  };
  nodes_count?: number;
}

export interface EnergyQueryParams {
  range?: string;
  from?: string;
  to?: string;
  month?: string;
  year?: string;
  node?: string;
  namespace?: string;
}

export const telemetryApi = {
  async getSummary() {
    return apiRequest<TelemetrySummary>('/api/v1/dashboard/summary', { method: 'GET' });
  },

  async getEnergyTelemetry(params?: EnergyQueryParams) {
    const query = new URLSearchParams();
    if (params?.range) query.set('range', params.range);
    if (params?.from) query.set('from', params.from);
    if (params?.to) query.set('to', params.to);
    if (params?.month) query.set('month', params.month);
    if (params?.year) query.set('year', params.year);
    if (params?.node) query.set('node', params.node);
    if (params?.namespace) query.set('namespace', params.namespace);
    const qs = query.toString();
    const endpoint = `/api/v1/dashboard/energy/telemetry${qs ? `?${qs}` : ''}`;
    return apiRequest<EnergyTelemetryResponse>(endpoint, { method: 'GET' });
  },
};
