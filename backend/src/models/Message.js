const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    from: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, required: true, trim: true },
    body: { type: String, trim: true, default: "" },
    read: { type: Boolean, default: false },
    date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", messageSchema);
