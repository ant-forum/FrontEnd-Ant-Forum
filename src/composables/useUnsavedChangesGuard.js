import { onBeforeUnmount, onMounted, ref, unref } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';

const DEFAULT_MESSAGE = 'You have unsaved changes. Leave this page and discard them?';

export function useUnsavedChangesGuard(hasUnsavedChanges, message = DEFAULT_MESSAGE, options = {}) {
  const showLeaveModal = ref(false);
  const pendingLeave = ref(null);
  const shouldWarn = () => Boolean(unref(hasUnsavedChanges));

  const handleBeforeUnload = (event) => {
    if (!shouldWarn()) return;
    event.preventDefault();
    event.returnValue = '';
  };

  onMounted(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  });

  onBeforeRouteLeave(() => {
    if (!shouldWarn()) return true;

    if (!options.useModal) {
      return window.confirm(message);
    }

    showLeaveModal.value = true;

    return new Promise((resolve) => {
      pendingLeave.value = resolve;
    });
  });

  const confirmLeave = () => {
    showLeaveModal.value = false;
    pendingLeave.value?.(true);
    pendingLeave.value = null;
  };

  const cancelLeave = () => {
    showLeaveModal.value = false;
    pendingLeave.value?.(false);
    pendingLeave.value = null;
  };

  return {
    showLeaveModal,
    message,
    confirmLeave,
    cancelLeave,
  };
}
