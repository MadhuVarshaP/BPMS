const { ethers } = require("ethers");
const abi = require("./contractAbi.json");

let provider;
let contractReadOnly;

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function initBlockchain() {
  const rpcUrl = getRequiredEnv("RPC_URL");
  const contractAddress = getRequiredEnv("CONTRACT_ADDRESS");

  provider = new ethers.JsonRpcProvider(rpcUrl);
  contractReadOnly = new ethers.Contract(contractAddress, abi, provider);
}

function getReadOnlyContract() {
  if (!contractReadOnly) {
    throw new Error("Blockchain not initialized");
  }
  return contractReadOnly;
}

function normalizeAddress(address) {
  try {
    return ethers.getAddress(address).toLowerCase();
  } catch (_) {
    const a = String(address || "").trim().toLowerCase();
    return a.startsWith("0x") ? a : "0x" + a;
  }
}

module.exports = {
  initBlockchain,
  getReadOnlyContract,
  normalizeAddress
};