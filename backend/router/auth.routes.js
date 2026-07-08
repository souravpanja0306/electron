// Package...
const express = require("express");
const router = express.Router()
const multer = require("multer");
const path = require("path");
const { app } = require("electron");
const fs = require("fs");
const uploadPath = app.isPackaged
    ? path.join(app.getPath("userData"), "uploads", "main")
    : path.join(__dirname, "../../uploads/main");
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
const file = multer({ dest: uploadPath });

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
    "/check-username/:username",
    AuthController.checkUsername
);

router.get(
    "/view-profile",
    middleware.isAuthenticated,
    AuthController.viewProfile
);


module.exports = router;