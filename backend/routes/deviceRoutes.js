const express = require("express");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const {
  getAvailablePatches,
  getPatchMetadata,
  reportInstallation,
  downloadPatch
} = require("../controllers/deviceController");

const router = express.Router();

router.get("/patches", requireAuth, requireRole("device"), getAvailablePatches);
router.get(
  "/patch/:patchId",
  requireAuth,
  requireRole("device"),
  getPatchMetadata
);
router.get(
  "/patch/:patchId/download",
  requireAuth,
  requireRole("device"),
  downloadPatch
);
router.post(
  "/report",
  requireAuth,
  requireRole("device"),
  reportInstallation
);
router.post(
  "/report-installation",
  requireAuth,
  requireRole("device"),
  reportInstallation
);

module.exports = router;