const { getReadOnlyContract, normalizeAddress } = require("../config/blockchain");
const User = require("../models/User");
const Device = require("../models/Device");
const AccessRequest = require("../models/AccessRequest");
const InstallationLog = require("../models/InstallationLog");
const Patch = require("../models/Patch");

async function registerDevice(req, res, next) {
  try {
    const { walletAddress, deviceId, deviceType, location } = req.body;

    if (!walletAddress || !deviceId) {
      return res
        .status(400)
        .json({ error: "walletAddress and deviceId are required" });
    }

    const normalized = normalizeAddress(walletAddress);
    const contract = getReadOnlyContract();
    const isRegisteredOnChain = await contract.registeredDevices(normalized);
    if (!isRegisteredOnChain) {
      return res.status(400).json({
        error:
          "Device not registered on-chain yet. Call registerDevice() from admin wallet first."
      });
    }

    await User.findOneAndUpdate(
      { walletAddress: normalized },
      { walletAddress: normalized, role: "device", status: "active" },
      { upsert: true, new: true }
    );

    const device = await Device.findOneAndUpdate(
      { walletAddress: normalized },
      {
        walletAddress: normalized,
        deviceId,
        deviceType,
        location,
        status: "registered",
        lastSeen: new Date()
      },
      { upsert: true, new: true }
    );

    return res.status(201).json({
      message: "Device registration synced successfully",
      device
    });
  } catch (error) {
    return next(error);
  }
}

async function authorizePublisher(req, res, next) {
  try {
    const { walletAddress, requestId } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: "walletAddress is required" });
    }

    const normalized = normalizeAddress(walletAddress);
    const contract = getReadOnlyContract();
    const isAuthorizedOnChain = await contract.authorizedPublishers(normalized);
    if (!isAuthorizedOnChain) {
      return res.status(400).json({
        error:
          "Publisher not authorized on-chain yet. Call authorizePublisher() from admin wallet first."
      });
    }

    await User.findOneAndUpdate(
      { walletAddress: normalized },
      { walletAddress: normalized, role: "publisher", status: "active" },
      { upsert: true, new: true }
    );

    if (requestId) {
      await AccessRequest.findByIdAndUpdate(requestId, {
        status: "approved",
        reviewedBy: req.auth.walletAddress,
        reviewedAt: new Date()
      });
    } else {
      await AccessRequest.updateMany(
        {
          walletAddress: normalized,
          requestedRole: "publisher",
          status: "pending"
        },
        {
          status: "approved",
          reviewedBy: req.auth.walletAddress,
          reviewedAt: new Date()
        }
      );
    }

    return res.status(201).json({
      message: "Publisher authorization synced successfully",
      walletAddress: normalized
    });
  } catch (error) {
    return next(error);
  }
}

async function getPublishers(_req, res, next) {
  try {
    const publishers = await User.find({ role: "publisher", status: "active" })
      .sort({ createdAt: -1 })
      .select("walletAddress role status createdAt");

    return res.json({ count: publishers.length, publishers });
  } catch (error) {
    return next(error);
  }
}

async function getPublisherRequests(req, res, next) {
  try {
    const status = String(req.query.status || "pending").toLowerCase();
    const filter = {
      requestedRole: "publisher"
    };

    if (["pending", "approved", "rejected"].includes(status)) {
      filter.status = status;
    }

    const requests = await AccessRequest.find(filter).sort({ createdAt: -1 });
    return res.json({ count: requests.length, requests });
  } catch (error) {
    return next(error);
  }
}

async function rejectPublisherRequest(req, res, next) {
  try {
    const requestId = req.params.requestId;
    const request = await AccessRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ error: "Only pending requests can be rejected" });
    }

    request.status = "rejected";
    request.reviewedBy = req.auth.walletAddress;
    request.reviewedAt = new Date();
    await request.save();

    return res.json({
      message: "Publisher request rejected",
      request
    });
  } catch (error) {
    return next(error);
  }
}

async function getAllDevices(req, res, next) {
  try {
    const devices = await Device.find({}).sort({ createdAt: -1 });
    return res.json({ count: devices.length, devices });
  } catch (error) {
    return next(error);
  }
}

async function getInstallationLogs(req, res, next) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 200;
    const filter = {};

    if (req.query.device) {
      filter.deviceAddress = normalizeAddress(req.query.device);
    }
    if (req.query.patch) {
      filter.patchId = Number(req.query.patch);
    }
    if (req.query.status) {
      filter.status = String(req.query.status).toLowerCase();
    }

    const logs = await InstallationLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit);
    return res.json({
      count: logs.length,
      filters: {
        device: req.query.device || null,
        patch: req.query.patch || null,
        status: req.query.status || null
      },
      logs
    });
  } catch (error) {
    return next(error);
  }
}

async function getDashboardMetrics(_req, res, next) {
  try {
    const [totalPatches, activeDevices, totalLogs, successLogs] = await Promise.all([
      Patch.countDocuments({}),
      Device.countDocuments({ status: "registered" }),
      InstallationLog.countDocuments({}),
      InstallationLog.countDocuments({ status: "success" })
    ]);

    const successRate = totalLogs === 0 ? 0 : Number((successLogs / totalLogs).toFixed(4));

    return res.json({
      totalPatches,
      activeDevices,
      totalLogs,
      successLogs,
      successRate
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  registerDevice,
  authorizePublisher,
  getPublishers,
  getAllDevices,
  getPublisherRequests,
  rejectPublisherRequest,
  getInstallationLogs,
  getDashboardMetrics
};