const User = require("../models/User");
const { normalizeAddress } = require("../config/blockchain");

async function upsertUser(walletAddress, role, status = "active") {
  const normalizedAddress = normalizeAddress(walletAddress);
  return User.findOneAndUpdate(
    { walletAddress: normalizedAddress },
    { walletAddress: normalizedAddress, role, status },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function ensureAdminUser() {
  const adminWallet = process.env.ADMIN_WALLET_ADDRESS;
  if (!adminWallet) {
    return;
  }
  await upsertUser(adminWallet, "admin", "active");
}

module.exports = {
  upsertUser,
  ensureAdminUser
};