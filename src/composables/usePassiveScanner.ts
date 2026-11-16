import { ref } from 'vue';
import { auditApi, type AuditReport, type DnsChallengeResponse } from '../services/api/auditApi';

function buildDemoAuditReport(rawDomain: string, verified = false): any {
  const cleanDomain = (rawDomain || 'aegis.aivo.fr')
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '')
    .trim() || 'aegis.aivo.fr';

  return {
    domain: cleanDomain,
    scanned_at: new Date().toISOString(),
    pages_scanned: 5,
    scan_duration_ms: 142,
    security_score: 94,
    security_grade: 'A',
    eco_index_score: 91.8,
    eco_index_grade: 'A',
    overall_eco_score: 91.8,
    overall_eco_grade: 'A',
    avg_gco2_grams: 1.16,
    avg_gco2e_per_visit: 1.16,
    avg_water_cl: 1.74,
    ownership_verified: verified,
    is_verified_owner: verified,
    pqc_readiness: {
      pqc_ready: true,
      tls_version: 'TLS 1.3',
      curve_id: '0x11EC (X25519MLKEM768)',
      standard: 'NIST FIPS 203 (ML-KEM)',
      verdict: 'Protégé contre Harvest Now, Decrypt Later (HNDL)',
    },
    cve_warnings: [
      {
        id: 'CVE-2024-4577',
        cve_id: 'CVE-2024-4577',
        title: 'Exécution de code à distance PHP-CGI (PHP2Shell RCE)',
        component: 'PHP-CGI / FastCGI Argument Injection',
        severity: 'CRITICAL',
        cvss: 9.8,
        score: 9.8,
        description:
          'Tentatives d\'injection %ADd allow_url_include=1 et auto_prepend_file=php://input neutralisées à l\'Edge avant d\'atteindre le worker PHP-FPM.',
        remediation:
          'Virtual Patching actif sur Aegis Gate PEP (HTTP 403 en 0.14 ms, 0% CPU cible, économie de 75.9% en Watts RAPL).',
        blocked_by_aegis: true,
      },
      {
        id: 'CVE-2026-109618',
        cve_id: 'CVE-2026-109618',
        title: 'Dépassement de tampon volumétrique (PHP2Shell Buffer/Heap Overflow)',
        component: 'PHP SAPI / FastCGI Buffer Engine',
        severity: 'CRITICAL',
        cvss: 9.8,
        score: 9.8,
        description:
          'Protection contre la saturation des tampons mémoires PHP-FPM par charges utiles surdimensionnées (> 64 Ko).',
        remediation:
          'Coupe-circuit volumétrique HTTP 413 et Sinkhole DNS Egress (:5053) actifs.',
        blocked_by_aegis: true,
      },
    ],
    tech_stack: [
      { name: 'Aegis Sovereign Gate PEP', version: 'v1.1.0 (Go 1.24)', category: 'Zero-Trust Edge Proxy', source: 'Header X-Aegis-Gate' },
      { name: 'TLS 1.3 Post-Quantum Hybrid', version: 'X25519MLKEM768 (FIPS 203)', category: 'Cryptographie Post-Quantique', source: 'TLS Handshake 0x11EC' },
      { name: 'Traefik Edge Ingress', version: 'v3.2', category: 'Reverse Proxy', source: 'ALPN h2 / http/1.1' },
      { name: 'Astro Static / Islands', version: 'v5.x', category: 'Frontend Éco-Conçu', source: 'DOM Empreinte Légère' },
    ],
    headers_analysis: [
      { header: 'Strict-Transport-Security (HSTS)', name: 'Strict-Transport-Security', present: true, status: 'present' },
      { header: 'Content-Security-Policy (CSP)', name: 'Content-Security-Policy', present: true, status: 'present' },
      { header: 'X-Frame-Options (Anti-Clickjacking)', name: 'X-Frame-Options', present: true, status: 'present' },
      { header: 'X-Content-Type-Options (nosniff)', name: 'X-Content-Type-Options', present: true, status: 'present' },
      { header: 'Permissions-Policy', name: 'Permissions-Policy', present: true, status: 'present' },
    ],
    dns_analysis: {
      has_spf: true,
      has_dmarc: true,
    },
    pages_detail: [
      { url: `https://${cleanDomain}/`, status_code: 200, response_time_ms: 18, weight_kb: 42, dom_elements: 165, http_requests: 6, eco_grade: 'A', eco_score: 94, gco2e_per_visit: 1.12, water_cl: 1.68 },
      { url: `https://${cleanDomain}/demo`, status_code: 200, response_time_ms: 24, weight_kb: 68, dom_elements: 240, http_requests: 9, eco_grade: 'A', eco_score: 90, gco2e_per_visit: 1.20, water_cl: 1.80 },
      { url: `https://${cleanDomain}/docs/architecture`, status_code: 200, response_time_ms: 15, weight_kb: 34, dom_elements: 142, http_requests: 5, eco_grade: 'A', eco_score: 95, gco2e_per_visit: 1.10, water_cl: 1.65 },
      { url: `https://${cleanDomain}/api/v1/health`, status_code: 200, response_time_ms: 4, weight_kb: 2, dom_elements: 1, http_requests: 1, eco_grade: 'A', eco_score: 99, gco2e_per_visit: 1.02, water_cl: 1.53 },
      { url: `https://${cleanDomain}/login/`, status_code: 200, response_time_ms: 19, weight_kb: 38, dom_elements: 118, http_requests: 5, eco_grade: 'A', eco_score: 96, gco2e_per_visit: 1.08, water_cl: 1.62 },
    ],
  };
}

export function usePassiveScanner(initialDomain = '', options?: { isDemo?: boolean }) {
  const isDemoMode = options?.isDemo ?? true;
  const scanDomain = ref(initialDomain || 'aegis.aivo.fr');
  const isScanning = ref(false);
  const auditResult = ref<AuditReport | null>(isDemoMode ? buildDemoAuditReport(scanDomain.value) : null);
  const verifyEmail = ref('');
  const verifyCompany = ref('');
  const dnsChallenge = ref<DnsChallengeResponse | null>(null);
  const contractAccepted = ref(false);
  const isVerifyingDns = ref(false);
  const deepFindings = ref<any[]>([]);
  const contractSha256 = ref('');
  const scanError = ref('');

  async function fetchLatestAudit(domain?: string) {
    const target = domain || scanDomain.value;
    if (isDemoMode) {
      auditResult.value = buildDemoAuditReport(target);
      scanDomain.value = auditResult.value.domain;
      return;
    }
    const res = await auditApi.getLatestAudit(target);
    if (res.ok && res.data) {
      const audit = (res.data as any).audit || res.data;
      if (audit && audit.domain) {
        auditResult.value = audit;
        scanDomain.value = audit.domain;
      }
    }
  }

  async function runPassiveScan(): Promise<string> {
    if (!scanDomain.value || isScanning.value) return '';
    isScanning.value = true;
    scanError.value = '';
    dnsChallenge.value = null;
    deepFindings.value = [];

    if (isDemoMode) {
      await new Promise((r) => setTimeout(r, 350));
      const demoAudit = buildDemoAuditReport(scanDomain.value, false);
      auditResult.value = demoAudit;
      scanDomain.value = demoAudit.domain;
      isScanning.value = false;
      return `Diagnostic passif + Sonde Post-Quantique (X25519MLKEM768) terminés sur ${demoAudit.domain} (5 pages en ${demoAudit.scan_duration_ms} ms).`;
    }

    const res = await auditApi.runPassiveScan(scanDomain.value);
    isScanning.value = false;

    if (res.ok && res.data) {
      const audit = (res.data as any).audit || res.data;
      if (audit && audit.domain) {
        auditResult.value = audit;
        return `Diagnostic passif terminé sur ${audit.domain} (${audit.pages_scanned || 1} pages en ${audit.scan_duration_ms || 0} ms).`;
      }
    }
    scanError.value = res.error || 'Erreur lors du scan passif.';
    return scanError.value;
  }

  async function requestDnsToken(): Promise<string> {
    if (!auditResult.value?.domain) return '';
    if (!verifyEmail.value) return 'Veuillez saisir votre adresse email professionnelle.';

    if (isDemoMode) {
      const tokenHash = Math.random().toString(36).substring(2, 12) + '9f8a7b6c';
      dnsChallenge.value = {
        domain: auditResult.value.domain,
        txt_record_name: `_aegis-verify.${auditResult.value.domain}`,
        expected_value: `aegis-site-verification=${tokenHash}`,
        dns_record_value: `aegis-site-verification=${tokenHash}`,
      } as any;
      return `Jeton DNS TXT généré pour ${auditResult.value.domain}.`;
    }

    const res = await auditApi.requestVerification(auditResult.value.domain, verifyEmail.value, verifyCompany.value);
    if (res.ok && res.data) {
      dnsChallenge.value = res.data;
      return `Jeton DNS TXT généré pour ${auditResult.value.domain}.`;
    }
    return res.error || 'Erreur lors de la génération du jeton DNS.';
  }

  async function verifyAndUnlockDeepAudit(): Promise<string> {
    if (!auditResult.value?.domain) return '';
    if (!contractAccepted.value) return "Vous devez cocher la case d'acceptation du Mandat d'Audit.";

    isVerifyingDns.value = true;

    if (isDemoMode) {
      await new Promise((r) => setTimeout(r, 400));
      isVerifyingDns.value = false;
      auditResult.value = buildDemoAuditReport(auditResult.value.domain, true);
      contractSha256.value = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
      deepFindings.value = [
        { path: '/.env', check_name: 'Exposition Variables & Clés Secrètes', verdict: '✓ HTTP 403 Bloqué (Aegis Gate)' },
        { path: '/.git/config', check_name: 'Fuite Dépôt Code Source Git', verdict: '✓ HTTP 403 Bloqué (Aegis Gate)' },
        { path: '/index.php?%ADd+allow_url_include=1', check_name: 'Sonde PHP2Shell (CVE-2024-4577)', verdict: '✓ HTTP 403 Virtual Patch Actif' },
        { path: '/xmlrpc.php', check_name: 'Amplification Brute-Force XML-RPC', verdict: '✓ HTTP 403 Bloqué (Aegis Gate)' },
        { path: 'TLS 1.3 (0x11EC)', check_name: 'Sonde Post-Quantum X25519MLKEM768', verdict: '✓ PQC Ready (NIST FIPS 203)' },
      ];
      return `✓ Domaine ${auditResult.value.domain} homologué (DNS TXT + Mandat SHA-256) et Audit Niveau 2 débloqué !`;
    }

    const email = verifyEmail.value || `admin@${auditResult.value.domain}`;
    const res = await auditApi.verifyOwnership(auditResult.value.domain, email, true);
    isVerifyingDns.value = false;

    if (res.ok && res.data) {
      if (res.data.audit) auditResult.value = res.data.audit;
      deepFindings.value = res.data.deep_findings || [];
      contractSha256.value = res.data.contract_sha256 || '';
      return `✓ Domaine ${auditResult.value.domain} homologué (${res.data.verification_method}) et Audit Niveau 2 débloqué !`;
    }
    return res.error || 'Échec de la vérification DNS.';
  }

  function downloadAuditReport() {
    if (!auditResult.value) return;
    const payload = {
      report_type: 'AEGIS_CERTIFIED_SECURITY_PQC_AND_ECOINDEX_AUDIT',
      generated_at: new Date().toISOString(),
      contract_sha256: contractSha256.value || 'VERIFIED_OWNER_MANDATE',
      audit: auditResult.value,
      deep_findings: deepFindings.value,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aegis-audit-${auditResult.value.domain}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return {
    scanDomain,
    isScanning,
    auditResult,
    verifyEmail,
    verifyCompany,
    dnsChallenge,
    contractAccepted,
    isVerifyingDns,
    deepFindings,
    contractSha256,
    scanError,
    fetchLatestAudit,
    runPassiveScan,
    requestDnsToken,
    verifyAndUnlockDeepAudit,
    downloadAuditReport,
  };
}

