const express = require("express");
const { body } = require("express-validator");
const rateLimit = require("express-rate-limit");
const { createReport, trackReport, getMyReports } = require("../controllers/reportController");
const upload = require("../middleware/upload");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Prevents spam/flooding of the report submission endpoint.
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { message: "Too many reports submitted from this network. Please try again later." },
});

router.post(
  "/",
  submitLimiter,
  upload.array("evidence", 3),
  [
    body("reporterEmail").isEmail().withMessage("A valid contact email is required"),
    body("incidentType").notEmpty().withMessage("Incident type is required"),
    body("description").isLength({ min: 10 }).withMessage("Please provide more detail (min 10 characters)"),
    body("dateOfIncident").isISO8601().withMessage("A valid incident date is required"),
  ],
  createReport
);

router.get("/track", trackReport);
router.get("/mine", protect, getMyReports);

module.exports = router;
