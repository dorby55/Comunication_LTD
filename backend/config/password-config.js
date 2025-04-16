// config/password-config.js
module.exports = {
  minLength: 10,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  passwordHistory: 3,
  // List of common words that shouldn't be used in passwords
  commonWords: [
    "password",
    "welcome",
    "123456",
    "admin",
    "qwerty",
    "letmein",
    "monkey",
    "abc123",
    "football",
    "iloveyou",
    "sunshine",
    "princess",
    "dragon",
    "administrator",
    "shadow",
  ],
  maxLoginAttempts: 3,
};
