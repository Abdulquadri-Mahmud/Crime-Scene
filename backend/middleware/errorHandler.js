// Catches every error forwarded from asyncHandler-wrapped controllers so a single
// bad request/bug can never crash the whole Node process.
const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  // Mongoose validation errors get a friendlier 400 response.
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation failed",
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  // Duplicate key errors (e.g. email already registered).
  if (err.code === 11000) {
    return res.status(409).json({
      message: `Duplicate value for field: ${Object.keys(err.keyValue).join(", ")}`,
    });
  }

  res.status(statusCode).json({
    message: err.message || "Internal server error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };
