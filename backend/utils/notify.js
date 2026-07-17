const Notification = require("../models/Notification");

/**
 * Records a notification and (in production) would dispatch it via
 * nodemailer/SMTP or an SMS gateway. Kept as a stub with a clear extension
 * point so the core report flow never breaks if email credentials are
 * missing during the ND demo - it just logs instead of throwing.
 */
async function notifyReporter({ reportId, recipientEmail, message }) {
  try {
    await Notification.create({ reportId, recipientEmail, message, channel: "email" });

    if (process.env.SMTP_HOST) {
      // Production hook: plug in nodemailer here using SMTP_* env vars.
      // Left intentionally simple so the demo never fails on missing SMTP config.
      // eslint-disable-next-line no-console
      console.log(`[email would be sent] to=${recipientEmail} message="${message}"`);
    } else {
      // eslint-disable-next-line no-console
      console.log(`[notification logged, SMTP not configured] to=${recipientEmail}: ${message}`);
    }
  } catch (err) {
    // Notifications are best-effort: a failure here must never break
    // the underlying report status update.
    // eslint-disable-next-line no-console
    console.error("Failed to record notification:", err.message);
  }
}

module.exports = { notifyReporter };
