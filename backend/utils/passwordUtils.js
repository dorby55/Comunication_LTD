// utils/passwordUtils.js
const passwordConfig = require("../config/password-config");
const crypto = require("crypto");

// Validate password complexity
const validatePassword = (password) => {
  const errors = [];

  // Check length
  if (password.length < passwordConfig.minLength) {
    errors.push(
      `Password must be at least ${passwordConfig.minLength} characters long`
    );
  }

  // Check for uppercase
  if (passwordConfig.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Password must include at least one uppercase letter");
  }

  // Check for lowercase
  if (passwordConfig.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("Password must include at least one lowercase letter");
  }

  // Check for numbers
  if (passwordConfig.requireNumbers && !/[0-9]/.test(password)) {
    errors.push("Password must include at least one number");
  }

  // Check for special characters
  if (
    passwordConfig.requireSpecialChars &&
    !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  ) {
    errors.push("Password must include at least one special character");
  }

  // Check against common words
  const lowerPassword = password.toLowerCase();
  for (const word of passwordConfig.commonWords) {
    if (lowerPassword.includes(word)) {
      errors.push(`Password cannot contain common words like "${word}"`);
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Generate password reset token (SHA-1)
const generateResetToken = () => {
  const randomBytes = crypto.randomBytes(20).toString("hex");
  return crypto.createHash("sha1").update(randomBytes).digest("hex");
};

module.exports = {
  validatePassword,
  generateResetToken,
};
