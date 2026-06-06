<template>
  <AdminPageShell
    title="Admin Profile"
    kicker="Official ANT Staff"
    subtitle="A simple staff profile for the signed-in administrator. System rules, security, and notification controls stay in Admin Settings."
  >

    <section class="admin-profile-page">
      <div class="admin-profile-grid">
        <main class="profile-main-stack">
          <section class="official-admin-card">
            <div class="admin-card-glow"></div>

            <router-link v-if="isOwnProfile" class="card-edit-profile-btn" to="/admin/profile/edit" title="Edit Profile">
              <i class="bi bi-pencil-fill"></i>
              <span>Edit Profile</span>
            </router-link>

            <div class="admin-identity-row">
              <div class="admin-avatar">
                <img v-if="adminAvatar" :src="adminAvatar" :alt="`${adminName} avatar`">
                <span v-else>{{ adminInitials }}</span>
                <span class="verified-mark">
                  <i class="bi bi-patch-check-fill"></i>
                </span>
              </div>

              <div class="admin-intro">
                <div class="badge-row">
                  <span class="official-badge">
                    <i class="bi bi-shield-lock-fill"></i>
                    Official ANT Admin
                  </span>
                </div>

                <h2>{{ adminName }}</h2>
                <p class="admin-role-line">
                  {{ adminRole }} · {{ adminDepartment }}
                </p>
                <p class="admin-summary">
                  {{ adminBio }}
                </p>
              </div>
            </div>
          </section>

          <section class="admin-panel">
            <div class="section-heading">
              <div>
                <span class="section-kicker">Admin Work</span>
                <h3>Current responsibilities</h3>
              </div>
            </div>

            <div class="responsibility-grid">
              <RouterLink
                v-for="item in responsibilityCards"
                :key="item.label"
                :to="item.to"
                :class="['responsibility-card', item.tone]"
              >
                <span class="responsibility-icon">
                  <i :class="['bi', item.icon]"></i>
                </span>
                <div>
                  <strong>{{ item.value }}</strong>
                  <span>{{ item.label }}</span>
                  <small>{{ item.helper }}</small>
                </div>
              </RouterLink>
            </div>
          </section>

          <section class="admin-panel">
            <div class="section-heading">
              <div>
                <span class="section-kicker">Audit Trail</span>
                <h3>Recent admin activity</h3>
              </div>
              <RouterLink class="text-link" to="/admin/analytics">
                View analytics
                <i class="bi bi-arrow-right"></i>
              </RouterLink>
            </div>

            <div v-if="recentActivity.length" class="activity-list">
              <div v-for="item in recentActivity" :key="item.id" class="activity-row">
                <span :class="['activity-icon', item.type]">
                  <i :class="['bi', activityIcon(item.type)]"></i>
                </span>
                <div>
                  <strong>{{ item.action }}</strong>
                  <small>{{ item.target }} · {{ formatActivityDate(item.createdAt) }}</small>
                </div>
              </div>
            </div>

            <div v-else class="empty-state">
              <i class="bi bi-activity"></i>
              <div>
                <strong>No admin activity yet</strong>
                <small>Your moderation, project review, and settings actions will appear here.</small>
              </div>
            </div>
          </section>
        </main>

        <aside class="profile-side-stack">
          <section class="admin-panel official-card">
            <span class="official-seal">
              <i class="bi bi-shield-check"></i>
            </span>
            <h3>ANT Forum Staff</h3>
            <p>This account represents an official administrator, not a student or mentor profile.</p>
            <div class="seal-list">
              <span><i class="bi bi-check2-circle"></i> Can moderate reports</span>
              <span><i class="bi bi-check2-circle"></i> Can review showcase projects</span>
              <span><i class="bi bi-check2-circle"></i> Can manage admin content</span>
            </div>
          </section>

          <section class="admin-panel info-card">
            <div class="section-heading compact">
              <div>
                <span class="section-kicker">Private Info</span>
                <h3>Account details</h3>
              </div>
            </div>

            <div class="info-list">
              <div class="info-row">
                <span>Email</span>
                <strong :title="adminEmail">{{ adminEmail }}</strong>
              </div>
              <div class="info-row">
                <span>Staff ID</span>
                <strong>{{ staffId }}</strong>
              </div>
              <div class="info-row">
                <span>Role</span>
                <strong>{{ adminRole }}</strong>
              </div>
              <div class="info-row">
                <span>Availability</span>
                <strong :title="officeHours">{{ officeHours }}</strong>
              </div>
            </div>
          </section>

          <section class="admin-panel settings-note">
            <div>
              <i class="bi bi-info-circle"></i>
              <strong>Where did settings go?</strong>
            </div>
            <p>Password policy, session timeout, notifications, and moderation rules belong in Admin Settings.</p>
            <RouterLink to="/admin/settings">
              Open settings
              <i class="bi bi-arrow-right"></i>
            </RouterLink>
          </section>
        </aside>
      </div>
    </section>

  </AdminPageShell>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/AuthStore';
import { useAdminOperationsStore } from '../../stores/AdminOperationsStore';
import AdminPageShell from '../../components/admin/AdminPageShell.vue';

const authStore = useAuthStore();
const adminStore = useAdminOperationsStore();
const route = useRoute();

const staffId = ref('ANT-2026-904');

// Checks if the profile belongs to the currently signed-in user
const isOwnProfile = computed(() => {
  const queryUser = route.query.username || route.params.username;
  if (queryUser && queryUser !== authStore.user?.username) {
    return false;
  }
  return true;
});

// Local profile details loaded from localStorage to persist edits across reloads
const isTemporaryAvatarUrl = (value) => typeof value === 'string' && value.includes('blob:');
const usableAvatar = (value) => (value && !isTemporaryAvatarUrl(value) ? value : '');
const profileAvatarFrom = (profile = {}) => (
  usableAvatar(profile.profile_pic) ||
  usableAvatar(profile.avatar) ||
  usableAvatar(profile.avatarUrl)
);

const getStoredProfile = () => {
  try {
    const email = authStore.user?.email || 'admin@antforum.com';
    const storageKey = `ANT_AdminProfile:${email}`;
    const storedProfile = JSON.parse(localStorage.getItem(storageKey)) || {};
    if (isTemporaryAvatarUrl(storedProfile.avatar)) {
      delete storedProfile.avatar;
      localStorage.setItem(storageKey, JSON.stringify(storedProfile));
    }
    return storedProfile;
  } catch {
    return {};
  }
};

const localProfile = ref(getStoredProfile());

watch(() => authStore.user?.email, () => {
  localProfile.value = getStoredProfile();
}, { immediate: true });

const adminName = computed(() => localProfile.value.name || authStore.user?.name || authStore.user?.username || 'ANT Administrator');
const adminEmail = computed(() => authStore.user?.email || 'admin@antforum.com');
const adminDepartment = computed(() => localProfile.value.department || authStore.user?.department || 'Forum Operations');
const adminAvatar = computed(() => (
  usableAvatar(localProfile.value.avatar) ||
  profileAvatarFrom(authStore.user)
));
const officeHours = computed(() => localProfile.value.officeHours || authStore.user?.officeHours || 'Mon - Fri, 8:00 AM - 5:00 PM');
const adminBio = computed(() => {
  return localProfile.value.bio || authStore.user?.bio
    || 'Responsible for keeping ANT Forum safe, organized, and useful for students, mentors, and project reviewers.';
});

const adminRole = computed(() => {
  const role = authStore.user?.role || 'admin';
  return String(role)
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
});

const adminInitials = computed(() => {
  return adminName.value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'AD';
});

// Sync local profile details back to the active user store
const syncToStore = () => {
  if (authStore.user) {
    authStore.user.name = adminName.value;
    authStore.user.bio = adminBio.value;
    authStore.user.department = adminDepartment.value;
    authStore.user.officeHours = officeHours.value;
    authStore.user.avatar = adminAvatar.value;
  }
};

// Sync if authStore.user gets loaded/initialized
watch(() => authStore.user, (newUser) => {
  if (newUser) {
    syncToStore();
  }
}, { immediate: true, deep: true });

// Responsibility cards with correct pluralization based on counts
const responsibilityCards = computed(() => [
  {
    label: adminStore.pendingReports.length === 1 ? 'Pending report' : 'Pending reports',
    value: adminStore.pendingReports.length,
    helper: `${adminStore.highPriorityReports.length} high priority`,
    icon: 'bi-flag',
    tone: 'danger',
    to: '/admin/reports',
  },
  {
    label: adminStore.pendingProjects.length === 1 ? 'Project in review' : 'Projects in review',
    value: adminStore.pendingProjects.length,
    helper: `${adminStore.publishedProjects.length} published`,
    icon: 'bi-folder-check',
    tone: 'warning',
    to: '/admin/projects',
  },
  {
    label: adminStore.lockedThreads.length === 1 ? 'Locked thread' : 'Locked threads',
    value: adminStore.lockedThreads.length,
    helper: 'Moderation state',
    icon: 'bi-lock',
    tone: 'purple',
    to: '/admin/threads',
  },
]);

const recentActivity = computed(() => adminStore.activityLog.slice(0, 4));

const activityIcon = (type) => ({
  moderation: 'bi-shield-check',
  project: 'bi-folder-check',
  settings: 'bi-gear',
  profile: 'bi-person-check',
  security: 'bi-shield-lock',
}[type] || 'bi-activity');

const formatActivityDate = (value) => new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
}).format(new Date(value));
</script>

<style scoped>
.admin-profile-page {
  font-family: var(--font-family-base);
}

.admin-profile-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 1.35rem;
  align-items: start;
}

.profile-main-stack,
.profile-side-stack,
.activity-list,
.info-list,
.seal-list {
  display: grid;
  gap: 1rem;
}

.admin-panel,
.official-admin-card {
  background: color-mix(in srgb, var(--color-surface) 96%, var(--color-primary) 4%);
  border: 1px solid color-mix(in srgb, var(--color-border) 84%, var(--color-primary) 16%);
  border-radius: 18px;
  box-shadow: var(--shadow-sm);
}

.official-admin-card {
  position: relative;
  overflow: hidden;
  padding: 1.45rem;
}

.admin-card-glow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 8% 0%, rgba(99, 102, 241, 0.26), transparent 34%),
    radial-gradient(circle at 100% 12%, rgba(16, 185, 129, 0.13), transparent 28%);
  pointer-events: none;
}

.admin-identity-row,
.badge-row,
.section-heading,
.responsibility-card,
.activity-row,
.settings-link,
.text-link,
.info-row,
.settings-note div,
.settings-note a {
  display: flex;
  align-items: center;
}

.admin-identity-row {
  position: relative;
  z-index: 1;
  gap: 1.2rem;
}

.admin-avatar {
  width: 118px;
  height: 118px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #ffffff;
  background: linear-gradient(135deg, var(--color-primary), var(--color-purple));
  border: 3px solid color-mix(in srgb, var(--color-surface) 82%, #ffffff 18%);
  border-radius: 32px;
  box-shadow: 0 22px 48px -28px var(--color-primary);
  position: relative;
  font-size: 2rem;
  font-weight: 900;
  overflow: visible;
}

.admin-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 29px;
  object-fit: cover;
}

.verified-mark {
  position: absolute;
  right: -5px;
  bottom: -5px;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  background: var(--color-success);
  border: 2px solid var(--color-surface);
  border-radius: 50%;
  font-size: 0.8rem;
}

.admin-intro {
  min-width: 0;
}

.badge-row {
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-bottom: 0.9rem;
}

.official-badge,
.visibility-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.42rem;
  border-radius: var(--radius-pill);
  font-size: 0.78rem;
  font-weight: 900;
  padding: 0.42rem 0.76rem;
}

.official-badge {
  color: #ffffff;
  background: linear-gradient(135deg, var(--color-primary), var(--color-purple));
  box-shadow: 0 10px 28px -20px var(--color-primary);
}

.visibility-badge {
  color: var(--color-text-muted);
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
}

.admin-intro h2 {
  color: var(--color-text);
  font-size: clamp(1.75rem, 2.4vw, 2.45rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  margin: 0 0 0.35rem;
}

.admin-role-line {
  color: var(--color-primary);
  font-weight: 900;
  margin: 0 0 0.75rem;
}

.admin-summary {
  max-width: 760px;
  color: var(--color-text-muted);
  font-size: 0.98rem;
  line-height: 1.65;
  margin: 0;
}

.admin-panel {
  padding: 1.25rem;
}

.section-heading {
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.section-heading.compact {
  margin-bottom: 0.8rem;
}

.section-kicker {
  display: inline-block;
  color: var(--color-primary);
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

.section-heading h3,
.official-card h3 {
  color: var(--color-text);
  font-size: 1.25rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  margin: 0;
}

.responsibility-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
}

.responsibility-card {
  min-height: 132px;
  display: block;
  position: relative;
  color: var(--color-text);
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 1.1rem 5rem 1.1rem 1.15rem;
  text-decoration: none;
  transition: transform var(--transition-base), border-color var(--transition-base), box-shadow var(--transition-base);
}

.responsibility-card:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--color-primary) 48%, transparent);
  box-shadow: var(--shadow-sm);
}

.responsibility-icon,
.activity-icon,
.official-seal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 16px;
}

.responsibility-icon i,
.activity-icon i,
.official-seal i {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.responsibility-icon {
  position: absolute;
  top: 1.05rem;
  right: 1.05rem;
  width: 52px;
  height: 52px;
  font-size: 1.5rem;
}

.responsibility-card.danger .responsibility-icon {
  color: var(--color-danger);
  background: var(--color-danger-light);
}

.responsibility-card.warning .responsibility-icon {
  color: var(--color-warning);
  background: var(--color-warning-light);
}

.responsibility-card.purple .responsibility-icon {
  color: var(--color-purple);
  background: var(--color-purple-light);
}

.responsibility-card strong,
.responsibility-card span,
.responsibility-card small,
.activity-row strong,
.activity-row small,
.info-row span,
.info-row strong,
.official-card p,
.settings-note p {
  display: block;
}

.responsibility-card strong {
  color: var(--color-text);
  font-size: clamp(1.6rem, 2vw, 2rem);
  font-weight: 900;
  line-height: 1;
  margin: 0.15rem 0 0.75rem;
}

.responsibility-card span {
  color: var(--color-text);
  font-size: 0.9rem;
  font-weight: 900;
  line-height: 1.25;
}

.responsibility-card small,
.activity-row small,
.info-row span,
.official-card p,
.settings-note p {
  color: var(--color-text-muted);
}

.responsibility-card small {
  font-size: 0.82rem;
  line-height: 1.35;
  margin-top: 0.35rem;
}

.activity-row {
  gap: 0.8rem;
  padding: 0.85rem;
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: 15px;
}

.activity-icon {
  width: 42px;
  height: 42px;
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.activity-icon.project {
  color: var(--color-success);
  background: var(--color-success-light);
}

.activity-icon.settings,
.activity-icon.moderation {
  color: var(--color-warning);
  background: var(--color-warning-light);
}

.activity-icon.security {
  color: var(--color-danger);
  background: var(--color-danger-light);
}

.activity-row strong,
.info-row strong {
  color: var(--color-text);
  font-weight: 900;
}

.text-link,
.settings-link,
.settings-note a {
  gap: 0.4rem;
  color: var(--color-primary);
  font-weight: 900;
  text-decoration: none;
}

.settings-link {
  padding: 0.55rem 0.8rem;
  background: var(--color-primary-light);
  border: 1px solid color-mix(in srgb, var(--color-primary) 32%, transparent);
  border-radius: var(--radius-pill);
  transition: all var(--transition-base);
}

.settings-link:hover {
  background: color-mix(in srgb, var(--color-primary) 20%, transparent);
  transform: translateY(-1px);
}

.card-edit-profile-btn {
  position: absolute;
  top: 1.45rem;
  right: 1.45rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.8rem;
  color: var(--color-text-muted);
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
  z-index: 2;
  transition: all var(--transition-base);
}

.card-edit-profile-btn:hover {
  color: #ffffff;
  background: var(--color-purple);
  border-color: var(--color-purple);
  transform: translateY(-1px);
}

.official-card {
  text-align: center;
}

.official-seal {
  width: 58px;
  height: 58px;
  color: #ffffff;
  background: linear-gradient(135deg, var(--color-primary), var(--color-purple));
  font-size: 1.5rem;
  margin: 0 auto 0.85rem;
}

.official-card h3 {
  margin-bottom: 0.45rem;
}

.seal-list {
  text-align: left;
  margin-top: 1rem;
}

.seal-list span {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  color: var(--color-text);
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 0.72rem;
  font-size: 0.86rem;
  font-weight: 800;
}

.seal-list i {
  color: var(--color-success);
}

.info-row {
  justify-content: space-between;
  gap: 1rem;
  padding: 0.78rem 0;
  border-bottom: 1px solid var(--color-border);
}

.info-row:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.info-row span {
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-row strong {
  max-width: 245px;
  text-align: right;
  word-break: break-all;
  overflow-wrap: anywhere;
}

.settings-note div {
  gap: 0.55rem;
  color: var(--color-text);
  font-weight: 900;
}

.settings-note div i {
  color: var(--color-primary);
}

.settings-note p {
  margin: 0.65rem 0 0.9rem;
  line-height: 1.55;
}

.empty-state {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  min-height: 110px;
  color: var(--color-text-muted);
  background: var(--color-surface-hover);
  border: 1px dashed var(--color-border);
  border-radius: 15px;
  padding: 1rem;
}

.empty-state i {
  color: var(--color-primary);
  font-size: 1.4rem;
}

.empty-state strong,
.empty-state small {
  display: block;
}

.empty-state strong {
  color: var(--color-text);
}

@media (max-width: 1199.98px) {
  .admin-profile-grid {
    grid-template-columns: 1fr;
  }

  .profile-side-stack {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 991.98px) {
  .admin-identity-row,
  .section-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .responsibility-grid,
  .profile-side-stack {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 575.98px) {
  .official-admin-card,
  .admin-panel {
    padding: 1rem;
  }

  .admin-avatar {
    width: 96px;
    height: 96px;
    border-radius: 26px;
  }

  .admin-avatar img {
    border-radius: 23px;
  }

  .responsibility-card,
  .info-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .responsibility-card {
    padding-right: 1.15rem;
  }

  .responsibility-icon {
    position: static;
    margin-bottom: 0.85rem;
  }

  .info-row strong {
    max-width: none;
    text-align: left;
  }

  .card-edit-profile-btn {
    position: static;
    margin-top: 1.25rem;
    align-self: flex-start;
  }
}

</style>
