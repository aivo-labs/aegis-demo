import { ref } from 'vue';
import { fetchAuthStatus, triggerLogout, type AuthUser } from '../services/api/authApi';

const isAuthenticated = ref<boolean | null>(null);
const currentUser = ref<AuthUser | null>(null);
const isChecking = ref(false);

export function useAuth() {
  async function checkSession(): Promise<boolean> {
    isChecking.value = true;
    try {
      const res = await fetchAuthStatus();
      if (res.authenticated && res.user) {
        isAuthenticated.value = true;
        currentUser.value = res.user;
        return true;
      }

      // Fallback gracieux en mode démo / dev standalone (si exécuté sans le conteneur BFF)
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('aegis_auth');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.authenticated && parsed.user) {
              isAuthenticated.value = true;
              currentUser.value = parsed.user;
              return true;
            }
          }
        } catch {}
      }

      isAuthenticated.value = false;
      currentUser.value = null;
      return false;
    } finally {
      isChecking.value = false;
    }
  }

  async function logout(): Promise<void> {
    isAuthenticated.value = false;
    currentUser.value = null;
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('aegis_auth');
        localStorage.removeItem('aegis_cached_summary');
      } catch {}
    }
    const { redirectUrl } = await triggerLogout();
    if (typeof window !== 'undefined') {
      window.location.href = redirectUrl || '/login/?logout=true';
    }
  }

  function startLoginFlow(): void {
    if (typeof window !== 'undefined') {
      window.location.href = '/api/auth/login';
    }
  }

  return {
    isAuthenticated,
    currentUser,
    isChecking,
    checkSession,
    logout,
    startLoginFlow,
  };
}
