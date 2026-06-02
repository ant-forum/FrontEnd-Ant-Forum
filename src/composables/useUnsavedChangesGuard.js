import { onBeforeUnmount, onMounted, unref } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';

const DEFAULT_MESSAGE = 'You have unsaved changes. Leave this page and discard them?';

export function useUnsavedChangesGuard(hasUnsavedChanges, message = DEFAULT_MESSAGE) {
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
    return window.confirm(message);
  });
}
