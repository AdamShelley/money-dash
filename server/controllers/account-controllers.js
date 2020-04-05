const HttpError = require("../models/http-error");
const mongoose = require("mongoose");
const Account = require("../models/account");
const User = require("../models/user");
const Transaction = require("../models/transaction");

//A POST - Create a fresh finance account for this user

const createNewAccount = async (req, res, next) => {
  const { userId, accountDetails } = req.body;

  let user;
  try {
    user = await (await User.findById(userId)).populate({ path: "accounts" });
  } catch (error) {
    return next(new HttpError("Could not find a user", 500));
  }

  if (!user) {
    return next(new HttpError("Could not find a user", 500));
  }

  // Check if account exists in user
  const accounts = await Account.find({ name: accountDetails.name }).populate(
    "user"
  );

  if (accounts.length !== 0) {
    return next(new HttpError("An account already exists with this name", 422));
  }

  const account = new Account({
    ...accountDetails,
    user: userId
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await account.save({ session: sess });
    user.accounts.push(account);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    return next(
      new HttpError("Issues creating the account. Please try again.", 500)
    );
  }

  res.status(201).json({ data: account });
};

// DELETE - Delete an account + transactions associated with it.
const deleteFinanceAccount = async (req, res, next) => {
  console.log("Delete Account");
  const accountId = req.params.aid;

  let account;
  try {
    account = await Account.findById(accountId).populate("user");
  } catch (err) {
    return next(
      new HttpError("Something went wrong. Could not delete account.", 500)
    );
  }

  if (!account) {
    return next(new HttpError("Account does not exist", 404));
  }

  console.log(account);

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await account.remove({ session: sess });
    account.user.accounts.pull(account);
    await account.user.save({ session: sess });
    sess.commitTransaction();

    Transaction.deleteMany({ account: accountId }, (err, result) => {
      if (err) {
        return next(
          new HttpError("Could not delete the transactions associated", 500)
        );
      }
    });
  } catch (err) {
    return next(new HttpError("Could not delete, please try again", 500));
  }

  res.status(201).json({ message: "Deleted account" });
};

exports.createNewAccount = createNewAccount;
exports.deleteFinanceAccount = deleteFinanceAccount;
