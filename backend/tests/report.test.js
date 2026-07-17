/**
 * Integration tests using an in-memory MongoDB, so these run without needing
 * a real Atlas connection - ideal for a defence demo or CI pipeline.
 *
 * Run with: npm test
 */
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const request = require("supertest");

let mongod;
let app;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  process.env.JWT_ACCESS_SECRET = "test_access_secret";
  process.env.JWT_REFRESH_SECRET = "test_refresh_secret";
  process.env.NODE_ENV = "test";

  await mongoose.connect(process.env.MONGO_URI);
  // Import app AFTER env vars are set and connection made, so server.js's own
  // connectDB() call (idempotent) attaches to the same in-memory instance.
  app = require("../server");
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongod.stop();
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
