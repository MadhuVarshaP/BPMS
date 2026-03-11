const express = require("express");
const User = require("../models/User");
const { normalizeAddress } = require("../config/blockchain");

const router = express.Router();

router.get("/user/role/:walletAddress", async (req, res, next) => {
  try {
    const walletAddress = req.params.walletAddress;

    if (!walletAddress) {
      return res.status(400).json({ error: "Wallet address required" });
    }

    const normalized = normalizeAddress(walletAddress);
    const user = await User.findOne({ walletAddress: normalized });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      walletAddress: normalized,
      role: user.role,
      status: user.status
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
