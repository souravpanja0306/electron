// Package...
const express = require("express");
const router = express.Router()

// Controllers...
const UserController = require("../controller/user.controller");

router.post(
    "/create-users",
    UserController.addUser
);

router.get(
    "/get-all-users",
    UserController.listUsers
);

router.get(
    "/get-user/:id",
    UserController.getUsers
);


router.delete(
    "/user-delete",
    UserController.removeUsers
);

module.exports = router;