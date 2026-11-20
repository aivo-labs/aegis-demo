import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAivoLeadPayload } from '../src/utils/aivoControlApi';
import { useAegisTheme } from '../src/composables/useAegisTheme';
import { useLiveStreams } from '../src/composables/useLiveStreams';
import { useTelemetry } from '../src/composables/useTelemetry';
import { useCveFeed } from '../src/composables/useCveFeed';

test('buildAivoLeadPayload builds compliant payload', () => {
  const payload = buildAivoLeadPayload({
    source: 'test_runner',
    offerType: 'TEST_OFFER',
    contact: {
      name: 'Cyber RSSI',
      email: 'rssi@enterprise.fr',
      company: 'SecCorp',
      domain: 'seccorp.fr',
    },
    auditReport: {
      domain: 'seccorp.fr',
      security_score: 92,
      security_grade: 'A',
      overall_eco_score: 78,
      overall_eco_grade: 'B',
      pages_scanned: 5,
    },
  });

  assert.equal(payload.schema_version, '1.0');
  assert.equal(payload.product, 'AEGIS_CYBER_GREEN');
  assert.equal(payload.source, 'test_runner');
  assert.equal(payload.prospect.full_name, 'Cyber RSSI');
  assert.equal(payload.prospect.email, 'rssi@enterprise.fr');
  assert.equal(payload.full_audit_report.security_score, 92);
  assert.equal(payload.full_audit_report.eco_index_score, 78);
});

test('sendLeadToAivoControlCenter respects privacy when endpoint is unconfigured', async () => {
  const { sendLeadToAivoControlCenter } = await import('../src/utils/aivoControlApi');
  const res = await sendLeadToAivoControlCenter({
    source: 'unit_test',
    contact: { name: 'Test User', email: 'test@example.com' },
  });

  assert.equal(res.ok, true);
  assert.equal(res.delivered_remotely, false);
  assert.equal(res.reason, 'unconfigured_open_source_mode');
});

test('useTelemetry dynamicSvgPath computes correct polyline', () => {
  const { powerHistory, dynamicSvgPath, instantWatts, dynamicCpuLoadSvgPath, timeseries } = useTelemetry();

  // Initial zero watts
  assert.equal(dynamicSvgPath.value, 'M 40,140 L 480,140');

  // Value set
  instantWatts.value = 10;
  assert.equal(dynamicSvgPath.value, 'M 40,90 L 480,90');

  // History path
  powerHistory.value = [
    { time: '10:00', watts: 5 },
    { time: '10:01', watts: 15 },
  ];
  assert.equal(dynamicSvgPath.value, 'M 40,120 L 480,60');

  // CPU Load path
  timeseries.value = [
    { time: '10:00', timestamp: '2026-11-06T10:00:00Z', watts: 8.8, cpu_watts: 6.1, ram_watts: 2.7, cpu_load_pct: 5.0, carbon_gco2: 0.45, water_cl: 1.32 },
    { time: '10:01', timestamp: '2026-11-06T10:01:00Z', watts: 10.2, cpu_watts: 7.1, ram_watts: 3.1, cpu_load_pct: 10.0, carbon_gco2: 0.53, water_cl: 1.53 },
  ];
  assert.ok(dynamicCpuLoadSvgPath.value.startsWith('M 40,'));
  assert.ok(dynamicCpuLoadSvgPath.value.includes('L 480,'));
});

test('useLiveStreams filters and classifies threats accurately', () => {
  const { ingressStream, probeEventsCount, exploitEventsCount, cleanEventsCount, filteredIngressStream, streamFilter } = useLiveStreams();

  ingressStream.value = [
    { id: '1', client_ip: '1.1.1.1', method: 'GET', target: '/wp-login.php', category: 'SONDE_WP', decision: 'BLOCK', status_code: 403, timestamp: '10:00' },
    { id: '2', client_ip: '2.2.2.2', method: 'GET', target: '/test', category: 'SCANNER_NIKTO', decision: 'BLOCK', status_code: 403, timestamp: '10:01' },
    { id: '3', client_ip: '3.3.3.3', method: 'POST', target: '/login', threat_type: 'SQLI', decision: 'BLOCK', status_code: 403, timestamp: '10:02' },
    { id: '4', client_ip: '4.4.4.4', method: 'GET', target: '/api/v1/health', decision: 'ALLOW', status_code: 200, timestamp: '10:03' },
  ];

  assert.equal(probeEventsCount.value, 2);
  assert.equal(exploitEventsCount.value, 1);
  assert.equal(cleanEventsCount.value, 1);

  streamFilter.value = 'probes';
  assert.equal(filteredIngressStream.value.length, 2);

  streamFilter.value = 'exploits';
  assert.equal(filteredIngressStream.value.length, 1);

  streamFilter.value = 'clean';
  assert.equal(filteredIngressStream.value.length, 1);
});

test('useCveFeed handles activeDefenses and catalog fallbacks', () => {
  const { cves, catalogCves, activeDefenses } = useCveFeed();

  cves.value = [
    { id: 'CVE-1', name: 'Test 1', component: 'php', severity: 'CRITICAL', cvss: 9.8, description: 'desc', status: 'active', is_active_defense: true },
    { id: 'CVE-2', name: 'Test 2', component: 'c2', severity: 'HIGH', cvss: 8.5, description: 'desc', status: 'active', is_active_defense: false, blocked_by_aegis: true } as any,
    { id: 'CVE-3', name: 'Test 3', component: 'misc', severity: 'MEDIUM', cvss: 5.0, description: 'desc', status: 'info', is_active_defense: false },
  ];

  assert.equal(activeDefenses.value.length, 2);
});

test('authApi handles fetchAuthStatus and logout gracefully in test environment', async () => {
  const { fetchAuthStatus, triggerLogout } = await import('../src/services/api/authApi');
  
  const status = await fetchAuthStatus();
  assert.equal(status.authenticated, false);

  const logoutRes = await triggerLogout();
  assert.equal(typeof logoutRes.success, 'boolean');
  assert.ok(logoutRes.redirectUrl.includes('/demo'));
});

test('useTelemetry in isDemo mode loads rich realistic sandbox dataset', async () => {
  const { summary, timeseries, workloads, nodes, fetchEnergyTelemetry } = useTelemetry({ isDemo: true });
  await fetchEnergyTelemetry();

  assert.ok(summary.value.instant_watts > 0);
  assert.ok(timeseries.value.length >= 12);
  assert.ok(workloads.value.length >= 3);
  assert.ok(nodes.value.length >= 1);
});

test('useCveFeed in isDemo mode loads populated CVE catalog', async () => {
  const { catalogCves, exposedCves, activeRulesCount, fetchCveFeed } = useCveFeed({ isDemo: true });
  await fetchCveFeed();

  assert.ok(catalogCves.value.length >= 5);
  assert.ok(exposedCves.value.length >= 1);
  assert.ok(activeRulesCount.value >= 6);
});

test('useLiveStreams in isDemo mode loads populated sandbox streams', async () => {
  const { ingressStream, egressStream, totalIngress24h, isLoading, fetchLiveStreams } = useLiveStreams({ isDemo: true });
  await fetchLiveStreams();

  assert.equal(isLoading.value, false);
  assert.ok(ingressStream.value.length > 0);
  assert.ok(egressStream.value.length > 0);
  assert.ok(totalIngress24h.value > 1000);
});

test('useSandboxReplay provides PHP2Shell comparative dataset and protection mode toggle', async () => {
  const { useSandboxReplay } = await import('../src/composables/useSandboxReplay');
  const {
    php2ShellDataset,
    php2ShellReplay,
    sandboxProtectionEnabled,
    metrics,
    setSandboxProtectionMode,
  } = useSandboxReplay();

  assert.equal(php2ShellDataset.withShield.http403Blocked, 602);
  assert.equal(php2ShellDataset.withShield.raplAvgWatts, 5.81);
  assert.equal(php2ShellDataset.withoutShield.http200Compromised, 126);
  assert.equal(php2ShellDataset.withoutShield.raplAvgWatts, 24.14);
  assert.equal(php2ShellReplay.value.history.length, 15);

  // Test toggling Shield OFF (compromised mode)
  setSandboxProtectionMode(false);
  assert.equal(sandboxProtectionEnabled.value, false);
  assert.equal(metrics.value.green.instant_power_watts, 24.14);
  assert.equal(metrics.value.traffic.compromised_bypass_total, 126);

  // Restore Shield ON
  setSandboxProtectionMode(true);
  assert.equal(sandboxProtectionEnabled.value, true);
  assert.equal(metrics.value.green.instant_power_watts, 8.84);
  assert.equal(metrics.value.traffic.compromised_bypass_total, 0);
});

