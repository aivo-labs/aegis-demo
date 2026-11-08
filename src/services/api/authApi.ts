/**
 * Service Client Pure BFF pour l'authentification sécurisée.
 * Ne manipule JAMAIS d'access_token en JavaScript (Cookie HttpOnly géré par le BFF).
 */

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  tenant_id: string;
  expires_at?: string;
}

export interface AuthStatusResponse {
  authenticated: boolean;
  user?: AuthUser;
  message?: string;
}

export async function fetchAuthStatus(): Promise<AuthStatusResponse> {
  try {
    const res = await fetch('/api/auth/me', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include', // Important pour transmettre le cookie HttpOnly __Host-aegis_session
    });

    if (res.ok) {
      const data = await res.json();
      return {
        authenticated: true,
        user: data.user,
      };
    }

    return {
      authenticated: false,
    };
  } catch (err) {
    return {
      authenticated: false,
      message: 'Erreur de communication avec le BFF',
    };
  }
}

export async function triggerLogout(): Promise<{ success: boolean; redirectUrl: string }> {
  const fallbackUrl = '/login/?logout=true';
  try {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('aegis_auth');
        localStorage.removeItem('aegis_cached_summary');
        sessionStorage.clear();
      } catch {}
    }
    const res = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      const logoutUrl = data && data.logout_url ? data.logout_url : fallbackUrl;
      return { success: true, redirectUrl: logoutUrl };
    }
    return { success: false, redirectUrl: fallbackUrl };
  } catch {
    return { success: false, redirectUrl: fallbackUrl };
  }
}
