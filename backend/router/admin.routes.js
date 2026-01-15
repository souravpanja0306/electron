// Package...
const express = require("express");
const router = express.Router()

// Controllers...
const AdminController = require("../controller/admin.controller");

router.get(
    "/reset-all-table",
    AdminController.resetAllTable
);


module.exports = router;