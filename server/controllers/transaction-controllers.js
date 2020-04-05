const HttpError = require("../models/http-error");
const mongoose = require("mongoose");
const Account = require("../models/account");
const User = require("../models/user");
const Transaction = require("../models/transaction");

// GET all data for a user
const getUserData = async (req, res, next) => {
  const userId = req.params.uid;

  let accounts;
  try {
    accounts = await Account.find({ user: userId });
  } catch (err) {
    return next(new HttpError("Could not find any data", 500));
  }

  res.json({ data: accounts });
};

// GET a specific transaction for a user

const getSingleTransaction = async (req, res, next) => {
  // Will have to authenticate the correct user
  console.log("function called");
  const transactionId = req.params.tid;

  let transaction;
  try {
    transaction = await Transaction.findById(transactionId);
  } catch (error) {
    return next(
      new HttpError("could not find a transaction with that ID", 500)
    );
  }

  if (!transaction) {
    return next(
      new HttpError("could not find a transaction with that ID", 500)
    );
  }

  res.json({ msg: "Here is the single transaction", data: transaction });
};

// POST a transaction for the user

const newTransaction = async (req, res, next) => {
  const { userId, accountId, transaction } = req.body;

  let account;
  try {
    account = await Account.findById(accountId).populate("transactions");
  } catch (err) {
    return next(new HttpError("Could not find the account", 500));
  }

  if (!account) {
    return next(new HttpError("Could not find the account", 500));
  }

  const newTransaction = new Transaction({
    ...transaction,
    account: accountId,
    user: userId
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await newTransaction.save({ session: sess });
    account.transactions.push(newTransaction);
    await account.save({ session: sess });

    await sess.commitTransaction();
  } catch (error) {
    return next(new HttpError("Could not save transaction", 500));
  }

  res.json({ data: newTransaction });
};

// PATCH - Update a transaction
const updateTransaction = async (req, res, next) => {
  // Authenticate user
  const { transactionId, description, amount, category, date } = req.body;

  let transaction;
  try {
    transaction = await Transaction.findById(transactionId);
  } catch (error) {
    return next(
      new HttpError("Could not find the transaction. Please try again.", 500)
    );
  }

  transaction.description = description;
  transaction.amount = amount;
  transaction.category = category;
  transaction.date = date;

  try {
    await transaction.save();
  } catch (error) {
    return next(new HttpError("Something went wrong, could not update", 500));
  }

  res.status(201).json({ message: transaction.toObject({ getters: true }) });
};

// DELETE - a single transaction
const deleteTransaction = async (req, res, next) => {
  const { transactionId } = req.body;

  let transaction;
  try {
    transaction = await Transaction.findById(transactionId).populate("account");
  } catch (error) {
    return next(new HttpError("Could not find the transaction", 500));
  }

  if (!transaction) {
    return next(
      new HttpError("A transaction with this ID does not exist", 500)
    );
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await transaction.remove({ session: sess });
    transaction.account.transactions.pull(transaction);
    await transaction.account.save({ session: sess });
    sess.commitTransaction();
  } catch (error) {
    return next(
      new HttpError("Could not delete the transaction. please try again.", 500)
    );
  }

  res.status(201).json({ msg: "Transaction deleted" });
};

exports.getUserData = getUserData;
exports.getSingleTransaction = getSingleTransaction;
exports.newTransaction = newTransaction;
exports.updateTransaction = updateTransaction;
exports.deleteTransaction = deleteTransaction;
