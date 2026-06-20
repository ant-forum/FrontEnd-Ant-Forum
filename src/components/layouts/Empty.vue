<template>
  <div class="empty-container">
    <div class="empty-icon-wrapper">
      <slot name="icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="empty-svg"
        >
          <path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3"></path>
          <path
            d="m21 12-3.05 1.74a2 2 0 0 1-2 0L12 11.5l-3.95 2.26a2 2 0 0 1-2 0L3 12"
          ></path>
          <path d="M3 16v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3"></path>
        </svg>
      </slot>
    </div>
    <h3 class="empty-title">{{ title }}</h3>
    <p class="empty-description">{{ description }}</p>
    <div class="empty-actions" v-if="$slots.actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: "No results found",
  },
  description: {
    type: String,
    default:
      "We couldn't find what you're looking for. Try adjusting your search or filters.",
  },
});
</script>

<style scoped>
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  width: 100%;
  background: linear-gradient(180deg, #fafafa 0%, #ffffff 100%);
  border-radius: 1.5rem;
  border: 1px solid #f1f5f9;
}

.empty-icon-wrapper {
  background: #f8fafc;
  width: 100px;
  height: 100px;
  border-radius: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: #94a3b8;
  transition: transform 0.3s ease;
}

.empty-container:hover .empty-icon-wrapper {
  transform: scale(1.05) rotate(2deg);
  color: #8b5cf6;
}

.empty-title {
  font-family: "Inter", sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.75rem;
}

.empty-description {
  font-family: "Inter", sans-serif;
  font-size: 1rem;
  color: #64748b;
  max-width: 350px;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.empty-actions {
  display: flex;
  gap: 1rem;
}
</style>
