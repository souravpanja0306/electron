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
const AdminController = require("../controller/admin.controller");
const LicenseController = require("../controller/license.controller");

// Middleware...
const middleware = require("../middleware/middleware");

router.get(
    "/key-validate",
    LicenseController.keyValidate
);

module.exports = router;