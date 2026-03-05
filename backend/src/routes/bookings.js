const router = require("express").Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const protect = require("../middleware/auth");
const ctrl = require("../controllers/bookingController");

// All booking routes are protected
router.use(protect);

router.get("/", ctrl.getAll);
router.get("/stats", ctrl.stats);

router.post(
    "/",
    [
        body("client").notEmpty().withMessage("Client name is required"),
        body("email").isEmail().withMessage("Valid email is required"),
        body("service").notEmpty().withMessage("Service is required"),
        body("date").notEmpty().withMessage("Date is required"),
    ],
    validate,
    ctrl.create
);

router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

module.exports = router;
