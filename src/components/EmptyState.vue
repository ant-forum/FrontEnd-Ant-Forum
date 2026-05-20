<template>
  <div class="empty-state text-center p-5">
    <div class="empty-icon mb-3">
      <slot name="icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="1.5"
          class="text-muted"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </slot>
    </div>
    <h3 class="empty-title h5 mb-2">{{ title }}</h3>
    <p class="empty-description text-muted mb-4">{{ description }}</p>
    <div class="empty-action" v-if="$slots.action || actionText">
      <slot name="action">
        <button
          v-if="actionText"
          class="btn btn-primary"
          @click="$emit('action')"
        >
          {{ actionText }}
        </button>
      </slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: "No data available",
  },
  description: {
    type: String,
    default: "There is no data to display at this time.",
  },
  actionText: {
    type: String,
    default: "",
  },
});

defineEmits(["action"]);
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 300px;
  background-color: var(--bg-grid, #f8f9fa);
  border-radius: var(--radius-lg);
  border: 1px dashed var(--input-border, #ced4da);
}

.empty-icon {
  color: #adb5bd;
}

.empty-title {
  color: var(--text-dark, #212529);
  font-weight: 600;
}

.empty-description {
  max-width: 400px;
  margin: 0 auto;
}
</style>
