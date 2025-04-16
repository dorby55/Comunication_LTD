// routes/auth.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");

// Register user
router.post("/register", authController.register);

// Login user
router.post("/login", authController.login);

// Change password (protected route)
router.post("/change-password", auth, authController.changePassword);

// Request password reset
router.post("/forgot-password", authController.forgotPassword);

// Reset password with token
router.post("/reset-password", authController.resetPassword);

module.exports = router;
