"use strict";
const express = require("express");
const router = express.Router();
const middleware = require("../middleware/middleware");
const ChallanController = require("../controller/challan.controller");

const auth = middleware.isAuthenticated;
router.get("/generate-challan-no", auth, ChallanController.generateChallanNo);
router.post("/create", auth, ChallanController.createChallan);
router.get("/list", auth, ChallanController.getAllChallans);
router.get("/generate-pdf", auth, ChallanController.generateChallanPdf);
router.delete("/delete/:id", auth, ChallanController.deleteChallan);
router.put("/update/:id", auth, ChallanController.updateChallan);

module.exports = router;
