const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");
const User = require("../models/User");

// @desc        register user
// @route       GET /api/v1/auth/register
// @access      Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    role
  });
  console.log(name, email, password, role);
  // const token = user.getSignedJWT();
  console.log(user);
  res.status(200).json({
    success: true,
    token: "qwe"
  });
});
