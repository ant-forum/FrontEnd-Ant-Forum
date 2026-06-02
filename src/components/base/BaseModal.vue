<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        class="modal fade show"
        tabindex="-1"
        role="dialog"
        @click.self="$emit('closeModal')"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <header class="modal-header">
              <div class="modal-title-row">
                <i v-if="icon" :class="[icon, 'modal-icon', themeClass]"></i>
                <div>
                  <p v-if="kicker">{{ kicker }}</p>
                  <h2 :class="themeClass">{{ title }}</h2>
                </div>
              </div>
              <button
                class="modal-close"
                type="button"
                aria-label="Close"
                title="Close"
                @click="$emit('closeModal')"
              >
                <i class="bi bi-x-lg"></i>
              </button>
            </header>

            <div class="modal-body">
              <slot></slot>
            </div>

            <footer v-if="$slots.footer" class="modal-footer">
              <slot name="footer"></slot>
            </footer>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="backdrop">
      <div class="modal-backdrop fade show"></div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
  theme: {
    type: String,
    default: 'primary',
  },
  kicker: {
    type: String,
    default: '',
  },
});

const themeClass = computed(() => `text-${props.theme}`);

defineEmits(['closeModal']);
</script>

<style scoped>
.modal {
  display: block;
}

.modal-content {
  overflow: hidden;
  color: var(--color-text);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
}

.modal-header,
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.15rem;
  border-color: var(--color-border);
}

.modal-title-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.modal-title-row p {
  color: var(--color-primary);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  margin: 0 0 0.2rem;
  text-transform: uppercase;
}

.modal-title-row h2 {
  font-size: 1rem;
  font-weight: 800;
  margin: 0;
}

.text-primary {
  color: var(--color-primary) !important;
}

.modal-icon {
  font-size: 1.15rem;
}

.modal-body {
  padding: 1.15rem;
}

.modal-footer {
  justify-content: flex-end;
}

.modal-close {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.modal-close:hover {
  color: var(--color-text);
  background: var(--color-surface-hover);
}

.modal-backdrop {
  background-color: rgba(2, 6, 23, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.modal-enter-active,
.modal-leave-active,
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.15s ease;
}

.modal-enter-active .modal-dialog,
.modal-leave-active .modal-dialog {
  transition: transform 0.25s ease-out;
}

.modal-enter-from,
.modal-leave-to,
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-dialog,
.modal-leave-to .modal-dialog {
  transform: scale(0.96) translateY(-12px);
}
</style>
