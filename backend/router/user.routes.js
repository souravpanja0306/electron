// Package...
const express = require("express");
const router = express.Router()

// Controllers...
const UserController = require("../controller/user.controller");

router.post(
    "/user-create",
    UserController.addUser(data)
);

router.get(
    "/user-list",
    UserController.listUsers(params)
);

router.delete(
    "/user-delete",
    UserController.removeUsers(params)
);
