"use strict";
const express = require("express");
const router = express.Router();
const middleware = require("../middleware/middleware");
const os = require("os");
const multer = require("multer");
// Backups are verified, then staged; they never land in the served uploads folder.
const restoreUpload = multer({ dest: os.tmpdir(), limits: { fileSize: 500 * 1024 * 1024, files: 1 } });
const AdminController = require("../controller/admin.controller");

const auth = middleware.isAuthenticated;

// Database backup / restore / reset (Settings > Database).
router.get("/dump-db", auth, AdminController.dumpDB);
router.post("/restore-db", auth, restoreUpload.single("backup"), AdminController.restoreDB);
router.post("/reset-data", auth, AdminController.resetData);
router.get("/data-summary", auth, AdminController.dataSummary);

// HSN / SAC master
router.post("/create-hsn-code", auth, AdminController.createHsnSac);
router.get("/get-hsn-code", auth, AdminController.getHsnSac);
router.put("/update-hsn-code", auth, AdminController.updateHsnSac);
router.delete("/delete-hsn-code/:id", auth, AdminController.deleteHsnSac);

// GST master
router.post("/create-gst", auth, AdminController.createGST);
router.get("/get-all-gst", auth, AdminController.getGST);
router.put("/update-gst", auth, AdminController.updateGST);
router.delete("/delete-gst/:id", auth, AdminController.deleteGST);

// CHA master
router.post("/create-cha", auth, AdminController.createCHA);
router.get("/get-cha", auth, AdminController.getCHA);
router.put("/update-cha", auth, AdminController.updateCHA);
router.delete("/delete-cha/:id", auth, AdminController.deleteCHA);

module.exports = router;
