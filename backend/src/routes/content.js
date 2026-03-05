const router = require("express").Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const protect = require("../middleware/auth");
const upload = require("../config/upload");
const ctrl = require("../controllers/contentController");

// Public — read content
router.get("/", ctrl.getAll);
router.get("/:sectionName", ctrl.getBySection);

// Protected — write content
router.post(
    "/",
    protect,
    upload.single("image"),
    [body("sectionName").notEmpty().withMessage("sectionName is required")],
    validate,
    ctrl.create
);

router.put("/:id", protect, upload.single("image"), ctrl.update);
router.delete("/:id", protect, ctrl.remove);

module.exports = router;
