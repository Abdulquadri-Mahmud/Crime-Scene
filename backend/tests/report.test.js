/**
 * Integration tests — uses the MONGO_URI from .env if present (Atlas),
 * otherwise falls back to downloading an in-memory MongoDB binary.
 *
 * Run with: npm test
 */
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const request = require("supertest");
require("dotenv").config();

// Atlas connections can take 10-15 s on first connect — give hooks 30 s.
jest.setTimeout(30000);

let mongod;
let app;

beforeAll(async () => {
  process.env.JWT_ACCESS_SECRET = "test_access_secret";
  process.env.JWT_REFRESH_SECRET = "test_refresh_secret";
  process.env.NODE_ENV = "test";

  // Use MONGO_URI from .env if available, pointed at a test database.
  // Fallback: spin up an in-memory MongoDB (downloads binary on first run).
  if (process.env.MONGO_URI) {
    // Point to a dedicated test database so tests don't pollute production data.
    let uri = process.env.MONGO_URI;
    if (uri.includes("?")) {
      const [base, query] = uri.split("?");
      const parts = base.split("/");
      if (parts.length > 3) {
        parts[3] = "crime_scene_test";
      } else {
        parts.push("crime_scene_test");
      }
      process.env.MONGO_URI = parts.join("/") + "?" + query;
    } else {
      const parts = uri.split("/");
      if (parts.length > 3) {
        parts[3] = "crime_scene_test";
      } else {
        parts.push("crime_scene_test");
      }
      process.env.MONGO_URI = parts.join("/");
    }
  } else {
    mongod = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongod.getUri();
  }

  // Import app AFTER env vars are set. server.js will call connectDB() itself
  // (since require.main !== module it won't try to bind a port).
  app = require("../server");

  // Wait for the connection to be ready before running any test.
  await mongoose.connection.asPromise();
});

afterAll(async () => {
  // Clean up the test database so each run starts fresh.
  if (!mongod && mongoose.connection.db) {
    try {
      await mongoose.connection.db.dropDatabase();
    } catch (error) {
      console.warn("Could not drop test database:", error.message);
    }
  }
  await mongoose.connection.close();
  if (mongod) {
    await mongod.stop();
  }
});

describe("Crime report submission & tracking", () => {
  let trackingId;

  test("citizen can submit a new report", async () => {
    const res = await request(app)
      .post("/api/reports")
      .field("reporterEmail", "witness@example.com")
      .field("reporterName", "Jane Witness")
      .field("incidentType", "Theft")
      .field("description", "A phone was stolen at the market around 4pm.")
      .field("dateOfIncident", new Date().toISOString())
      .field("area", "Saapade");

    expect(res.statusCode).toBe(201);
    expect(res.body.trackingId).toMatch(/^CR-\d{4}-\d{6}$/);
    trackingId = res.body.trackingId;
  });

  test("citizen can track the report with correct tracking ID + email", async () => {
    const res = await request(app)
      .get("/api/reports/track")
      .query({ trackingId, contact: "witness@example.com" });

    expect(res.statusCode).toBe(200);
    expect(res.body.report.status).toBe("received");
  });

  test("tracking fails with wrong contact detail (prevents snooping)", async () => {
    const res = await request(app)
      .get("/api/reports/track")
      .query({ trackingId, contact: "stranger@example.com" });

    expect(res.statusCode).toBe(404);
  });

  test("rejects a report with a description that is too short", async () => {
    const res = await request(app)
      .post("/api/reports")
      .field("reporterEmail", "test@example.com")
      .field("incidentType", "Theft")
      .field("description", "short")
      .field("dateOfIncident", new Date().toISOString());

    expect(res.statusCode).toBe(400);
  });
});
