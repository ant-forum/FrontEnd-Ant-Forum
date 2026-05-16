import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

import Home from "../views/Home.vue";
import Dashboard from "../views/Dashboard.vue";
import Profile from "../views/Profile.vue";
import LoginView from "../views/auth/LoginView.vue";
import ForgotPasswordView from "../views/auth/ForgotPasswordView.vue";
import VerifyAccountView from "../views/auth/VerifyAccountView.vue";

import Loading from "../components/layouts/Loading.vue";
import Page404 from "../components/layouts/404Page.vue";
import Empty from "../components/layouts/Empty.vue";

const routes = [
  {
    path: "/loading",
    name: "loading",
    component: Loading,
  },
  {
    path: "/404",
    name: "not-found",
    component: Page404,
  },
  {
    path: "/empty",
    name: "empty",
    component: Empty,
  },
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
    path: "/blog",
    name: "Blog",
    meta: { requiresAuth: true },
    component: () => import("../views/Home.vue"), // placeholder until Blog view is built
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
