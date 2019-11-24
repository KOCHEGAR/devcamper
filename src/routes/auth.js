const express = require("express");
const router = express.Router();
const { protectRoute } = require("../middleware/auth");
const {
  register,
  login,
  getMe,
  forgotPassword
} = require("../controllers/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protectRoute, getMe);
router.post("/forgotpassword", forgotPassword);

module.exports = router;
