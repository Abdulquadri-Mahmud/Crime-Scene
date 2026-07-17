const asyncHandler = require("express-async-handler");
const Report = require("../models/Report");
const { notifyReporter } = require("../utils/notify");

// @desc   List reports with filtering, search, and pagination
// @route  GET /api/admin/reports
const listReports = asyncHandler(async (req, res) => {
  const { status, area, incidentType, search, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (area) filter["incident.location.area"] = new RegExp(area, "i");
  if (incidentType) filter["incident.type"] = incidentType;
  if (search) {
    filter.$or = [
      { trackingId: new RegExp(search, "i") },
      { "incident.description": new RegExp(search, "i") },
      { "reporter.name": new RegExp(search, "i") },
    ];
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(parseInt(limit, 10) || 20, 100); // hard cap to avoid huge, laggy responses

  const [reports, total] = await Promise.all([
    Report.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate("assignedOfficer", "fullName email"),
    Report.countDocuments(filter),
  ]);

  res.json({
    reports,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

// @desc   Get full detail of a single report
// @route  GET /api/admin/reports/:id
const getReportById = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id).populate("assignedOfficer", "fullName email");
  if (!report) {
    res.status(404);
    throw new Error("Report not found");
  }
  res.json({ report });
});

// @desc   Update a report's status (enforces legal state transitions)
// @route  PATCH /api/admin/reports/:id/status
const updateReportStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const report = await Report.findById(req.params.id);

  if (!report) {
    res.status(404);
    throw new Error("Report not found");
  }

  if (!report.canTransitionTo(status)) {
    res.status(400);
    throw new Error(
      `Cannot move report from "${report.status}" to "${status}". Allowed next steps: ${
        Report.ALLOWED_TRANSITIONS[report.status].join(", ") || "none (final state)"
      }`
    );
  }

  report.status = status;
  report.statusHistory.push({ status, note, changedBy: req.user._id, changedAt: new Date() });
  await report.save();

  await notifyReporter({
    reportId: report._id,
    recipientEmail: report.reporter.email,
    message: `Update on your report ${report.trackingId}: status changed to "${status}".`,
  });

  res.json({ message: "Status updated", report });
});

// @desc   Assign an officer to a report
// @route  PATCH /api/admin/reports/:id/assign
const assignOfficer = asyncHandler(async (req, res) => {
  const { officerId } = req.body;
  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { assignedOfficer: officerId },
    { new: true, runValidators: true }
  );

  if (!report) {
    res.status(404);
    throw new Error("Report not found");
  }

  res.json({ message: "Officer assigned", report });
});

// @desc   Dashboard summary counts for the admin homepage
// @route  GET /api/admin/stats
const getDashboardStats = asyncHandler(async (req, res) => {
  const statusCounts = await Report.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const totalReports = await Report.countDocuments();

  const byArea = await Report.aggregate([
    { $group: { _id: "$incident.location.area", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  res.json({ totalReports, statusCounts, topAreas: byArea });
});

module.exports = {
  listReports,
  getReportById,
  updateReportStatus,
  assignOfficer,
  getDashboardStats,
};
