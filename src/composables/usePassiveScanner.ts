import { ref } from 'vue';
import { auditApi, type AuditReport, type DnsChallengeResponse } from '../services/api/auditApi';

export function usePassiveScanner(initialDomain = '') {
  const scanDomain = ref(initialDomain || 'localhost');
  const isScanning = ref(false);
  const auditResult = ref<AuditReport | null>(null);
  const verifyEmail = ref('');
  const verifyCompany = ref('');
  const dnsChallenge = ref<DnsChallengeResponse | null>(null);
  const contractAccepted = ref(false);
  const isVerifyingDns = ref(false);
  const deepFindings = ref<any[]>([]);
  const contractSha256 = ref('');
  const scanError = ref('');

  async function fetchLatestAudit(domain?: string) {
    const res = await auditApi.getLatestAudit(domain || scanDomain.value);
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
      report_type: 'AEGIS_CERTIFIED_SECURITY_AND_ECOINDEX_AUDIT',
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
