"use strict";
const express = require("express");
const router = express.Router();
const middleware = require("../middleware/middleware");
const SettingController = require("../controller/setting.controller");

const auth = middleware.isAuthenticated;
router.post("/add-challan-setting", auth, SettingController.addChallanSetting);
router.get("/get-challan-setting", auth, SettingController.listChallanSetting);
router.post("/invoice-setting", auth, SettingController.saveInvoiceSetting);
router.get("/invoice-setting", auth, SettingController.listInvoiceSetting);
router.get("/field-settings", auth, SettingController.getFieldSettings);
router.put("/field-settings", auth, SettingController.saveFieldSettings);
router.get("/theme", auth, SettingController.getTheme);
router.put("/theme", auth, SettingController.saveTheme);

module.exports = router;
