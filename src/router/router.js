import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

import Home from '../views/Home.vue';
import HomePage from '../views/HomePage.vue';
import Dashboard from '../views/Dashboard.vue';
import Profile from "../views/Profile.vue"
import LoginView from '../views/auth/LoginView.vue';
import RegisterView from '../views/auth/RegisterView.vue';
import ForgotPasswordView from '../views/auth/ForgotPasswordView.vue';
import VerifyAccountView from '../views/auth/VerifyAccountView.vue';

import ShowcaseDashboard from '../views/showcase/ShowcaseDashboard.vue';
import ShowcaseProjectDetail from '../views/showcase/ShowcaseProjectDetail.vue';
import CreateProject from '../views/showcase/showcaseCRUD/createProject.vue';
import VisualProject from '../views/showcase/showcaseCRUD/visaulProject.vue';
import ReviewProject from '../views/showcase/showcaseCRUD/reviewCreateProject.vue';


import AdminDashboard from '../views/admin/adminDashboard.vue';
import UserManagement from '../views/admin/UserManagement.vue';
import CreateUserView from '../views/admin/CreateUserView.vue';
import ProjectManagement from '../views/admin/ProjectManagement.vue';
import CreateProjectView from '../views/admin/CreateProjectView.vue';
import ThreadManagement from '../views/admin/ThreadManagement.vue';
// import AnalyticsView from '../views/admin/AnalyticsView.vue';
import SettingsView from '../views/admin/SettingsView.vue';
// import ShowcaseDashboard from '../views/showcase/ShowcaseDashboard.vue';


//this is new

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
    path: "/register",
    name: "register",
    component: RegisterView,
    meta: { title: "Register" },
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
    path: "/home",
    component: Home,
    name: "HomeLayout",
    meta: { requiresAuth: true },
  },
  {
    path: "/",
    name: "HomePage",
    component: HomePage,
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
    path: "/help",
    name: "Help",
    meta: { requiresAuth: true },
    component: () => import("../views/HelpView.vue"),
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
  },{
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
    path: "/admin/users/create",
    name: "CreateUser",
    meta: { requiresAuth: true },
    component: CreateUserView,
  },
  {
    path: "/admin/projects",
    name: "ProjectManagement",
    meta: { requiresAuth: true },
    component: ProjectManagement,
  },
  {
    path: "/admin/projects/create",
    name: "CreateProjectAdmin",
    meta: { requiresAuth: true },
    component: CreateProjectView,
  },
  {
    path: "/admin/threads",
    name: "ThreadManagement",
    meta: { requiresAuth: true },
    component: ThreadManagement,
  },
  {
    path: "/admin/analytics",
    name: "Analytics",
    meta: { requiresAuth: true },
    component: () => import("../views/admin/AnalyticsView.vue"),
  },
  {
    path: "/admin/settings",
    name: "Settings",
    meta: { requiresAuth: true },
    component: SettingsView,
  },
  {
    path: "/forum",
    name: "Forum",
    meta: { requiresAuth: true },
    component: ForumView,
  },
  {
    path: "/forum/create",
    name: "CreateDiscussion",
    meta: { requiresAuth: true },
    component: () => import("../views/forum/CreateDiscussionView.vue"),
  },
  {
    path: "/forum/:id",
    name: "ThreadReplies",
    meta: { requiresAuth: true },
    component: () => import("../views/forum/ThreadRepliesView.vue"),
  },

];


const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // always scroll to top
    return { top: 0 }
  },
});

router.afterEach((to) => {
  if (typeof window === "undefined") return;
  
  // Update page title
  if (to.meta.title) {
    document.title = `${to.meta.title} | ANT Forum`;
  }

  // Ensure theme is applied based on localStorage or system preference
  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved ? saved : (prefersDark ? "dark" : "light");
  
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    document.body.classList.add('dark-mode');
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    document.body.classList.remove('dark-mode');
  }
});

export default router;
