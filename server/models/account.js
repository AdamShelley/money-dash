const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const Schema = mongoose.Schema;

const accountSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    required: true,
    default: 0
  },
  user: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "User"
  },
  transactions: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Transaction"
    }
  ]
});

accountSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Account", accountSchema);
