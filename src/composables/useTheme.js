import { ref, watch } from "vue";

const theme = ref(localStorage.getItem("theme") || "light");

export function useTheme() {
  const toggleTheme = () => {
    theme.value = theme.value === "light" ? "dark" : "light";
  };

  const applyTheme = (val) => {
    document.documentElement.setAttribute("data-bs-theme", val);
    document.documentElement.setAttribute("data-theme", val);
    localStorage.setItem("theme", val);
  };

  const initTheme = () => {
    applyTheme(theme.value);
  };

  watch(theme, (newTheme) => {
    applyTheme(newTheme);
  });

  return {
    theme,
    toggleTheme,
    initTheme,
  };
}
