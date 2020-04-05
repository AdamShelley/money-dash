const express = require("express");

const router = express.Router();
const transactionControllers = require("../controllers/transaction-controllers");
const accountControllers = require("../controllers/account-controllers");

router.post("/", accountControllers.createNewAccount);

router.delete("/:aid", accountControllers.deleteFinanceAccount);

module.exports = router;
