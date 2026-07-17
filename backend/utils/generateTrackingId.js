const Report = require("../models/Report");

/**
 * Generates a human-friendly, unique tracking ID such as CR-2026-000482.
 * Retries on the rare chance of a collision instead of trusting randomness blindly,
 * which is what actually guarantees uniqueness rather than just hoping for it.
 */
async function generateTrackingId() {
  const year = new Date().getFullYear();
  let trackingId;
  let exists = true;

  while (exists) {
    const randomSegment = Math.floor(100000 + Math.random() * 900000); // 6 digits
    trackingId = `CR-${year}-${randomSegment}`;
    // eslint-disable-next-line no-await-in-loop
    exists = await Report.exists({ trackingId });
  }

  return trackingId;
}

module.exports = generateTrackingId;
