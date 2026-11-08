"use strict";
const express = require("express");
const router = express.Router();
const middleware = require("../middleware/middleware");
const MoneyReceiptController = require("../controller/moneyReceipts.controller");

const auth = middleware.isAuthenticated;
router.get("/generate-receipt-no", auth, MoneyReceiptController.generateMoneyReceiptNo);
router.post("/create-money-receipt", auth, MoneyReceiptController.createMoneyReceipt);
router.put("/update-money-receipt", auth, MoneyReceiptController.updateMoneyReceipt);
router.get("/get-money-receipt", auth, MoneyReceiptController.getMoneyReceipt);
router.get("/print-money-receipt", auth, MoneyReceiptController.printMoneyReceipt);
router.delete("/delete-money-receipt/:id", auth, MoneyReceiptController.deleteMoneyReceipt);

module.exports = router;
