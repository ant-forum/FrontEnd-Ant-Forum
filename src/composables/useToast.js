import { useToast as useToastification } from "vue-toastification";

export const toastOptions = {
  position: "top-right",
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: false,
  pauseOnHover: false,
  draggable: false,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
};

export function useToast() {
  const toast = useToastification();

  const success = (message, options = {}) =>
    toast.success(message, { ...toastOptions, ...options, timeout: 2000 });
  const error = (message, options = {}) =>
    toast.error(message, { ...toastOptions, ...options, timeout: 2000 });
  const info = (message, options = {}) =>
    toast.info(message, { ...toastOptions, ...options, timeout: 2000 });
  const warning = (message, options = {}) =>
    toast.warning(message, { ...toastOptions, ...options, timeout: 2000 });

  return {
    success,
    error,
    info,
    warning,
  };
}
