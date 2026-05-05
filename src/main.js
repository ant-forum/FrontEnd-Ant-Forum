import { createApp } from 'vue'
import router from './router/router'
import { createPinia } from 'pinia'

import './assets/styles/theme.css'
import App from './App.vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './assets/styles/global.css'

const app = createApp(App);

app.use(createPinia())
app.use(router);
app.mount("#app");
