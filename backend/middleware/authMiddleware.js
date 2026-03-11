const { normalizeAddress } = require("../config/blockchain");
const User = require("../models/User");

function extractAuthPayload(req) {
  return {
    walletAddress:
      req.headers["x-wallet-address"] ||
      req.body.walletAddress ||
      req.query.walletAddress
  };
}

async function requireAuth(req, res, next) {
  try {
    const authBypass = process.env.AUTH_BYPASS === "true";
    const { walletAddress } = extractAuthPayload(req);

    if (!walletAddress) {
      return res.status(401).json({ error: "Wallet address is required" });
    }

    const normalizedAddress = normalizeAddress(walletAddress);

    const user = await User.findOne({ walletAddress: normalizedAddress });
    if (!user || user.status !== "active") {
      return res
        .status(403)
        .json({
          error: "User not registered or not active",
          hint: "Admin must register this wallet first"
        });
    }

    req.auth = {
      walletAddress: normalizedAddress,
      role: user.role,
      user
    };

    return next();
  } catch (error) {
    return res.status(500).json({ error: "Authentication failed", detail: error.message });
  }
}

function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const accepted = Array.isArray(allowedRoles)
      ? allowedRoles
      : [allowedRoles];

    if (!accepted.includes(req.auth.role)) {
      return res.status(403).json({
        error: "Insufficient permissions",
        requiredRole: accepted,
        yourRole: req.auth.role
      });
    }

    return next();
  };
}

module.exports = {
  requireAuth,
  requireRole
};