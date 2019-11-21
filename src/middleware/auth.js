const jwt = require("jsonwebtoken");
const asyncHandler = require("./asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

//Protect route
const protectRoute = asyncHandler(async (req, res, next) => {
  let token;
  const auth = req.headers.authorization;

  if (auth && auth.startsWith("Bearer")) {
    token = auth.split(" ")[1];
  }

  // Ensure token exist
  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded ", decoded);

    req.user = await User.findById(decoded.id);
    next();
  } catch (e) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }
});

module.exports = protectRoute;
