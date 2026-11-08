import { ref, computed } from 'vue';
import { streamsApi, type IngressEvent, type EgressEvent } from '../services/api/streamsApi';
import { REPLAY_ATTACK_SEEDS } from '../data/sandboxFixtures';

export function useLiveStreams(options?: { isDemo?: boolean }) {
  const ingressStream = ref<IngressEvent[]>([]);
  const egressStream = ref<EgressEvent[]>([]);
  const streamFilter = ref<'all' | 'probes' | 'exploits' | 'clean'>('all');
  const selectedHost = ref<string>('all');
  const selectedDate = ref<string>('');
  const searchQuery = ref<string>('');
  const isSimulatingProbes = ref(false);
  const isLoading = ref(true);

  // 24h Totals from Backend / Database
  const totalIngress24h = ref<number>(0);
  const blockedIngress24h = ref<number>(0);
  const totalEgress24h = ref<number>(0);
  const blockedEgress24h = ref<number>(0);

  // Classification helpers
  function isClean(item: IngressEvent): boolean {
    return item.decision === 'ALLOW' || item.decision === 'OK' || ((item as any).http_status ?? item.status_code) < 400;
  }

  function isProbe(item: IngressEvent): boolean {
    if (isClean(item)) return false;
    const cat = (item.category || (item as any).threat_category || '').toUpperCase();
    const uri = (item.target || (item as any).request_uri || '').toLowerCase();
    const threat = (item.threat_type || (item as any).threat_detected || '').toUpperCase();
    return (
      cat.includes('SONDE') ||
      cat.includes('SCAN') ||
      threat.includes('SCAN') ||
      threat.includes('PROBE') ||
      uri.includes('wp-') ||
      uri.includes('.env') ||
      uri.includes('.git') ||
      uri.includes('xmlrpc') ||
      uri.includes('phpmyadmin') ||
      uri.includes('phpinfo') ||
      uri.includes('cgi-bin') ||
      uri.includes('setup.cgi')
    );
  }

  function isExploit(item: IngressEvent): boolean {
    if (isClean(item)) return false;
    return !isProbe(item);
  }

  // Base list filtered by host and search
  const baseIngressList = computed(() => {
    let list = ingressStream.value;
    if (selectedHost.value && selectedHost.value !== 'all') {
      const h = selectedHost.value.toLowerCase();
      list = list.filter(i => (i.host || i.domain || '').toLowerCase() === h);
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase();
      list = list.filter(i => 
        (i.client_ip || '').toLowerCase().includes(q) ||
        (i.target || '').toLowerCase().includes(q) ||
        (i.host || '').toLowerCase().includes(q) ||
        (i.category || '').toLowerCase().includes(q)
      );
    }
    return list;
  });

  const probeEventsCount = computed(() => baseIngressList.value.filter(isProbe).length);
  const exploitEventsCount = computed(() => baseIngressList.value.filter(isExploit).length);
  const cleanEventsCount = computed(() => baseIngressList.value.filter(isClean).length);

  const filteredIngressStream = computed(() => {
    const list = baseIngressList.value;
    if (streamFilter.value === 'probes') {
      return list.filter(isProbe);
    }
    if (streamFilter.value === 'exploits') {
      return list.filter(isExploit);
    }
    if (streamFilter.value === 'clean') {
      return list.filter(isClean);
    }
    return list;
  });

  const filteredEgressStream = computed(() => {
    let list = egressStream.value;
    if (selectedHost.value && selectedHost.value !== 'all') {
      const h = selectedHost.value.toLowerCase();
      list = list.filter(e => 
        (e.host || '').toLowerCase() === h ||
        (e.domain || '').toLowerCase().includes(h)
      );
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase();
      list = list.filter(e => 
        (e.domain || '').toLowerCase().includes(q) ||
        (e.client_ip || '').toLowerCase().includes(q) ||
        (e.target_ip || '').toLowerCase().includes(q)
      );
    }
    return list;
  });

  const availableHosts = computed(() => {
    const set = new Set<string>();
    ingressStream.value.forEach(i => {
      const h = i.host || i.domain;
      if (h) set.add(h);
    });
    egressStream.value.forEach(e => {
      const h = e.host || e.domain;
      if (h && !h.includes(':')) set.add(h);
    });
    return Array.from(set).sort();
  });

  const mapEvents = computed(() => {
    return filteredIngressStream.value
      .filter(i => i.decision !== 'ALLOW')
      .map(i => ({
        id: i.id,
        client_ip: i.client_ip,
        fqdn: `${i.method || (i as any).http_method || 'GET'} ${i.target || (i as any).request_uri || '/'}`,
        threat_type: i.threat_type || 'THREAT',
        lat: i.lat || 48.8566,
        lon: i.lon || 2.3522,
      }));
  });

  function loadSandboxStreams() {
    ingressStream.value = REPLAY_ATTACK_SEEDS.map((s, idx) => ({
      id: `seed-ingress-${idx}`,
      client_ip: s.client_ip,
      method: s.method,
      target: s.target,
      host: s.host,
      domain: s.host,
      user_agent: s.user_agent,
      threat_type: s.threat_type,
      category: s.category,
      decision: s.decision === 'SINKHOLE' ? 'BLOCK' : s.decision,
      status_code: s.status_code,
      timestamp: new Date(Date.now() - idx * 360000).toISOString(),
      lat: s.lat,
      lon: s.lon,
      country: s.country,
      entropy: s.entropy,
      latency_ms: s.latency_ms,
    }));

    egressStream.value = REPLAY_ATTACK_SEEDS
      .filter(s => s.decision === 'SINKHOLE' || s.category.includes('Egress'))
      .map((s, idx) => ({
        id: `seed-egress-${idx}`,
        protocol: 'DNS',
        domain: s.target.replace('/dns-query?name=', '').replace('&type=A', ''),
        target: s.target,
        target_ip: '0.0.0.0',
        client_ip: s.client_ip,
        port: 53,
        decision: 'BLOCK',
        threat_type: s.threat_type,
        entropy: s.entropy,
        timestamp: new Date(Date.now() - idx * 120000).toISOString(),
        latency_ms: s.latency_ms,
        exfil_probability: 0.98,
      }));

    totalIngress24h.value = 13950;
    blockedIngress24h.value = 13845;
    totalEgress24h.value = 870;
    blockedEgress24h.value = 867;
  }

  function mergeStreams<T extends { id: string; timestamp: string }>(currentList: T[], incomingList: T[]): T[] {
    const map = new Map<string, T>();
    currentList.forEach(item => map.set(item.id, item));
    incomingList.forEach(item => map.set(item.id, item));
    return Array.from(map.values()).sort((a, b) => {
      const tb = new Date(b.timestamp).getTime();
      const ta = new Date(a.timestamp).getTime();
      return tb - ta;
    });
  }

  const SIMULATED_ATTACK_PROBES: IngressEvent[] = [
    {
      id: 'sim-in-1',
      client_ip: '198.51.100.77',
      method: 'GET',
      target: '/wp-login.php',
      host: 'aegis.aivo.fr',
      domain: 'aegis.aivo.fr',
      user_agent: 'Mozilla/5.0 sqlmap/1.5.11 (Automated Botnet Probe)',
      threat_type: 'SONDE BOTNET CMS / PHP',
      category: 'SONDE BOTNET CMS / PHP',
      decision: 'BLOCK',
      status_code: 403,
      timestamp: new Date().toISOString(),
      lat: 48.8566,
      lon: 2.3522,
      country: 'FR',
      entropy: 3.45,
      latency_ms: 0.35,
      metadata: {
        engine: 'Aegis Gate PEP (:8000)',
        pattern: 'CMS Admin Login Brute Force Signature',
        simulated: true,
        risk_score: 96,
      },
    },
    {
      id: 'sim-in-2',
      client_ip: '198.51.100.77',
      method: 'GET',
      target: '/wp-content/plugins/revslider/temp/update_extract/revslider/db.php',
      host: 'aegis.aivo.fr',
      domain: 'aegis.aivo.fr',
      user_agent: 'nikto/2.1.6 (Vulnerability Scanner)',
      threat_type: 'EXPLOIT REVSLIDER RCE',
      category: 'EXPLOITS CRITIQUES',
      decision: 'BLOCK',
      status_code: 403,
      timestamp: new Date(Date.now() - 600).toISOString(),
      lat: 52.52,
      lon: 13.405,
      country: 'DE',
      entropy: 4.12,
      latency_ms: 0.42,
      metadata: {
        engine: 'Aegis Gate PEP (Virtual Patching)',
        pattern: 'CVE-2014-9734 Arbitrary File Retrieval',
        simulated: true,
        risk_score: 99,
      },
    },
    {
      id: 'sim-in-3',
      client_ip: '198.51.100.77',
      method: 'POST',
      target: '/xmlrpc.php',
      host: 'aegis.aivo.fr',
      domain: 'aegis.aivo.fr',
      user_agent: 'python-requests/2.31.0',
      threat_type: 'XML-RPC AMPLIFICATION & BRUTEFORCE',
      category: 'SONDE BOTNET CMS / PHP',
      decision: 'BLOCK',
      status_code: 403,
      timestamp: new Date(Date.now() - 1200).toISOString(),
      lat: 37.7749,
      lon: -122.4194,
      country: 'US',
      entropy: 3.88,
      latency_ms: 0.28,
      metadata: {
        engine: 'Aegis Gate PEP (:8000)',
        pattern: 'system.multicall amplification probe',
        simulated: true,
        risk_score: 92,
      },
    },
    {
      id: 'sim-in-4',
      client_ip: '198.51.100.77',
      method: 'GET',
      target: '/.env',
      host: 'aegis.aivo.fr',
      domain: 'aegis.aivo.fr',
      user_agent: 'gobuster/3.5 (Dir Brute)',
      threat_type: 'EXTRACTION SECRETS (.ENV)',
      category: 'SONDE FICHIER SENSIBLE',
      decision: 'BLOCK',
      status_code: 403,
      timestamp: new Date(Date.now() - 1800).toISOString(),
      lat: 55.7558,
      lon: 37.6173,
      country: 'RU',
      entropy: 2.91,
      latency_ms: 0.22,
      metadata: {
        engine: 'Aegis Gate PEP (Virtual Patching)',
        pattern: 'DotEnv Sensitive Credential Scanner',
        simulated: true,
        risk_score: 98,
      },
    },
    {
      id: 'sim-in-5',
      client_ip: '198.51.100.77',
      method: 'GET',
      target: '/phpmyadmin/index.php',
      host: 'aegis.aivo.fr',
      domain: 'aegis.aivo.fr',
      user_agent: 'zgrab/0.x',
      threat_type: 'SONDE PHPMYADMIN EXP',
      category: 'SONDE FICHIER SENSIBLE',
      decision: 'BLOCK',
      status_code: 403,
      timestamp: new Date(Date.now() - 2400).toISOString(),
      lat: 51.5074,
      lon: -0.1278,
      country: 'GB',
      entropy: 3.1,
      latency_ms: 0.31,
      metadata: {
        engine: 'Aegis Gate PEP (:8000)',
        pattern: 'Database Management Exposure Probe',
        simulated: true,
        risk_score: 90,
      },
    },
    {
      id: 'sim-in-6',
      client_ip: '198.51.100.77',
      method: 'GET',
      target: '/api/v1/search?q=1+UNION+SELECT+username,password+FROM+users--',
      host: 'aegis.aivo.fr',
      domain: 'aegis.aivo.fr',
      user_agent: 'Mozilla/5.0 sqlmap/1.5.11',
      threat_type: 'INJECTION SQL (UNION SELECT)',
      category: 'EXPLOITS CRITIQUES',
      decision: 'BLOCK',
      status_code: 403,
      timestamp: new Date(Date.now() - 3000).toISOString(),
      lat: 1.3521,
      lon: 103.8198,
      country: 'SG',
      entropy: 4.75,
      latency_ms: 0.38,
      metadata: {
        engine: 'Aegis Gate PEP (OWASP CRS SQLLD)',
        pattern: 'SQL injection union select token detected',
        simulated: true,
        risk_score: 100,
      },
    },
  ];

  const SIMULATED_EGRESS_PROBES: EgressEvent[] = [
    {
      id: 'sim-eg-1',
      protocol: 'DNS',
      domain: 'c2-beacon.random-domain.top',
      target: 'c2-beacon.random-domain.top',
      target_ip: '0.0.0.0',
      client_ip: '198.51.100.77',
      port: 53,
      decision: 'BLOCK',
      threat_type: 'KNOWN_C2_INFRASTRUCTURE',
      entropy: 4.85,
      timestamp: new Date().toISOString(),
      latency_ms: 0.95,
      exfil_probability: 0.98,
      metadata: {
        engine: 'Aegis System One Sinkhole (:5053)',
        action: 'SINKHOLE_REDIRECT_0.0.0.0',
        simulated: true,
      },
    },
    {
      id: 'sim-eg-2',
      protocol: 'TCP',
      domain: 'revshell.xmrig-pool.xyz',
      target: 'revshell.xmrig-pool.xyz',
      target_ip: '0.0.0.0',
      client_ip: '198.51.100.77',
      port: 4444,
      decision: 'BLOCK',
      threat_type: 'REVERSE_SHELL_C2',
      entropy: 4.62,
      timestamp: new Date(Date.now() - 800).toISOString(),
      latency_ms: 1.1,
      exfil_probability: 0.95,
      metadata: {
        engine: 'Aegis Egress Gateway PEP',
        action: 'SOCKET_DROP_IMMEDIATE',
        simulated: true,
      },
    },
    {
      id: 'sim-eg-3',
      protocol: 'DNS',
      domain: 'data-tunnel.exfil-dns-payload.io',
      target: 'data-tunnel.exfil-dns-payload.io',
      target_ip: '0.0.0.0',
      client_ip: '198.51.100.77',
      port: 53,
      decision: 'BLOCK',
      threat_type: 'DNS_TUNNEL_EXFIL',
      entropy: 4.92,
      timestamp: new Date(Date.now() - 1600).toISOString(),
      latency_ms: 0.85,
      exfil_probability: 0.99,
      metadata: {
        engine: 'Aegis System One Shannon Entropy Filter',
        action: 'SINKHOLE_BLOCK',
        simulated: true,
      },
    },
  ];

  async function fetchLiveStreams(params?: { date?: string; host?: string; limit?: number }) {
    if (options?.isDemo) {
      loadSandboxStreams();
      isLoading.value = false;
      return;
    }

    try {
      const reqDate = params?.date !== undefined ? params.date : selectedDate.value;
      const reqHost = params?.host !== undefined ? params.host : (selectedHost.value === 'all' ? '' : selectedHost.value);
      const limit = params?.limit ?? 50;

      const res = await streamsApi.getLiveStreams({
        date: reqDate || undefined,
        host: reqHost || undefined,
        limit,
      });

      if (res.ok && res.data) {
        const incomingIn = res.data.ingress_stream || [];
        const incomingEg = res.data.egress_stream || [];

        ingressStream.value = mergeStreams(ingressStream.value, incomingIn);
        egressStream.value = mergeStreams(egressStream.value, incomingEg);

        totalIngress24h.value = Math.max(res.data.total_ingress_24h ?? 0, ingressStream.value.length);
        blockedIngress24h.value = Math.max(
          res.data.blocked_ingress_24h ?? 0,
          ingressStream.value.filter(i => i.decision === 'BLOCK').length
        );
        totalEgress24h.value = Math.max(res.data.total_egress_24h ?? 0, egressStream.value.length);
        blockedEgress24h.value = Math.max(
          res.data.blocked_egress_24h ?? 0,
          egressStream.value.filter(e => e.decision === 'BLOCK').length
        );
      }
    } catch (e) {
      // Tolérance réseau en arrière-plan : ne jamais vider les flux existants
    } finally {
      isLoading.value = false;
    }
  }

  async function simulateBotProbes() {
    if (isSimulatingProbes.value) return;
    isSimulatingProbes.value = true;
    try {
      // 1. Optimistic immediate UI update: Prepend realistic blocked events
      const now = Date.now();
      const currentHost = (selectedHost.value && selectedHost.value !== 'all') ? selectedHost.value : 'aegis.aivo.fr';
      const freshIngress = SIMULATED_ATTACK_PROBES.map((p, idx) => ({
        ...p,
        id: `sim-in-${now}-${idx}`,
        host: currentHost,
        domain: currentHost,
        timestamp: new Date(now - idx * 400).toISOString(),
      }));
      const freshEgress = SIMULATED_EGRESS_PROBES.map((eg, idx) => ({
        ...eg,
        id: `sim-eg-${now}-${idx}`,
        host: currentHost,
        domain: currentHost,
        timestamp: new Date(now - idx * 700).toISOString(),
      }));

      ingressStream.value = mergeStreams(ingressStream.value, freshIngress);
      egressStream.value = mergeStreams(egressStream.value, freshEgress);

      totalIngress24h.value += freshIngress.length;
      blockedIngress24h.value += freshIngress.length;
      totalEgress24h.value += freshEgress.length;
      blockedEgress24h.value += freshEgress.length;

      // 2. Fire backend simulation to record in PostgreSQL / Gate Proxy
      await streamsApi.simulateBotProbes();
      setTimeout(() => {
        fetchLiveStreams();
      }, 700);
    } finally {
      isSimulatingProbes.value = false;
    }
  }

  return {
    ingressStream,
    egressStream,
    streamFilter,
    selectedHost,
    selectedDate,
    searchQuery,
    isLoading,
    isSimulatingProbes,
    totalIngress24h,
    blockedIngress24h,
    totalEgress24h,
    blockedEgress24h,
    availableHosts,
    probeEventsCount,
    exploitEventsCount,
    cleanEventsCount,
    filteredIngressStream,
    filteredEgressStream,
    mapEvents,
    fetchLiveStreams,
    simulateBotProbes,
  };
}
