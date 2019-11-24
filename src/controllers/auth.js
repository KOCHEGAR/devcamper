const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");
const User = require("../models/User");

// @desc        register user
// @route       POST /api/v1/auth/register
// @access      Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  await User.init();
  const user = await User.create({
    name,
    email,
    password,
    role
  });

  sendTokenResponse(user, 200, res);
});

// @desc        login user
// @route       POST /api/v1/auth/login
// @access      Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse("Please provide email and password", 401));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  const isValidPassword = await user.matchPassword(password);

  if (!isValidPassword) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc        get currently logged user
// @route       POST /api/v1/auth/me
// @access      Private
exports.getMe = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
});

// @desc        forgot password
// @route       POST /api/v1/auth/forgotpassword
// @access      Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new ErrorResponse(`There is no user with email of ${req.body.email}`, 404)
    );
  }

  const resetToken = user.getResetPasswordToken();
  console.log(resetToken);

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    data: user
  });
});

// Helper func
const sendTokenResponse = (user, code, res) => {
  res.status(code).json({
    success: true,
    token: user.getSignedJWT()
  });
};
