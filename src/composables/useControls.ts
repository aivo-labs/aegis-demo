import { ref } from 'vue';
import { controlsApi, type BannedIp, type RetentionPolicy } from '../services/api/controlsApi';

const demoBannedIps = ref<BannedIp[]>([
  {
    ip: '185.220.101.33',
    reason: 'Exploitation PHP2Shell RCE (CVE-2024-4577 — auto_prepend_file=php://input)',
    banned_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    ip: '91.214.124.88',
    reason: 'Dépassement de tampon PHP2Shell (CVE-2026-109618 — HTTP 413 Buffer Overflow)',
    banned_at: new Date(Date.now() - 3200000).toISOString(),
  },
  {
    ip: '185.220.101.4',
    reason: 'Sonde automatisée WPScan /3.8.22 sur /wp-login.php',
    banned_at: new Date(Date.now() - 5400000).toISOString(),
  },
  {
    ip: '103.151.125.18',
    reason: 'Injection SQL UNION SELECT (sqlmap/1.7.11)',
    banned_at: new Date(Date.now() - 7200000).toISOString(),
  },
]);

export function useControls(options?: { isDemo?: boolean }) {
  const bannedIps = ref<BannedIp[]>([...demoBannedIps.value]);
  const newBanIp = ref('');
  const newBanReason = ref('');
  const maxPayloadBytes = ref(32768);
  const retention = ref<RetentionPolicy>({
    hot_window_days: 30,
    anssi_forensic_days: 180,
    rgpd_clean_ip_days: 7,
  });

  async function fetchControls() {
    if (options?.isDemo) {
      bannedIps.value = [...demoBannedIps.value];
      return;
    }

    const [bansRes, retRes] = await Promise.all([
      controlsApi.getBans(),
      controlsApi.getRetention(),
    ]);

    if (bansRes.ok && bansRes.data) {
      bannedIps.value = bansRes.data.bans || [];
      if (bansRes.data.max_payload_bytes) maxPayloadBytes.value = bansRes.data.max_payload_bytes;
    }
    if (retRes.ok && retRes.data) {
      const pol = (retRes.data as any).retention || retRes.data;
      if (pol.hot_window_days) retention.value.hot_window_days = pol.hot_window_days;
      if (pol.anssi_forensic_days) retention.value.anssi_forensic_days = pol.anssi_forensic_days;
      if (pol.rgpd_clean_ip_days) retention.value.rgpd_clean_ip_days = pol.rgpd_clean_ip_days;
    }
  }

  async function addBan(ip: string, reason: string): Promise<string> {
    if (!ip) return '';
    if (options?.isDemo) {
      const cleanIp = ip.trim();
      const entry: BannedIp = {
        ip: cleanIp,
        reason: reason || 'Bannissement manuel SOC',
        banned_at: new Date().toISOString(),
      };
      demoBannedIps.value = [entry, ...demoBannedIps.value.filter((b) => b.ip !== cleanIp)];
      bannedIps.value = [...demoBannedIps.value];
      return `IP ${cleanIp} bannie à chaud sur Aegis Gate PEP (HTTP 403 immédiat).`;
    }

    const res = await controlsApi.addBan(ip, reason || 'Bannissement manuel SOC');
    if (res.ok) {
      await fetchControls();
      return res.data?.message || `IP ${ip} bannie avec succès.`;
    }
    return res.error || 'Erreur lors du bannissement.';
  }

  async function removeBan(ip: string): Promise<string> {
    if (options?.isDemo) {
      demoBannedIps.value = demoBannedIps.value.filter((b) => b.ip !== ip);
      bannedIps.value = [...demoBannedIps.value];
      return `IP ${ip} retirée de la liste de bannissement Edge.`;
    }

    const res = await controlsApi.removeBan(ip);
    if (res.ok) {
      await fetchControls();
      return res.data?.message || `IP ${ip} débloquée.`;
    }
    return res.error || 'Erreur lors du déblocage.';
  }

  async function updatePayloadLimit(bytes: number): Promise<string> {
    if (options?.isDemo) {
      maxPayloadBytes.value = bytes;
      return `Coupe-circuit volumétrique (Anti-Buffer Overflow CVE-2026-109618) fixé à ${Math.round(bytes / 1024)} Ko (${bytes} octets).`;
    }

    const res = await controlsApi.updatePayloadLimit(bytes);
    if (res.ok) {
      maxPayloadBytes.value = bytes;
      return res.data?.message || `Seuil de charge utile mis à jour : ${bytes} octets.`;
    }
    return res.error || 'Erreur lors de la mise à jour.';
  }

  async function saveRetention(): Promise<string> {
    if (options?.isDemo) {
      return `Politique de rétention enregistrée (${retention.value.hot_window_days}j Hot / ${retention.value.anssi_forensic_days}j ANSSI / ${retention.value.rgpd_clean_ip_days}j RGPD).`;
    }

    const res = await controlsApi.saveRetention(retention.value);
    if (res.ok) {
      return res.data?.message || 'Politique de rétention enregistrée.';
    }
    return res.error || 'Erreur lors de la sauvegarde.';
  }

  async function purgeCleanLogs(): Promise<string> {
    if (options?.isDemo) {
      return 'Purge RGPD effectuée : IPs du trafic légitime (HTTP 200) anonymisées avec succès.';
    }

    const res = await controlsApi.purgeCleanLogs();
    if (res.ok) {
      return res.data?.message || 'Purge des logs conformes terminée.';
    }
    return res.error || 'Erreur lors de la purge.';
  }

  return {
    bannedIps,
    newBanIp,
    newBanReason,
    maxPayloadBytes,
    retention,
    fetchControls,
    addBan,
    removeBan,
    updatePayloadLimit,
    saveRetention,
    purgeCleanLogs,
  };
}

