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
const PartyController = require("../controller/party.controller");

// Middleware...
const middleware = require("../middleware/middleware");

router.post(
    "/party-create",
    middleware.isAuthenticated,
    PartyController.addParty
);

router.get(
    "/party-list",
    middleware.isAuthenticated,
    PartyController.listParty
);

router.delete(
    "/party-delete/:id",
    middleware.isAuthenticated,
    PartyController.removeParty
);

router.put(
    "/party-update/:id",
    middleware.isAuthenticated,
    PartyController.editParty
);


module.exports = router;