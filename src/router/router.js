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


import AdminDashboard from '../views/admin/AdminDashboard.vue';
import UserManagement from '../views/admin/UserManagement.vue';
import ProjectManagement from '../views/admin/ProjectManagement.vue';
import ThreadManagement from '../views/admin/ThreadManagement.vue';



import ForumView from "../views/forum/ForumView.vue";

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
    component: () => import("../views/blog/Blog.vue"),
  },
  {
    path: "/blog/:id",
    name: "BlogDetail",
    component: () => import("../views/blog/BlogDetail.vue"),
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
    path: "/admin",
    name: "AdminDashboard",
    meta: { requiresAuth: true },
    component: AdminDashboard,
  },
  {
    path: "/admin/users",
    name: "UserManagement",
    meta: { requiresAuth: true },
    component: UserManagement,
  },
  {
    path: "/admin/projects",
    name: "ProjectManagement",
    meta: { requiresAuth: true },
    component: ProjectManagement,
  },
  {
    path: "/admin/threads",
    name: "ThreadManagement",
    meta: { requiresAuth: true },
    component: ThreadManagement,
  },
    path: "/forum",
    name: "Forum",
    meta: { requiresAuth: true },
    component: ForumView,
  }
];


const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
