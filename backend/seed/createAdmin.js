/**
 * Run once to create the first admin/law-enforcement account:
 *   node seed/createAdmin.js "Admin Name" admin@example.com StrongPass123
 */
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function run() {
  const [fullName, email, password] = process.argv.slice(2);

  if (!fullName || !email || !password) {
    console.log('Usage: node seed/createAdmin.js "Full Name" email@example.com password');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email });
  if (existing) {
    console.log("A user with that email already exists. Aborting.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await User.create({
    fullName,
    email,
    passwordHash,
    role: "admin",
    isVerified: true,
  });

  console.log("Admin account created:", admin.email);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
