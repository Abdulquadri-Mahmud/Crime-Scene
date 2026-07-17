const express = require("express");
const { body } = require("express-validator");
const {
  listReports,
  getReportById,
  updateReportStatus,
  assignOfficer,
  getDashboardStats,
} = require("../controllers/adminController");
const { protect, roleGuard } = require("../middleware/auth");

const router = express.Router();

// Every route below requires a valid JWT AND an officer/admin role.
router.use(protect, roleGuard("officer", "admin"));

router.get("/stats", getDashboardStats);
router.get("/reports", listReports);
router.get("/reports/:id", getReportById);

router.patch(
  "/reports/:id/status",
  [
    body("status")
      .isIn(["received", "under_review", "investigating", "resolved", "closed"])
      .withMessage("Invalid status value"),
  ],
  updateReportStatus
);

router.patch("/reports/:id/assign", roleGuard("admin"), assignOfficer);

module.exports = router;
