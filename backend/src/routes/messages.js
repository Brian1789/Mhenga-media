const router = require("express").Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const protect = require("../middleware/auth");
const ctrl = require("../controllers/messageController");

// Public — submit a message (contact form)
router.post(
    "/",
    [
        body("from").notEmpty().withMessage("Name is required"),
        body("email").isEmail().withMessage("Valid email is required"),
        body("subject").notEmpty().withMessage("Subject is required"),
    ],
    validate,
    ctrl.create
);

// Protected — admin reads / manages messages
router.get("/", protect, ctrl.getAll);
router.get("/stats", protect, ctrl.stats);
router.patch("/:id/read", protect, ctrl.markRead);
router.delete("/:id", protect, ctrl.remove);

module.exports = router;
