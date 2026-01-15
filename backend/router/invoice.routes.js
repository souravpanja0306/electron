// Package...
const express = require("express");
const router = express.Router()

// Controllers...
const InvoiceController = require("../controller/invoice.controller");

router.get(
    "/generate-invoice-no",
    InvoiceController.generateInvoiceNo
);

router.post(
    "/invoice-create",
    InvoiceController.createInvoice
);

router.get(
    "/invoice-list",
    InvoiceController.getAllInvoice
);

router.delete(
    "/invoice-delete",
    InvoiceController.deleteInvoice
);


module.exports = router;