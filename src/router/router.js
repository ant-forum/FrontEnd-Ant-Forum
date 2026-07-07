import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/AuthStore";

import HomePage from "../views/HomePage.vue";
import Dashboard from "../views/Dashboard.vue";
import Profile from "../views/Profile.vue";
import ViewProfile from "../views/ViewProfile.vue";
import LoginView from "../views/auth/LoginView.vue";
import ForgotPasswordView from "../views/auth/ForgotPasswordView.vue";
import VerifyAccountView from "../views/auth/VerifyAccountView.vue";
import TermsOfService from "../views/TermsOfService.vue";
import FAQView from "../views/FAQView.vue";

import ShowcaseDashboard from "../views/showcase/ShowcaseDashboard.vue";
import ShowcaseProjectDetail from "../views/showcase/ShowcaseProjectDetail.vue";
import CreateProject from "../views/showcase/showcaseCRUD/createProject.vue";
import VisualProject from "../views/showcase/showcaseCRUD/visaulProject.vue";
import ReviewProject from "../views/showcase/showcaseCRUD/reviewCreateProject.vue";
import HelpView from "../views/HelpView.vue";

import CreateDiscussionView from "../views/forum/CreateDiscussionView.vue";
import ThreadRepliesView from "../views/forum/ThreadRepliesView.vue";

import BlogDetail from "../views/blog/BlogDetail.vue";
import AboutUs from "../views/AboutUs.vue";
import Blog from "../views/blog/Blog.vue";
import UserSettingsView from "../views/settings/UserSettingsView.vue";
import NotificationsView from "../views/notification/NotificationsView.vue";

import AdminDashboard from "../views/admin/adminDashboard.vue";
import AdminUsersView from "../views/admin/AdminUsersView.vue";
import AdminCreateUserView from "../views/admin/AdminCreateUserView.vue";
import ProjectReviewManagement from "../views/admin/ProjectReviewManagement.vue";
import ThreadModerationView from "../views/admin/ThreadModerationView.vue";

import AdminBlogsView from "../views/admin/AdminBlogsView.vue";
import AdminBlogCreateView from "../views/admin/AdminBlogCreateView.vue";
import AdminCategoriesView from "../views/admin/AdminCategoriesView.vue";
import AdminCategoryDetailView from "../views/admin/AdminCategoryDetailView.vue";
import AdminTagsView from "../views/admin/AdminTagsView.vue";
import AdminReportsView from "../views/admin/AdminReportsView.vue";
import AdminProfileView from "../views/admin/AdminProfileView.vue";
import AdminProfileEditView from "../views/admin/AdminProfileEditView.vue";
import AdminActivityView from "../views/admin/AdminActivityView.vue";
import AdminProjectDetailsView from "../views/admin/AdminProjectDetailsView.vue";
import AdminBlogDetailsView from "../views/admin/AdminBlogDetailsView.vue";
import AdminThreadDetailsView from "../views/admin/AdminThreadDetailsView.vue";

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
    // meta: { requiresAuth: true },
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
    component: Blog,
  },
  {
    path: "/blog/:id",
    name: "BlogDetail",
    meta: { requiresAuth: true },
    component: BlogDetail,
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
    path: "/about",
    name: "AboutUs",
    meta: { public: true, title: "About Us" },
    component: AboutUs,
  },
  {
    path: "/settings/:section?",
    name: "UserSettings",
    meta: { requiresAuth: true, title: "Settings" },
    component: UserSettingsView,
  },
  {
    path: "/viewprofile/:id",
    name: "ViewProfile",
    meta: { requiresAuth: true },
    component: ViewProfile,
  },
  {
    path: "/notifications",
    name: "Notifications",
    meta: { requiresAuth: true, title: "Notifications" },
    component: NotificationsView,
  },
  {
    path: "/help",
    name: "Help",
    meta: { requiresAuth: true },
    component: HelpView,
  },
  {
    path: "/terms-of-service",
    name: "TermsOfService",
    meta: { public: true, title: "Terms of Service" },
    component: TermsOfService,
  },
  {
    path: "/faq",
    name: "FAQ",
    meta: { public: true, title: "FAQ" },
    component: FAQView,
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
    path: "/showcase/edit/:id",
    name: "EditProject",
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
    component: AdminUsersView,
  },
  {
    path: "/admin/users/create",
    name: "CreateUser",
    meta: { requiresAuth: true, role: "admin" },
    component: AdminCreateUserView,
  },
  {
    path: "/admin/projects",
    name: "ProjectManagement",
    meta: { requiresAuth: true, role: "admin" },
    component: ProjectReviewManagement,
  },
  {
    path: "/admin/projects/:id",
    name: "AdminProjectDetails",
    meta: { requiresAuth: true, role: "admin" },
    component: AdminProjectDetailsView,
  },
  {
    path: "/admin/threads",
    name: "ThreadManagement",
    meta: { requiresAuth: true, role: "admin" },
    component: ThreadModerationView,
  },
  {
    path: "/admin/threads/:id",
    name: "AdminThreadDetails",
    meta: { requiresAuth: true, role: "admin" },
    component: AdminThreadDetailsView,
  },


  {
    path: "/admin/blogs",
    name: "AdminBlogs",
    meta: { requiresAuth: true, role: "admin" },
    component: AdminBlogsView,
  },
  {
    path: "/admin/blogs/create",
    name: "AdminBlogCreate",
    meta: { requiresAuth: true, role: "admin" },
    component: AdminBlogCreateView,
  },
  {
    path: "/admin/blogs/edit/:id",
    name: "AdminBlogEdit",
    meta: { requiresAuth: true, role: "admin" },
    component: AdminBlogCreateView,
  },
  {
    path: "/admin/blogs/:id",
    name: "AdminBlogDetails",
    meta: { requiresAuth: true, role: "admin" },
    component: AdminBlogDetailsView,
  },
  {
    path: "/admin/categories",
    name: "AdminCategories",
    meta: { requiresAuth: true, role: "admin" },
    component: AdminCategoriesView,
  },
  {
    path: "/admin/categories/:id",
    name: "AdminCategoryDetail",
    meta: { requiresAuth: true, role: "admin" },
    component: AdminCategoryDetailView,
  },
  {
    path: "/admin/tags",
    name: "AdminTags",
    meta: { requiresAuth: true, role: "admin" },
    component: AdminTagsView,
  },
  {
    path: "/admin/reports",
    name: "AdminReports",
    meta: { requiresAuth: true, role: "admin" },
    component: AdminReportsView,
  },
  {
    path: "/admin/profile",
    name: "AdminProfile",
    meta: { requiresAuth: true, role: "admin" },
    component: AdminProfileView,
  },
  {
    path: "/admin/profile/edit",
    name: "AdminProfileEdit",
    meta: { requiresAuth: true, role: "admin" },
    component: AdminProfileEditView,
  },
  {
    path: "/admin/activity",
    name: "AdminActivity",
    meta: { requiresAuth: true, role: "admin" },
    component: AdminActivityView,
  },
  {
    path: "/forum",
    name: "Forum",
    meta: { requiresAuth: true },
    component: ForumView,
  },
  {
    path: "/forum/edit/:id",
    name: "EditDiscussion",
    meta: { requiresAuth: true },
    component: () => import("../views/forum/CreateDiscussionView.vue"),
  },
  {
    path: "/forum/create",
    name: "CreateDiscussion",
    meta: { requiresAuth: true },
    component: CreateDiscussionView,
  },
  {
    path: "/forum/:id",
    name: "ThreadReplies",
    meta: { requiresAuth: true },
    component: ThreadRepliesView,
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
    return { top: 0 };
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
  const isPendingAccount =
    String(authStore.user?.status || "").toLowerCase() === "pending";

  if (isLoggedIn && isPendingAccount && to.name !== "verify") {
    sessionStorage.setItem("ANT_FirstLogin", "true");
    sessionStorage.setItem("ANT_VerifiedToken", authStore.token);
    return { name: "verify" };
  }

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
    const routeRole = to.meta.role;
    const userRole = authStore.user?.role;

    if (routeRole === "admin" && userRole !== "admin") {
      console.warn(
        `[Route Guard] Non-admin attempting to access admin route ${to.path}. Current: ${userRole}`,
      );
      return { name: "not-found" };
    }
  }

  // Prevent admin from accessing non-admin user routes
  const userRole = authStore.user?.role;
  const isPublicRoute = to.meta.public === true;

  if (userRole === "admin") {
    if (
      !to.path.startsWith("/admin") &&
      !isPublicRoute &&
      to.name !== "login" &&
      to.name !== "not-found" &&
      to.name !== "empty" &&
      to.name !== "loading"
    ) {
      console.warn(
        `[Route Guard] Admin attempting to access user route ${to.path}. Redirecting to 404.`,
      );
      return { name: "not-found" };
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

  // Handle admin route class on body
  if (to.path.startsWith("/admin")) {
    document.body.classList.add("admin-route");
  } else {
    document.body.classList.remove("admin-route");
  }

  // Handle auth route class on body
  if (
    to.name === "login" ||
    to.name === "forgot-password" ||
    to.name === "verify"
  ) {
    document.body.classList.add("auth-route");
  } else {
    document.body.classList.remove("auth-route");
  }

  // Ensure theme is applied based on localStorage or system preference
  const saved = localStorage.getItem("theme");
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved ? saved : prefersDark ? "dark" : "light";

  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    document.body.classList.add("dark-mode");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    document.body.classList.remove("dark-mode");
  }
});

export default router;
