<script setup>
import { computed, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Footer from "../../components/layouts/footer.vue";
import Navbar from "../../components/layouts/header.vue";
import { useToast } from "../../composables/useToast";
import { useUnsavedChangesGuard } from "../../composables/useUnsavedChangesGuard";
import { useAuthStore } from "../../stores/AuthStore";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const sections = [
  {
    id: "privacy",
    label: "Privacy",
    description: "Visibility and messaging",
    icon: "bi-shield-check",
  },
  {
    id: "security",
    label: "Security",
    description: "Password and sessions",
    icon: "bi-lock",
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Forum and email alerts",
    icon: "bi-bell",
  },
  {
    id: "account",
    label: "Account",
    description: "Account support requests",
    icon: "bi-person-gear",
  },
];

const sectionIds = new Set(sections.map((section) => section.id));
const activeSection = computed(() =>
  sectionIds.has(route.params.section) ? route.params.section : "privacy",
);
const role = computed(() =>
  String(authStore.user?.role || "student").toLowerCase(),
);
const roleLabel = computed(
  () => role.value.charAt(0).toUpperCase() + role.value.slice(1),
);
const isMentor = computed(() => ["mentor", "teacher"].includes(role.value));
const storageKey = computed(() => {
  const identity =
    authStore.user?.id ||
    authStore.user?.email ||
    authStore.user?.username ||
    "user";
  return `ANT_UserSettingsPreview:${identity}`;
});

const getDefaults = () => ({
  privacy: {
    profileVisibility: "members",
    showProjects: true,
    showActivity: true,
    showSocialLinks: false,
    searchable: true,
    messagePermission: isMentor.value ? "members" : "mentors",
  },
  notifications: {
    forumReplies: true,
    mentions: true,
    projectUpdates: true,
    directMessages: true,
    weeklyDigest: false,
    emailAlerts: false,
  },
});

const getStoredSettings = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey.value));
    const defaults = getDefaults();
    return {
      privacy: { ...defaults.privacy, ...(stored?.privacy || {}) },
      notifications: {
        ...defaults.notifications,
        ...(stored?.notifications || {}),
      },
    };
  } catch {
    return getDefaults();
  }
};

const form = reactive(getStoredSettings());
const snapshot = ref(JSON.stringify(form));
const saved = ref(false);
const hasChanges = computed(() => JSON.stringify(form) !== snapshot.value);

useUnsavedChangesGuard(
  hasChanges,
  "You have unsaved settings changes. Leave this page and discard them?",
);

const selectSection = (section) => {
  router.push(`/settings/${section}`);
};

const savePreview = () => {
  localStorage.setItem(storageKey.value, JSON.stringify(form));
  snapshot.value = JSON.stringify(form);
  saved.value = true;
  toast.success(
    "Preferences saved on this device. Backend sync still needs to be connected.",
  );
  window.setTimeout(() => {
    saved.value = false;
  }, 2200);
};

const discardChanges = () => {
  Object.assign(form, JSON.parse(snapshot.value));
  toast.info("Unsaved preferences discarded.");
};

const browserName = computed(() => {
  const agent = navigator.userAgent;
  if (agent.includes("Edg/")) return "Microsoft Edge";
  if (agent.includes("Chrome/")) return "Google Chrome";
  if (agent.includes("Firefox/")) return "Mozilla Firefox";
  if (agent.includes("Safari/")) return "Safari";
  return "Current browser";
});

watch(
  () => route.params.section,
  (section) => {
    if (!sectionIds.has(section)) {
      router.replace("/settings/privacy");
    }
  },
  { immediate: true },
);
</script>

<template>
  <Navbar />

  <div class="settings-page">
    <div class="settings-page-container">
      <main class="settings-main">
        <header class="settings-header">
          <div>
            <span class="settings-kicker">Personal settings</span>
            <h1>Settings & Privacy</h1>
            <p>
              Manage your ANT Forum privacy, security, and account preferences.
            </p>
          </div>
          <span class="role-badge"
            ><i class="bi bi-person-badge"></i> {{ roleLabel }}</span
          >
        </header>

        <div class="settings-content-grid">
          <aside class="settings-section-nav">
            <button
              v-for="section in sections"
              :key="section.id"
              type="button"
              :class="{ active: activeSection === section.id }"
              @click="selectSection(section.id)"
            >
              <span class="section-icon"
                ><i :class="['bi', section.icon]"></i
              ></span>
              <span>
                <strong>{{ section.label }}</strong>
                <small>{{ section.description }}</small>
              </span>
            </button>
          </aside>

          <section class="settings-panel-wrap">
            <section v-if="activeSection === 'privacy'" class="settings-panel">
              <div class="panel-heading">
                <div>
                  <h2>Privacy Controls</h2>
                  <p>
                    Choose how other forum members can discover and interact
                    with you.
                  </p>
                </div>
                <span class="preview-badge"
                  ><i class="bi bi-device-ssd"></i> Device preview</span
                >
              </div>

              <div class="field-grid">
                <label class="field-block">
                  <span>Profile visibility</span>
                  <select
                    v-model="form.privacy.profileVisibility"
                    class="form-select"
                  >
                    <option value="members">Forum members only</option>
                    <option value="private">Only me</option>
                    <option value="public">Public profile</option>
                  </select>
                  <small
                    >Student profiles should stay members-only unless public
                    visibility is intentionally enabled.</small
                  >
                </label>

                <label class="field-block">
                  <span>Who can message you</span>
                  <select
                    v-model="form.privacy.messagePermission"
                    class="form-select"
                  >
                    <option value="mentors">Mentors only</option>
                    <option value="members">Forum members</option>
                    <option value="none">Nobody</option>
                  </select>
                  <small>{{
                    isMentor
                      ? "Mentors may accept messages from the wider community."
                      : "Students default to mentor-only messages."
                  }}</small>
                </label>
              </div>

              <div class="toggle-list">
                <label class="toggle-row">
                  <span
                    ><strong>Show showcase projects</strong
                    ><small
                      >Allow members to view projects linked to your
                      profile.</small
                    ></span
                  >
                  <input
                    v-model="form.privacy.showProjects"
                    class="settings-switch"
                    type="checkbox"
                  />
                </label>
                <label class="toggle-row">
                  <span
                    ><strong>Show recent forum activity</strong
                    ><small
                      >Display your recent discussions and replies on your
                      profile.</small
                    ></span
                  >
                  <input
                    v-model="form.privacy.showActivity"
                    class="settings-switch"
                    type="checkbox"
                  />
                </label>
                <label class="toggle-row">
                  <span
                    ><strong>Show social links</strong
                    ><small
                      >Display GitHub and LinkedIn links after you add them to
                      your profile.</small
                    ></span
                  >
                  <input
                    v-model="form.privacy.showSocialLinks"
                    class="settings-switch"
                    type="checkbox"
                  />
                </label>
                <label class="toggle-row">
                  <span
                    ><strong>Appear in forum search</strong
                    ><small
                      >Let other members find your profile by username.</small
                    ></span
                  >
                  <input
                    v-model="form.privacy.searchable"
                    class="settings-switch"
                    type="checkbox"
                  />
                </label>
              </div>

              <div class="integration-note">
                <i class="bi bi-info-circle"></i>
                <span
                  >The backend must enforce these visibility rules before this
                  ships. The current save stores a device preview only.</span
                >
              </div>
              <div class="settings-actions">
                <button
                  class="btn-secondary-action"
                  type="button"
                  :disabled="!hasChanges"
                  @click="discardChanges"
                >
                  Discard
                </button>
                <button
                  class="btn-primary-action"
                  type="button"
                  :disabled="!hasChanges"
                  @click="savePreview"
                >
                  <i class="bi bi-check2-circle"></i>
                  {{ saved ? "Saved on device" : "Save privacy preview" }}
                </button>
              </div>
            </section>

            <section
              v-else-if="activeSection === 'security'"
              class="settings-panel"
            >
              <div class="panel-heading">
                <div>
                  <h2>Password & Security</h2>
                  <p>
                    Review your password and the devices currently signed into
                    your account.
                  </p>
                </div>
                <span class="backend-badge"
                  ><i class="bi bi-plug"></i> Backend required</span
                >
              </div>

              <div class="security-card">
                <span class="security-icon"><i class="bi bi-key"></i></span>
                <div>
                  <strong>Password</strong>
                  <small
                    >Use the verified reset flow to change your account
                    password.</small
                  >
                </div>
                <router-link to="/forgot-password" class="inline-action"
                  >Reset password</router-link
                >
              </div>

              <div class="section-heading">
                <div>
                  <h3>Active sessions</h3>
                  <p>
                    Session management needs backend support before remote
                    logout can be enabled.
                  </p>
                </div>
                <button class="btn-secondary-action" type="button" disabled>
                  Log out other sessions
                </button>
              </div>

              <div class="session-card">
                <span class="security-icon current"
                  ><i class="bi bi-laptop"></i
                ></span>
                <div>
                  <strong>{{ browserName }}</strong>
                  <small>Current session · This device</small>
                </div>
                <span class="current-badge">Active now</span>
              </div>
            </section>

            <section
              v-else-if="activeSection === 'notifications'"
              class="settings-panel"
            >
              <div class="panel-heading">
                <div>
                  <h2>Notification Preferences</h2>
                  <p>Choose the updates you want to receive from the forum.</p>
                </div>
                <span class="preview-badge"
                  ><i class="bi bi-device-ssd"></i> Device preview</span
                >
              </div>

              <div class="toggle-list">
                <label class="toggle-row">
                  <span
                    ><strong>Replies to your discussions</strong
                    ><small
                      >Notify when someone responds to a thread you
                      started.</small
                    ></span
                  >
                  <input
                    v-model="form.notifications.forumReplies"
                    class="settings-switch"
                    type="checkbox"
                  />
                </label>
                <label class="toggle-row">
                  <span
                    ><strong>Mentions</strong
                    ><small
                      >Notify when another member mentions your username.</small
                    ></span
                  >
                  <input
                    v-model="form.notifications.mentions"
                    class="settings-switch"
                    type="checkbox"
                  />
                </label>
                <label class="toggle-row">
                  <span
                    ><strong>Project updates</strong
                    ><small
                      >Receive showcase review and project activity
                      updates.</small
                    ></span
                  >
                  <input
                    v-model="form.notifications.projectUpdates"
                    class="settings-switch"
                    type="checkbox"
                  />
                </label>
                <label class="toggle-row">
                  <span
                    ><strong>Direct messages</strong
                    ><small
                      >Notify when a permitted member sends you a
                      message.</small
                    ></span
                  >
                  <input
                    v-model="form.notifications.directMessages"
                    class="settings-switch"
                    type="checkbox"
                  />
                </label>
                <label class="toggle-row">
                  <span
                    ><strong>Weekly forum digest</strong
                    ><small
                      >Receive a summary of discussions and projects each
                      week.</small
                    ></span
                  >
                  <input
                    v-model="form.notifications.weeklyDigest"
                    class="settings-switch"
                    type="checkbox"
                  />
                </label>
                <label class="toggle-row">
                  <span
                    ><strong>Email alerts</strong
                    ><small
                      >Send enabled notifications to your verified account
                      email.</small
                    ></span
                  >
                  <input
                    v-model="form.notifications.emailAlerts"
                    class="settings-switch"
                    type="checkbox"
                  />
                </label>
              </div>

              <div class="settings-actions">
                <button
                  class="btn-secondary-action"
                  type="button"
                  :disabled="!hasChanges"
                  @click="discardChanges"
                >
                  Discard
                </button>
                <button
                  class="btn-primary-action"
                  type="button"
                  :disabled="!hasChanges"
                  @click="savePreview"
                >
                  <i class="bi bi-check2-circle"></i>
                  {{ saved ? "Saved on device" : "Save notification preview" }}
                </button>
              </div>
            </section>

            <section v-else class="settings-panel">
              <div class="panel-heading">
                <div>
                  <h2>Account Support</h2>
                  <p>
                    Get help with account access or request an account status
                    change.
                  </p>
                </div>
                <span class="backend-badge"
                  ><i class="bi bi-plug"></i> Backend required</span
                >
              </div>

              <div class="account-support-card">
                <span class="support-icon"><i class="bi bi-download"></i></span>
                <div>
                  <strong>Download your data</strong>
                  <small
                    >Request an export of your profile, projects, and forum
                    activity.</small
                  >
                </div>
                <button type="button" disabled>API needed</button>
              </div>
              <div class="account-support-card">
                <span class="support-icon warning"
                  ><i class="bi bi-person-dash"></i
                ></span>
                <div>
                  <strong>Request account deactivation</strong>
                  <small
                    >Send a request to an administrator. Your account is not
                    deleted automatically.</small
                  >
                </div>
                <button type="button" disabled>API needed</button>
              </div>

              <div class="integration-note">
                <i class="bi bi-shield-check"></i>
                <span
                  >Self-service profile deletion stays disabled. Account changes
                  should be reviewed by an administrator.</span
                >
              </div>
            </section>
          </section>
        </div>
      </main>
    </div>
  </div>

  <Footer />
</template>

<style scoped>
.settings-page {
  min-height: 100vh;
}
.settings-page-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 36px 24px 72px;
}
.settings-main {
  min-width: 0;
}
.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 28px 30px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  box-shadow: var(--shadow-sm);
}
.settings-kicker {
  display: block;
  margin-bottom: 8px;
  color: var(--color-blue);
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.settings-header h1 {
  margin: 0;
  color: var(--color-text);
  font-size: clamp(1.95rem, 3vw, 2.35rem);
  font-weight: 800;
  letter-spacing: -0.04em;
}
.settings-header p {
  margin: 8px 0 0;
  color: var(--color-text-muted);
  font-size: 1rem;
}
.role-badge,
.preview-badge,
.backend-badge,
.current-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  flex-shrink: 0;
  padding: 7px 11px;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 800;
  white-space: nowrap;
}
.role-badge,
.preview-badge {
  color: var(--color-blue);
  background: var(--color-blue-light);
}
.backend-badge {
  color: var(--color-warning);
  background: var(--color-warning-light);
}
.current-badge {
  color: var(--color-success);
  background: var(--color-success-light);
}
.settings-content-grid {
  display: grid;
  grid-template-columns: 252px 1fr;
  gap: 24px;
  margin-top: 24px;
}
.settings-section-nav {
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-self: start;
  padding: 10px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  box-shadow: var(--shadow-sm);
}
.settings-section-nav button {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 11px;
  color: var(--color-text-muted);
  background: transparent;
  border: 0;
  border-radius: 10px;
  text-align: left;
  transition: all var(--transition-base);
}
.settings-section-nav button:hover {
  color: var(--color-text);
  background: var(--color-surface-hover);
}
.settings-section-nav button.active {
  color: var(--color-blue);
  background: var(--color-blue-light);
}
.section-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: var(--color-surface-hover);
  font-size: 1rem;
}
.settings-section-nav strong,
.settings-section-nav small {
  display: block;
}
.settings-section-nav strong {
  font-size: 0.9rem;
}
.settings-section-nav small {
  margin-top: 2px;
  color: var(--color-text-muted);
  font-size: 0.72rem;
}
.settings-panel-wrap {
  min-width: 0;
}
.settings-panel {
  padding: 26px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  box-shadow: var(--shadow-sm);
}
.panel-heading,
.settings-actions,
.section-heading,
.security-card,
.session-card,
.account-support-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.panel-heading {
  align-items: flex-start;
  margin-bottom: 22px;
}
.settings-panel h2,
.settings-panel h3 {
  color: var(--color-text);
  font-weight: 800;
}
.settings-panel h2 {
  margin: 0 0 5px;
  font-size: 1.22rem;
}
.settings-panel h3 {
  margin: 0 0 4px;
  font-size: 1rem;
}
.panel-heading p,
.section-heading p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}
.field-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
  margin-bottom: 20px;
}
.field-block {
  display: grid;
  gap: 8px;
  color: var(--color-text);
  font-size: 0.9rem;
  font-weight: 800;
}
.field-block small {
  color: var(--color-text-muted);
  font-size: 0.78rem;
  font-weight: 500;
  line-height: 1.5;
}
.form-select {
  min-height: 44px;
  color: var(--color-text);
  background-color: var(--color-input-bg);
  border: 1px solid var(--color-border);
  border-radius: 9px;
  font-size: 0.92rem;
}
.toggle-list {
  display: grid;
  gap: 11px;
}
.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 14px 15px;
  background: color-mix(in srgb, var(--color-surface-hover) 72%, transparent);
  border: 1px solid var(--color-border);
  border-radius: 10px;
}
.toggle-row strong,
.toggle-row small {
  display: block;
}
.toggle-row strong,
.security-card strong,
.session-card strong,
.account-support-card strong {
  color: var(--color-text);
  font-size: 0.94rem;
}
.toggle-row small,
.security-card small,
.session-card small,
.account-support-card small {
  margin-top: 3px;
  color: var(--color-text-muted);
  font-size: 0.8rem;
}
.settings-switch {
  position: relative;
  flex-shrink: 0;
  width: 46px;
  height: 25px;
  appearance: none;
  cursor: pointer;
  background: rgba(148, 163, 184, 0.28);
  border: 1px solid rgba(148, 163, 184, 0.34);
  border-radius: 999px;
  outline: 0;
  transition: all var(--transition-base);
}
.settings-switch::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;
  width: 19px;
  height: 19px;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.28);
  transition: transform var(--transition-base);
}
.settings-switch:checked {
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--color-blue)
  );
  border-color: var(--color-primary);
}
.settings-switch:checked::after {
  transform: translateX(21px);
}
.settings-switch:focus-visible {
  box-shadow: var(--focus-ring);
}
.integration-note {
  display: flex;
  gap: 10px;
  margin-top: 18px;
  padding: 13px 14px;
  color: var(--color-text-muted);
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  font-size: 0.8rem;
  line-height: 1.5;
}
.integration-note i {
  color: var(--color-blue);
}
.settings-actions {
  justify-content: flex-end;
  margin-top: 20px;
}
.btn-primary-action,
.btn-secondary-action,
.inline-action,
.account-support-card button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 10px 13px;
  border-radius: 8px;
  font-size: 0.84rem;
  font-weight: 800;
  text-decoration: none;
  transition: all var(--transition-base);
}
.btn-primary-action {
  color: #ffffff;
  background: var(--color-blue);
  border: 1px solid var(--color-blue);
}
.btn-secondary-action,
.account-support-card button {
  color: var(--color-text-muted);
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
}
.btn-primary-action:disabled,
.btn-secondary-action:disabled,
.account-support-card button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
.security-card,
.session-card,
.account-support-card {
  padding: 16px;
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: 10px;
}
.security-card > div,
.session-card > div,
.account-support-card > div {
  min-width: 0;
  flex: 1;
}
.security-card strong,
.security-card small,
.session-card strong,
.session-card small,
.account-support-card strong,
.account-support-card small {
  display: block;
}
.security-icon,
.support-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  color: var(--color-blue);
  background: var(--color-blue-light);
  border-radius: 9px;
  font-size: 1.05rem;
}
.security-icon.current {
  color: var(--color-success);
  background: var(--color-success-light);
}
.support-icon.warning {
  color: var(--color-warning);
  background: var(--color-warning-light);
}
.inline-action {
  color: var(--color-blue);
  background: var(--color-blue-light);
  border: 1px solid var(--color-blue-light);
}
.section-heading {
  align-items: flex-end;
  margin: 24px 0 12px;
}
.account-support-card + .account-support-card {
  margin-top: 10px;
}
@media (max-width: 760px) {
  .settings-content-grid {
    grid-template-columns: 1fr;
  }
  .settings-section-nav {
    flex-direction: row;
    overflow-x: auto;
  }
  .settings-section-nav button {
    min-width: 155px;
  }
  .field-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 520px) {
  .settings-page-container {
    padding: 20px 16px 40px;
  }
  .settings-header,
  .panel-heading,
  .section-heading {
    align-items: flex-start;
    flex-direction: column;
  }
  .settings-panel {
    padding: 16px;
  }
  .security-card,
  .session-card,
  .account-support-card {
    align-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
