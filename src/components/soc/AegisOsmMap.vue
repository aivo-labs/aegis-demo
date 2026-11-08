<template>
  <div class="relative w-full h-full min-h-[220px] rounded-xl overflow-hidden border border-slate-800/90 bg-[#070b14] flex flex-col">
    <!-- Map Header / Status Bar -->
    <div class="px-3 py-2 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between text-[11px] font-mono z-10">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span class="text-slate-300 font-semibold">OpenStreetMap Live GeoIP Defense Map</span>
      </div>
      <div class="flex items-center gap-3 text-[10px]">
        <span class="flex items-center gap-1 text-emerald-400">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Paris HQ / VPS
        </span>
        <span class="flex items-center gap-1 text-rose-400">
          <span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span> C2 Bloqué
        </span>
        <span class="flex items-center gap-1 text-amber-400">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Quarantaine
        </span>
      </div>
    </div>

    <!-- Leaflet Map Container -->
    <div ref="mapContainer" class="flex-1 w-full min-h-[190px] relative">
      <!-- Loading state until leaflet is mounted on client -->
      <div v-if="!isMapLoaded" class="absolute inset-0 flex items-center justify-center bg-slate-950/80 text-xs text-slate-400 font-mono">
        <span class="animate-pulse">Chargement de la cartographie OpenStreetMap...</span>
      </div>
    </div>

    <!-- Map Overlay Stats / Legend -->
    <div class="px-3 py-1.5 bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
      <span>Projection souveraine Leaflet / OpenStreetMap (Zero-Log)</span>
      <span class="text-cyan-400 font-bold">{{ markersCount }} nœuds de flux tracés</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import 'leaflet/dist/leaflet.css';

const props = defineProps({
  events: {
    type: Array,
    default: () => []
  }
});

const mapContainer = ref(null);
const isMapLoaded = ref(false);
const markersCount = ref(0);
let mapInstance = null;
let leafletModule = null;
let markersLayer = null;

// Position centrale du VPS / QG de défense (Paris)
const HQ_COORDS = [48.8566, 2.3522];

async function initMap() {
  if (typeof window === 'undefined' || !mapContainer.value) return;

  try {
    leafletModule = await import('leaflet');
    const L = leafletModule.default || leafletModule;

    // Création de la carte centrée sur l'Europe / Atlantique
    mapInstance = L.map(mapContainer.value, {
      center: [42.0, 10.0],
      zoom: 2,
      minZoom: 1,
      maxZoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    // Contrôle de zoom discret
    L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);

    // Tuiles OpenStreetMap sombres (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(mapInstance);

    markersLayer = L.layerGroup().addTo(mapInstance);

    // Rendu des nœuds et des lignes
    renderNodes(L);
    isMapLoaded.value = true;
  } catch (err) {
    console.error('Erreur chargement Leaflet:', err);
  }
}

function renderNodes(L) {
  if (!mapInstance || !markersLayer || !L) return;
  markersLayer.clearLayers();

  // 1. Marqueur Hub Défense (Paris HQ)
  const hqIcon = L.divIcon({
    className: 'custom-hq-marker',
    html: `
      <div style="position: relative; width: 22px; height: 22px;">
        <div style="position: absolute; inset: 0; border-radius: 9999px; background-color: #10b981; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: relative; width: 100%; height: 100%; border-radius: 9999px; background-color: #10b981; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #000; font-weight: bold;">🛡️</div>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });

  const hqMarker = L.marker(HQ_COORDS, { icon: hqIcon }).addTo(markersLayer);
  hqMarker.bindPopup(`
    <div style="font-family: monospace; font-size: 11px; color: #0f172a; padding: 4px;">
      <strong style="color: #059669;">🛡️ Hub Défense Aegis (Paris HQ / VPS)</strong><br/>
      <span>Protection Edge active : Gate + Egress</span><br/>
      <small style="color: #64748b;">Statut : Zero-Trust Opérationnel</small>
    </div>
  `);

  // 2. Marqueurs des flux réels uniquement (Zéro donnée fictive)
  const nodes = Array.isArray(props.events) ? props.events : [];
  markersCount.value = nodes.length;

  nodes.forEach((node, idx) => {
    const baseLat = node.geo?.lat ?? node.lat;
    const baseLon = node.geo?.lon ?? node.lon;
    if (!baseLat || !baseLon) return;
    // Léger décalage angulaire si plusieurs attaques proviennent de la même ville pour éviter la superposition parfaite
    const lat = baseLat + ((idx % 5) - 2) * 0.35;
    const lon = baseLon + ((idx % 7) - 3) * 0.45;

    const action = String(node.action ?? 'ALLOW').toUpperCase();
    const isBlock = action.includes('BLOCK');
    const isQuar = action.includes('QUARANTINE');

    const color = isBlock ? '#f43f5e' : isQuar ? '#f59e0b' : '#06b6d4';
    const label = isBlock ? '🚫' : isQuar ? '⚠️' : '✓';

    const markerIcon = L.divIcon({
      className: 'custom-threat-marker',
      html: `
        <div style="position: relative; width: 16px; height: 16px;">
          ${isBlock ? `<div style="position: absolute; inset: -4px; border-radius: 9999px; background-color: ${color}; opacity: 0.3; animation: pulse 2s infinite;"></div>` : ''}
          <div style="position: relative; width: 100%; height: 100%; border-radius: 9999px; background-color: ${color}; border: 1.5px solid #ffffff; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #ffffff; font-weight: bold;">
            ${label}
          </div>
        </div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    const m = L.marker([lat, lon], { icon: markerIcon }).addTo(markersLayer);
    
    // Info-bulle détaillée
    const popupHtml = `
      <div style="font-family: monospace; font-size: 11px; color: #0f172a; min-width: 170px;">
        <div style="font-weight: bold; color: ${color}; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 4px;">
          ${isBlock ? '🔴 REQUÊTE BLOQUÉE' : isQuar ? '🟠 EN QUARANTAINE' : '🟢 FLUX AUTORISÉ'}
        </div>
        <div><strong>IP :</strong> ${node.client_ip || node.ip}</div>
        <div><strong>Lieu :</strong> ${node.geo?.city || node.city || 'Inconnu'}, ${node.geo?.country || node.country || ''}</div>
        <div><strong>Cible :</strong> ${node.target || node.fqdn || '/'}</div>
        <div><strong>Type :</strong> ${node.threat_type || node.threat || 'Trafic'}</div>
        <div style="margin-top: 4px; font-size: 10px; color: #64748b;">Action : <strong>${action}</strong></div>
      </div>
    `;
    m.bindPopup(popupHtml);

    // Ligne géodésique / tracé vers le Hub Paris
    const polyline = L.polyline([[lat, lon], HQ_COORDS], {
      color: color,
      weight: 1.2,
      opacity: 0.6,
      dashArray: isBlock ? '4, 4' : '2, 6'
    }).addTo(markersLayer);
  });
}

watch(() => props.events, () => {
  if (leafletModule) {
    const L = leafletModule.default || leafletModule;
    renderNodes(L);
  }
}, { deep: true });

onMounted(() => {
  initMap();
});

onUnmounted(() => {
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }
});
</script>

<style>
/* Animation keyframes for custom leaflet icons */
@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}
@keyframes pulse {
  50% {
    opacity: .5;
  }
}
</style>
