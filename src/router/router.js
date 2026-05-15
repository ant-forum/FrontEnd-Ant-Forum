import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

import Home from '../views/Home.vue';
import HomePage from '../views/HomePage.vue';
import Dashboard from '../views/Dashboard.vue';
import Profile from "../views/Profile.vue"
import LoginView from '../views/auth/LoginView.vue';

const routes = [
  {
    path: "/login",
    name: "login",
    component: LoginView,
    meta: { title: "Login" },
  },
  {
    path: "/forgot-password",
    name: "forgot-password",
    component: ForgotPasswordView,
    meta: { title: "Reset Password" },
  },
  {
    path: "/verify",
    name: "verify",
    component: VerifyAccountView,
    meta: { title: "Verify Account" },
  },
  {
    path: "/",
    component: Home,
    name: "HomeLayout",
    meta: { requiresAuth: true },
  },
  {
    path: '/home',
    component: HomePage,
    name: "HomePage",
    meta: { requiresAuth: true }
  },
  {
    path: '/blog', 
    name: 'Blog', 
    meta: { requiresAuth: true }
    // component
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    meta: { requiresAuth: true },
    component: Dashboard,
  },
  {
    path: "/profile",
    name: "Profile",
    meta: { requiresAuth: true },
    component: Profile,
  },
];


const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
