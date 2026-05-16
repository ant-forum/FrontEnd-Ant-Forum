import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

import Home from '../views/Home.vue';
import HomePage from '../views/HomePage.vue';
import Dashboard from '../views/Dashboard.vue';
import Profile from "../views/Profile.vue"
import LoginView from '../views/auth/LoginView.vue';
import ForgotPasswordView from '../views/auth/ForgotPasswordView.vue';
import VerifyAccountView from '../views/auth/VerifyAccountView.vue';

import ShowcaseDashboard from '../views/showcase/ShowcaseDashboard.vue';
import ShowcaseProjectDetail from '../views/showcase/ShowcaseProjectDetail.vue';
import CreateProject from '../views/showcase/showcaseCRUD/createProject.vue';
import VisualProject from '../views/showcase/showcaseCRUD/visaulProject.vue';
import ReviewProject from '../views/showcase/showcaseCRUD/reviewCreateProject.vue';



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
  {
    path: "/showcase",
    name: "ShowcaseDashboard",
    meta: { requiresAuth: true },
    component: ShowcaseDashboard,
  },
  {
    path: "/showcase/:id",
    name: "ShowcaseProjectDetail",
    meta: { requiresAuth: true },
    component: ShowcaseProjectDetail,
  },
  {
    path: "/showcase/create",
    name: "CreateProject",
    meta: { requiresAuth: true },
    component: CreateProject,
  },
  {
    path: "/showcase/create/assets",
    name: "VisualProject",
    meta: { requiresAuth: true },
    component: VisualProject,
  },
  {
    path: "/showcase/create/review",
    name: "ReviewProject",
    meta: { requiresAuth: true },
    component: ReviewProject,
  },
];


const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
