// Package...
const express = require("express");
const router = express.Router()

// Controllers...
const UserController = require("../controller/user.controller");

// Middleware...
const middleware = require("../middleware/middleware");

router.post(
    "/create-users",
    middleware.isAuthenticated,
    UserController.addUser
);

router.get(
    "/get-all-users",
    middleware.isAuthenticated,
    UserController.listUsers
);

router.get(
    "/get-user/:id",
    middleware.isAuthenticated,
    UserController.getUsers
);


router.delete(
    "/user-delete",
    middleware.isAuthenticated,
    UserController.removeUsers
);

module.exports = router;