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

router.post(
    "/migrate-table",
    AdminController.migrateTable
);

router.get(
    "/dump-db",
    AdminController.dumpDB
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

router.put(
    "/update-hsn-code",
    middleware.isAuthenticated,
    AdminController.updateHsnSac
);

router.delete(
    "/delete-hsn-code/:id",
    middleware.isAuthenticated,
    AdminController.deleteHsnSac
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

router.put(
    "/update-gst",
    middleware.isAuthenticated,
    AdminController.updateGST
);

router.delete(
    "/delete-gst/:id",
    middleware.isAuthenticated,
    AdminController.deleteGST
);

module.exports = router;