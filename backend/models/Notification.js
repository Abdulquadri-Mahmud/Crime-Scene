const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    reportId: { type: mongoose.Schema.Types.ObjectId, ref: "Report", required: true },
    recipientEmail: { type: String, required: true },
    message: { type: String, required: true },
    channel: { type: String, enum: ["email", "sms", "in-app"], default: "email" },
    sentAt: { type: Date, default: Date.now },
    delivered: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
