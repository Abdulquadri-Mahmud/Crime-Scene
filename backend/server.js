require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const reportRoutes = require("./routes/reportRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

// Debug: log every incoming request to aid troubleshooting connection resets
app.use((req, res, next) => {
  console.log(`DEBUG_INCOMING_REQUEST: ${req.method} ${req.url} from ${req.ip}`);
  next();
});

// --- Security & core middleware ---
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Serve locally-stored evidence files (swap for Cloudinary URLs in production).
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- Health check for uptime monitoring ---
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);

// --- 404 + centralized error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

// --- Never let one uncaught error kill the whole process silently ---
process.on("unhandledRejection", (reason) => {
  // eslint-disable-next-line no-console
  console.error("Unhandled Rejection:", reason);
});
process.on("uncaughtException", (err) => {
  // eslint-disable-next-line no-console
  console.error("Uncaught Exception:", err);
});

const PORT = process.env.PORT || 5001;

// Only start listening when executed directly (e.g. `node server.js`).
// When require()'d by Supertest integration tests the server is not bound to
// any port — Supertest creates its own ephemeral listener internally.
if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Crime reporting API running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
    });
  });
} else {
  // Tests: connect to DB but don't bind a port; Supertest handles that.
  connectDB();
}

module.exports = app; // exported for Supertest integration tests
