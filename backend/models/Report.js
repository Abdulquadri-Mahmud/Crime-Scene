const mongoose = require("mongoose");

const statusHistoryEntrySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["received", "under_review", "investigating", "resolved", "closed"],
      required: true,
    },
    note: { type: String, trim: true, maxlength: 500 },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const evidenceFileSchema = new mongoose.Schema(
  { url: String, type: String, originalName: String },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    reporter: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      name: { type: String, required: true, trim: true },
      phone: { type: String, trim: true },
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
      },
      isAnonymous: { type: Boolean, default: false },
    },
    incident: {
      type: {
        type: String,
        required: [true, "Incident type is required"],
        enum: [
          "Theft",
          "Assault",
          "Burglary",
          "Vandalism",
          "Fraud",
          "Domestic Violence",
          "Kidnapping",
          "Cultism/Gang Activity",
          "Other",
        ],
      },
      description: {
        type: String,
        required: [true, "A description of the incident is required"],
        trim: true,
        minlength: 10,
        maxlength: 3000,
      },
      location: {
        address: { type: String, trim: true },
        area: { type: String, trim: true, index: true },
        lat: Number,
        lng: Number,
      },
      dateOfIncident: { type: Date, required: true },
      evidenceFiles: [evidenceFileSchema],
    },
    status: {
      type: String,
      enum: ["received", "under_review", "investigating", "resolved", "closed"],
      default: "received",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    statusHistory: [statusHistoryEntrySchema],
  },
  { timestamps: true }
);

// Compound index to make the admin dashboard's common filter
// (status + area, sorted by newest) fast even as the archive grows.
reportSchema.index({ status: 1, "incident.area": 1, createdAt: -1 });

// Enforce a legal state transition order so a report can never
// silently "jump" from received straight to resolved without review.
const ALLOWED_TRANSITIONS = {
  received: ["under_review", "closed"],
  under_review: ["investigating", "closed"],
  investigating: ["resolved", "closed"],
  resolved: ["closed"],
  closed: [],
};

reportSchema.methods.canTransitionTo = function (nextStatus) {
  return ALLOWED_TRANSITIONS[this.status]?.includes(nextStatus);
};

reportSchema.statics.ALLOWED_TRANSITIONS = ALLOWED_TRANSITIONS;

module.exports = mongoose.model("Report", reportSchema);
