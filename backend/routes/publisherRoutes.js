const express = require("express");
const multer = require("multer");

const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const {
  uploadPatchFile,
  syncPatchFromTx,
  getPublisherPatches,
  getPublisherInstallationLogs,
  getPublisherAnalytics
} = require("../controllers/publisherController");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024
  }
});

router.post(
  "/upload",
  requireAuth,
  requireRole("publisher"),
  upload.single("patchFile"),
  uploadPatchFile
);
router.post(
  "/sync",
  requireAuth,
  requireRole("publisher"),
  syncPatchFromTx
);
router.post(
  "/publish",
  requireAuth,
  requireRole("publisher"),
  syncPatchFromTx
);
router.get(
  "/patches",
  requireAuth,
  requireRole("publisher"),
  getPublisherPatches
);
router.get("/logs", requireAuth, requireRole("publisher"), getPublisherInstallationLogs);
router.get("/analytics", requireAuth, requireRole("publisher"), getPublisherAnalytics);

module.exports = router;
