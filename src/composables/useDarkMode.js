import { ref, onMounted, watch } from 'vue';

export function useDarkMode() {
  const isDark = ref(localStorage.getItem('theme') === 'dark');

  const toggleDarkMode = () => {
    isDark.value = !isDark.value;
    updateTheme();
  };

  const updateTheme = () => {
    const theme = isDark.value ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Also add/remove a class for bootstrap compatibility if needed
    if (isDark.value) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  onMounted(() => {
    // Check system preference if no local storage
    if (localStorage.getItem('theme') === null) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      isDark.value = prefersDark;
    }
    updateTheme();
  });

  return {
    isDark,
    toggleDarkMode
  };
}
