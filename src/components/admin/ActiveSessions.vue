<template>
  <div class="active-sessions-card card border-0 shadow-sm rounded-4 overflow-hidden bg-surface border">
    <div class="card-header bg-surface border-0 p-4 pb-2 d-flex justify-content-between align-items-center">
      <div>
        <h6 class="fw-bold mb-0 text-adaptive">Active Sessions</h6>
        <p class="text-muted xx-small text-uppercase fw-bold mb-0 tracking-wider">Real-time presence</p>
      </div>
      <div class="live-indicator px-2 py-1 rounded-pill d-flex align-items-center gap-2 border border-theme">
        <span class="pulse-dot"></span>
        <span class="fw-bold text-purple" style="font-size: 0.65rem;">{{ filteredSessions.length }} LIVE</span>
      </div>
    </div>

    <div class="px-4 pb-3">
      <div class="input-group input-group-sm search-mini border border-theme rounded-pill overflow-hidden bg-surface-hover">
        <span class="input-group-text bg-transparent border-0 pe-0"><i class="bi bi-search text-muted xx-small"></i></span>
        <input v-model="searchQuery" type="text" class="form-control border-0 bg-transparent py-1 x-small text-adaptive" placeholder="Search sessions...">
      </div>
    </div>

    <div class="card-body p-0">
      <div class="session-list custom-scrollbar" style="max-height: 420px; overflow-y: auto;">
        <div v-for="session in filteredSessions" :key="session.id" 
             class="session-item d-flex align-items-center p-4 transition-all cursor-pointer border-bottom border-theme">
          <div class="avatar-container position-relative me-3">
            <img :src="session.avatar" :alt="session.name" class="rounded-circle border border-2 border-theme shadow-sm" width="44" height="44">
            <span :class="['status-ring position-absolute bottom-0 end-0 rounded-circle', session.status]"></span>
          </div>
          
          <div class="session-info flex-grow-1 min-width-0">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <p class="mb-0 fw-bold text-truncate text-adaptive" style="font-size: 0.9rem;">{{ session.name }}</p>
              <div class="d-flex align-items-center gap-2">
                <i :class="['bi', session.deviceIcon, 'text-muted']" style="font-size: 0.75rem;"></i>
                <span class="text-muted xx-small fw-bold">{{ session.time }}</span>
              </div>
            </div>
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-geo-alt text-muted" style="font-size: 0.7rem;"></i>
              <small class="text-muted text-truncate fw-semibold" style="font-size: 0.65rem;">{{ session.location }}</small>
            </div>
          </div>

          <div class="session-actions ms-3 d-flex gap-1 opacity-0">
            <button class="btn btn-icon btn-surface-hover btn-sm rounded-circle shadow-sm border" title="Message">
              <i class="bi bi-chat-text text-adaptive" style="font-size: 0.75rem;"></i>
            </button>
            <button @click.stop="terminateSession(session.id)" class="btn btn-icon btn-light-danger btn-sm rounded-circle shadow-sm border" title="Terminate Session">
              <i class="bi bi-power" style="font-size: 0.75rem;"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card-footer bg-surface-hover border-0 p-3 border-top border-theme">
      <button class="btn btn-surface w-100 rounded-pill py-2 border shadow-sm fw-bold text-uppercase text-adaptive" style="font-size: 0.7rem; letter-spacing: 1px;">
        View Monitoring Console
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const searchQuery = ref('');

const sessions = ref([
  {
    id: 1,
    name: 'Julianna Danilova',
    location: 'Stockholm, Sweden',
    time: 'Just now',
    avatar: 'https://i.pravatar.cc/150?u=julianna',
    status: 'online',
    deviceIcon: 'bi-laptop'
  },
  {
    id: 2,
    name: 'Markus Thorne',
    location: 'San Francisco, US',
    time: '2m ago',
    avatar: 'https://i.pravatar.cc/150?u=markus',
    status: 'online',
    deviceIcon: 'bi-phone'
  },
  {
    id: 3,
    name: 'Sarah Yozakura',
    location: 'Tokyo, Japan',
    time: '5m ago',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    status: 'away',
    deviceIcon: 'bi-tablet'
  },
  {
    id: 4,
    name: 'Alex Kovac',
    location: 'Berlin, Germany',
    time: '12m ago',
    avatar: 'https://i.pravatar.cc/150?u=alexk',
    status: 'online',
    deviceIcon: 'bi-display'
  },
  {
    id: 5,
    name: 'Elena Vance',
    location: 'London, UK',
    time: '15m ago',
    avatar: 'https://i.pravatar.cc/150?u=elena',
    status: 'online',
    deviceIcon: 'bi-laptop'
  }
]);

const filteredSessions = computed(() => {
  if (!searchQuery.value) return sessions.value;
  const query = searchQuery.value.toLowerCase();
  return sessions.value.filter(s => 
    s.name.toLowerCase().includes(query) || 
    s.location.toLowerCase().includes(query)
  );
});

const terminateSession = (id) => {
  if (confirm('Are you sure you want to terminate this user session? They will be logged out immediately.')) {
    sessions.value = sessions.value.filter(s => s.id !== id);
  }
};
</script>

<style scoped>
.active-sessions-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
}

.session-item:last-child {
  border-bottom: none !important;
}

.session-item:hover {
  background-color: var(--color-surface-hover);
}

.session-item:hover .session-actions {
  opacity: 1;
}

.avatar-container img {
  transition: transform 0.3s ease;
}

.session-item:hover .avatar-container img {
  transform: scale(1.1);
}

.status-ring {
  width: 12px;
  height: 12px;
  border: 2px solid var(--color-surface);
}

.online { background-color: var(--color-success); }
.away { background-color: var(--color-warning); }

.live-indicator {
  background-color: var(--color-primary-light);
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background-color: var(--color-primary);
  border-radius: 50%;
  animation: pulse-ring 1.5s infinite;
}

@keyframes pulse-ring {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 var(--color-primary-light); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(99, 102, 241, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 var(--color-primary-light); }
}

.xx-small { font-size: 0.6rem; }
.x-small { font-size: 0.75rem; }
.tracking-wider { letter-spacing: 0.08em; }

.search-mini input:focus {
  box-shadow: none;
}

.btn-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-light-danger {
  background-color: var(--color-danger-light);
  color: var(--color-danger);
  border: none;
}

.btn-light-danger:hover {
  background-color: var(--color-danger);
  color: white;
}

.transition-all {
  transition: all 0.2s ease;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 10px;
}

.bg-surface { background-color: var(--color-surface) !important; }
.bg-surface-hover { background-color: var(--color-surface-hover) !important; }
.text-adaptive { color: var(--color-text) !important; }
.border-theme { border-color: var(--color-border) !important; }
.btn-surface { background-color: var(--color-surface); color: var(--color-text); }
.text-purple { color: var(--color-purple) !important; }
</style>
