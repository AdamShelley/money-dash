const express = require("express");

const router = express.Router();
const transactionControllers = require("../controllers/transaction-controllers");

router.get("/:uid/:tid", transactionControllers.getSingleTransaction);
router.get("/:uid", transactionControllers.getUserData);

router.post("/", transactionControllers.newTransaction);

router.patch("/", transactionControllers.updateTransaction);

router.delete("/", transactionControllers.deleteTransaction);

module.exports = router;
