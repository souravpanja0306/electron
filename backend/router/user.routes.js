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

router.get(
    "/get-profile",
    middleware.isAuthenticated,
    UserController.getProfile
);

router.put(
    "/update-profile",
    middleware.isAuthenticated,
    UserController.updateProfile
);

router.delete(
    "/user-delete",
    middleware.isAuthenticated,
    UserController.removeUsers
);

module.exports = router;