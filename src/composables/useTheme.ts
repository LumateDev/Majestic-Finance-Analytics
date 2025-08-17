import { ref, onMounted, watch } from 'vue';

type Theme = 'light' | 'dark';

const currentTheme = ref<Theme>('dark');

export function useTheme() {
  const applyTheme = (theme: Theme) => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light';
  };

  onMounted(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;

    if (savedTheme) {
      currentTheme.value = savedTheme;
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      currentTheme.value = prefersDark ? 'dark' : 'light';
    }
  });
  watch(currentTheme, (newTheme) => {
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  }, { immediate: true });

  return {
    currentTheme,
    toggleTheme,
  };
}
