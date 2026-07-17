const express = require("express");
const { body } = require("express-validator");
const rateLimit = require("express-rate-limit");
const { register, login, refresh, getProfile } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Slows down brute-force login/registration attempts.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many attempts. Please try again in a few minutes." },
});

router.post(
  "/register",
  authLimiter,
  [
    body("fullName").trim().isLength({ min: 2 }).withMessage("Full name is too short"),
    body("email").isEmail().withMessage("A valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  register
);

router.post(
  "/login",
  authLimiter,
  [
    body("email").isEmail().withMessage("A valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  login
);

router.post("/refresh", refresh);
router.get("/me", protect, getProfile);

module.exports = router;
