export function validateEmail(email) {
  if (!email || !email.trim()) {
    return "Email is required.";
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email.trim())) {
    return "Enter a valid email address.";
  }

  return "";
}

export function validatePassword(password) {
  if (!password) {
    return "Password is required.";
  }

  if (password.length < 6) {
    return "Password must contain at least 6 characters.";
  }

  return "";
}

export function validateRequired(value, fieldName) {
  if (!value || !value.trim()) {
    return `${fieldName} is required.`;
  }

  return "";
}
