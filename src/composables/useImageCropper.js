import { computed, onBeforeUnmount, ref } from "vue";

export function useImageCropper(defaultOptions = {}) {
  const cropSource = ref(null);
  const pendingResolver = ref(null);

  const isCropModalOpen = computed(() => Boolean(cropSource.value));

  const closeCropper = () => {
    if (cropSource.value?.url?.startsWith("blob:")) {
      URL.revokeObjectURL(cropSource.value.url);
    }

    cropSource.value = null;
  };

  const openCropper = (file, options = {}) =>
    new Promise((resolve) => {
      if (pendingResolver.value) {
        pendingResolver.value(null);
        pendingResolver.value = null;
      }

      closeCropper();

      cropSource.value = {
        file,
        url: URL.createObjectURL(file),
        options: {
          ...defaultOptions,
          ...options,
        },
      };
      pendingResolver.value = resolve;
    });

  const confirmCrop = (result) => {
    pendingResolver.value?.(result);
    pendingResolver.value = null;
    closeCropper();
  };

  const cancelCrop = () => {
    pendingResolver.value?.(null);
    pendingResolver.value = null;
    closeCropper();
  };

  onBeforeUnmount(() => {
    pendingResolver.value?.(null);
    pendingResolver.value = null;
    closeCropper();
  });

  return {
    cropSource,
    isCropModalOpen,
    openCropper,
    confirmCrop,
    cancelCrop,
  };
}
