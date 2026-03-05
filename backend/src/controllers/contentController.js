const Content = require("../models/Content");

// GET /api/content/:sectionName
exports.getBySection = async (req, res) => {
    try {
        const items = await Content.find({ sectionName: req.params.sectionName }).sort("-updatedAt");
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// GET /api/content
exports.getAll = async (_req, res) => {
    try {
        const items = await Content.find().sort("-updatedAt");
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// POST /api/content   (protected)
exports.create = async (req, res) => {
    try {
        const { sectionName, title, subtitle, description } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl || "";
        const item = await Content.create({ sectionName, title, subtitle, description, imageUrl });
        res.status(201).json(item);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// PUT /api/content/:id   (protected)
exports.update = async (req, res) => {
    try {
        const updates = { ...req.body };
        if (req.file) updates.imageUrl = `/uploads/${req.file.filename}`;
        const item = await Content.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
        if (!item) return res.status(404).json({ message: "Content not found" });
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// DELETE /api/content/:id   (protected)
exports.remove = async (req, res) => {
    try {
        const item = await Content.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ message: "Content not found" });
        res.json({ message: "Content deleted" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};
