require("dotenv").config();

const axios = require("axios");
const crypto = require("crypto");

const API_BASE = process.env.API_BASE_URL || "http://localhost:3001";
const WALLET_ADDRESS = process.env.DEVICE_WALLET_ADDRESS;
const IPFS_GATEWAY =
  process.env.IPFS_GATEWAY || "https://gateway.pinata.cloud/ipfs";

function sha256Hex(inputBuffer) {
  return `0x${crypto
    .createHash("sha256")
    .update(inputBuffer)
    .digest("hex")}`;
}

function authHeaders() {
  return {
    "x-wallet-address": WALLET_ADDRESS
  };
}

async function fetchAvailablePatches() {
  const response = await axios.get(`${API_BASE}/api/device/patches`, {
    headers: authHeaders()
  });
  return response.data.patches || [];
}

async function fetchPatchMetadata(patchId) {
  const response = await axios.get(`${API_BASE}/api/device/patch/${patchId}`, {
    headers: authHeaders()
  });
  return response.data;
}

async function downloadPatchBuffer(ipfsHash) {
  const url = `${IPFS_GATEWAY}/${ipfsHash}`;
  const response = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(response.data);
}

async function reportInstallation(patchId, success) {
  await axios.post(
    `${API_BASE}/api/device/report-installation`,
    {
      patchId,
      success
    },
    {
      headers: authHeaders()
    }
  );
}

async function run() {
  if (!WALLET_ADDRESS) {
    throw new Error("DEVICE_WALLET_ADDRESS is required");
  }

  console.log(
    `Device Agent starting for wallet: ${WALLET_ADDRESS}`
  );

  const patches = await fetchAvailablePatches();

  if (!patches.length) {
    console.log("No active patches available");
    return;
  }

  console.log(`Found ${patches.length} active patches`);

  for (const patch of patches) {
    try {
      console.log(`\nProcessing patch ${patch.patchId}...`);

      const metadata = await fetchPatchMetadata(patch.patchId);
      console.log(
        `Downloaded metadata: ${patch.softwareName} v${patch.version}`
      );

      const patchBuffer = await downloadPatchBuffer(metadata.ipfsHash);
      const calculatedHash = sha256Hex(patchBuffer).toLowerCase();

      console.log(`Expected hash:   ${metadata.expectedFileHash.toLowerCase()}`);
      console.log(`Calculated hash: ${calculatedHash}`);

      const isValid =
        calculatedHash === metadata.expectedFileHash.toLowerCase();

      if (!isValid) {
        console.log(`❌ Patch ${patch.patchId} rejected: hash mismatch`);
        await reportInstallation(patch.patchId, false);
        continue;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(`✅ Patch ${patch.patchId} installed successfully`);
      await reportInstallation(patch.patchId, true);
    } catch (error) {
      console.error(
        `❌ Patch ${patch.patchId} failed: ${error.message}`
      );
      await reportInstallation(patch.patchId, false).catch(
        () => {}
      );
    }
  }
}

run()
  .then(() => {
    console.log("\n✅ Device agent completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Device agent failed", error.message);
    process.exit(1);
  });
