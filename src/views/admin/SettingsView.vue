<template>
  <div class="settings-layout d-flex bg-light min-vh-100">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Main Content -->
    <main class="admin-main flex-grow-1">
      <div class="admin-content-wrapper">
        <!-- Header -->
      <header class="settings-header mb-5 d-flex justify-content-between align-items-end">
        <div>
          <h2 class="fw-bold mb-1">System Settings</h2>
          <p class="text-muted small mb-0">Manage platform configurations and administrative preferences</p>
        </div>
        <div class="d-flex gap-2">
          <div class="badge bg-white text-dark border shadow-sm rounded-pill px-3 py-2 d-flex align-items-center gap-2 font-xs fw-bold">
            <span class="live-dot-sm"></span> System Status: Operational
          </div>
        </div>
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
              <div class="d-flex justify-content-between align-items-start mb-4">
                <h5 class="fw-bold mb-0">Administrator Profile</h5>
                <span class="badge bg-purple-subtle text-purple rounded-pill px-3 py-1 font-xs fw-bold">Admin Level 1</span>
              </div>
              <div class="d-flex align-items-center mb-5 gap-4 p-4 rounded-4 bg-light-purple border border-white">
                <div class="position-relative">
                  <img src="https://i.pravatar.cc/150?u=alex" alt="Profile" class="rounded-circle shadow-md border border-4 border-white" width="100" height="100">
                  <button class="btn btn-primary btn-sm rounded-circle position-absolute bottom-0 end-0 shadow-sm p-2 border border-2 border-white">
                    <i class="bi bi-camera-fill"></i>
                  </button>
                </div>
                <div>
                  <h6 class="fw-bold mb-1 fs-5">Alex Rivera</h6>
                  <p class="text-muted small mb-0 d-flex align-items-center gap-2">
                    <i class="bi bi-briefcase"></i> Lead Architect 
                    <span class="text-silver">•</span> 
                    <i class="bi bi-calendar-event"></i> Joined May 2024
                  </p>
                </div>
              </div>

              <div class="row g-4">
                <div class="col-md-6">
                  <div class="form-floating mb-0">
                    <input type="text" class="form-control border-0 bg-light p-3 h-auto rounded-4" id="fullName" value="Alex Rivera" placeholder="Full Name">
                    <label for="fullName" class="text-muted small fw-bold text-uppercase px-4">Full Name</label>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-floating mb-0">
                    <input type="email" class="form-control border-0 bg-light p-3 h-auto rounded-4" id="emailAddr" value="alex.rivera@ant.dev" placeholder="Email Address">
                    <label for="emailAddr" class="text-muted small fw-bold text-uppercase px-4">Email Address</label>
                  </div>
                </div>
                <div class="col-12">
                  <div class="form-floating mb-0">
                    <textarea class="form-control border-0 bg-light p-3 h-auto rounded-4" id="bio" rows="3" placeholder="Bio" style="min-height: 100px;">Managing the technical operations and system architecture for the ANT ecosystem.</textarea>
                    <label for="bio" class="text-muted small fw-bold text-uppercase px-4">Bio</label>
                  </div>
                </div>
              </div>

              <div class="row g-4 mt-2">
                <div class="col-md-6">
                  <label class="form-label text-muted small fw-bold text-uppercase mb-2 ms-2">Language</label>
                  <select v-model="selectedLanguage" class="form-select border-0 bg-light p-3 rounded-4">
                    <option v-for="lang in languages" :key="lang.code" :value="lang.code">{{ lang.name }}</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label text-muted small fw-bold text-uppercase mb-2 ms-2">Timezone</label>
                  <select v-model="selectedTimezone" class="form-select border-0 bg-light p-3 rounded-4">
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
              <div class="d-flex justify-content-between align-items-start mb-4">
                <h5 class="fw-bold mb-0">Dashboard Appearance</h5>
                <button class="btn btn-link text-purple p-0 small fw-bold text-decoration-none">Reset to Defaults</button>
              </div>
              
              <div class="mb-5">
                <label class="form-label text-muted small fw-bold text-uppercase mb-3 ms-2">Color Theme</label>
                <div class="row g-4">
                  <div v-for="theme in themes" :key="theme.id" class="col-md-4">
                    <div 
                      @click="selectedTheme = theme.id"
                      :class="['theme-preview-card p-0 rounded-4 border-2 overflow-hidden transition-all cursor-pointer', selectedTheme === theme.id ? 'active shadow-brand' : 'opacity-75 hover-opacity-100']"
                    >
                      <div :class="['theme-swatch position-relative', theme.class]">
                        <div v-if="selectedTheme === theme.id" class="position-absolute top-50 start-50 translate-middle">
                          <div class="bg-white rounded-circle p-2 shadow-sm">
                            <i class="bi bi-check-lg text-purple fs-4"></i>
                          </div>
                        </div>
                      </div>
                      <div class="p-3 bg-white border-top">
                        <div class="fw-bold small">{{ theme.label }}</div>
                        <div class="text-muted xx-small">Optimized for accessibility</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mb-5">
                <label class="form-label text-muted small fw-bold text-uppercase mb-3 ms-2">Sidebar Layout</label>
                <div class="row g-3">
                  <div class="col-md-6">
                    <div class="p-4 rounded-4 bg-light border border-2 d-flex align-items-center gap-3 cursor-pointer hover-bg-white transition-all">
                      <div class="form-check mb-0">
                        <input class="form-check-input" type="radio" name="sidebarLayout" id="layoutFull" checked>
                        <label class="form-check-label fw-bold small ms-2" for="layoutFull">Full Navigation</label>
                      </div>
                      <i class="bi bi-layout-sidebar-inset ms-auto text-muted fs-5"></i>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="p-4 rounded-4 bg-light border border-2 d-flex align-items-center gap-3 cursor-pointer hover-bg-white transition-all">
                      <div class="form-check mb-0">
                        <input class="form-check-input" type="radio" name="sidebarLayout" id="layoutCompact">
                        <label class="form-check-label fw-bold small ms-2" for="layoutCompact">Compact Mode</label>
                      </div>
                      <i class="bi bi-layout-sidebar ms-auto text-muted fs-5"></i>
                    </div>
                  </div>
                </div>
              </div>

              <div class="p-4 rounded-4 bg-light-purple border border-white d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-3">
                  <div class="icon-box-sm rounded-circle bg-white d-flex align-items-center justify-content-center shadow-sm">
                    <i class="bi bi-moon-stars-fill text-purple"></i>
                  </div>
                  <div>
                    <h6 class="fw-bold mb-1 small">Automatic Theme Switching</h6>
                    <p class="text-muted xx-small mb-0">Sync dashboard theme with your system light/dark mode.</p>
                  </div>
                </div>
                <div class="form-check form-switch">
                  <input class="form-check-input custom-switch" type="checkbox">
                </div>
              </div>
            </div>

            <!-- Security Settings -->
            <div v-if="activeTab === 'security'" class="animate__animated animate__fadeIn">
              <div class="d-flex justify-content-between align-items-start mb-4">
                <h5 class="fw-bold mb-0">Security & Authentication</h5>
                <div class="badge bg-danger-subtle text-danger rounded-pill px-3 py-1 font-xs fw-bold">Security Level: High</div>
              </div>
              
              <div class="d-grid gap-4 mb-5">
                <div class="security-item p-4 rounded-4 bg-white border border-2 d-flex justify-content-between align-items-center hover-shadow-sm transition-all">
                  <div class="d-flex align-items-center gap-3">
                    <div class="icon-box rounded-4 bg-purple-subtle d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
                      <i class="bi bi-shield-lock-fill text-purple fs-5"></i>
                    </div>
                    <div>
                      <h6 class="fw-bold mb-1">Two-Factor Authentication</h6>
                      <p class="text-muted small mb-0">Secure your account with a secondary verification code.</p>
                    </div>
                  </div>
                  <div class="form-check form-switch">
                    <input class="form-check-input custom-switch" type="checkbox" checked>
                  </div>
                </div>
                
                <div class="security-item p-4 rounded-4 bg-white border border-2 d-flex justify-content-between align-items-center hover-shadow-sm transition-all">
                  <div class="d-flex align-items-center gap-3">
                    <div class="icon-box rounded-4 bg-light d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
                      <i class="bi bi-key-fill text-muted fs-5"></i>
                    </div>
                    <div>
                      <h6 class="fw-bold mb-1">Update Master Password</h6>
                      <p class="text-muted small mb-0">Regularly updating your password enhances security.</p>
                    </div>
                  </div>
                  <button class="btn btn-white border-2 shadow-sm rounded-pill px-4 py-2 small fw-bold hover-bg-light transition-all">Change Password</button>
                </div>
              </div>

              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="fw-bold mb-0 small text-uppercase tracking-wider text-muted">Active Sessions</h6>
                <button class="btn btn-link text-danger p-0 xx-small fw-bold text-decoration-none">Logout all other sessions</button>
              </div>
              
              <div class="list-group list-group-flush rounded-4 overflow-hidden border border-2">
                <div v-for="session in activeSessions" :key="session.device" class="list-group-item p-4 d-flex justify-content-between align-items-center border-bottom bg-white">
                  <div class="d-flex align-items-center gap-4">
                    <div class="icon-box-sm rounded-circle bg-light d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                      <i :class="['bi', session.icon, 'text-muted fs-5']"></i>
                    </div>
                    <div>
                      <div class="d-flex align-items-center gap-2">
                        <span class="fw-bold small">{{ session.device }}</span>
                        <span v-if="session.current" class="badge bg-purple text-white rounded-pill" style="font-size: 0.5rem; padding: 2px 6px;">CURRENT</span>
                      </div>
                      <div class="text-muted xx-small mt-1">
                        <i class="bi bi-geo-alt-fill me-1"></i> {{ session.location }} 
                        <span class="mx-2 opacity-50">•</span> 
                        <i class="bi bi-clock-fill me-1"></i> {{ session.status }}
                      </div>
                    </div>
                  </div>
                  <button v-if="!session.current" class="btn btn-outline-danger btn-sm rounded-pill px-3 xx-small fw-bold">Revoke</button>
                  <div v-else class="text-success xx-small fw-bold d-flex align-items-center gap-1">
                    <span class="live-dot-sm" style="width: 6px; height: 6px;"></span> Active Now
                  </div>
                </div>
              </div>
            </div>

            <!-- Notification Settings -->
            <div v-if="activeTab === 'notifications'" class="animate__animated animate__fadeIn">
              <div class="d-flex justify-content-between align-items-start mb-4">
                <h5 class="fw-bold mb-0">Notification Preferences</h5>
                <button class="btn btn-link text-purple p-0 small fw-bold text-decoration-none">Mark all as read</button>
              </div>
              
              <div class="list-group list-group-flush mb-5">
                <div v-for="pref in notifications" :key="pref.label" class="list-group-item border-0 py-4 px-3 mb-2 rounded-4 bg-white hover-bg-light transition-all d-flex justify-content-between align-items-center border">
                  <div class="d-flex align-items-center gap-3">
                    <div class="icon-box-sm rounded-circle bg-light d-flex align-items-center justify-content-center">
                      <i class="bi bi-bell-fill text-muted"></i>
                    </div>
                    <div>
                      <h6 class="fw-bold mb-1 small">{{ pref.label }}</h6>
                      <p class="text-muted xx-small mb-0">{{ pref.desc }}</p>
                    </div>
                  </div>
                  <div class="d-flex gap-4">
                    <div class="text-center">
                      <div class="xx-small text-muted fw-bold mb-2">EMAIL</div>
                      <div class="form-check form-switch">
                        <input class="form-check-input custom-switch-sm" type="checkbox" :checked="pref.email">
                      </div>
                    </div>
                    <div class="text-center">
                      <div class="xx-small text-muted fw-bold mb-2">BROWSER</div>
                      <div class="form-check form-switch">
                        <input class="form-check-input custom-switch-sm" type="checkbox" :checked="pref.browser">
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="p-4 rounded-4 bg-light-purple border border-white">
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <h6 class="fw-bold mb-0 small text-uppercase tracking-wider text-muted">System Audit Logs</h6>
                  <span class="badge bg-white text-muted border rounded-pill px-3 py-1 xx-small fw-bold">Last 24 Hours</span>
                </div>
                
                <div class="audit-logs px-2">
                  <div v-for="(log, index) in auditLogs" :key="index" class="audit-item d-flex align-items-center justify-content-between py-3 border-bottom last-child-border-0">
                    <div class="d-flex align-items-center gap-3">
                      <div class="icon-box-sm rounded-circle bg-white shadow-sm d-flex align-items-center justify-content-center">
                        <i :class="['bi', log.icon, log.color]"></i>
                      </div>
                      <div>
                        <div class="fw-bold xx-small text-dark">{{ log.action }}</div>
                        <div class="text-muted" style="font-size: 0.6rem;">By <span class="text-purple fw-bold">{{ log.user }}</span></div>
                      </div>
                    </div>
                    <div class="text-muted" style="font-size: 0.6rem; font-weight: bold;">{{ log.time }}</div>
                  </div>
                </div>
                <button class="btn btn-white border shadow-sm w-100 mt-4 py-2 rounded-pill xx-small fw-bold text-purple transition-all hover-bg-purple hover-text-white">
                  Download Full Audit Trail (CSV)
                </button>
              </div>
            </div>

            <!-- System Configuration -->
            <div v-if="activeTab === 'system'" class="animate__animated animate__fadeIn">
              <div class="d-flex justify-content-between align-items-start mb-4">
                <h5 class="fw-bold mb-0">System Configuration</h5>
                <span class="badge bg-dark text-white rounded-pill px-3 py-1 font-xs fw-bold">v2.4.0-stable</span>
              </div>
              
              <div class="d-grid gap-4">
                <div class="p-4 rounded-4 bg-white border border-2 hover-shadow-sm transition-all">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="d-flex align-items-center gap-3">
                      <div class="icon-box rounded-4 bg-danger-subtle d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
                        <i class="bi bi-wrench-adjustable text-danger fs-5"></i>
                      </div>
                      <div>
                        <h6 class="fw-bold mb-1">Maintenance Mode</h6>
                        <p class="text-muted small mb-0">Restrict public access for scheduled maintenance.</p>
                      </div>
                    </div>
                    <div class="form-check form-switch">
                      <input class="form-check-input custom-switch" type="checkbox">
                    </div>
                  </div>
                  <div class="alert alert-danger border-0 rounded-4 mb-0 py-3 px-4 d-flex align-items-center gap-3">
                    <i class="bi bi-exclamation-octagon-fill fs-5"></i>
                    <div>
                      <div class="xx-small fw-black text-uppercase tracking-wider">High Impact Action</div>
                      <div class="font-xs opacity-75">Enabling this will immediately logout all non-admin users.</div>
                    </div>
                  </div>
                </div>

                <div class="row g-4">
                  <div class="col-md-6">
                    <div class="p-4 rounded-4 bg-white border border-2 h-100">
                      <h6 class="fw-bold mb-3 small text-uppercase tracking-wider text-muted">API Rate Limits</h6>
                      <div class="form-floating mb-3">
                        <input type="number" class="form-control border-0 bg-light p-3 h-auto rounded-4" id="rateLimit" value="100" placeholder="100">
                        <label for="rateLimit" class="text-muted small fw-bold px-4">REQUESTS PER MINUTE</label>
                      </div>
                      <div class="progress rounded-pill" style="height: 6px;">
                        <div class="progress-bar bg-purple" style="width: 65%;"></div>
                      </div>
                      <div class="text-muted mt-2" style="font-size: 0.6rem;">Current average: 65 req/min</div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="p-4 rounded-4 bg-white border border-2 h-100">
                      <h6 class="fw-bold mb-3 small text-uppercase tracking-wider text-muted">Storage Limits</h6>
                      <div class="form-floating mb-3">
                        <input type="number" class="form-control border-0 bg-light p-3 h-auto rounded-4" id="uploadSize" value="10" placeholder="10">
                        <label for="uploadSize" class="text-muted small fw-bold px-4">MAX UPLOAD SIZE (MB)</label>
                      </div>
                      <div class="d-flex justify-content-between align-items-center">
                        <span class="xx-small text-muted">Cloud Storage Usage</span>
                        <span class="xx-small fw-bold">4.2 / 10 GB</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="p-4 rounded-4 bg-purple text-white shadow-brand border-0">
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center gap-4">
                      <div class="icon-box rounded-circle bg-white/20 d-flex align-items-center justify-content-center" style="width: 56px; height: 56px;">
                        <i class="bi bi-cloud-arrow-up-fill fs-4"></i>
                      </div>
                      <div>
                        <h6 class="fw-bold mb-1">Automated Backups</h6>
                        <p class="text-white/70 xx-small mb-0">System state is mirrored to AWS S3 every 24 hours.</p>
                        <div class="mt-2 badge bg-white/20 rounded-pill font-xxs">NEXT RUN: TOMORROW, 04:00 AM</div>
                      </div>
                    </div>
                    <button class="btn btn-white rounded-pill px-4 py-2 fw-bold small text-purple hover-scale transition-all">
                      Trigger Manual Backup
                    </button>
                  </div>
                </div>

                <div class="p-4 rounded-4 bg-white border border-2">
                  <div class="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h6 class="fw-bold mb-1">API Integrations</h6>
                      <p class="text-muted small mb-0">Manage secure keys for third-party service access.</p>
                    </div>
                    <button class="btn btn-purple btn-sm rounded-pill px-4 fw-bold shadow-sm">+ Create New Key</button>
                  </div>
                  <div class="api-keys-list">
                    <div v-for="key in apiKeys" :key="key.id" class="api-key-item p-4 bg-light rounded-4 mb-3 border d-flex justify-content-between align-items-center hover-bg-white transition-all">
                      <div class="d-flex align-items-center gap-4">
                        <div class="icon-box-sm rounded-circle bg-white shadow-sm d-flex align-items-center justify-content-center">
                          <i class="bi bi-key-fill text-purple"></i>
                        </div>
                        <div>
                          <div class="fw-bold small">{{ key.name }}</div>
                          <div class="d-flex align-items-center gap-2 mt-1">
                            <code class="text-muted xx-small bg-white px-2 py-1 rounded border">{{ key.prefix }}••••••••••••••••</code>
                            <button class="btn btn-link text-muted p-0"><i class="bi bi-eye-slash xx-small"></i></button>
                          </div>
                        </div>
                      </div>
                      <div class="d-flex gap-2">
                        <button class="btn btn-white btn-sm rounded-circle shadow-sm border" title="Copy Key"><i class="bi bi-copy"></i></button>
                        <button class="btn btn-white btn-sm rounded-circle shadow-sm border text-danger" title="Revoke Key"><i class="bi bi-trash"></i></button>
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
.settings-layout {
  font-family: var(--font-family-base);
  color: var(--color-text);
}

.settings-nav .list-group-item {
  color: #64748b;
  border-left: 3px solid transparent !important;
}

.settings-nav .list-group-item.active {
  background-color: #8b5cf6;
  color: white;
  border-left-color: #7c3aed !important;
}

.settings-nav .list-group-item:hover:not(.active) {
  background-color: #f1f5f9;
  color: #1e293b;
}

.live-dot-sm {
  width: 8px;
  height: 8px;
  background-color: #10b981;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 5px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.font-xs { font-size: 0.75rem; }
.shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
.text-silver { color: #cbd5e1; }

.hover-opacity-100:hover { opacity: 1 !important; }
.hover-bg-white:hover { background-color: white !important; }
.hover-bg-light:hover { background-color: #f8fafc !important; }
.hover-shadow-sm:hover { box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06) !important; }
.hover-scale:hover { transform: scale(1.02); }
.hover-bg-purple:hover { background-color: #8b5cf6 !important; }
.hover-text-white:hover { color: white !important; }

.bg-danger-subtle { background-color: rgba(239, 68, 68, 0.1); }
.bg-light-purple { background-color: #f5f3ff; }
.bg-white\/20 { background-color: rgba(255, 255, 255, 0.2); }

.fw-black { font-weight: 900; }
.font-xxs { font-size: 0.6rem; }

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
