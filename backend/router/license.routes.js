// Package...
const express = require("express");
const router = express.Router()

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