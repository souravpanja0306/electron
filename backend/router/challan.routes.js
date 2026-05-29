"use strict";
const express = require("express");
const router = express.Router();

// Controllers...
const ChallanController = require("../controller/challan.controller");

// Middleware...
const middleware = require("../middleware/middleware");

router.get(
    "/generate-challan-no",
    middleware.isAuthenticated,
    ChallanController.generateChallanNo
);

router.post(
    "/create",
    middleware.isAuthenticated,
    ChallanController.createChallan
);

router.get(
    "/list",
    middleware.isAuthenticated,
    ChallanController.getAllChallans
);

router.get(
    "/generate-pdf",
    middleware.isAuthenticated,
    ChallanController.generateChallanPdf
);

router.delete(
    "/delete/:id",
    middleware.isAuthenticated,
    ChallanController.deleteChallan
);

module.exports = router;