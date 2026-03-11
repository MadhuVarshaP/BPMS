const express = require("express");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const {
  registerDevice,
  authorizePublisher,
  getAllDevices,
  getInstallationLogs
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
router.get("/devices", requireAuth, requireRole("admin"), getAllDevices);
router.get("/logs", requireAuth, requireRole("admin"), getInstallationLogs);

module.exports = router;