const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");

router.post("/register", authController.register);

router.post("/login", authController.login);

router.post("/change-password", auth, authController.changePassword);

router.post("/forgot-password", authController.forgotPassword);

router.post("/reset-password", authController.resetPassword);

module.exports = router;
