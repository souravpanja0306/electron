// Package...
const express = require("express");
const router = express.Router()

// Controllers...
const AdminController = require("../controller/admin.controller");

// Middleware...
const middleware = require("../middleware/middleware");

router.get(
    "/reset-all-table",
    AdminController.resetAllTable
);

// HSN Create...
router.post(
    "/create-hsn-code",
    middleware.isAuthenticated,
    AdminController.createHsnSac
);

router.get(
    "/get-hsn-code",
    middleware.isAuthenticated,
    AdminController.getHsnSac
);

// GST setup
router.post(
    "/create-gst",
    middleware.isAuthenticated,
    AdminController.createGST
);

router.get(
    "/get-all-gst",
    middleware.isAuthenticated,
    AdminController.getGST
);

module.exports = router;