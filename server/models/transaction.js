const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const transactionSchema = new Schema({
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true,
    default: "Unidentified Transaction"
  },
  date: {
    type: Date,
    required: false
  },
  account: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Account"
  },
  user: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "User"
  }
});

module.exports = mongoose.model("Transaction", transactionSchema);
