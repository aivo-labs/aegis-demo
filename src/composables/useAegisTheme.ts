import { ref, onMounted, onUnmounted } from 'vue';

export function useAegisTheme() {
  const isLightMode = ref(false);

  const initTheme = () => {
    if (typeof document !== 'undefined') {
      isLightMode.value = document.documentElement.classList.contains('theme-light');
    }
  };

  const toggleTheme = () => {
    if (typeof document === 'undefined') return;
    const isLight = document.documentElement.classList.toggle('theme-light');
    try {
      localStorage.setItem('aegis_theme', isLight ? 'light' : 'dark');
    } catch (e) {}
    isLightMode.value = isLight;
    window.dispatchEvent(new CustomEvent('aegis-theme-changed', { detail: { isLight } }));
  };

  const handleThemeChanged = (e: any) => {
    if (e?.detail?.isLight !== undefined) {
      isLightMode.value = e.detail.isLight;
    } else if (typeof document !== 'undefined') {
      isLightMode.value = document.documentElement.classList.contains('theme-light');
    }
  };

  onMounted(() => {
    initTheme();
    if (typeof window !== 'undefined') {
      window.addEventListener('aegis-theme-changed', handleThemeChanged);
    }
  });

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('aegis-theme-changed', handleThemeChanged);
    }
  });

  return {
    isLightMode,
    toggleTheme,
  };
}
