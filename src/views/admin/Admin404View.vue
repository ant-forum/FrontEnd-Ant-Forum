<template>
  <AdminPageShell
    title="Page Not Found"
    kicker="404 Error"
    subtitle="The administrative page you are looking for does not exist or has been moved."
  >
    <div class="admin-404-container d-flex flex-column align-items-center justify-content-center py-5 bg-surface rounded-4 border text-center my-4">
      <div class="error-illustration mb-4">
        <h1 class="error-code fw-extrabold m-0">404</h1>
        <div class="glow-ring"></div>
      </div>
      <h3 class="fw-bold text-adaptive mb-2">Oops! Page not found</h3>
      <p class="text-muted mx-auto mb-4 px-3" style="max-width: 480px">
        The system could not locate the requested operations panel or database resource. Please verify the URL address or click below to return safely.
      </p>
      <div class="d-flex gap-2">
        <router-link to="/admin" class="btn btn-primary rounded-pill px-4 fw-bold">
          <i class="bi bi-house-door-fill me-1"></i> Control Center
        </router-link>
        <button @click="$router.back()" class="btn btn-outline-primary rounded-pill px-4 fw-bold">
          <i class="bi bi-arrow-left me-1"></i> Go Back
        </button>
      </div>
    </div>
  </AdminPageShell>
</template>

<script setup>
import AdminPageShell from "../../components/admin/AdminPageShell.vue";
</script>

<style scoped>
.admin-404-container {
  min-height: 400px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
}

.error-illustration {
  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

.error-code {
  font-size: 6.5rem;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(
    135deg,
    var(--color-primary) 0%,
    var(--color-blue) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -3px;
  z-index: 2;
  filter: drop-shadow(0 4px 12px var(--color-primary-light));
}

.glow-ring {
  position: absolute;
  width: 120px;
  height: 120px;
  background: radial-gradient(
    circle,
    var(--color-primary-light) 0%,
    transparent 70%
  );
  border-radius: 50%;
  z-index: 1;
  animation: pulse-ring 3s ease-in-out infinite;
}

@keyframes pulse-ring {
  0%,
  100% {
    transform: scale(0.95);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.8;
  }
}
</style>
