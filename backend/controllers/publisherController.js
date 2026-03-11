const Patch = require("../models/Patch");
const { normalizeAddress } = require("../config/blockchain");
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
    const { softwareName, version, ipfsHash, fileHash } = req.body;

    if (!softwareName || !version || !ipfsHash || !fileHash) {
      return res.status(400).json({
        error:
          "softwareName, version, ipfsHash, and fileHash are required"
      });
    }

    const bytes32Hash = ensureBytes32(fileHash);

    const patch = new Patch({
      patchId: Date.now(),
      softwareName,
      version,
      publisher: req.auth.walletAddress,
      ipfsHash,
      fileHash: bytes32Hash,
      active: true,
      releaseTime: new Date()
    });

    await patch.save();

    return res.status(201).json({
      message:
        "Patch metadata stored. Publisher must call publishPatch() on smart contract with patchId.",
      patch,
      nextStep: `Call contract publishPatch("${softwareName}", "${version}", "${ipfsHash}", "${bytes32Hash}") from publisher wallet`
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