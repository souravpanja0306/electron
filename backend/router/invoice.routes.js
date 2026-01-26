"use strict";
// Package...
const express = require("express");
const router = express.Router();

const multer = require("multer");
const file = multer({ dest: "./uploads/main" });

// Controllers...
const InvoiceController = require("../controller/invoice.controller");

// Middleware...
const middleware = require("../middleware/middleware");

router.get(
    "/generate-invoice-no",
    middleware.isAuthenticated,
    InvoiceController.generateInvoiceNo
);

router.post(
    "/invoice-create",
    middleware.isAuthenticated,
    InvoiceController.createInvoice
);

router.get(
    "/invoice-list",
    middleware.isAuthenticated,
    InvoiceController.getAllInvoice
);

router.get(
    "/invoice-exports",
    middleware.isAuthenticated,
    InvoiceController.invoiceExports
);

router.put(
    "/invoice-update",
    middleware.isAuthenticated,
    InvoiceController.invoiceUpdate
);

router.delete(
    "/invoice-delete",
    middleware.isAuthenticated,
    InvoiceController.deleteInvoice
);


module.exports = router;