const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema({
    sectionName: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    title: {
        type: String,
        trim: true,
        default: "",
    },
    subtitle: {
        type: String,
        trim: true,
        default: "",
    },
    description: {
        type: String,
        trim: true,
        default: "",
    },
    imageUrl: {
        type: String,
        default: "",
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

contentSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

contentSchema.pre("findOneAndUpdate", function (next) {
    this.set({ updatedAt: Date.now() });
    next();
});

module.exports = mongoose.model("Content", contentSchema);
