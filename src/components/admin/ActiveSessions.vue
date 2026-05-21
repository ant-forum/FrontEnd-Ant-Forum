<template>
  <div class="active-sessions-card card border-0 shadow-sm rounded-4 overflow-hidden">
    <div class="card-header bg-white border-0 p-4 pb-2 d-flex justify-content-between align-items-center">
      <div>
        <h6 class="fw-bold mb-0">Active Sessions</h6>
        <p class="text-muted xx-small text-uppercase fw-bold mb-0 tracking-wider">Real-time presence</p>
      </div>
      <div class="live-indicator px-2 py-1 rounded-pill d-flex align-items-center gap-2">
        <span class="pulse-dot"></span>
        <span class="fw-bold text-primary" style="font-size: 0.65rem;">{{ filteredSessions.length }} LIVE</span>
      </div>
    </div>

    <div class="px-4 pb-3">
      <div class="input-group input-group-sm search-mini border rounded-pill overflow-hidden bg-light">
        <span class="input-group-text bg-transparent border-0 pe-0"><i class="bi bi-search text-muted xx-small"></i></span>
        <input v-model="searchQuery" type="text" class="form-control border-0 bg-transparent py-1 x-small" placeholder="Search sessions...">
      </div>
    </div>

    <div class="card-body p-0">
      <div class="session-list custom-scrollbar" style="max-height: 420px; overflow-y: auto;">
        <div v-for="session in filteredSessions" :key="session.id" 
             class="session-item d-flex align-items-center p-4 transition-all cursor-pointer">
          <div class="avatar-container position-relative me-3">
            <img :src="session.avatar" :alt="session.name" class="rounded-circle border border-2 border-white shadow-sm" width="44" height="44">
            <span :class="['status-ring position-absolute bottom-0 end-0 rounded-circle', session.status]"></span>
          </div>
          
          <div class="session-info flex-grow-1 min-width-0">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <p class="mb-0 fw-bold text-truncate" style="font-size: 0.9rem;">{{ session.name }}</p>
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
            <button class="btn btn-icon btn-light btn-sm rounded-circle shadow-sm" title="Message">
              <i class="bi bi-chat-text" style="font-size: 0.75rem;"></i>
            </button>
            <button @click.stop="terminateSession(session.id)" class="btn btn-icon btn-light-danger btn-sm rounded-circle shadow-sm" title="Terminate Session">
              <i class="bi bi-power" style="font-size: 0.75rem;"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card-footer bg-light-subtle border-0 p-3">
      <button class="btn btn-white w-100 rounded-pill py-2 border shadow-sm fw-bold text-uppercase" style="font-size: 0.7rem; letter-spacing: 1px;">
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
.session-item {
  border-bottom: 1px solid rgba(0,0,0,0.03);
}

.session-item:last-child {
  border-bottom: none;
}

.session-item:hover {
  background-color: #f8fafc;
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
  width: 14px;
  height: 14px;
  border: 3px solid #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.online { background-color: #10b981; }
.away { background-color: #f59e0b; }

.live-indicator {
  background-color: rgba(99, 102, 241, 0.08);
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background-color: #6366f1;
  border-radius: 50%;
  animation: pulse-ring 1.5s infinite;
}

@keyframes pulse-ring {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(99, 102, 241, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
}

.xx-small { font-size: 0.6rem; }
.x-small { font-size: 0.75rem; }
.tracking-wider { letter-spacing: 0.08em; }

.search-mini {
  background: #f1f5f9;
  border-color: #e2e8f0 !important;
}

.search-mini input:focus {
  box-shadow: none;
}

.btn-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
}

.btn-light-danger {
  background-color: rgba(239, 68, 68, 0.08);
  color: #ef4444;
  border: none;
}

.btn-light-danger:hover {
  background-color: #ef4444;
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
  background: #e2e8f0;
  border-radius: 10px;
}
</style>
