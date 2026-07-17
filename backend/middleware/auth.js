const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

// Verifies the JWT on protected routes and attaches the user to req.user.
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401);
      throw new Error("Not authorized, user no longer exists");
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401);
    throw new Error("Not authorized, token invalid or expired");
  }
});

// Restricts a route to specific roles, e.g. roleGuard('admin', 'officer').
const roleGuard = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    res.status(403);
    throw new Error(`Access denied: requires role(s) ${allowedRoles.join(", ")}`);
  }
  next();
};

module.exports = { protect, roleGuard };
