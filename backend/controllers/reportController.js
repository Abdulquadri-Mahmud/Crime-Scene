const asyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");
const Report = require("../models/Report");
const generateTrackingId = require("../utils/generateTrackingId");
const { notifyReporter } = require("../utils/notify");

// @desc   Submit a new crime report (public - login optional)
// @route  POST /api/reports
const createReport = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((e) => e.msg).join(", "));
  }

  const {
    reporterName,
    reporterPhone,
    reporterEmail,
    isAnonymous,
    incidentType,
    description,
    address,
    area,
    lat,
    lng,
    dateOfIncident,
  } = req.body;

  const trackingId = await generateTrackingId();

  const evidenceFiles = (req.files || []).map((file) => ({
    url: file.path && file.path.startsWith("http") ? file.path : `/uploads/${file.filename}`,
    type: file.mimetype,
    originalName: file.originalname,
  }));

  const report = await Report.create({
    trackingId,
    reporter: {
      userId: req.user ? req.user._id : null,
      name: isAnonymous === "true" || isAnonymous === true ? "Anonymous" : reporterName,
      phone: reporterPhone,
      email: reporterEmail,
      isAnonymous: isAnonymous === "true" || isAnonymous === true,
    },
    incident: {
      type: incidentType,
      description,
      location: { address, area, lat, lng },
      dateOfIncident,
      evidenceFiles,
    },
    status: "received",
    statusHistory: [
      { status: "received", note: "Report submitted by community member", changedBy: null },
    ],
  });

  await notifyReporter({
    reportId: report._id,
    recipientEmail: reporterEmail,
    message: `Your crime report has been received. Tracking ID: ${trackingId}`,
  });

  res.status(201).json({
    message: "Report submitted successfully",
    trackingId: report.trackingId,
    reportId: report._id,
  });
});

// @desc   Track a report using trackingId + the contact used to file it
// @route  GET /api/reports/track?trackingId=...&contact=...
const trackReport = asyncHandler(async (req, res) => {
  const { trackingId, contact } = req.query;

  if (!trackingId || !contact) {
    res.status(400);
    throw new Error("trackingId and contact (email or phone) are required");
  }

  const report = await Report.findOne({
    trackingId: trackingId.trim(),
    $or: [{ "reporter.email": contact.trim().toLowerCase() }, { "reporter.phone": contact.trim() }],
  }).select("trackingId status priority incident.type incident.dateOfIncident statusHistory createdAt");

  if (!report) {
    res.status(404);
    throw new Error("No report found matching that tracking ID and contact detail");
  }

  res.json({ report });
});

// @desc   Get a citizen's own submitted reports (requires login)
// @route  GET /api/reports/mine
const getMyReports = asyncHandler(async (req, res) => {
  const reports = await Report.find({ "reporter.userId": req.user._id })
    .sort({ createdAt: -1 })
    .select("-incident.description");

  res.json({ reports });
});

module.exports = { createReport, trackReport, getMyReports };
