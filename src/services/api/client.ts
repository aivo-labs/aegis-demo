/**
 * Client HTTP pour l'API du Core Control Plane Aegis.
 * Gère les en-têtes standard, le décodage JSON et les timeouts.
 */

export interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs = 6000
): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(endpoint, {
      credentials: 'include',
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const isJson = (res.headers.get('content-type') || '').includes('application/json');
    const data = isJson ? await res.json() : undefined;

    return {
      ok: res.ok,
      status: res.status,
      data,
      error: !res.ok ? (data?.message || `HTTP ${res.status}`) : undefined,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    return {
      ok: false,
      status: 0,
      error: err.name === 'AbortError' ? 'Requête expirée (timeout)' : (err.message || 'Erreur réseau'),
    };
  }
}
