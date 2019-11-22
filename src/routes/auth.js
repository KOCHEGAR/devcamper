const express = require("express");
const router = express.Router();
const { protectRoute } = require("../middleware/auth");
const { register, login, getMe } = require("../controllers/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protectRoute, getMe);

module.exports = router;
