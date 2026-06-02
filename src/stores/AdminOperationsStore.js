import { computed, ref, watch } from 'vue';
import { defineStore } from 'pinia';

const STORAGE_KEY = 'ANT_AdminOperations';

const clone = (value) => JSON.parse(JSON.stringify(value));
const now = () => new Date().toISOString();

const defaultState = {
  threadReports: [
    {
      id: 1,
      threadId: 103,
      title: 'Is it worth moving from REST to GraphQL in 2026?',
      detail: 'Architecture discussion',
      excerpt: 'The discussion has become personal and several replies are no longer about the original technical question.',
      author: 'Marcus Wright',
      priority: 'High',
      reports: 5,
      status: 'Open',
      locked: false,
      createdAt: '2026-05-31T08:40:00.000Z',
      reasons: ['Harassment or personal attack', 'Off-topic argument', 'Repeated disruptive replies'],
      reportedBy: ['Dara Kim', 'Mony Rath', 'Lina Sok', 'Rithy Heng', 'Sophea V.'],
      notes: [],
    },
    {
      id: 2,
      threadId: 102,
      title: 'Best practices for Vue 3 Composition API',
      detail: 'Vue help thread',
      excerpt: 'Members reported repeated promotional links inside otherwise useful replies.',
      author: 'Sarah Chen',
      priority: 'Medium',
      reports: 2,
      status: 'Open',
      locked: false,
      createdAt: '2026-05-30T15:20:00.000Z',
      reasons: ['Spam or promotional content', 'Repeated external links'],
      reportedBy: ['Sokha Lim', 'Nita Chan'],
      notes: [],
    },
    {
      id: 3,
      threadId: 104,
      title: 'New security vulnerability in popular npm package',
      detail: 'Security announcement',
      excerpt: 'The thread was locked after several duplicate replies. It remains visible for reference.',
      author: 'Elena Vance',
      priority: 'Low',
      reports: 1,
      status: 'Resolved',
      locked: true,
      createdAt: '2026-05-29T11:10:00.000Z',
      reasons: ['Duplicate replies'],
      reportedBy: ['Admin Team'],
      notes: [{ text: 'Locked after posting the verified update.', createdAt: '2026-05-29T14:00:00.000Z' }],
    },
  ],
  projects: [
    { id: 201, name: 'ANT Forum Redesign', description: 'Student forum interface and moderation experience.', status: 'In Review', author: 'Sopanha Voeun', category: 'Web App', updated: 'Today', dateOrder: 6, likes: 184, comments: 32, feedback: '', reviewedBy: '', reviewedAt: '' },
    { id: 202, name: 'Portfolio Showcase', description: 'Public project gallery with profile and publishing flow.', status: 'Published', author: 'Mony Rath', category: 'Showcase', updated: 'Yesterday', dateOrder: 5, likes: 241, comments: 44, feedback: 'Strong presentation and a clear submission flow.', reviewedBy: 'Admin Team', reviewedAt: '2026-05-31T09:30:00.000Z' },
    { id: 203, name: 'Learning Tracker', description: 'Dashboard for assignments, tasks, and class progress.', status: 'Published', author: 'Dara Kim', category: 'Education', updated: 'May 24', dateOrder: 4, likes: 163, comments: 18, feedback: 'Approved for the student showcase.', reviewedBy: 'Admin Team', reviewedAt: '2026-05-24T10:15:00.000Z' },
    { id: 204, name: 'Dormitory Helper', description: 'Student utility app for room reports and maintenance requests.', status: 'In Review', author: 'Lina Sok', category: 'Mobile App', updated: 'May 21', dateOrder: 3, likes: 98, comments: 11, feedback: '', reviewedBy: '', reviewedAt: '' },
    { id: 205, name: 'Code Snippet Library', description: 'Reusable snippets with tags, copy actions, and search.', status: 'Changes Requested', author: 'Rithy Heng', category: 'Developer Tool', updated: 'May 18', dateOrder: 2, likes: 207, comments: 29, feedback: 'Add screenshots and clarify how snippets are reviewed before publishing.', reviewedBy: 'Admin Team', reviewedAt: '2026-05-19T13:00:00.000Z' },
  ],
  settings: {
    forumName: 'ANT Forum',
    supportEmail: 'support@ant.dev',
    replyWindow: '48 hours',
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
      blockedKeywords: 'spam, scam, phishing',
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
    { id: 1, type: 'project', action: 'Approved project', target: 'Portfolio Showcase', createdAt: '2026-05-31T09:30:00.000Z' },
    { id: 2, type: 'moderation', action: 'Locked thread', target: 'New security vulnerability in popular npm package', createdAt: '2026-05-29T14:00:00.000Z' },
    { id: 3, type: 'settings', action: 'Updated forum settings', target: 'Moderation controls', createdAt: '2026-05-28T08:15:00.000Z' },
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

export const useAdminOperationsStore = defineStore('adminOperations', () => {
  const state = ref(loadState());

  const threadReports = computed(() => state.value.threadReports);
  const projects = computed(() => state.value.projects);
  const settings = computed(() => state.value.settings);
  const activityLog = computed(() => state.value.activityLog);

  const pendingReports = computed(() => threadReports.value.filter((item) => item.status === 'Open'));
  const resolvedReports = computed(() => threadReports.value.filter((item) => item.status !== 'Open'));
  const highPriorityReports = computed(() => pendingReports.value.filter((item) => item.priority === 'High'));
  const lockedThreads = computed(() => threadReports.value.filter((item) => item.locked));
  const pendingProjects = computed(() => projects.value.filter((item) => item.status === 'In Review'));
  const publishedProjects = computed(() => projects.value.filter((item) => item.status === 'Published'));
  const rejectedProjects = computed(() => projects.value.filter((item) => item.status === 'Rejected'));
  const totalProjectLikes = computed(() => projects.value.reduce((total, item) => total + item.likes, 0));

  const sidebarBadges = computed(() => ({
    '/admin/reports': pendingReports.value.length,
    '/admin/projects': pendingProjects.value.length,
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

  const updateReport = (id, patch, action, note = '') => {
    const item = state.value.threadReports.find((report) => report.id === id);
    if (!item) return;
    Object.assign(item, patch);
    if (note.trim()) {
      item.notes.push({ text: note.trim(), createdAt: now() });
    }
    addActivity('moderation', action, item.title);
  };

  const resolveReport = (id, note) => updateReport(id, { status: 'Resolved' }, 'Resolved report', note);
  const dismissReport = (id, note) => updateReport(id, { status: 'Dismissed' }, 'Dismissed report', note);
  const warnThreadAuthor = (id, note) => updateReport(id, {}, 'Warned thread author', note);
  const toggleThreadLock = (id, note) => {
    const item = state.value.threadReports.find((report) => report.id === id);
    if (!item) return;
    updateReport(id, { locked: !item.locked }, item.locked ? 'Unlocked thread' : 'Locked thread', note);
  };

  const reviewProject = (id, status, feedback = '') => {
    const item = state.value.projects.find((project) => project.id === id);
    if (!item) return;
    item.status = status;
    item.feedback = feedback.trim();
    item.reviewedBy = 'Admin Team';
    item.reviewedAt = now();
    addActivity('project', `${status} project`, item.name);
  };

  const saveSettings = (nextSettings) => {
    state.value.settings = { ...state.value.settings, ...clone(nextSettings) };
    addActivity('settings', 'Updated forum settings', 'Forum configuration');
  };

  const resetDemoData = () => {
    state.value = clone(defaultState);
  };

  watch(state, (nextState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  }, { deep: true });

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
    resetDemoData,
  };
});
