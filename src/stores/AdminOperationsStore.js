import { computed, ref, watch } from "vue";
import { defineStore } from "pinia";
import api from "@/api/api.js";

const STORAGE_KEY = "ANT_AdminOperations";

const clone = (value) => JSON.parse(JSON.stringify(value));
const now = () => new Date().toISOString();

const defaultState = {
  threadReports: [
    {
      id: 1,
      threadId: 103,
      title: "Is it worth moving from REST to GraphQL in 2026?",
      detail: "Architecture discussion",
      excerpt:
        "The discussion has become personal and several replies are no longer about the original technical question.",
      author: "Marcus Wright",
      priority: "High",
      reports: 5,
      status: "Open",
      locked: false,
      createdAt: "2026-05-31T08:40:00.000Z",
      reasons: [
        "Harassment or personal attack",
        "Off-topic argument",
        "Repeated disruptive replies",
      ],
      reportedBy: [
        "Dara Kim",
        "Mony Rath",
        "Lina Sok",
        "Rithy Heng",
        "Sophea V.",
      ],
      notes: [],
    },
    {
      id: 2,
      threadId: 102,
      title: "Best practices for Vue 3 Composition API",
      detail: "Vue help thread",
      excerpt:
        "Members reported repeated promotional links inside otherwise useful replies.",
      author: "Sarah Chen",
      priority: "Medium",
      reports: 2,
      status: "Open",
      locked: false,
      createdAt: "2026-05-30T15:20:00.000Z",
      reasons: ["Spam or promotional content", "Repeated external links"],
      reportedBy: ["Sokha Lim", "Nita Chan"],
      notes: [],
    },
    {
      id: 3,
      threadId: 104,
      title: "New security vulnerability in popular npm package",
      detail: "Security announcement",
      excerpt:
        "The thread was locked after several duplicate replies. It remains visible for reference.",
      author: "Elena Vance",
      priority: "Low",
      reports: 1,
      status: "Resolved",
      locked: true,
      createdAt: "2026-05-29T11:10:00.000Z",
      reasons: ["Duplicate replies"],
      reportedBy: ["Admin Team"],
      notes: [
        {
          text: "Locked after posting the verified update.",
          createdAt: "2026-05-29T14:00:00.000Z",
        },
      ],
    },
  ],
  projects: [],
  settings: {
    forumName: "ANT Forum",
    supportEmail: "support@ant.dev",
    replyWindow: "48 hours",
    requireFirstPostReview: true,
    allowProjectSubmissions: true,
    autoLockReportThreshold: 5,
    moderation: {
      requireDecisionNotes: true,
      allowModeratorWarnings: true,
      allowModeratorSuspensions: false,
      defaultSuspensionDays: 7,
    },
    contentRules: {
      maxTitleLength: 120,
      maxPostLength: 10000,
      maxUploadMb: 8,
      allowNewUserLinks: false,
      autoHideReportedContent: true,
      blockedKeywords: "spam, scam, phishing",
    },
    security: {
      requireStrongPasswords: true,
      requireAdminTwoFactor: false,
      sessionTimeoutMinutes: 60,
      loginAttemptLimit: 5,
    },
    notificationPreferences: {
      studentRegistrations: true,
      projectReviews: true,
      moderationReports: true,
      weeklyDigest: false,
    },
  },
  activityLog: [
    {
      id: 1,
      type: "project",
      action: "Approved project",
      target: "Portfolio Showcase",
      createdAt: "2026-05-31T09:30:00.000Z",
    },
    {
      id: 2,
      type: "moderation",
      action: "Locked thread",
      target: "New security vulnerability in popular npm package",
      createdAt: "2026-05-29T14:00:00.000Z",
    },
    {
      id: 3,
      type: "settings",
      action: "Updated forum settings",
      target: "Moderation controls",
      createdAt: "2026-05-28T08:15:00.000Z",
    },
  ],
};

const loadState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return clone(defaultState);
    const parsed = JSON.parse(saved);
    return {
      ...clone(defaultState),
      ...parsed,
      settings: {
        ...clone(defaultState.settings),
        ...(parsed.settings || {}),
        moderation: {
          ...clone(defaultState.settings.moderation),
          ...(parsed.settings?.moderation || {}),
        },
        contentRules: {
          ...clone(defaultState.settings.contentRules),
          ...(parsed.settings?.contentRules || {}),
        },
        security: {
          ...clone(defaultState.settings.security),
          ...(parsed.settings?.security || {}),
        },
        notificationPreferences: {
          ...clone(defaultState.settings.notificationPreferences),
          ...(parsed.settings?.notificationPreferences || {}),
        },
      },
    };
  } catch {
    return clone(defaultState);
  }
};

export const useAdminOperationsStore = defineStore("adminOperations", () => {
  const state = ref(loadState());

  const threadReports = computed(() => state.value.threadReports);
  const projects = computed(() => state.value.projects);
  const settings = computed(() => state.value.settings);
  const activityLog = computed(() => state.value.activityLog);

  const pendingReports = computed(() =>
    threadReports.value.filter((item) => item.status === "Open"),
  );
  const resolvedReports = computed(() =>
    threadReports.value.filter((item) => item.status !== "Open"),
  );
  const highPriorityReports = computed(() =>
    pendingReports.value.filter((item) => item.priority === "High"),
  );
  const lockedThreads = computed(() =>
    threadReports.value.filter((item) => item.locked),
  );
  const pendingProjects = computed(() =>
    projects.value.filter((item) => item.status === "In Review"),
  );
  const publishedProjects = computed(() =>
    projects.value.filter((item) => item.status === "Published"),
  );
  const rejectedProjects = computed(() =>
    projects.value.filter((item) => item.status === "Rejected"),
  );
  const totalProjectLikes = computed(() =>
    projects.value.reduce((total, item) => total + item.likes, 0),
  );

  const sidebarBadges = computed(() => ({
    "/admin/reports": pendingReports.value.length,
    "/admin/projects": pendingProjects.value.length,
  }));

  const addActivity = (type, action, target) => {
    state.value.activityLog.unshift({
      id: Date.now(),
      type,
      action,
      target,
      createdAt: now(),
    });
  };

  const fetchReports = async () => {
    try {
      const res = await api.get("/api/report/getAllReport");
      const data = res.data?.data || res.data || [];
      const list = Array.isArray(data) ? data : (data.rows || data.items || []);

      state.value.threadReports = list.map((item) => {
        const isForum = Boolean(item.forum_id || item.forum);
        const isProject = Boolean(item.project_id || item.project);
        
        let title = "Reported Content";
        let detail = isForum ? "Forum Post" : (isProject ? "Project Showcase" : "General Content");
        let authorName = "Unknown";
        
        if (isForum) {
          const forumObj = item.forum || {};
          title = forumObj.title || forumObj.name || `Forum Post #${item.forum_id}`;
          authorName = forumObj.author?.name || forumObj.author?.username || forumObj.user?.username || `User ${forumObj.user_id || ""}`;
        } else if (isProject) {
          const projObj = item.project || {};
          title = projObj.title || projObj.projectName || projObj.name || `Project #${item.project_id}`;
          authorName = projObj.author?.name || projObj.author?.username || projObj.user?.username || `User ${projObj.user_id || ""}`;
        }
        
        let priority = "Medium";
        const reasonLower = String(item._reason || "").toLowerCase();
        if (reasonLower.includes("harassment") || reasonLower.includes("hate") || reasonLower.includes("abuse") || reasonLower.includes("security")) {
          priority = "High";
        } else if (reasonLower.includes("spam") || reasonLower.includes("promo")) {
          priority = "Low";
        }
        
        let status = "Open";
        const statusLower = String(item.status || "").toLowerCase();
        if (statusLower === "approved" || statusLower === "resolved") {
          status = "Resolved";
        } else if (statusLower === "rejected" || statusLower === "dismissed") {
          status = "Dismissed";
        } else if (statusLower === "pending" || statusLower === "open") {
          status = "Open";
        } else if (item.status) {
          status = item.status;
        }
        
        const reasonsList = item._reason ? [item._reason] : ["No reason specified"];
        const reportersList = item.user ? [item.user.name || item.user.username] : [`User #${item.user_id}`];
        
        return {
          id: item.id,
          threadId: item.forum_id || null,
          projectId: item.project_id || null,
          title: title,
          detail: detail,
          excerpt: item._reason || "",
          author: authorName,
          priority: priority,
          reports: 1,
          status: status,
          locked: Boolean(item.forum?.locked || item.project?.locked || false),
          createdAt: item.createdAt || item.created_at || new Date().toISOString(),
          reasons: reasonsList,
          reportedBy: reportersList,
          notes: item.notes || [],
          image: item._image || null,
          rawItem: item
        };
      });
    } catch (err) {
      console.error("[AdminOperationsStore] Failed to fetch reports:", err);
    }
  };

  const updateReport = async (id, patch, action, note = "") => {
    const item = state.value.threadReports.find((report) => report.id === id);
    if (!item) return;

    if (patch.status !== undefined) {
      let backendStatus = "pending";
      if (patch.status === "Resolved") {
        backendStatus = "approved";
      } else if (patch.status === "Dismissed") {
        backendStatus = "rejected";
      }
      try {
        await api.put(`/api/report/updateStatus/${id}`, { status: backendStatus });
      } catch (err) {
        console.error(`[AdminOperationsStore] Failed to update status for report ${id}:`, err);
        throw err.response?.data || err.message;
      }
    }

    Object.assign(item, patch);
    if (note.trim()) {
      item.notes.push({ text: note.trim(), createdAt: now() });
    }
    addActivity("moderation", action, item.title);
  };

  const resolveReport = async (id, note) =>
    await updateReport(id, { status: "Resolved" }, "Resolved report", note);
  const dismissReport = async (id, note) =>
    await updateReport(id, { status: "Dismissed" }, "Dismissed report", note);
  const warnThreadAuthor = async (id, note) =>
    await updateReport(id, {}, "Warned thread author", note);
  const toggleThreadLock = async (id, note) => {
    const item = state.value.threadReports.find((report) => report.id === id);
    if (!item) return;
    await updateReport(
      id,
      { locked: !item.locked },
      item.locked ? "Unlocked thread" : "Locked thread",
      note,
    );
  };

  const deleteReport = async (id) => {
    try {
      await api.delete(`/api/report/deleteReport/${id}`);
      state.value.threadReports = state.value.threadReports.filter((r) => r.id != id);
      addActivity("moderation", "Deleted report", `Report #${id}`);
    } catch (err) {
      console.error(`[AdminOperationsStore] Failed to delete report ${id}:`, err);
      throw err.response?.data || err.message;
    }
  };

  const reviewProject = (id, status, feedback = "") => {
    const item = state.value.projects.find((project) => project.id === id);
    if (!item) return;
    item.status = status;
    item.feedback = feedback.trim();
    item.reviewedBy = "Admin Team";
    item.reviewedAt = now();
    addActivity("project", `${status} project`, item.name);
  };

  const saveSettings = (nextSettings) => {
    state.value.settings = { ...state.value.settings, ...clone(nextSettings) };
    addActivity("settings", "Updated forum settings", "Forum configuration");
  };

  const recordProfileUpdate = () =>
    addActivity("profile", "Updated staff profile", "Profile details");
  const recordSecurityUpdate = () =>
    addActivity("security", "Updated account password", "Security credentials");

  const resetDemoData = () => {
    state.value = clone(defaultState);
  };

  watch(
    state,
    (nextState) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    },
    { deep: true },
  );

  return {
    threadReports,
    projects,
    settings,
    activityLog,
    pendingReports,
    resolvedReports,
    highPriorityReports,
    lockedThreads,
    pendingProjects,
    publishedProjects,
    rejectedProjects,
    totalProjectLikes,
    sidebarBadges,
    resolveReport,
    dismissReport,
    warnThreadAuthor,
    toggleThreadLock,
    reviewProject,
    saveSettings,
    recordProfileUpdate,
    recordSecurityUpdate,
    resetDemoData,
    fetchReports,
    deleteReport,
  };
});
