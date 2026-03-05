const Message = require("../models/Message");

// GET /api/messages   (protected)
exports.getAll = async (_req, res) => {
    try {
        const items = await Message.find().sort("-date");
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// GET /api/messages/stats   (protected)
exports.stats = async (_req, res) => {
    try {
        const total = await Message.countDocuments();
        const unread = await Message.countDocuments({ read: false });
        res.json({ total, unread });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// POST /api/messages   (public — contact form)
exports.create = async (req, res) => {
    try {
        const item = await Message.create(req.body);
        res.status(201).json({ message: "Message sent" });
    } catch (err) {
        if (err.name === "ValidationError") {
            const msg = Object.values(err.errors).map(e => e.message).join(", ");
            return res.status(400).json({ message: msg });
        }
        res.status(500).json({ message: "Server error" });
    }
};

// PATCH /api/messages/:id/read   (protected)
exports.markRead = async (req, res) => {
    try {
        const item = await Message.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
        if (!item) return res.status(404).json({ message: "Message not found" });
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// DELETE /api/messages/:id   (protected)
exports.remove = async (req, res) => {
    try {
        const item = await Message.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ message: "Message not found" });
        res.json({ message: "Message deleted" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};
