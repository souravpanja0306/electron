// Package...
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const file = multer({ dest: "./uploads/main/" });

// Controllers...
const CompanyController = require("../controller/company.controller");

// Middleware...
const middleware = require("../middleware/middleware");

router.post(
    "/create-company",
    middleware.isAuthenticated,
    file.single('logo'),
    CompanyController.addCompany
);

router.get(
    "/get-company",
    middleware.isAuthenticated,
    CompanyController.getCompany
);

router.get(
    "/company/:id",
    middleware.isAuthenticated,
    CompanyController.getCompanyById
);

router.delete(
    "/company-delete",
    middleware.isAuthenticated,
    CompanyController.removeCompany
);

router.put(
    "/update-company/:id",
    middleware.isAuthenticated,
    file.single('logo'),
    CompanyController.updateCompany
);


module.exports = router;