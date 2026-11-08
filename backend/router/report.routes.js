"use strict";
const express = require("express");
const router = express.Router();
const middleware = require("../middleware/middleware");
const ReportController = require("../controller/report.controller");

const auth = middleware.isAuthenticated;
router.get("/debtors", auth, ReportController.debtors);
router.get("/dashboard-stats", auth, ReportController.dashboardStats);
router.get("/customer-ledger", auth, ReportController.customerLedger);
router.get("/creditors", auth, ReportController.creditors);
router.get("/sales-report", auth, ReportController.salesReports);

module.exports = router;
