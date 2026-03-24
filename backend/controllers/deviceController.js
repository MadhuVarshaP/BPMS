const axios = require("axios");
const Patch = require("../models/Patch");
const InstallationLog = require("../models/InstallationLog");
const Device = require("../models/Device");
const { normalizeAddress } = require("../config/blockchain");

async function getAvailablePatches(_req, res, next) {
  try {
    const patches = await Patch.find({ active: true }).sort({
      releaseTime: -1
    });

    const latestBySoftware = new Map();
    for (const patch of patches) {
      if (!latestBySoftware.has(patch.softwareName)) {
        latestBySoftware.set(patch.softwareName, patch);
      }
    }

    return res.json({
      count: latestBySoftware.size,
      patches: Array.from(latestBySoftware.values())
    });
  } catch (error) {
    return next(error);
  }
}

async function getPatchMetadata(req, res, next) {
  try {
    const patchId = Number(req.params.patchId);
    const patch = await Patch.findOne({ patchId, active: true });

    if (!patch) {
      return res.status(404).json({ error: "Patch not found" });
    }

    return res.json({
      patchId: patch.patchId,
      softwareName: patch.softwareName,
      version: patch.version,
      ipfsHash: patch.ipfsHash,
      expectedFileHash: patch.fileHash,
      releaseTime: patch.releaseTime
    });
  } catch (error) {
    return next(error);
  }
}

async function reportInstallation(req, res, next) {
  try {
    const { patchId, success, status, deviceAddress } = req.body;
    const resolvedStatus =
      status ||
      (success === true
        ? "success"
        : success === false
          ? "failure"
          : null);
    const normalizedStatus = resolvedStatus
      ? String(resolvedStatus).toLowerCase()
      : null;

    if (
      patchId === undefined ||
      !normalizedStatus ||
      !["success", "failure"].includes(normalizedStatus)
    ) {
      return res
        .status(400)
        .json({
          error:
            "patchId and status ('success'|'failure') are required. success (boolean) is also supported."
        });
    }

    const patch = await Patch.findOne({
      patchId: Number(patchId),
      active: true
    });
    if (!patch) {
      return res.status(404).json({ error: "Patch not found or inactive" });
    }

    const log = await InstallationLog.create({
      deviceAddress: normalizeAddress(deviceAddress || req.auth.walletAddress),
      patchId: Number(patchId),
      status: normalizedStatus,
      source: "api",
      timestamp: new Date()
    });

    await Device.findOneAndUpdate(
      { walletAddress: log.deviceAddress },
      { lastSeen: new Date() }
    );

    return res.status(201).json({
      message: "Installation report synced successfully",
      log
    });
  } catch (error) {
    return next(error);
  }
}

async function downloadPatch(req, res, next) {
  try {
    const patchId = Number(req.params.patchId);
    const patch = await Patch.findOne({ patchId, active: true });

    if (!patch) {
      return res.status(404).json({ error: "Patch not found" });
    }

    const gateway =
      process.env.IPFS_GATEWAY || "https://gateway.pinata.cloud/ipfs";
    const url = `${gateway}/${patch.ipfsHash}`;

    const fileResponse = await axios.get(url, { responseType: "stream" });
    res.setHeader(
      "Content-Type",
      fileResponse.headers["content-type"] ||
        "application/octet-stream"
    );
    fileResponse.data.pipe(res);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAvailablePatches,
  getPatchMetadata,
  reportInstallation,
  downloadPatch
};