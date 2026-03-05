require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const contentRoutes = require("./routes/content");
const bookingRoutes = require("./routes/bookings");
const messageRoutes = require("./routes/messages");

const app = express();

// ── Security headers ──
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        contentSecurityPolicy: false,
    })
);

// ── CORS ──
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "*",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// ── Rate limiting (login) ──
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 10,
    message: { message: "Too many login attempts, try again in 15 minutes" },
});
app.use("/api/auth/login", loginLimiter);

// ── Body parsers ──
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Static uploads ──
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Routes ──
app.use("/api/auth", authRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/messages", messageRoutes);

// ── Health check ──
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// ── 404 ──
app.use((_req, res) => res.status(404).json({ message: "Route not found" }));

// ── Global error handler ──
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal server error" });
});

// ── Start ──
const PORT = process.env.PORT || 5000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
        });
    })
    .catch((err) => {
        console.error("Failed to connect to MongoDB:", err.message);
        process.exit(1);
    });
