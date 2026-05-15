import { reactive } from "vue";

export function useRequiredValidator() {
  const errors = reactive({});

  const validateField = (field, value, message) => {
    // Check if value is empty (or empty string after trim)
    const isValid = typeof value === "string" ? value.trim() !== "" : !!value;
    errors[field] = isValid ? "" : message;
    return isValid;
  };

  const clearError = (field) => {
    errors[field] = "";
  };

  return { errors, validateField, clearError };
}
