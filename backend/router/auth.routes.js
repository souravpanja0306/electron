// Package...
const express = require("express");
const router = express.Router()

// Controllers...
const AuthController = require("../controller/auth.controller");

router.post(
    "/signup",
    AuthController.signup
);

router.post(
    "/signin",
    AuthController.signin
);

router.get(
    "/forgot-password",
    AuthController.forgotPassword
);

router.get(
    "/reset-password",
    AuthController.resetPassword
);

module.exports = router;