"use strict";
// Package...
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
    "/generate-invoice-pdf",
    middleware.isAuthenticated,
    InvoiceController.generateInvoicePdf
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
    "/invoice-delete/:id",
    middleware.isAuthenticated,
    InvoiceController.deleteInvoice
);


module.exports = router;