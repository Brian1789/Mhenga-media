const router = require("express").Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const protect = require("../middleware/auth");
const ctrl = require("../controllers/authController");

// POST /api/auth/login
router.post(
    "/login",
    [
        body("email").isEmail().withMessage("Valid email is required"),
        body("password").notEmpty().withMessage("Password is required"),
    ],
    validate,
    ctrl.login
);

// POST /api/auth/change-password  (protected)
router.post(
    "/change-password",
    protect,
    [
        body("currentPassword").notEmpty().withMessage("Current password is required"),
        body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
    ],
    validate,
    ctrl.changePassword
);

module.exports = router;
