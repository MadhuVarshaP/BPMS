const Patch = require("../models/Patch");
const { getReadOnlyContract, normalizeAddress } = require("../config/blockchain");
const { uploadBufferToPinata } = require("../services/ipfsService");
const { sha256Hex, ensureBytes32 } = require("../services/hashService");

async function uploadPatchFile(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Patch file is required" });
    }

    const fileHash = sha256Hex(req.file.buffer);
    const { cid, size, timestamp } = await uploadBufferToPinata(
      req.file.buffer,
      req.file.originalname,
      {
        uploadedBy: req.auth.walletAddress,
        mimeType: req.file.mimetype
      }
    );

    return res.status(201).json({
      message: "Patch uploaded to IPFS successfully",
      ipfsHash: cid,
      fileHash,
      size,
      timestamp,
      nextStep:
        "Use ipfsHash and fileHash to call publishPatch() from publisher wallet on smart contract"
    });
  } catch (error) {
    return next(error);
  }
}

async function publishPatchMetadata(req, res, next) {
  try {
    const { softwareName, version, ipfsHash, fileHash, publisher } = req.body;

    if (!softwareName || !version || !ipfsHash || !fileHash) {
      return res.status(400).json({
        error:
          "softwareName, version, ipfsHash, and fileHash are required"
      });
    }

    const bytes32Hash = ensureBytes32(fileHash);
    const publisherAddress = normalizeAddress(
      publisher || req.auth.walletAddress
    );
    const contract = getReadOnlyContract();
    const patchId = Number(await contract.patchCounter());

    if (!Number.isFinite(patchId) || patchId <= 0) {
      return res.status(400).json({
        error:
          "No on-chain patch detected. Call publishPatch() on the smart contract first."
      });
    }

    const existingPatch = await Patch.findOne({ patchId });
    if (existingPatch) {
      return res.status(200).json({
        message: "Patch already synced to backend",
        patch: existingPatch
      });
    }

    const chainPatch = await contract.patches(patchId);
    const chainPublisher = normalizeAddress(chainPatch.publisher);
    if (
      chainPatch.softwareName !== softwareName ||
      chainPatch.version !== version ||
      chainPatch.ipfsHash !== ipfsHash ||
      String(chainPatch.fileHash).toLowerCase() !== bytes32Hash ||
      chainPublisher !== publisherAddress
    ) {
      return res.status(409).json({
        error: "On-chain patch metadata does not match request payload",
        hint: "Call this endpoint immediately after your publishPatch transaction is confirmed."
      });
    }

    const patch = new Patch({
      patchId,
      softwareName,
      version,
      publisher: publisherAddress,
      ipfsHash,
      fileHash: bytes32Hash,
      active: true,
      releaseTime: new Date()
    });

    await patch.save();

    return res.status(201).json({
      message: "Patch metadata synced successfully",
      patch
    });
  } catch (error) {
    return next(error);
  }
}

async function getPublisherPatches(req, res, next) {
  try {
    const patches = await Patch.find({
      publisher: req.auth.walletAddress
    }).sort({ releaseTime: -1 });

    return res.json({ count: patches.length, patches });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  uploadPatchFile,
  publishPatchMetadata,
  getPublisherPatches
};