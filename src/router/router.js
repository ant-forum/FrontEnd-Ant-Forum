import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/AuthStore";


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
    path: "/",
    name: "HomePage",
    component: HomePage,
    meta: { requiresAuth: true },
  },
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
    path: "/blog",
    name: "Blog",
    meta: { requiresAuth: true },
    component: () => import("../views/blog/Blog.vue"),
  },
  {
    path: "/blog/:id",
    name: "BlogDetail",
    meta: { requiresAuth: true },
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
    path: "/notifications",
    name: "Notifications",
    meta: { requiresAuth: true, title: "Notifications" },
    component: () => import("../views/notification/NotificationsView.vue"),
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
  },
  {
    path: "/admin",
    name: "AdminDashboard",
    meta: { requiresAuth: true, role: "admin" },
    component: AdminDashboard,
  },
  {
    path: "/admin/users",
    name: "UserManagement",
    meta: { requiresAuth: true, role: "admin" },
    component: UserManagement,
  },
  {
    path: "/admin/users/create",
    name: "CreateUser",
    meta: { requiresAuth: true, role: "admin" },
    component: CreateUserView,
  },
  {
    path: "/admin/projects",
    name: "ProjectManagement",
    meta: { requiresAuth: true, role: "admin" },
    component: ProjectManagement,
  },
  {
    path: "/admin/projects/create",
    name: "CreateProjectAdmin",
    meta: { requiresAuth: true, role: "admin" },
    component: CreateProjectView,
  },
  {
    path: "/admin/threads",
    name: "ThreadManagement",
    meta: { requiresAuth: true, role: "admin" },
    component: ThreadManagement,
  },
  {
    path: "/admin/analytics",
    name: "Analytics",
    meta: { requiresAuth: true, role: "admin" },
    component: () => import("../views/admin/AnalyticsView.vue"),
  },
  {
    path: "/admin/settings",
    name: "Settings",
    meta: { requiresAuth: true, role: "admin" },
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
  {
    path: "/:pathMatch(.*)*",
    redirect: "/404",
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

router.beforeEach(async (to, from) => {
  const authStore = useAuthStore();

  // 1. Unify profile loading: fetch user info once if token is present but user state is null
  if (authStore.token && !authStore.user) {
    try {
      await authStore.fetchProfile();
    } catch (err) {
      // Ignored: fetchProfile handles token invalidation on 401s internally
    }
  }

  const isLoggedIn = !!authStore.token && !!authStore.user;

  // 2. Redirect logged-in users away from login page to their dashboard
  if (to.name === "login" && isLoggedIn) {
    return authStore.user?.role === "admin" 
      ? { name: "AdminDashboard" } 
      : { name: "Dashboard" };
  }

  // 3. Enforce authentication and role constraints
  if (to.meta.requiresAuth) {
    if (!isLoggedIn) {
      return { name: "login" };
    }

    // Role verification guard
    if (to.meta.role && authStore.user?.role !== to.meta.role) {
      console.warn(`[Route Guard] Unauthorized access attempt to ${to.path}. Required: ${to.meta.role}. Current: ${authStore.user?.role}`);
      
      // Cancel navigation if user was already browsing a valid page inside the app
      if (from && from.name && from.path !== "/") {
        return false;
      }
      
      // Fallback reload redirect to their last successfully visited page
      const lastPath = localStorage.getItem("ANT_LastPath");
      if (lastPath && lastPath !== to.path) {
        return lastPath;
      }
      
      return authStore.user?.role === "admin"
        ? { name: "AdminDashboard" }
        : { name: "Dashboard" };
    }
  }

  return true;
});

router.afterEach((to) => {
  if (typeof window === "undefined") return;
  
  // Save last successfully visited valid student page (excluding login / restricted routes)
  if (to.meta.requiresAuth && !to.meta.role) {
    localStorage.setItem("ANT_LastPath", to.fullPath);
  }

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
