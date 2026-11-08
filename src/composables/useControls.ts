import { ref } from 'vue';
import { controlsApi, type BannedIp, type RetentionPolicy } from '../services/api/controlsApi';

export function useControls() {
  const bannedIps = ref<BannedIp[]>([]);
  const newBanIp = ref('');
  const newBanReason = ref('');
  const maxPayloadBytes = ref(32768);
  const retention = ref<RetentionPolicy>({
    hot_window_days: 30,
    anssi_forensic_days: 180,
    rgpd_clean_ip_days: 7,
  });

  async function fetchControls() {
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
    const res = await controlsApi.addBan(ip, reason || 'Bannissement manuel SOC');
    if (res.ok) {
      await fetchControls();
      return res.data?.message || `IP ${ip} bannie avec succès.`;
    }
    return res.error || 'Erreur lors du bannissement.';
  }

  async function removeBan(ip: string): Promise<string> {
    const res = await controlsApi.removeBan(ip);
    if (res.ok) {
      await fetchControls();
      return res.data?.message || `IP ${ip} débloquée.`;
    }
    return res.error || 'Erreur lors du déblocage.';
  }

  async function updatePayloadLimit(bytes: number): Promise<string> {
    const res = await controlsApi.updatePayloadLimit(bytes);
    if (res.ok) {
      maxPayloadBytes.value = bytes;
      return res.data?.message || `Seuil de charge utile mis à jour : ${bytes} octets.`;
    }
    return res.error || 'Erreur lors de la mise à jour.';
  }

  async function saveRetention(): Promise<string> {
    const res = await controlsApi.saveRetention(retention.value);
    if (res.ok) {
      return res.data?.message || 'Politique de rétention enregistrée.';
    }
    return res.error || 'Erreur lors de la sauvegarde.';
  }

  async function purgeCleanLogs(): Promise<string> {
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
