"use strict";
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
const ChallanController = require("../controller/challan.controller");

// Middleware...
const middleware = require("../middleware/middleware");

router.get(
    "/generate-challan-no",
    middleware.isAuthenticated,
    ChallanController.generateChallanNo
);

router.post(
    "/create",
    middleware.isAuthenticated,
    ChallanController.createChallan
);

router.get(
    "/list",
    middleware.isAuthenticated,
    ChallanController.getAllChallans
);

router.get(
    "/generate-pdf",
    middleware.isAuthenticated,
    ChallanController.generateChallanPdf
);

router.delete(
    "/delete/:id",
    middleware.isAuthenticated,
    ChallanController.deleteChallan
);

router.put(
    "/update/:id",
    middleware.isAuthenticated,
    ChallanController.updateChallan
);

module.exports = router;