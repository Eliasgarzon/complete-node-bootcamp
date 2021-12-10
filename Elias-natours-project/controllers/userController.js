const ApiFeatures = require("./../utils/ApiFeatures");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("../utils/AppError");

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const user = await User.find();

  res.status(200).json({
    status: "success",
    requestTime: req.requestTime,
    data: {
      user,
    },
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Route not defined yet",
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Route not defined yet",
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Route not defined yet",
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Route not defined yet",
  });
};
