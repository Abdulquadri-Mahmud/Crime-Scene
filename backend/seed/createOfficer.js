/**
 * Run once to create an officer account:
 *   node seed/createOfficer.js "Officer Name" officer@example.com Password123
 */
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function run() {
  const [fullName, email, password] = process.argv.slice(2);

  if (!fullName || !email || !password) {
    console.log('Usage: node seed/createOfficer.js "Full Name" email@example.com password');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email });
  if (existing) {
    console.log("A user with that email already exists. Aborting.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const officer = await User.create({
    fullName,
    email,
    passwordHash,
    role: "officer",
    isVerified: true,
  });

  console.log("Officer account created:", officer.email);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
