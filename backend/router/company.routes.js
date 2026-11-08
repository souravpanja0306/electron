"use strict";
const express = require("express");
const router = express.Router();
const middleware = require("../middleware/middleware");
const { logoUpload } = require("../helper/upload");
const CompanyController = require("../controller/company.controller");

const auth = middleware.isAuthenticated;
router.post("/create-company", auth, logoUpload.single("logo"), middleware.restoreAuth, CompanyController.addCompany);
router.get("/get-company", auth, CompanyController.getCompany);
router.get("/company/:id", auth, CompanyController.getCompanyById);
router.delete("/company-delete", auth, CompanyController.removeCompany);
router.put("/update-company/:id", auth, logoUpload.single("logo"), middleware.restoreAuth, CompanyController.updateCompany);

module.exports = router;
