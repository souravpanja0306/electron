// Package...
const express = require("express");
const router = express.Router()

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