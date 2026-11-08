/**
 * Connecteur Client vers l'API du Centre de Contrôle AIVO.
 * Assemble l'intégralité du dossier prospect :
 *  - Coordonnées du contact & besoin exprimé
 *  - Rapport d'audit passif complet (scores, 5 pages EcoIndex, stack détectée, CVE exposées, headers/DNS)
 *
 * Aucune donnée de prospect n'est stockée dans le backend d'Aegis :
 * tout le payload JSON est structuré pour être transmis directement à l'API AIVO.
 */

export const AIVO_CONTROL_API_ENDPOINT =
  (typeof import.meta !== 'undefined' && import.meta.env && ((import.meta.env as any).PUBLIC_AIVO_CONTROL_API_URL || (import.meta.env as any).AEGIS_LEADS_WEBHOOK_URL)) ||
  '';

export interface LeadContact {
  name?: string;
  email?: string;
  company?: string;
  phone?: string;
  domain?: string;
  infrastructure?: string;
  message?: string;
}

export interface BuildLeadPayloadOptions {
  source?: string;
  offerType?: string;
  contact?: LeadContact;
  contextTrigger?: string;
  auditReport?: any;
}

/**
 * Construit le payload normalisé complet (Prospect + Snapshot intégral de l'Audit)
 */
export function buildAivoLeadPayload({
  source = 'aegis_onboarding_assistance',
  offerType = 'ACCOMPAGNEMENT_SUR_MESURE',
  contact = {},
  contextTrigger = '',
  auditReport = null,
}: BuildLeadPayloadOptions = {}) {
  return {
    schema_version: '1.0',
    product: 'AEGIS_CYBER_GREEN',
    submitted_at_utc: new Date().toISOString(),
    source,
    offer_type: offerType,
    context_trigger: contextTrigger,
    prospect: {
      full_name: contact.name || '',
      email: contact.email || '',
      company: contact.company || '',
      phone: contact.phone || '',
      domain: contact.domain || (auditReport ? auditReport.domain : ''),
      infrastructure: contact.infrastructure || '',
      message: contact.message || '',
    },
    full_audit_report: auditReport
      ? {
          audit_id: auditReport.audit_id || null,
          domain: auditReport.domain,
          scanned_at: auditReport.scanned_at,
          pages_scanned: auditReport.pages_scanned,
          security_score: auditReport.security_score,
          security_grade: auditReport.security_grade,
          eco_index_score: auditReport.eco_index_score ?? auditReport.overall_eco_score,
          eco_index_grade: auditReport.eco_index_grade ?? auditReport.overall_eco_grade,
          avg_gco2_grams: auditReport.avg_gco2_grams ?? auditReport.avg_gco2e_per_visit,
          ownership_verified: Boolean(auditReport.ownership_verified || auditReport.is_verified_owner),
          detected_tech: auditReport.detected_tech || auditReport.tech_stack || [],
          cve_warnings: auditReport.cve_warnings || [],
          security_headers: auditReport.security_headers || {},
          headers_analysis: auditReport.headers_analysis || [],
          dns_checks: auditReport.dns_checks || {},
          dns_analysis: auditReport.dns_analysis || {},
          pages_detail: auditReport.pages || auditReport.pages_detail || [],
          deep_probes: auditReport.deep_probes || [],
        }
      : null,
  };
}

/**
 * Envoie le dossier complet vers l'API du Centre de Contrôle AIVO.
 */
export async function sendLeadToAivoControlCenter(options: BuildLeadPayloadOptions = {}) {
  const payload = buildAivoLeadPayload(options);

  if (typeof window !== 'undefined') {
    (window as any).__lastAivoLeadPayload = payload;
  }

  // Si aucun webhook n'est configuré (installation open-source par défaut), on n'émet aucun appel externe
  if (!AIVO_CONTROL_API_ENDPOINT) {
    return {
      ok: true,
      delivered_remotely: false,
      reason: 'unconfigured_open_source_mode',
      endpoint: '',
      payload,
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(AIVO_CONTROL_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Aegis-Client': 'aegis-web-v5.4',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    return {
      ok: true,
      delivered_remotely: response.ok,
      endpoint: AIVO_CONTROL_API_ENDPOINT,
      payload,
    };
  } catch (err) {
    return {
      ok: true,
      delivered_remotely: false,
      endpoint: AIVO_CONTROL_API_ENDPOINT,
      payload,
    };
  }
}
