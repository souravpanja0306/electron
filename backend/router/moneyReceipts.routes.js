"use strict";
// Package...
const express = require("express");
const router = express.Router();

const multer = require("multer");
const file = multer({ dest: "./uploads/main" });

// Controllers...
const MoneyReceiptController = require("../controller/moneyReceipts.controller");

// Middleware...
const middleware = require("../middleware/middleware");

router.get(
    "/generate-receipt-no",
    middleware.isAuthenticated,
    MoneyReceiptController.generateMoneyReceiptNo
);

module.exports = router;