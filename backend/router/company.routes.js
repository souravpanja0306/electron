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
const CompanyController = require("../controller/company.controller");

// Middleware...
const middleware = require("../middleware/middleware");

router.post(
    "/create-company",
    file.single('logo'),
    middleware.isAuthenticated,
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