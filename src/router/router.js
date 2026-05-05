import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home.vue';
import Dashboard from '../views/Dashboard.vue';
import Profile from "../views/Profile.vue"

const routes = [
  {
    path: '/',
    component: Home,
    name: "HomeLayout",
    meta: { requiresAuth: true }
  },
  {
    path: '/blog', 
    name: 'Blog', 
    meta: { requiresAuth: true }
    // component
  },
  { path: '/dashboard', 
    name: 'Dashboard', 
    meta: { requiresAuth: true },
    component: Dashboard
   },
   { path: '/profile', 
    name: 'Profile', 
    meta: { requiresAuth: true },
    component: Profile
   },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router