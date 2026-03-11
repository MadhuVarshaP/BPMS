const express = require("express");
const multer = require("multer");

const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const {
  uploadPatchFile,
  publishPatchMetadata,
  getPublisherPatches
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
  "/publish",
  requireAuth,
  requireRole("publisher"),
  publishPatchMetadata
);
router.get(
  "/patches",
  requireAuth,
  requireRole("publisher"),
  getPublisherPatches
);

module.exports = router;