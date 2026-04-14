const express = require("express");
const multer = require("multer");
const path = require("path");

const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const {
  uploadPatchFile,
  syncPatchFromTx,
  getPublisherPatches,
  getPublisherInstallationLogs,
  getPublisherAnalytics
} = require("../controllers/publisherController");

const router = express.Router();

const allowedPatchExtensions = new Set([
  ".zip",
  ".pkg",
  ".dmg",
  ".exe",
  ".msi",
  ".deb",
  ".rpm",
  ".tar",
  ".gz",
  ".tgz",
  ".7z",
  ".bin",
  ".sh"
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024
  },
  fileFilter(_req, file, cb) {
    const ext = path.extname(String(file.originalname || "")).toLowerCase();
    if (allowedPatchExtensions.has(ext)) {
      return cb(null, true);
    }
    const err = new Error(
      `Unsupported patch file type "${ext || "unknown"}". Allowed types: ${Array.from(
        allowedPatchExtensions
      ).join(", ")}`
    );
    err.statusCode = 400;
    return cb(err);
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
