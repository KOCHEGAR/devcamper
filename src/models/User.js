const crypto = require("crypto");

const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const uniqueValidator = require("mongoose-unique-validator");

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"]
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please add a valid email"
    ]
  },
  role: {
    type: String,
    enum: ["user", "publisher"],
    default: "user"
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    select: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});
UserSchema.plugin(uniqueValidator);

// Encrypt password
UserSchema.pre("save", async function(next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcryptjs.genSalt(13);
  this.password = await bcryptjs.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJWT = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

UserSchema.methods.matchPassword = async function(password) {
  return await bcryptjs.compare(password, this.password);
};

UserSchema.methods.getResetPasswordToken = function() {
  //Generate token
  const resetToken = crypto.randomBytes(19).toString("hex");

  // Hash token and set to resetPassword
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
module.exports = mongoose.model("User", UserSchema);
