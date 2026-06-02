<template>
  <button
    :class="`btn btn-${variant} px-4`"
    :disabled="isDisabled || isLoading"
    :type="type"
    @click="$emit('click')"
  >
    <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
    <slot></slot>
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: "primary",
  },
  type: {
    type: String,
    default: "button",
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
});
defineEmits(["click"]);
</script>

<style>
.btn {
  font-weight: 600;
  border-radius: var(--radius-md);
  transition:
    background-color var(--transition-base),
    border-color var(--transition-base),
    box-shadow var(--transition-base),
    transform var(--transition-fast);
}

.btn-primary {
  --color-primary: #6366f1;
  --color-primary-hover: #4f46e5;
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}
</style>
