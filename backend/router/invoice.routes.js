"use strict";
const express = require("express");
const router = express.Router();
const middleware = require("../middleware/middleware");
const InvoiceController = require("../controller/invoice.controller");

const auth = middleware.isAuthenticated;
router.get("/generate-invoice-no", auth, InvoiceController.generateInvoiceNo);
router.post("/invoice-create", auth, InvoiceController.createInvoice);
router.get("/generate-invoice-pdf", auth, InvoiceController.generateInvoicePdf);
router.get("/invoice-list", auth, InvoiceController.getAllInvoice);
router.put("/invoice-update", auth, InvoiceController.invoiceUpdate);
router.delete("/invoice-delete/:id", auth, InvoiceController.deleteInvoice);

module.exports = router;
