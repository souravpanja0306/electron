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
const ReportController = require("../controller/report.controller");
const PartyController = require("../controller/party.controller");

// Middleware...
const middleware = require("../middleware/middleware");

router.get(
    "/debtors",
    middleware.isAuthenticated,
    ReportController.debtors
);

router.get(
    "/dashboard-stats",
    middleware.isAuthenticated,
    ReportController.dashboardStats
);

router.get(
    "/customer-ledger",
    middleware.isAuthenticated,
    ReportController.customerLedger
);

router.get(
    "/creditors",
    middleware.isAuthenticated,
    ReportController.creditors
);

router.get(
    "/sales-report",
    middleware.isAuthenticated,
    ReportController.salesReports
);

module.exports = router;