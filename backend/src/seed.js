/**
 * Seed script — creates the initial admin user.
 *
 * Usage:
 *   1. Set ADMIN_EMAIL and ADMIN_PASSWORD in .env
 *   2. Run:  npm run seed
 *
 * If an admin with that email already exists, the script skips creation.
 */

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const AdminUser = require("./models/AdminUser");

async function seed() {
    const { MONGO_URI, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
        console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env before seeding.");
        process.exit(1);
    }

    if (ADMIN_PASSWORD.length < 6) {
        console.error("ADMIN_PASSWORD must be at least 6 characters.");
        process.exit(1);
    }

    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const existing = await AdminUser.findOne({ email: ADMIN_EMAIL.toLowerCase() });
    if (existing) {
        console.log(`Admin "${ADMIN_EMAIL}" already exists — updating password.`);
        existing.password = ADMIN_PASSWORD;
        await existing.save();
        console.log("Password updated.");
    } else {
        await AdminUser.create({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
        console.log(`Admin user created: ${ADMIN_EMAIL}`);
    }

    await mongoose.disconnect();
    console.log("Done.");
}

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
