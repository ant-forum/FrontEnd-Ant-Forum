import { reactive } from "vue";

export function useRequiredValidator() {
  const errors = reactive({});

  // ─── Generic ────────────────────────────────────────────────────────────────

  const validateField = (field, value, message) => {
    const isValid = typeof value === "string" ? value.trim() !== "" : !!value;
    errors[field] = isValid ? "" : message;
    return isValid;
  };

  const clearError = (field) => {
    errors[field] = "";
  };

  // ─── Email ───────────────────────────────────────────────────────────────────

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateEmail = (value) => {
    if (!value || value.trim() === "") {
      errors.email = "Email is required.";
      return false;
    }
    if (!EMAIL_REGEX.test(value.trim())) {
      errors.email = "Please enter a valid email address.";
      return false;
    }
    errors.email = "";
    return true;
  };

  // ─── Password ────────────────────────────────────────────────────────────────

  const validatePassword = (value) => {
    if (!value || value === "") {
      errors.password = "Password is required.";
      return false;
    }
    if (value.length < 6) {
      errors.password = "Password must be at least 6 characters.";
      return false;
    }
    errors.password = "";
    return true;
  };

  // ─── Username ────────────────────────────────────────────────────────────────

  const validateUsername = (value) => {
    if (!value || value.trim() === "") {
      errors.username = "Username is required.";
      return false;
    }
    errors.username = "";
    return true;
  };

  return {
    errors,
    clearError,
    validateField,
    validateEmail,
    validatePassword,
    validateUsername,
  };
}
