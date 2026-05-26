<template>
  <div class="system-events-card card border-0 shadow-sm rounded-4 overflow-hidden bg-surface border">
    <div class="card-header bg-surface border-0 p-4 pb-0 d-flex justify-content-between align-items-center">
      <h6 class="fw-bold mb-0 text-adaptive">Platform Audit Trail</h6>
      <button class="btn btn-link btn-sm text-purple fw-bold text-decoration-none p-0">Clear Logs</button>
    </div>

    <div class="card-body p-4 pt-3">
      <div class="events-timeline">
        <div v-for="event in events" :key="event.id" class="event-item d-flex gap-3 mb-4 last-child-mb-0">
          <div class="event-icon-container">
            <div :class="['event-icon rounded-circle d-flex align-items-center justify-content-center shadow-sm', event.bgClass]">
              <i :class="['bi', event.icon, event.textClass]"></i>
            </div>
            <div class="timeline-line"></div>
          </div>
          
          <div class="event-content pb-2 flex-grow-1">
            <div class="d-flex justify-content-between align-items-start mb-1">
              <span class="fw-bold small text-adaptive">{{ event.action }}</span>
              <span class="text-muted xx-small fw-bold">{{ event.time }}</span>
            </div>
            <p class="text-muted small mb-1">{{ event.details }}</p>
            <div class="d-flex align-items-center gap-2">
              <img :src="event.userAvatar" class="rounded-circle border border-theme" width="18" height="18">
              <span class="xx-small fw-bold text-purple">{{ event.user }}</span>
              <span class="text-silver mx-1">•</span>
              <span class="xx-small text-muted fw-bold">{{ event.ip }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card-footer bg-surface-hover border-0 p-3 border-top border-theme">
      <button class="btn btn-surface w-100 rounded-pill py-2 border shadow-sm fw-bold text-uppercase text-adaptive" style="font-size: 0.7rem; letter-spacing: 1px;">
        Download Security Report
      </button>
    </div>
  </div>
</template>

<script setup>
const events = [
  {
    id: 1,
    action: 'Settings Modified',
    details: 'System maintenance mode was disabled',
    user: 'Alex Rivera',
    userAvatar: 'https://i.pravatar.cc/150?u=alex',
    time: '2m ago',
    ip: '192.168.1.1',
    icon: 'bi-gear-fill',
    bgClass: 'bg-purple-light',
    textClass: 'text-purple'
  },
  {
    id: 2,
    action: 'User Suspended',
    details: 'Account @spammer_01 was suspended for policy violation',
    user: 'Elena Fisher',
    userAvatar: 'https://i.pravatar.cc/150?u=elena',
    time: '45m ago',
    ip: '172.16.0.42',
    icon: 'bi-person-x-fill',
    bgClass: 'bg-danger-light',
    textClass: 'text-danger'
  },
  {
    id: 3,
    action: 'New API Key',
    details: 'Production integration key was generated',
    user: 'Alex Rivera',
    userAvatar: 'https://i.pravatar.cc/150?u=alex',
    time: '2h ago',
    ip: '192.168.1.1',
    icon: 'bi-key-fill',
    bgClass: 'bg-info-light',
    textClass: 'text-info'
  },
  {
    id: 4,
    action: 'Security Alert',
    details: 'Failed login attempt from unauthorized location (RU)',
    user: 'System',
    userAvatar: 'https://i.pravatar.cc/150?u=system',
    time: '5h ago',
    ip: '95.161.224.12',
    icon: 'bi-shield-exclamation',
    bgClass: 'bg-warning-light',
    textClass: 'text-warning'
  }
];
</script>

<style scoped>
.system-events-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
}

.event-item {
  position: relative;
}

.event-icon {
  width: 36px;
  height: 36px;
  z-index: 2;
  position: relative;
}

.timeline-line {
  position: absolute;
  top: 36px;
  left: 18px;
  bottom: -24px;
  width: 2px;
  background-color: var(--color-border);
  z-index: 1;
}

.event-item:last-child .timeline-line {
  display: none;
}

.xx-small { font-size: 0.6rem; }
.text-silver { color: var(--color-border); }

.bg-purple-light { background-color: var(--color-purple-light); }
.text-purple { color: var(--color-purple); }

.bg-danger-light { background-color: var(--color-danger-light); }
.text-danger { color: var(--color-danger); }

.bg-info-light { background-color: var(--color-info-light); }
.text-info { color: var(--color-info); }

.bg-warning-light { background-color: var(--color-warning-light); }
.text-warning { color: var(--color-warning); }

.last-child-mb-0:last-child {
  margin-bottom: 0 !important;
}

.bg-surface { background-color: var(--color-surface) !important; }
.bg-surface-hover { background-color: var(--color-surface-hover) !important; }
.text-adaptive { color: var(--color-text) !important; }
.border-theme { border-color: var(--color-border) !important; }
.btn-surface { background-color: var(--color-surface); color: var(--color-text); }
</style>
