const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateToken");

// @desc   Register a new citizen (admins/officers are seeded/created separately)
// @route  POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((e) => e.msg).join(", "));
  }

  const { fullName, email, phone, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409);
    throw new Error("An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ fullName, email, phone, passwordHash, role: "citizen" });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.status(201).json({ user, accessToken, refreshToken });
});

// @desc   Login for citizens, officers, and admins
// @route  POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((e) => e.msg).join(", "));
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.json({ user, accessToken, refreshToken });
});

// @desc   Exchange a valid refresh token for a new access token
// @route  POST /api/auth/refresh
const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400);
    throw new Error("Refresh token is required");
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401);
      throw new Error("User no longer exists");
    }
    const accessToken = generateAccessToken(user);
    res.json({ accessToken });
  } catch (err) {
    res.status(401);
    throw new Error("Invalid or expired refresh token");
  }
});

// @desc   Get the currently logged-in user's profile
// @route  GET /api/auth/me
const getProfile = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

module.exports = { register, login, refresh, getProfile };
