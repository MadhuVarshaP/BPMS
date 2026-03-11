const mongoose = require("mongoose");

const installationLogSchema = new mongoose.Schema(
  {
    deviceAddress: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    patchId: { type: Number, required: true, index: true },
    status: {
      type: String,
      enum: ["success", "failure"],
      required: true
    },
    timestamp: { type: Date, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("InstallationLog", installationLogSchema);