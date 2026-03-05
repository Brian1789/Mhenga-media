const jwt = require("jsonwebtoken");
const AdminUser = require("../models/AdminUser");

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "2h",
    });

// POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await AdminUser.findOne({ email }).select("+password");
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const token = signToken(user._id);
        res.json({ token, admin: { id: user._id, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// POST /api/auth/change-password  (protected)
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await AdminUser.findById(req.adminId).select("+password");
        if (!user || !(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }
        user.password = newPassword;
        await user.save();
        const token = signToken(user._id);
        res.json({ message: "Password updated", token });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};
