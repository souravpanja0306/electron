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

router.post(
    "/create-money-receipt",
    middleware.isAuthenticated,
    MoneyReceiptController.createMoneyReceipt
);

router.get(
    "/get-money-receipt",
    middleware.isAuthenticated,
    MoneyReceiptController.getMoneyReceipt
);

router.get(
    "/generate-money-receipt-pdf/:id",
    middleware.isAuthenticated,
    MoneyReceiptController.generateMoneyReceiptPdf
);

router.delete(
    "/delete-money-receipt/:id",
    middleware.isAuthenticated,
    MoneyReceiptController.deleteMoneyReceipt
);

module.exports = router;