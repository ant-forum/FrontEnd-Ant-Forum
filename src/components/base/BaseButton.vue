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
    border-radius: 0.5rem;
  }

  .btn-primary {
    background-color: #25397e;
    border-color: #25397e;
    color: #fff;
  }
</style>