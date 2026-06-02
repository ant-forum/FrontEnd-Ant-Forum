<template>
  <AdminPageShell
    title="Profile & Preferences"
    kicker="Administrative Account"
    subtitle="Manage your staff profile details, operational role, and system notification preferences."
  >
    <section class="school-admin-profile">
      <div class="row g-4">
        
        <!-- Left Side: Profile Card -->
        <aside class="col-xl-4 col-lg-5 col-md-12">
          <!-- Institutional Admin Info Card -->
          <div class="admin-card-academic mb-0">
            <div class="card-academic-header"></div>
            
            <div class="card-academic-body text-center">
              <div class="avatar-academic-container mb-3">
                <img v-if="adminAvatar" :src="adminAvatar" class="avatar-img" alt="Admin Avatar">
                <div v-else class="avatar-placeholder">
                  <span>{{ adminInitials }}</span>
                </div>
              </div>

              <h3 class="admin-full-name mb-1">{{ adminName }}</h3>
              <p class="admin-role-badge mb-2">{{ adminRole }}</p>
              <p class="admin-dept-text text-muted mb-4">
                <i class="bi bi-building-fill me-1"></i>
                {{ adminDepartment }}
              </p>

              <hr class="card-divider">

              <!-- Quick Info List -->
              <div class="quick-info-list text-start">
                <div class="info-item mb-2">
                  <span class="info-label"><i class="bi bi-envelope me-2"></i>Email</span>
                  <span class="info-val text-truncate">{{ adminEmail }}</span>
                </div>
                <div class="info-item mb-2">
                  <span class="info-label"><i class="bi bi-hash me-2"></i>Staff ID</span>
                  <span class="info-val">{{ staffId }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label"><i class="bi bi-clock me-2"></i>Office Hours</span>
                  <span class="info-val text-wrap">{{ officeHours }}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- Right Side: Stats Panel & Profile Forms -->
        <main class="col-xl-8 col-lg-7 col-md-12">
          <!-- Academic Moderation Stats (Operational Activity) -->
          <div class="admin-panel stats-panel mb-4">
            <h4 class="panel-section-title mb-3">Operational Activity</h4>
            <div class="row g-3">
              <div class="col-md-3 col-sm-6">
                <div class="academic-stat-box text-center p-3">
                  <i class="bi bi-people-fill text-primary mb-2 fs-4"></i>
                  <div class="stat-number">182</div>
                  <small class="text-muted">Users Verified</small>
                </div>
              </div>
              <div class="col-md-3 col-sm-6">
                <div class="academic-stat-box text-center p-3">
                  <i class="bi bi-folder-check text-success mb-2 fs-4"></i>
                  <div class="stat-number">48</div>
                  <small class="text-muted">Projects Approved</small>
                </div>
              </div>
              <div class="col-md-3 col-sm-6">
                <div class="academic-stat-box text-center p-3">
                  <i class="bi bi-shield-exclamation text-danger mb-2 fs-4"></i>
                  <div class="stat-number">14</div>
                  <small class="text-muted">Reports Solved</small>
                </div>
              </div>
              <div class="col-md-3 col-sm-6">
                <div class="academic-stat-box text-center p-3">
                  <i class="bi bi-newspaper text-info mb-2 fs-4"></i>
                  <div class="stat-number">32</div>
                  <small class="text-muted">Blogs Posted</small>
                </div>
              </div>
            </div>
          </div>

          <div class="admin-panel main-profile-panel">
            <!-- Tabs Menu -->
            <div class="profile-tabs mb-4">
              <button 
                class="profile-tab-btn" 
                :class="{ active: activeTab === 'credentials' }"
                @click="activeTab = 'credentials'"
              >
                <i class="bi bi-person-vcard me-2"></i>
                <span>Staff Profile</span>
              </button>
              
              <button 
                class="profile-tab-btn" 
                :class="{ active: activeTab === 'security' }"
                @click="activeTab = 'security'"
              >
                <i class="bi bi-shield-lock me-2"></i>
                <span>Security & Password</span>
              </button>
            </div>

            <!-- Tab 1: Staff Credentials Details -->
            <div v-if="activeTab === 'credentials'" class="profile-tab-pane fade-in-panel">
              <form class="clean-form" @submit.prevent="saveProfile">
                <h4 class="form-section-title">Personal Profile Information</h4>
                <p class="panel-subtitle mb-4">Manage details displayed on your institutional administrative profile card.</p>
                
                <div class="row g-3">
                  <div class="col-md-6">
                    <div class="field-block">
                      <label>Full Administrative Name</label>
                      <input 
                        type="text" 
                        class="form-control premium-input" 
                        v-model="editForm.name" 
                        placeholder="Alex Rivera"
                        required
                      >
                    </div>
                  </div>
                  
                  <div class="col-md-6">
                    <div class="field-block">
                      <label>Operational Email Address</label>
                      <input 
                        type="email" 
                        class="form-control premium-input" 
                        v-model="editForm.email" 
                        placeholder="admin@ant.dev"
                        required
                      >
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="field-block">
                      <label>Department / Office</label>
                      <input 
                        type="text" 
                        class="form-control premium-input" 
                        v-model="editForm.department" 
                        placeholder="Student Affairs & Operations"
                        required
                      >
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="field-block">
                      <label>Administrative Role</label>
                      <select class="form-control premium-input form-select" v-model="editForm.role">
                        <option value="admin">Admin</option>
                        <option value="super admin">Super Admin</option>
                        <option value="moderator">Moderator</option>
                        <option value="dean of students">Dean of Students</option>
                        <option value="academic coordinator">Academic Coordinator</option>
                      </select>
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="field-block">
                      <label>Office Telephone Contact</label>
                      <input 
                        type="text" 
                        class="form-control premium-input" 
                        v-model="editForm.phone" 
                        placeholder="+855 12 345 678"
                      >
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="field-block">
                      <label>Office Hours Availability</label>
                      <input 
                        type="text" 
                        class="form-control premium-input" 
                        v-model="editForm.officeHours" 
                        placeholder="Mon - Fri, 8:00 AM - 5:00 PM"
                      >
                    </div>
                  </div>

                  <div class="col-12">
                    <div class="field-block">
                      <label>Administrative Short Bio / Description</label>
                      <textarea 
                        class="form-control premium-input" 
                        v-model="editForm.bio" 
                        rows="3" 
                        placeholder="Briefly state your duties, courses monitored, or roles in managing the forum..."
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div class="form-actions mt-4 pt-3 d-flex justify-content-end gap-2">
                  <button 
                    type="button" 
                    class="btn btn-secondary-premium" 
                    @click="resetForm"
                  >
                    Discard Changes
                  </button>
                  <button 
                    type="submit" 
                    class="btn btn-primary-premium"
                    :disabled="isProfileSaving"
                  >
                    <i class="bi bi-check2-circle me-2" v-if="!isProfileSaving"></i>
                    <span class="spinner-border spinner-border-sm me-2" v-else></span>
                    <span>{{ isProfileSaving ? 'Saving Changes...' : 'Save Profile Details' }}</span>
                  </button>
                </div>
              </form>
            </div>

            <!-- Tab 2: Security & Password -->
            <div v-else-if="activeTab === 'security'" class="profile-tab-pane fade-in-panel">
              <form class="clean-form" @submit.prevent="savePassword">
                <h4 class="form-section-title">Change Account Password</h4>
                <p class="panel-subtitle mb-4">Ensure your administrative privileges stay secure by regularly updating your credentials.</p>
                
                <div class="row g-3">
                  <div class="col-md-12">
                    <div class="field-block">
                      <label>Current Administrative Password</label>
                      <input 
                        type="password" 
                        class="form-control premium-input" 
                        v-model="passwordForm.current" 
                        placeholder="••••••••"
                        required
                      >
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="field-block">
                      <label>New Operational Password</label>
                      <input 
                        type="password" 
                        class="form-control premium-input" 
                        v-model="passwordForm.new" 
                        placeholder="••••••••"
                        required
                      >
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="field-block">
                      <label>Confirm New Password</label>
                      <input 
                        type="password" 
                        class="form-control premium-input" 
                        v-model="passwordForm.confirm" 
                        placeholder="••••••••"
                        required
                      >
                    </div>
                  </div>
                </div>

                <div class="form-actions mt-4 pt-3 d-flex justify-content-end gap-2">
                  <button 
                    type="button" 
                    class="btn btn-secondary-premium" 
                    @click="clearPasswordForm"
                  >
                    Clear Fields
                  </button>
                  <button 
                    type="submit" 
                    class="btn btn-primary-premium"
                    :disabled="isPasswordSaving"
                  >
                    <i class="bi bi-shield-check me-2" v-if="!isPasswordSaving"></i>
                    <span class="spinner-border spinner-border-sm me-2" v-else></span>
                    <span>{{ isPasswordSaving ? 'Updating Password...' : 'Secure & Update Password' }}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </section>
  </AdminPageShell>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useAuthStore } from '../../stores/AuthStore';
import AdminPageShell from '../../components/admin/AdminPageShell.vue';

const authStore = useAuthStore();

// Tab state
const activeTab = ref('credentials');

// Actions saving indicators
const isProfileSaving = ref(false);
const isPasswordSaving = ref(false);

// School operational details
const editForm = reactive({
  name: '',
  email: '',
  department: 'Academic Affairs Department',
  role: 'super admin',
  phone: '+855 12 345 678',
  officeHours: 'Mon - Fri, 8:00 AM - 5:00 PM',
  bio: ''
});

// Password states
const passwordForm = reactive({
  current: '',
  new: '',
  confirm: ''
});

// Dynamic values from authStore
const adminName = computed(() => authStore.user?.name || authStore.user?.username || 'Alex Rivera');
const adminEmail = computed(() => authStore.user?.email || 'admin@ant.dev');
const adminRole = computed(() => {
  const role = authStore.user?.role || 'Super Admin';
  if (role.toLowerCase() === 'admin') return 'Admin';
  if (role.toLowerCase() === 'super admin') return 'Super Admin';
  if (role.toLowerCase() === 'dean of students') return 'Dean of Students';
  if (role.toLowerCase() === 'academic coordinator') return 'Academic Coordinator';
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
});
const adminInitials = computed(() => {
  return adminName.value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'AR';
});
const adminAvatar = computed(() => authStore.user?.avatar || authStore.user?.profile_pic || authStore.user?.avatarUrl);

// Constants
const staffId = ref('ANT-2026-904');
const adminDepartment = computed(() => editForm.department || 'Academic Operations');
const officeHours = computed(() => editForm.officeHours || 'Mon - Fri, 8:00 AM - 5:00 PM');

onMounted(() => {
  resetForm();
});

const resetForm = () => {
  const user = authStore.user || {};
  editForm.name = user.name || user.username || 'Alex Rivera';
  editForm.email = user.email || 'admin@ant.dev';
  editForm.role = String(user.role || 'super admin').toLowerCase();
  editForm.department = user.department || 'Student Affairs & Operations';
  editForm.phone = user.phone || '+855 12 345 678';
  editForm.officeHours = user.officeHours || 'Mon - Fri, 8:00 AM - 5:00 PM';
  editForm.bio = user.bio || 'Administrative supervisor managing forum community standards and scholastic showcase evaluations.';
};

const clearPasswordForm = () => {
  passwordForm.current = '';
  passwordForm.new = '';
  passwordForm.confirm = '';
};

// Form Save Actions
const saveProfile = async () => {
  isProfileSaving.value = true;
  await sleep(1200);
  
  // Persist values in authStore locally
  authStore.user = {
    ...authStore.user,
    name: editForm.name,
    email: editForm.email,
    role: editForm.role,
    department: editForm.department,
    phone: editForm.phone,
    officeHours: editForm.officeHours,
    bio: editForm.bio
  };
  
  isProfileSaving.value = false;
};

const savePassword = async () => {
  if (passwordForm.new !== passwordForm.confirm) {
    alert("New password and confirmation password do not match!");
    return;
  }
  
  isPasswordSaving.value = true;
  await sleep(1400);
  clearPasswordForm();
  isPasswordSaving.value = false;
  alert("Password updated securely!");
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
</script>

<style scoped>
.school-admin-profile {
  font-family: var(--font-family-base);
}

/* Elegant Academic Profile Card Styling */
.admin-card-academic {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.admin-card-academic:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md), 0 10px 30px rgba(99, 102, 241, 0.05);
  border-color: rgba(99, 102, 241, 0.25);
}

.card-academic-header {
  height: 105px;
  background: 
    linear-gradient(135deg, rgba(99, 102, 241, 0.95) 0%, rgba(139, 92, 246, 0.95) 100%),
    radial-gradient(circle at 100% 0%, rgba(255, 255, 255, 0.15) 0%, transparent 60%);
  position: relative;
}

.card-academic-header::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 100% 100%, rgba(255, 255, 255, 0.08) 0%, transparent 60%);
  pointer-events: none;
}

.card-academic-body {
  padding: 0 1.5rem 1.75rem;
  margin-top: -48px;
}

.avatar-academic-container {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  padding: 4px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  display: inline-block;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 2;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-purple) 100%);
  color: #ffffff;
  font-size: 1.8rem;
  font-weight: 800;
  box-shadow: 0 4px 10px rgba(99, 102, 241, 0.25);
}

.admin-full-name {
  color: var(--color-text);
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.3px;
  margin-top: 0.5rem;
}

.admin-role-badge {
  display: inline-block;
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-pill);
  letter-spacing: 0.8px;
}

.admin-dept-text {
  font-size: 0.84rem;
  font-weight: 600;
}

.card-divider {
  border-top: 1px solid var(--color-border);
  margin: 1.25rem 0 1rem;
  opacity: 0.6;
}

.quick-info-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1rem 1.2rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  font-size: 0.82rem;
}

.info-label {
  color: var(--color-text-muted);
  font-weight: 600;
  white-space: nowrap;
}

.info-val {
  color: var(--color-text);
  font-weight: 700;
  max-width: 170px;
  text-align: right;
}

/* Stats panel */
.admin-panel {
  padding: 1.5rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  box-shadow: var(--shadow-sm);
}

.panel-section-title {
  font-size: 0.94rem;
  font-weight: 800;
  color: var(--color-text);
}

.academic-stat-box {
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  transition: all var(--transition-base);
}

.academic-stat-box:hover {
  background: var(--color-surface);
  border-color: rgba(99, 102, 241, 0.4);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm), 0 4px 12px rgba(99, 102, 241, 0.04);
}

.stat-number {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--color-text);
}

.academic-stat-box small {
  font-size: 0.72rem;
  font-weight: 700;
  display: block;
}

/* Tabs list styling */
.profile-tabs {
  display: flex;
  gap: 0.25rem;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.75rem;
  flex-wrap: wrap;
}

.profile-tab-btn {
  background: transparent;
  border: none;
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--color-text-muted);
  padding: 0.5rem 0.95rem;
  border-radius: 8px;
  transition: all var(--transition-base);
}

.profile-tab-btn:hover {
  color: var(--color-text);
  background: var(--color-surface-hover);
}

.profile-tab-btn.active {
  color: var(--color-primary);
  background: var(--color-primary-light);
  box-shadow: inset 0 0 0 1px rgba(99, 102, 241, 0.15);
}

/* Form Styling */
.form-section-title {
  font-size: 1rem;
  font-weight: 800;
  color: var(--color-text);
  margin-bottom: 0.25rem;
}

.panel-subtitle {
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.field-block {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field-block label {
  font-size: 0.76rem;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--color-text-muted);
  letter-spacing: 0.4px;
}

.premium-input {
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-input-bg);
  padding: 0.55rem 0.85rem;
  color: var(--color-text);
  font-size: 0.88rem;
  transition: all var(--transition-base);
}

.premium-input:focus {
  border-color: var(--color-primary);
  background: var(--color-surface);
  box-shadow: var(--focus-ring);
  outline: none;
}

.form-hint {
  font-size: 0.72rem;
}

/* Action button configurations */
.btn-primary-premium {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-purple) 100%);
  color: #ffffff;
  border: none;
  font-weight: 700;
  font-size: 0.84rem;
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  transition: all var(--transition-base);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}

.btn-primary-premium:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(139, 92, 246, 0.25);
  filter: brightness(1.08);
}

.btn-primary-premium:disabled {
  opacity: 0.7;
}

.btn-secondary-premium {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-weight: 700;
  font-size: 0.84rem;
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  transition: all var(--transition-base);
}

.btn-secondary-premium:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

/* Animations */
.fade-in-panel {
  animation: slide-up-fade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slide-up-fade {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
