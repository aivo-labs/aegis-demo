(function () {
  'use strict';
  
  const currentScript = document.currentScript || document.querySelector('script[src*="aegis-badge.js"]');
  const tenantId = currentScript ? currentScript.getAttribute('data-tenant') || '00000000-0000-0000-0000-000000000001' : 'default';
  
  const badgeSvg = `
    <div id="aegis-rse-badge" style="display:inline-flex; align-items:center; gap:8px; background:#0f172a; border:1px solid #1e293b; border-radius:9999px; padding:4px 12px 4px 6px; font-family:ui-sans-serif, system-ui, sans-serif; font-size:12px; color:#f8fafc; text-decoration:none; box-shadow:0 4px 12px rgba(0,0,0,0.3); transition:all 0.2s ease;" title="Certifié Aegis Green - Sobriété Numérique RGESN 2024 & Norme VS (EFRAG)">
      <div style="width:24px; height:24px; border-radius:50%; background:linear-gradient(135deg, #10b981, #06b6d4); display:flex; align-items:center; justify-content:center; font-weight:800; color:#022c22; font-size:11px;">
        A
      </div>
      <div style="display:flex; flex-direction:column; line-height:1.2;">
        <span style="font-weight:700; color:#34d399; font-size:11px;">Site Éco-Conçu</span>
        <span style="font-size:9px; color:#94a3b8; font-family:monospace;">EcoIndex A • Aegis Green</span>
      </div>
    </div>
  `;

  if (document.body) {
    const container = document.createElement('div');
    container.innerHTML = badgeSvg.trim();
    if (currentScript && currentScript.parentNode) {
      currentScript.parentNode.insertBefore(container.firstElementChild, currentScript);
    } else {
      document.body.appendChild(container.firstElementChild);
    }
  }
})();
