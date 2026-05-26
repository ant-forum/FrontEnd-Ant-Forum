<template>
  <div
    class="skeleton-loader"
    :class="[`skeleton-${variant}`, { 'skeleton-round': round }]"
  >
    <div
      class="skeleton-item"
      :style="{ width: width, height: height, borderRadius: borderRadius }"
    ></div>
  </div>
</template>

<script setup>
defineProps({
  width: {
    type: String,
    default: "100%",
  },
  height: {
    type: String,
    default: "20px",
  },
  borderRadius: {
    type: String,
    default: "var(--radius-sm)",
  },
  variant: {
    type: String,
    default: "text",
    validator: (value) => ["text", "card", "avatar", "image"].includes(value),
  },
  round: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.skeleton-loader {
  display: inline-block;
  width: 100%;
  line-height: 0;
}

.skeleton-item {
  background: linear-gradient(
    90deg,
    var(--color-surface) 25%,
    var(--color-surface-hover) 50%,
    var(--color-surface) 75%
  );
  background-size: 200% 100%;
  animation: loading 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
  display: block;
  overflow: hidden;
}

.skeleton-round .skeleton-item {
  border-radius: 50%;
}

.skeleton-card .skeleton-item {
  border-radius: 1rem;
}

.skeleton-avatar .skeleton-item {
  border-radius: 50%;
}

.skeleton-image .skeleton-item {
  border-radius: 0.75rem;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
