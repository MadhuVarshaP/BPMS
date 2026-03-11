const { normalizeAddress } = require("../config/blockchain");
const User = require("../models/User");
const Device = require("../models/Device");
const InstallationLog = require("../models/InstallationLog");

async function registerDevice(req, res, next) {
  try {
    const { walletAddress, deviceId, deviceType, location } = req.body;

    if (!walletAddress || !deviceId) {
      return res
        .status(400)
        .json({ error: "walletAddress and deviceId are required" });
    }

    const normalized = normalizeAddress(walletAddress);

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
      message: "Device registered in backend. Admin must call registerDevice() on smart contract.",
      device,
      nextStep: "Call contract registerDevice() from admin wallet"
    });
  } catch (error) {
    return next(error);
  }
}

async function authorizePublisher(req, res, next) {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: "walletAddress is required" });
    }

    const normalized = normalizeAddress(walletAddress);

    await User.findOneAndUpdate(
      { walletAddress: normalized },
      { walletAddress: normalized, role: "publisher", status: "active" },
      { upsert: true, new: true }
    );

    return res.status(201).json({
      message: "Publisher authorized in backend. Admin must call authorizePublisher() on smart contract.",
      walletAddress: normalized,
      nextStep: "Call contract authorizePublisher() from admin wallet"
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
    const limit = req.query.limit ? parseInt(req.query.limit) : 200;
    const logs = await InstallationLog.find({})
      .sort({ timestamp: -1 })
      .limit(limit);
    return res.json({ count: logs.length, logs });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  registerDevice,
  authorizePublisher,
  getAllDevices,
  getInstallationLogs
};