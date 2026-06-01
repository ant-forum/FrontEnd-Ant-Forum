import { reactive } from "vue";

export function useRequiredValidator() {
  const errors = reactive({});

  const validateField = (field, value, message) => {
    const isValid = typeof value === "string" ? value.trim() !== "" : !!value;
    errors[field] = isValid ? "" : message;
    return isValid;
  };

  const clearError = (field) => {
    errors[field] = "";
  };


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


  const validatePassword = (value) => {
    if (!value || value === "") {
      errors.password = "Password is required.";
      return false;
    }
    if (value.length < 8) {
      errors.password = "Password must be at least 8 characters.";
      return false;
    }
    // Requires at least one uppercase letter, one lowercase letter, one number, and one special character
    const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-#.+=(){}[\]^~])[A-Za-z\d@$!%*?&_\-#.+=(){}[\]^~]{8,}$/;
    if (!STRONG_PASSWORD_REGEX.test(value)) {
      errors.password = "Password must include uppercase, lowercase, numbers, and special characters.";
      return false;
    }
    errors.password = "";
    return true;
  };


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
