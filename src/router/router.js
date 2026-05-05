import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home.vue'
import MainLayout from '../layouts/mainLayout.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    name: "MainLayout"
  },
  {
    path: '/blog', 
    name: 'Blog', 
    // component
  },
  { path: '/dashboard', 
    name: 'Dashboard', 
    // component
   },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router