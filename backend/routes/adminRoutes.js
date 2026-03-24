const express = require("express");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const {
  registerDevice,
  authorizePublisher,
  getPublishers,
  getAllDevices,
  getPublisherRequests,
  rejectPublisherRequest,
  getInstallationLogs,
  getDashboardMetrics
} = require("../controllers/adminController");

const router = express.Router();

router.post(
  "/register-device",
  requireAuth,
  requireRole("admin"),
  registerDevice
);
router.post(
  "/authorize-publisher",
  requireAuth,
  requireRole("admin"),
  authorizePublisher
);
router.get("/publishers", requireAuth, requireRole("admin"), getPublishers);
router.get(
  "/requests/publisher",
  requireAuth,
  requireRole("admin"),
  getPublisherRequests
);
router.post(
  "/requests/publisher/:requestId/reject",
  requireAuth,
  requireRole("admin"),
  rejectPublisherRequest
);
router.get("/devices", requireAuth, requireRole("admin"), getAllDevices);
router.get("/logs", requireAuth, requireRole("admin"), getInstallationLogs);
router.get("/metrics", requireAuth, requireRole("admin"), getDashboardMetrics);

module.exports = router;