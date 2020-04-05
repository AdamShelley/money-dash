const HttpError = require("../models/http-error");
const mongoose = require("mongoose");
const Account = require("../models/account");
const Transaction = require("../models/transaction");
const User = require("../models/user");

// GET ALL USERS
const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find().populate({
      path: "accounts",
      populate: { path: "transactions" }
    });
  } catch (error) {
    return next(new HttpError("There has been an error", 500));
  }

  res.status(201).json({ users: users });
};

// SIGNUP ROUTE
const signup = async (req, res, next) => {
  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Signing up failed. Please try again", 500);
    return next(error);
  }

  if (existingUser) {
    return next(new HttpError("User exists already, please login", 422));
  }

  const createdUser = new User({
    name,
    email,
    password,
    accounts: []
  });

  // Why is it not saving?
  try {
    await createdUser.save();
  } catch (error) {
    console.log(error);
    return next(
      new HttpError("Signing up failed, please try again later.", 500)
    );
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

// LOGIN ROUTE
const login = async (req, res) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Logging in failed. Please try again", 500);
    return next(error);
  }

  if (!existingUser || existingUser.password !== password) {
    return next(new HttpError("Invalid credentials", 422));
  }

  res.status(201).json({ message: "Logged in" });
};

const deleteData = async (req, res, next) => {
  const { userId } = req.body;

  let user;
  try {
    user = await User.findById(userId).populate({
      path: "accounts",
      populate: { path: "transactions" }
    });
  } catch (err) {
    return next(
      new HttpError("Could not find the user. Please try again", 500)
    );
  }

  if (!user) {
    return next(new HttpError("Could not find user", 500));
  }

  // Remove all accounts and transactions

  try {
    Transaction.deleteMany({ user: userId }, function(err, result) {
      if (err) {
        return next(new HttpError(err, 500));
      }
    });

    Account.deleteMany({ user: userId }, (err, result) => {
      if (err) {
        return next(new HttpError(err, 500));
      }
    });

    user.accounts = [];
    await user.save();
  } catch (error) {
    console.log(error);
    return next(
      new HttpError("Error deleting all accounts, please try again.", 500)
    );
  }

  res.status(201).json({ message: "All data deleted", data: user });
};

// DELETE ACCOUNT - NUCLEAR OPTION
const deleteAccount = async (req, res, next) => {
  const { userId } = req.body;

  let user;
  try {
    user = await User.findById(userId).populate({
      path: "accounts",
      populate: { path: "transactions" }
    });
  } catch (error) {
    return next(new HttpError("Could not find user", 500));
  }

  if (!user) {
    return next(new HttpError("Could not find user", 500));
  }

  // Start delete process
  try {
    Transaction.deleteMany({ user: userId }, (err, result) => {
      if (err) {
        return next(new HttpError(err, 500));
      }
    });

    Account.deleteMany({ user: userId }, (err, result) => {
      if (err) {
        return next(new HttpError(err, 500));
      }
    });

    User.deleteOne({ _id: userId }, (err, result) => {
      if (err) {
        return next(new HttpError(err, 500));
      }
    });
  } catch (error) {
    return next(new HttpError("Could not delete data, please try again", 500));
  }

  res.status(201).json({ message: "Account deleted" });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
exports.deleteData = deleteData;
exports.deleteAccount = deleteAccount;
