import { useToast as useToastification } from "vue-toastification";

export const toastOptions = {
  position: "top-right",
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: "button",
  icon: true,
  rtl: false,
};

export function useToast() {
  const toast = useToastification();

  const success = (message) => toast.success(message);
  const error = (message) => toast.error(message);
  const info = (message) => toast.info(message);
  const warning = (message) => toast.warning(message);

  return {
    success,
    error,
    info,
    warning,
  };
}
