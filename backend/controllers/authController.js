// controllers/authController.js
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const {
  validatePassword,
  generateResetToken,
} = require("../utils/passwordUtils");
const { sendPasswordResetEmail } = require("../utils/emailService");
const passwordConfig = require("../config/password-config");

// Register user
exports.register = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // Check if username already exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Check if email already exists
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Validate password
    const { isValid, errors } = validatePassword(password);
    if (!isValid) {
      return res
        .status(400)
        .json({ message: "Password requirements not met", errors });
    }

    // Create user
    const userId = await User.create(username, password, email);

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if account is locked
    if (user.failed_login_attempts >= passwordConfig.maxLoginAttempts) {
      return res
        .status(401)
        .json({
          message:
            "Account locked due to too many failed login attempts. Please reset your password.",
        });
    }

    // Verify password
    const isMatch = await User.checkPassword(
      password,
      user.password_hash,
      user.salt
    );
    if (!isMatch) {
      // Increment failed login attempts
      await User.incrementLoginAttempts(user.user_id);

      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Reset failed login attempts
    await User.resetLoginAttempts(user.user_id);

    // Create JWT
    const payload = {
      user: {
        id: user.user_id,
        username: user.username,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get user
    const user = await User.findByUsername(req.user.username);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await User.checkPassword(
      currentPassword,
      user.password_hash,
      user.salt
    );
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Validate new password
    const { isValid, errors } = validatePassword(newPassword);
    if (!isValid) {
      return res
        .status(400)
        .json({ message: "Password requirements not met", errors });
    }

    // Check if new password is in history
    const isInHistory = await User.isPasswordInHistory(userId, newPassword);
    if (isInHistory) {
      return res.status(400).json({ message: "Cannot reuse recent passwords" });
    }

    // Update password
    await User.updatePassword(userId, newPassword);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Request password reset
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      // To prevent email enumeration, still return success even if email doesn't exist
      return res.json({
        message:
          "If your email exists in our system, you will receive a reset token shortly",
      });
    }

    // Generate reset token (SHA-1)
    const resetToken = generateResetToken();

    // Set token expiry (1 hour from now)
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 1);

    // Save token to user
    await User.updateResetToken(user.user_id, resetToken, tokenExpiry);

    // Send email with token
    await sendPasswordResetEmail(email, resetToken);

    res.json({
      message:
        "If your email exists in our system, you will receive a reset token shortly",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Reset password with token
exports.resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    // Find user by reset token
    const user = await User.findByResetToken(token);

    if (!user || user.email !== email) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    // Validate new password
    const { isValid, errors } = validatePassword(newPassword);
    if (!isValid) {
      return res
        .status(400)
        .json({ message: "Password requirements not met", errors });
    }

    // Check if new password is in history
    const isInHistory = await User.isPasswordInHistory(
      user.user_id,
      newPassword
    );
    if (isInHistory) {
      return res.status(400).json({ message: "Cannot reuse recent passwords" });
    }

    // Update password
    await User.updatePassword(user.user_id, newPassword);

    // Clear reset token
    await User.updateResetToken(user.user_id, null, null);

    // Reset failed login attempts
    await User.resetLoginAttempts(user.user_id);

    res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
