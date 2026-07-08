// Package...
const express = require("express");
const router = express.Router();
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
const SettingController = require("../controller/setting.controller");

// Middleware...
const middleware = require("../middleware/middleware");

router.post(
    "/add-challan-setting",
    middleware.isAuthenticated,
    SettingController.addChallanSetting
);

router.get(
    "/get-challan-setting",
    middleware.isAuthenticated,
    SettingController.listChallanSetting
);

module.exports = router;