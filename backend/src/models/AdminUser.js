const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminUserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        select: false, // never returned by default
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Hash password before save
adminUserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Instance method to verify password
adminUserSchema.methods.comparePassword = async function (candidate) {
    return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("AdminUser", adminUserSchema);
