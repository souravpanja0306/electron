// Package...
const express = require("express");
const router = express.Router();

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