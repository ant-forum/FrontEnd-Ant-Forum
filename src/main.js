import { createApp } from 'vue'
import router from './router/router'
import { createPinia } from 'pinia'
import Toast, { useToast } from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import axios from 'axios'

import './assets/styles/theme.css'
import './assets/styles/main.css'
import App from './App.vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './assets/styles/global.css'

const app = createApp(App);

app.use(createPinia())
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
  rtl: false
};
app.use(Toast, toastOptions);

// Setup global axios interceptor
const toast = useToast();

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { data } = error.response;
      const message = data?.message || 'An error occurred with the response.';
      toast.error(message);
    } else if (error.request) {
      toast.error('Network Error. Please check your connection.');
    } else {
      toast.error(error.message || 'An error occurred.');
    }
    return Promise.reject(error);
  }
);

app.mount("#app");
