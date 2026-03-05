const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    client: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    service: {
        type: String,
        required: true,
        enum: ["Photoshoot", "Graphic Design", "Media Coverage", "Podcast Feature"],
    },
    date: { type: Date, required: true },
    status: {
        type: String,
        enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
        default: "Pending",
    },
    notes: { type: String, trim: true, default: "" },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Booking", bookingSchema);
