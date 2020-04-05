const express = require("express");

const router = express.Router();

const usersControllers = require("../controllers/user-controller");

router.get("/", usersControllers.getUsers);

router.post("/signup", usersControllers.signup);
router.post("/login", usersControllers.login);

router.delete("/data", usersControllers.deleteData);
router.delete("/account", usersControllers.deleteAccount);

module.exports = router;
