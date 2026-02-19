// Package...
const express = require("express");
const router = express.Router()

// Controllers...
const AuthController = require("../controller/auth.controller");

// Middleware...
const middleware = require("../middleware/middleware");

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

router.get(
    "/view-profile",
    middleware.isAuthenticated,
    AuthController.viewProfile
);


module.exports = router;