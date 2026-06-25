<template>
  <AdminPageShell
    title="Settings"
    kicker="System Settings"
    subtitle="Configure forum defaults and moderation behavior. Changes are saved locally until the settings endpoint is ready."
    :metrics="metrics"
  >
    <nav class="settings-tabs" aria-label="Settings sections">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <i :class="['bi', tab.icon]"></i>
        <span>
          <strong>{{ tab.label }}</strong>
          <small>{{ tab.description }}</small>
        </span>
      </button>
    </nav>

    <div :class="['settings-state', { dirty: hasChanges }]">
      <i
        :class="['bi', hasChanges ? 'bi-pencil-square' : 'bi-check2-circle']"
      ></i>
      <span>{{
        hasChanges
          ? "You have unsaved changes."
          : "All settings are up to date."
      }}</span>
    </div>

    <section class="settings-tab-content">
      <form
        v-if="activeTab === 'general'"
        class="admin-panel clean-form"
        @submit.prevent="save"
      >
        <div class="panel-heading">
          <div>
            <h2>General Settings</h2>
            <p>Shared values used across the forum experience.</p>
          </div>
          <span class="storage-badge"
            ><i class="bi bi-device-ssd"></i> Local preview</span
          >
        </div>

        <div class="field-block">
          <label for="forum-name">Forum Name</label>
          <input
            id="forum-name"
            v-model.trim="form.forumName"
            class="form-control"
            type="text"
            required
          />
        </div>

        <div class="field-block">
          <label for="support-email">Support Email</label>
          <input
            id="support-email"
            v-model.trim="form.supportEmail"
            class="form-control"
            type="email"
            required
          />
        </div>

        <div class="field-block">
          <label for="reply-window">Default Reply Window</label>
          <input
            id="reply-window"
            v-model.trim="form.replyWindow"
            class="form-control"
            type="text"
            placeholder="48 hours"
            required
          />
        </div>

        <div class="settings-actions">
          <button
            class="btn btn-light border"
            type="button"
            :disabled="!hasChanges"
            @click="resetForm"
          >
            Discard Changes
          </button>
          <button
            class="btn btn-primary settings-save"
            type="submit"
            :disabled="!hasChanges"
          >
            <i class="bi bi-check2"></i>
            <span>{{ saved ? "Saved Locally" : "Save Settings" }}</span>
          </button>
        </div>
      </form>

      <section v-else-if="activeTab === 'moderation'" class="admin-panel">
        <div class="panel-heading">
          <div>
            <h2>Moderation Controls</h2>
            <p>Set report handling rules and moderator permissions.</p>
          </div>
        </div>
        <div class="toggle-list">
          <label class="toggle-row">
            <span
              ><strong>Require review for first post</strong
              ><small>New users need moderator approval once.</small></span
            >
            <input
              v-model="form.requireFirstPostReview"
              class="settings-switch"
              type="checkbox"
            />
          </label>
          <label class="toggle-row">
            <span
              ><strong>Allow project showcase submissions</strong
              ><small>Students can submit portfolio projects.</small></span
            >
            <input
              v-model="form.allowProjectSubmissions"
              class="settings-switch"
              type="checkbox"
            />
          </label>
          <label class="toggle-row">
            <span
              ><strong>Require report decision notes</strong
              ><small
                >Admins must explain why a case was resolved or
                dismissed.</small
              ></span
            >
            <input
              v-model="form.moderation.requireDecisionNotes"
              class="settings-switch"
              type="checkbox"
            />
          </label>
          <label class="toggle-row">
            <span
              ><strong>Allow moderator warnings</strong
              ><small
                >Moderators can send warnings to members after reviewing a
                report.</small
              ></span
            >
            <input
              v-model="form.moderation.allowModeratorWarnings"
              class="settings-switch"
              type="checkbox"
            />
          </label>
          <label class="toggle-row">
            <span
              ><strong>Allow moderator suspensions</strong
              ><small
                >Moderators can temporarily suspend accounts without admin
                approval.</small
              ></span
            >
            <input
              v-model="form.moderation.allowModeratorSuspensions"
              class="settings-switch"
              type="checkbox"
            />
          </label>
        </div>

        <div class="form-row settings-field-row">
          <div class="field-block">
            <label for="lock-threshold">Auto-lock Report Threshold</label>
            <input
              id="lock-threshold"
              v-model.number="form.autoLockReportThreshold"
              class="form-control"
              type="number"
              min="1"
              max="20"
              required
            />
          </div>
          <div class="field-block">
            <label for="suspension-days">Default Suspension Duration</label>
            <select
              id="suspension-days"
              v-model.number="form.moderation.defaultSuspensionDays"
              class="form-select"
            >
              <option :value="1">1 day</option>
              <option :value="7">7 days</option>
              <option :value="30">30 days</option>
            </select>
          </div>
        </div>

        <div class="settings-actions">
          <button
            class="btn btn-light border"
            type="button"
            :disabled="!hasChanges"
            @click="resetForm"
          >
            Discard Changes
          </button>
          <button
            class="btn btn-primary settings-save"
            type="button"
            :disabled="!hasChanges"
            @click="save"
          >
            <i class="bi bi-check2-circle"></i>
            <span>{{
              saved ? "Saved Locally" : "Save Moderation Controls"
            }}</span>
          </button>
        </div>
      </section>

      <section v-else-if="activeTab === 'content'" class="admin-panel">
        <div class="panel-heading">
          <div>
            <h2>Content Rules</h2>
            <p>Define post limits and lightweight anti-spam guardrails.</p>
          </div>
        </div>

        <div class="form-row settings-field-row">
          <div class="field-block">
            <label for="title-length">Maximum Title Length</label>
            <input
              id="title-length"
              v-model.number="form.contentRules.maxTitleLength"
              class="form-control"
              type="number"
              min="40"
              max="300"
            />
          </div>
          <div class="field-block">
            <label for="post-length">Maximum Post Length</label>
            <input
              id="post-length"
              v-model.number="form.contentRules.maxPostLength"
              class="form-control"
              type="number"
              min="500"
              max="50000"
            />
          </div>
          <div class="field-block">
            <label for="upload-size">Maximum Upload Size</label>
            <div class="input-group">
              <input
                id="upload-size"
                v-model.number="form.contentRules.maxUploadMb"
                class="form-control"
                type="number"
                min="1"
                max="50"
              />
              <span class="input-group-text">MB</span>
            </div>
          </div>
        </div>

        <div class="field-block keyword-field">
          <label for="blocked-keywords">Blocked Spam Keywords</label>
          <textarea
            id="blocked-keywords"
            v-model.trim="form.contentRules.blockedKeywords"
            class="form-control"
            rows="3"
            placeholder="spam, scam, phishing"
          ></textarea>
          <small
            >Separate words or phrases with commas. Backend enforcement can use
            this list later.</small
          >
        </div>

        <div class="toggle-list">
          <label class="toggle-row">
            <span
              ><strong>Allow links from new accounts</strong
              ><small
                >Let new members include external links before their first
                approved post.</small
              ></span
            >
            <input
              v-model="form.contentRules.allowNewUserLinks"
              class="settings-switch"
              type="checkbox"
            />
          </label>
          <label class="toggle-row">
            <span
              ><strong>Auto-hide heavily reported content</strong
              ><small
                >Temporarily hide content when it reaches the report
                threshold.</small
              ></span
            >
            <input
              v-model="form.contentRules.autoHideReportedContent"
              class="settings-switch"
              type="checkbox"
            />
          </label>
        </div>

        <div class="settings-actions">
          <button
            class="btn btn-light border"
            type="button"
            :disabled="!hasChanges"
            @click="resetForm"
          >
            Discard Changes
          </button>
          <button
            class="btn btn-primary settings-save"
            type="button"
            :disabled="!hasChanges"
            @click="save"
          >
            <i class="bi bi-check2-circle"></i>
            <span>{{ saved ? "Saved Locally" : "Save Content Rules" }}</span>
          </button>
        </div>
      </section>

      <section v-else-if="activeTab === 'notifications'" class="admin-panel">
        <div class="panel-heading">
          <div>
            <h2>Notification Preferences</h2>
            <p>Choose which operational alerts should reach the admin team.</p>
          </div>
          <span class="storage-badge"
            ><i class="bi bi-bell"></i> Admin alerts</span
          >
        </div>

        <div class="notification-list">
          <label class="notification-row">
            <span class="notification-icon blue"
              ><i class="bi bi-person-plus-fill"></i
            ></span>
            <span class="notification-copy">
              <strong>New Student Registration Alerts</strong>
              <small
                >Send a notification when a new student completes account
                verification.</small
              >
            </span>
            <input
              v-model="form.notificationPreferences.studentRegistrations"
              class="settings-switch"
              type="checkbox"
            />
          </label>
          <label class="notification-row">
            <span class="notification-icon green"
              ><i class="bi bi-folder-symlink-fill"></i
            ></span>
            <span class="notification-copy">
              <strong>Student Project Review Requests</strong>
              <small
                >Notify immediately when a student submits a showcase project
                for approval.</small
              >
            </span>
            <input
              v-model="form.notificationPreferences.projectReviews"
              class="settings-switch"
              type="checkbox"
            />
          </label>
          <label class="notification-row">
            <span class="notification-icon red"
              ><i class="bi bi-exclamation-octagon-fill"></i
            ></span>
            <span class="notification-copy">
              <strong>Reported Posts & Threads Alerts</strong>
              <small
                >Receive an alert when a discussion is reported for violating
                guidelines.</small
              >
            </span>
            <input
              v-model="form.notificationPreferences.moderationReports"
              class="settings-switch"
              type="checkbox"
            />
          </label>
          <label class="notification-row">
            <span class="notification-icon cyan"
              ><i class="bi bi-envelope-paper-fill"></i
            ></span>
            <span class="notification-copy">
              <strong>Weekly Forum Summaries</strong>
              <small
                >Receive a weekly operations summary with engagement statistics
                and pending actions.</small
              >
            </span>
            <input
              v-model="form.notificationPreferences.weeklyDigest"
              class="settings-switch"
              type="checkbox"
            />
          </label>
        </div>

        <div class="settings-actions">
          <button
            class="btn btn-light border"
            type="button"
            :disabled="!hasChanges"
            @click="resetForm"
          >
            Discard Changes
          </button>
          <button
            class="btn btn-primary settings-save"
            type="button"
            :disabled="!hasChanges"
            @click="save"
          >
            <i class="bi bi-check2-circle"></i>
            <span>{{
              saved ? "Saved Locally" : "Save Alert Preferences"
            }}</span>
          </button>
        </div>
      </section>

      <section v-else class="admin-panel">
        <div class="panel-heading">
          <div>
            <h2>Security Settings</h2>
            <p>
              Configure admin authentication and session protection defaults.
            </p>
          </div>
          <span class="storage-badge"
            ><i class="bi bi-shield-lock"></i> Admin access</span
          >
        </div>

        <div class="toggle-list">
          <label class="toggle-row">
            <span
              ><strong>Require strong passwords</strong
              ><small
                >Admin passwords must include mixed case, numbers, and special
                characters.</small
              ></span
            >
            <input
              v-model="form.security.requireStrongPasswords"
              class="settings-switch"
              type="checkbox"
            />
          </label>
          <label class="toggle-row">
            <span
              ><strong>Require admin two-factor authentication</strong
              ><small
                >Require an additional verification step when administrators
                sign in.</small
              ></span
            >
            <input
              v-model="form.security.requireAdminTwoFactor"
              class="settings-switch"
              type="checkbox"
            />
          </label>
        </div>

        <div class="form-row settings-field-row">
          <div class="field-block">
            <label for="session-timeout">Session Timeout</label>
            <select
              id="session-timeout"
              v-model.number="form.security.sessionTimeoutMinutes"
              class="form-select"
            >
              <option :value="30">30 minutes</option>
              <option :value="60">1 hour</option>
              <option :value="240">4 hours</option>
              <option :value="480">8 hours</option>
            </select>
          </div>
          <div class="field-block">
            <label for="login-limit">Login Attempt Limit</label>
            <input
              id="login-limit"
              v-model.number="form.security.loginAttemptLimit"
              class="form-control"
              type="number"
              min="3"
              max="10"
            />
          </div>
        </div>

        <div class="settings-actions">
          <button
            class="btn btn-light border"
            type="button"
            :disabled="!hasChanges"
            @click="resetForm"
          >
            Discard Changes
          </button>
          <button
            class="btn btn-primary settings-save"
            type="button"
            :disabled="!hasChanges"
            @click="save"
          >
            <i class="bi bi-check2-circle"></i>
            <span>{{
              saved ? "Saved Locally" : "Save Security Settings"
            }}</span>
          </button>
        </div>
      </section>
    </section>
  </AdminPageShell>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import AdminPageShell from "../../components/admin/AdminPageShell.vue";
import { useToast } from "../../composables/useToast";
import { useUnsavedChangesGuard } from "../../composables/useUnsavedChangesGuard";
import { useAdminOperationsStore } from "../../stores/AdminOperationsStore";

const adminStore = useAdminOperationsStore();
const toast = useToast();
const saved = ref(false);
const activeTab = ref("general");
const cloneSettings = () => JSON.parse(JSON.stringify(adminStore.settings));
const form = reactive(cloneSettings());
const tabs = [
  {
    id: "general",
    label: "General",
    description: "Forum identity and defaults",
    icon: "bi-sliders",
  },
  {
    id: "moderation",
    label: "Moderation",
    description: "Reports and permissions",
    icon: "bi-shield-check",
  },
  {
    id: "content",
    label: "Content Rules",
    description: "Limits and spam controls",
    icon: "bi-file-earmark-text",
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Operational alert preferences",
    icon: "bi-bell",
  },
  {
    id: "security",
    label: "Security",
    description: "Admin access protection",
    icon: "bi-shield-lock",
  },
];

const metrics = computed(() => [
  {
    label: "Storage",
    value: "Local",
    change: "API-ready preview",
    icon: "bi-device-ssd",
    className: "green",
  },
  {
    label: "First Post Review",
    value: form.requireFirstPostReview ? "On" : "Off",
    change: "New member guardrail",
    icon: "bi-shield-check",
    className: "blue",
  },
  {
    label: "Auto-lock",
    value: `${form.autoLockReportThreshold}+`,
    change: "Reports per thread",
    icon: "bi-lock",
    className: "blue",
  },
  {
    label: "Admin 2FA",
    value: form.security.requireAdminTwoFactor ? "On" : "Off",
    change: "Login protection",
    icon: "bi-shield-lock",
    className: "orange",
  },
]);
const hasChanges = computed(
  () => JSON.stringify(form) !== JSON.stringify(adminStore.settings),
);
useUnsavedChangesGuard(
  hasChanges,
  "You have unsaved settings changes. Leave this page and discard them?",
);

const resetForm = () => {
  Object.assign(form, cloneSettings());
  saved.value = false;
  toast.info("Unsaved changes discarded.");
};
const save = () => {
  if (!hasChanges.value) return;
  adminStore.saveSettings(form);
  saved.value = true;
  toast.success("Settings saved locally for frontend preview.");
  window.setTimeout(() => {
    saved.value = false;
  }, 2200);
};
</script>

<style scoped>
.settings-tabs {
  display: flex;
  gap: 0.3rem;
  padding: 0.3rem;
  margin-bottom: 0.75rem;
  overflow-x: auto;
  background: color-mix(in srgb, var(--color-surface) 92%, transparent);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  box-shadow: var(--shadow-sm);
}
.settings-tabs button {
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  color: var(--color-text-muted);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 7px;
  text-align: left;
  white-space: nowrap;
  transition: all var(--transition-base);
}
.settings-tabs button:hover {
  color: var(--color-text);
  background: color-mix(in srgb, var(--color-surface-hover) 76%, transparent);
}
.settings-tabs button.active {
  color: #a5b4fc;
  background: rgba(84, 131, 179, 0.12);
  border-color: rgba(129, 140, 248, 0.42);
  box-shadow: inset 0 0 0 1px rgba(84, 131, 179, 0.08);
}
.settings-tabs i {
  font-size: 1rem;
}
.settings-tabs span,
.settings-tabs strong,
.settings-tabs small {
  display: block;
}
.settings-tabs strong {
  font-size: 0.82rem;
}
.settings-tabs small {
  display: none;
}
.settings-state {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
  color: var(--color-success);
  font-size: 0.78rem;
  font-weight: 700;
}
.settings-state.dirty {
  color: var(--color-warning);
}
.settings-tab-content {
  width: 100%;
}
:deep(.metric-tile) {
  background: color-mix(
    in srgb,
    var(--color-surface) 94%,
    var(--color-primary) 6%
  );
  border-color: color-mix(
    in srgb,
    var(--color-border) 84%,
    var(--color-primary) 16%
  );
}
:deep(.metric-icon) {
  border: 1px solid rgba(148, 163, 184, 0.08);
}
:deep(.metric-icon.green) {
  background: rgba(16, 185, 129, 0.12);
}
:deep(.metric-icon.blue) {
  background: rgba(84, 131, 179, 0.13);
}
:deep(.metric-icon.blue) {
  background: rgba(14, 165, 233, 0.12);
}
:deep(.metric-icon.orange) {
  background: rgba(245, 158, 11, 0.12);
}
.admin-panel {
  padding: 1.25rem;
  background: color-mix(
    in srgb,
    var(--color-surface) 96%,
    var(--color-primary) 4%
  );
  border: 1px solid
    color-mix(in srgb, var(--color-border) 86%, var(--color-primary) 14%);
  border-radius: 10px;
  box-shadow: var(--shadow-sm);
}
.panel-heading,
.settings-actions,
.form-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}
.panel-heading {
  align-items: flex-start;
  margin-bottom: 1rem;
}
.admin-panel h2 {
  color: var(--color-text);
  font-size: 1rem;
  font-weight: 800;
  margin: 0 0 0.25rem;
}
.panel-heading p {
  color: var(--color-text-muted);
  font-size: 0.84rem;
  margin: 0;
}
.storage-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.55rem;
  color: var(--color-primary);
  background: var(--color-primary-light);
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
  white-space: nowrap;
}
.clean-form,
.field-block,
.toggle-list {
  display: grid;
  gap: 1rem;
}
.form-row > * {
  flex: 1;
}
.settings-field-row {
  margin: 1rem 0;
}
.field-block label {
  color: var(--color-text);
  font-size: 0.82rem;
  font-weight: 800;
}
.keyword-field {
  margin: 1rem 0;
}
.keyword-field small {
  color: var(--color-text-muted);
  font-size: 0.76rem;
}
.settings-actions {
  justify-content: flex-end;
  align-items: center;
  padding-top: 0.25rem;
}
.settings-save {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}
.settings-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem;
  background: color-mix(in srgb, var(--color-surface-hover) 72%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-border) 85%, transparent);
  border-radius: 9px;
  transition:
    border-color var(--transition-base),
    background-color var(--transition-base);
}
.toggle-row:hover {
  background: color-mix(in srgb, var(--color-surface-hover) 92%, transparent);
  border-color: rgba(84, 131, 179, 0.28);
}
.toggle-row strong,
.toggle-row small {
  display: block;
}
.toggle-row small {
  color: var(--color-text-muted);
}
.notification-list {
  display: grid;
  gap: 0.75rem;
}
.notification-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 1rem;
  background: color-mix(in srgb, var(--color-surface-hover) 72%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-border) 85%, transparent);
  border-radius: 10px;
  transition:
    border-color var(--transition-base),
    background-color var(--transition-base);
}
.notification-row:hover {
  background: color-mix(in srgb, var(--color-surface-hover) 92%, transparent);
  border-color: rgba(84, 131, 179, 0.28);
}
.notification-icon {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 8px;
  font-size: 1.1rem;
}
.notification-icon.blue {
  color: var(--color-info);
  background: var(--color-info-light);
}
.notification-icon.green {
  color: var(--color-success);
  background: var(--color-success-light);
}
.notification-icon.red {
  color: var(--color-danger);
  background: var(--color-danger-light);
}
.notification-icon.cyan {
  color: var(--color-primary);
  background: var(--color-primary-light);
}
.notification-copy {
  min-width: 0;
  flex: 1;
}
.notification-copy strong,
.notification-copy small {
  display: block;
}
.notification-copy strong {
  color: var(--color-text);
  font-size: 0.88rem;
}
.notification-copy small {
  color: var(--color-text-muted);
  font-size: 0.78rem;
}
.settings-switch {
  width: 44px;
  height: 24px;
  position: relative;
  flex-shrink: 0;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  background: rgba(148, 163, 184, 0.28);
  border: 1px solid rgba(148, 163, 184, 0.34);
  border-radius: 999px;
  outline: 0;
  transition:
    background-color var(--transition-base),
    border-color var(--transition-base),
    box-shadow var(--transition-base);
}
.settings-switch::after {
  content: "";
  width: 18px;
  height: 18px;
  position: absolute;
  top: 2px;
  left: 2px;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.28);
  transition: transform var(--transition-base);
}
.settings-switch:hover {
  border-color: rgba(129, 140, 248, 0.62);
}
.settings-switch:focus-visible {
  box-shadow: var(--focus-ring);
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
  transform: translateX(20px);
}
@media (max-width: 575.98px) {
  .form-row {
    flex-direction: column;
  }
}
</style>
