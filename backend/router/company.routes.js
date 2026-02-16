// Package...
const express = require("express");
const router = express.Router();

// Controllers...
const CompanyController = require("../controller/company.controller");

// Middleware...
const middleware = require("../middleware/middleware");

router.post(
    "/create-company",
    middleware.isAuthenticated,
    CompanyController.addCompany
);

router.get(
    "/get-company",
    middleware.isAuthenticated,
    CompanyController.getCompany
);

router.delete(
    "/company-delete",
    middleware.isAuthenticated,
    CompanyController.removeParty
);


module.exports = router;