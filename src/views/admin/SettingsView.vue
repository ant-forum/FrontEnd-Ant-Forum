<template>
  <div class="settings-layout d-flex bg-light min-vh-100">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Main Content -->
    <main class="flex-grow-1 p-4 p-lg-5">
      <!-- Header -->
      <header class="settings-header mb-5">
        <h2 class="fw-bold mb-1">System Settings</h2>
        <p class="text-muted small mb-0">Manage platform configurations and administrative preferences</p>
      </header>

      <div class="row g-4">
        <!-- Settings Navigation -->
        <div class="col-lg-3">
          <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div class="list-group list-group-flush settings-nav">
              <button 
                v-for="tab in tabs" 
                :key="tab.id"
                @click="activeTab = tab.id"
                :class="['list-group-item list-group-item-action border-0 p-3 d-flex align-items-center gap-3 transition-all', activeTab === tab.id ? 'active' : '']"
              >
                <i :class="[tab.icon, 'fs-5']"></i>
                <span class="fw-bold small">{{ tab.label }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Settings Content -->
        <div class="col-lg-9">
          <div class="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white h-100">
            <!-- Profile Settings -->
            <div v-if="activeTab === 'profile'" class="animate__animated animate__fadeIn">
              <h5 class="fw-bold mb-4">Administrator Profile</h5>
              <div class="d-flex align-items-center mb-5 gap-4">
                <div class="position-relative">
                  <img src="https://i.pravatar.cc/150?u=alex" alt="Profile" class="rounded-circle shadow-sm" width="100" height="100">
                  <button class="btn btn-primary btn-sm rounded-circle position-absolute bottom-0 end-0 shadow-sm p-2">
                    <i class="bi bi-camera-fill"></i>
                  </button>
                </div>
                <div>
                  <h6 class="fw-bold mb-1">Alex Rivera</h6>
                  <p class="text-muted small mb-0">Lead Architect • Joined May 2024</p>
                </div>
              </div>

              <div class="row g-4">
                <div class="col-md-6">
                  <label class="form-label text-muted small fw-bold text-uppercase">Full Name</label>
                  <input type="text" class="form-control border-0 bg-light p-3 rounded-3" value="Alex Rivera">
                </div>
                <div class="col-md-6">
                  <label class="form-label text-muted small fw-bold text-uppercase">Email Address</label>
                  <input type="email" class="form-control border-0 bg-light p-3 rounded-3" value="alex.rivera@ant.dev">
                </div>
                <div class="col-12">
                  <label class="form-label text-muted small fw-bold text-uppercase">Bio</label>
                  <textarea class="form-control border-0 bg-light p-3 rounded-3" rows="3">Managing the technical operations and system architecture for the ANT ecosystem.</textarea>
                </div>
              </div>

              <div class="row g-4 mt-2">
                <div class="col-md-6">
                  <label class="form-label text-muted small fw-bold text-uppercase">Language</label>
                  <select v-model="selectedLanguage" class="form-select border-0 bg-light p-3 rounded-3">
                    <option v-for="lang in languages" :key="lang.code" :value="lang.code">{{ lang.name }}</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label text-muted small fw-bold text-uppercase">Timezone</label>
                  <select v-model="selectedTimezone" class="form-select border-0 bg-light p-3 rounded-3">
                    <option value="UTC-8">Pacific Time (US & Canada)</option>
                    <option value="UTC+0">Western European Time (London)</option>
                    <option value="UTC+7">Indochina Time (Bangkok)</option>
                  </select>
                </div>
              </div>

              <!-- Account Status -->
              <div class="mt-5 p-4 rounded-4 bg-light border d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-3">
                  <div class="icon-box-sm rounded-circle bg-success-subtle d-flex align-items-center justify-content-center">
                    <i class="bi bi-patch-check-fill text-success"></i>
                  </div>
                  <div>
                    <h6 class="fw-bold mb-0 small">Verified Administrator</h6>
                    <p class="text-muted xx-small mb-0">Your account has full system permissions.</p>
                  </div>
                </div>
                <span class="badge bg-success-subtle text-success rounded-pill px-3 py-2 fw-bold text-uppercase xx-small">Active</span>
              </div>
            </div>

            <!-- Appearance Settings -->
            <div v-if="activeTab === 'appearance'" class="animate__animated animate__fadeIn">
              <h5 class="fw-bold mb-4">Dashboard Appearance</h5>
              
              <div class="mb-5">
                <label class="form-label text-muted small fw-bold text-uppercase mb-3">Color Theme</label>
                <div class="row g-3">
                  <div v-for="theme in themes" :key="theme.id" class="col-md-4">
                    <div 
                      @click="selectedTheme = theme.id"
                      :class="['theme-preview-card p-3 rounded-4 border transition-all cursor-pointer', selectedTheme === theme.id ? 'active' : '']"
                    >
                      <div :class="['theme-swatch rounded-3 mb-3', theme.class]"></div>
                      <div class="d-flex justify-content-between align-items-center">
                        <span class="fw-bold small">{{ theme.label }}</span>
                        <i v-if="selectedTheme === theme.id" class="bi bi-check-circle-fill text-purple"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mb-4">
                <label class="form-label text-muted small fw-bold text-uppercase mb-3">Sidebar Layout</label>
                <div class="d-flex gap-4">
                  <div class="form-check">
                    <input class="form-check-input" type="radio" name="sidebarLayout" id="layoutFull" checked>
                    <label class="form-check-label small fw-bold" for="layoutFull">Full Width</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="radio" name="sidebarLayout" id="layoutCompact">
                    <label class="form-check-label small fw-bold" for="layoutCompact">Compact (Icons Only)</label>
                  </div>
                </div>
              </div>

              <div class="p-4 rounded-4 bg-light border d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="fw-bold mb-1">Auto-switch Theme</h6>
                  <p class="text-muted xx-small mb-0">Synchronize dashboard theme with system preferences.</p>
                </div>
                <div class="form-check form-switch">
                  <input class="form-check-input custom-switch" type="checkbox">
                </div>
              </div>
            </div>

            <!-- Security Settings -->
            <div v-if="activeTab === 'security'" class="animate__animated animate__fadeIn">
              <h5 class="fw-bold mb-4">Security & Authentication</h5>
              <div class="d-grid gap-4 mb-5">
                <div class="security-item p-4 rounded-4 bg-light border d-flex justify-content-between align-items-center">
                  <div>
                    <h6 class="fw-bold mb-1">Two-Factor Authentication</h6>
                    <p class="text-muted small mb-0">Add an extra layer of security to your account.</p>
                  </div>
                  <div class="form-check form-switch">
                    <input class="form-check-input custom-switch" type="checkbox" checked>
                  </div>
                </div>
                <div class="security-item p-4 rounded-4 bg-light border d-flex justify-content-between align-items-center">
                  <div>
                    <h6 class="fw-bold mb-1">Password Management</h6>
                    <p class="text-muted small mb-0">Last changed 3 months ago.</p>
                  </div>
                  <button class="btn btn-white border shadow-sm rounded-pill px-4 py-2 small fw-bold">Update</button>
                </div>
              </div>

              <h6 class="fw-bold mb-3 small text-uppercase tracking-wider text-muted">Active Sessions</h6>
              <div class="list-group list-group-flush rounded-4 overflow-hidden border">
                <div v-for="session in activeSessions" :key="session.device" class="list-group-item p-3 d-flex justify-content-between align-items-center">
                  <div class="d-flex align-items-center gap-3">
                    <div class="icon-box-sm rounded-circle bg-light d-flex align-items-center justify-content-center">
                      <i :class="['bi', session.icon, 'text-muted']"></i>
                    </div>
                    <div>
                      <div class="fw-bold small">{{ session.device }}</div>
                      <div class="text-muted xx-small">{{ session.location }} • {{ session.status }}</div>
                    </div>
                  </div>
                  <button v-if="!session.current" class="btn btn-link text-danger p-0 xx-small fw-bold text-decoration-none">Revoke</button>
                  <span v-else class="badge bg-purple-subtle text-purple rounded-pill xx-small px-2 py-1">Current</span>
                </div>
              </div>
            </div>

            <!-- Notification Settings -->
            <div v-if="activeTab === 'notifications'" class="animate__animated animate__fadeIn">
              <h5 class="fw-bold mb-4">Notification Preferences</h5>
              <div class="list-group list-group-flush border-top">
                <div v-for="pref in notifications" :key="pref.label" class="list-group-item border-0 py-4 px-0 d-flex justify-content-between align-items-center">
                  <div>
                    <h6 class="fw-bold mb-1 small">{{ pref.label }}</h6>
                    <p class="text-muted xx-small mb-0">{{ pref.desc }}</p>
                  </div>
                  <div class="d-flex gap-4">
                    <div class="text-center">
                      <div class="xx-small text-muted fw-bold mb-1">EMAIL</div>
                      <div class="form-check form-switch">
                        <input class="form-check-input custom-switch-sm" type="checkbox" :checked="pref.email">
                      </div>
                    </div>
                    <div class="text-center">
                      <div class="xx-small text-muted fw-bold mb-1">BROWSER</div>
                      <div class="form-check form-switch">
                        <input class="form-check-input custom-switch-sm" type="checkbox" :checked="pref.browser">
                      </div>
                    </div>
                  </div>
                </div>

                <div class="p-4 rounded-4 bg-light border">
                  <h6 class="fw-bold mb-3 small text-uppercase tracking-wider text-muted">Recent Audit Logs</h6>
                  <div class="audit-logs">
                    <div v-for="(log, index) in auditLogs" :key="index" class="audit-item d-flex align-items-center justify-content-between py-2 border-bottom last-child-border-0">
                      <div class="d-flex align-items-center gap-3">
                        <i :class="['bi', log.icon, log.color]"></i>
                        <div>
                          <div class="fw-bold xx-small text-dark">{{ log.action }}</div>
                          <div class="text-muted" style="font-size: 0.6rem;">By {{ log.user }}</div>
                        </div>
                      </div>
                      <div class="text-muted" style="font-size: 0.6rem; font-weight: bold;">{{ log.time }}</div>
                    </div>
                  </div>
                  <button class="btn btn-link text-purple w-100 mt-3 p-0 xx-small fw-bold text-decoration-none text-center">View Full Audit Trail</button>
                </div>
              </div>
            </div>

            <!-- System Configuration -->
            <div v-if="activeTab === 'system'" class="animate__animated animate__fadeIn">
              <h5 class="fw-bold mb-4">System Configuration</h5>
              <div class="d-grid gap-4">
                <div class="p-4 rounded-4 bg-light border">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h6 class="fw-bold mb-1">Maintenance Mode</h6>
                      <p class="text-muted small mb-0">Disable public access to the platform for updates.</p>
                    </div>
                    <div class="form-check form-switch">
                      <input class="form-check-input custom-switch" type="checkbox">
                    </div>
                  </div>
                  <div class="alert alert-warning border-0 rounded-3 mb-0 py-2 px-3 d-flex align-items-center gap-2">
                    <i class="bi bi-exclamation-triangle-fill small"></i>
                    <span class="xx-small fw-bold text-uppercase">Warning: This will affect all users</span>
                  </div>
                </div>

                <div class="p-4 rounded-4 bg-light border">
                  <h6 class="fw-bold mb-3">API Limits & Performance</h6>
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label text-muted xx-small fw-bold text-uppercase">Rate Limit (req/min)</label>
                      <input type="number" class="form-control border-0 bg-white shadow-sm p-3 rounded-3" value="100">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted xx-small fw-bold text-uppercase">Max Upload Size (MB)</label>
                      <input type="number" class="form-control border-0 bg-white shadow-sm p-3 rounded-3" value="10">
                    </div>
                  </div>
                </div>

                <div class="p-4 rounded-4 bg-light border">
                  <h6 class="fw-bold mb-3">Platform Backup</h6>
                  <div class="d-flex justify-content-between align-items-center p-3 bg-white rounded-3 shadow-sm">
                    <div class="d-flex align-items-center gap-3">
                      <div class="icon-box-sm rounded-circle bg-success-subtle d-flex align-items-center justify-content-center">
                        <i class="bi bi-cloud-check text-success small"></i>
                      </div>
                      <div>
                        <div class="fw-bold small">Last Auto-Backup</div>
                        <div class="text-muted xx-small">Today at 04:12 AM</div>
                      </div>
                    </div>
                    <button class="btn btn-primary rounded-pill px-3 py-1 xx-small fw-bold">Backup Now</button>
                  </div>
                </div>

                <div class="p-4 rounded-4 bg-light border">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <h6 class="fw-bold mb-0">API Keys & Integration</h6>
                    <button class="btn btn-link text-purple p-0 small fw-bold text-decoration-none">+ Generate New Key</button>
                  </div>
                  <div class="api-keys-list">
                    <div v-for="key in apiKeys" :key="key.id" class="api-key-item p-3 bg-white rounded-3 shadow-sm mb-2 border d-flex justify-content-between align-items-center">
                      <div class="d-flex align-items-center gap-3">
                        <div class="icon-box-sm rounded-circle bg-light d-flex align-items-center justify-content-center">
                          <i class="bi bi-key text-muted small"></i>
                        </div>
                        <div>
                          <div class="fw-bold small">{{ key.name }}</div>
                          <code class="text-muted xx-small">{{ key.prefix }}••••••••••••••••</code>
                        </div>
                      </div>
                      <div class="d-flex gap-2">
                        <button class="btn btn-icon-sm rounded-circle bg-light" title="Copy Key"><i class="bi bi-copy xx-small"></i></button>
                        <button class="btn btn-icon-sm rounded-circle bg-light text-danger" title="Revoke Key"><i class="bi bi-trash xx-small"></i></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer Actions -->
            <div class="mt-5 pt-5 border-top d-flex justify-content-between align-items-center">
              <div v-if="saveStatus" :class="['animate__animated animate__fadeIn xx-small fw-bold text-uppercase', saveStatus === 'success' ? 'text-success' : 'text-danger']">
                <i :class="['bi me-1', saveStatus === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill']"></i>
                {{ saveStatus === 'success' ? 'Changes saved successfully' : 'Error saving changes' }}
              </div>
              <div v-else></div>
              <div class="d-flex gap-3">
                <button class="btn btn-light rounded-pill px-4 py-2 fw-bold" :disabled="isSaving">Discard</button>
                <button 
                  class="btn btn-primary rounded-pill px-5 py-2 fw-bold shadow-brand d-flex align-items-center gap-2" 
                  @click="saveChanges"
                  :disabled="isSaving"
                >
                  <span v-if="isSaving" class="spinner-border spinner-border-sm" role="status"></span>
                  {{ isSaving ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AdminSidebar from '../../components/admin/AdminSidebar.vue';

const activeTab = ref('profile');
const selectedTheme = ref('light');
const selectedLanguage = ref('en');
const selectedTimezone = ref('UTC-8');
const isSaving = ref(false);
const saveStatus = ref(null);

const activeSessions = [
  { device: 'MacBook Pro 16"', location: 'San Francisco, US', status: 'Online', icon: 'bi-laptop', current: true },
  { device: 'iPhone 15 Pro', location: 'San Francisco, US', status: 'Active 2h ago', icon: 'bi-phone', current: false },
  { device: 'Chrome on Windows', location: 'London, UK', status: 'Active 3d ago', icon: 'bi-display', current: false }
];

const apiKeys = [
  { id: 1, name: 'Production API Key', prefix: 'ant_prod_0x7f' },
  { id: 2, name: 'Staging Integration', prefix: 'ant_stag_0x9a' }
];

const auditLogs = [
  { action: 'Updated API Limit', user: 'Alex Rivera', time: '20 MIN AGO', icon: 'bi-sliders', color: 'text-primary' },
  { action: 'Revoked API Key', user: 'Alex Rivera', time: '2 HOURS AGO', icon: 'bi-shield-slash', color: 'text-danger' },
  { action: 'Changed Theme', user: 'Alex Rivera', time: '5 HOURS AGO', icon: 'bi-palette', color: 'text-purple' }
];

const languages = [
  { code: 'en', name: 'English (US)' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' }
];

const saveChanges = () => {
  isSaving.value = true;
  saveStatus.value = null;
  
  // Mock save delay
  setTimeout(() => {
    isSaving.value = false;
    saveStatus.value = 'success';
    
    // Clear status after 3 seconds
    setTimeout(() => {
      saveStatus.value = null;
    }, 3000);
  }, 1200);
};

const tabs = [
  { id: 'profile', label: 'Profile', icon: 'bi bi-person-circle' },
  { id: 'appearance', label: 'Appearance', icon: 'bi bi-palette' },
  { id: 'security', label: 'Security', icon: 'bi bi-shield-lock' },
  { id: 'notifications', label: 'Notifications', icon: 'bi bi-bell' },
  { id: 'system', label: 'System Config', icon: 'bi bi-cpu' }
];

const themes = [
  { id: 'light', label: 'Classic Light', class: 'bg-white border' },
  { id: 'dark', label: 'Midnight Dark', class: 'bg-dark' },
  { id: 'purple', label: 'Modern Purple', class: 'bg-purple' }
];

const notifications = [
  { label: 'Project Approvals', desc: 'Notify when a new project is submitted for review', email: true, browser: true },
  { label: 'Security Alerts', desc: 'Critical alerts about system vulnerabilities', email: true, browser: true },
  { label: 'Community Reports', desc: 'Daily summary of flagged discussion content', email: false, browser: true },
  { label: 'Weekly Analytics', desc: 'Send automated platform performance reports', email: true, browser: false }
];
</script>

<style scoped>
.settings-nav .list-group-item {
  color: #64748b;
  border-left: 3px solid transparent !important;
}

.settings-nav .list-group-item.active {
  background-color: rgba(139, 92, 246, 0.05);
  color: #8b5cf6;
  border-left-color: #8b5cf6 !important;
}

.settings-nav .list-group-item:hover:not(.active) {
  background-color: #f8fafc;
  color: #1e293b;
}

.custom-switch {
  width: 3rem;
  height: 1.5rem;
  cursor: pointer;
}

.custom-switch:checked {
  background-color: #8b5cf6;
  border-color: #8b5cf6;
}

.custom-switch-sm {
  width: 2.2rem;
  height: 1.1rem;
  cursor: pointer;
}

.custom-switch-sm:checked {
  background-color: #8b5cf6;
  border-color: #8b5cf6;
}

.shadow-brand {
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
}

.xx-small { font-size: 0.65rem; }

.icon-box-sm {
  width: 32px;
  height: 32px;
}

.btn-icon-sm {
  width: 28px;
  height: 28px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  transition: all 0.2s ease;
}

.btn-icon-sm:hover {
  background-color: #e2e8f0 !important;
}

.bg-success-subtle {
  background-color: rgba(16, 185, 129, 0.1);
}

.theme-preview-card {
  border: 2px solid #f1f5f9;
}

.theme-preview-card.active {
  border-color: #8b5cf6;
  background-color: rgba(139, 92, 246, 0.02);
}

.theme-swatch {
  height: 60px;
  width: 100%;
}

.bg-purple {
  background-color: #8b5cf6 !important;
}

.bg-purple-subtle {
  background-color: rgba(139, 92, 246, 0.1);
}

.text-purple {
  color: #8b5cf6 !important;
}

.last-child-border-0:last-child {
  border-bottom: 0 !important;
}

.transition-all {
  transition: all 0.2s ease;
}

textarea:focus, input:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
  background-color: white !important;
}
</style>
