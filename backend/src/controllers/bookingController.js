const Booking = require("../models/Booking");

// GET /api/bookings   (protected)
exports.getAll = async (_req, res) => {
    try {
        const items = await Booking.find().sort("-createdAt");
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// GET /api/bookings/stats   (protected)
exports.stats = async (_req, res) => {
    try {
        const total = await Booking.countDocuments();
        const pending = await Booking.countDocuments({ status: "Pending" });
        res.json({ total, pending });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// POST /api/bookings   (protected)
exports.create = async (req, res) => {
    try {
        const item = await Booking.create(req.body);
        res.status(201).json(item);
    } catch (err) {
        if (err.name === "ValidationError") {
            const msg = Object.values(err.errors).map(e => e.message).join(", ");
            return res.status(400).json({ message: msg });
        }
        res.status(500).json({ message: "Server error" });
    }
};

// PUT /api/bookings/:id   (protected)
exports.update = async (req, res) => {
    try {
        const item = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!item) return res.status(404).json({ message: "Booking not found" });
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// DELETE /api/bookings/:id   (protected)
exports.remove = async (req, res) => {
    try {
        const item = await Booking.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ message: "Booking not found" });
        res.json({ message: "Booking deleted" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};
