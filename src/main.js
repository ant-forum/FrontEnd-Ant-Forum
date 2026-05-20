import { createApp } from "vue";
import router from "./router/router";
import { createPinia } from "pinia";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";


import "./assets/styles/theme.css";
import "./assets/styles/main.css";
import App from "./App.vue";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./assets/styles/global.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);

const toastOptions = {
  position: "top-right",
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: "button",
  icon: true,
  rtl: false,
};
app.use(Toast, toastOptions);

// Axios interceptor is configured in src/api/api.js

app.mount("#app");
