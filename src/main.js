import { createApp } from "vue";
import router from "./router/router";
import { createPinia } from "pinia";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import { toastOptions } from "./composables/useToast";

import "./assets/styles/theme.css";
import "./assets/styles/main.css";
import App from "./App.vue";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./assets/styles/global.css";

if (typeof window !== "undefined") {
  const saved = localStorage.getItem("theme");
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved ? saved : prefersDark ? "dark" : "light";
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    document.body.classList.add("dark-mode");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    document.body.classList.remove("dark-mode");
  }
}

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.use(Toast, toastOptions);

app.mount("#app");
