const mongoose = require("mongoose");

// A single shared connection is reused across every request (connection pooling
// is handled internally by the MongoDB driver). This avoids the "reopening a
// connection per request" mistake that causes lag under load.
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Modern mongoose (6+) no longer needs useNewUrlParser/useUnifiedTopology,
      // they are defaults, but maxPoolSize is worth being explicit about.
      maxPoolSize: 10,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // Fail loudly on startup rather than letting the server run without a DB.
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected. Attempting to reconnect is handled by the driver.");
});

module.exports = connectDB;
