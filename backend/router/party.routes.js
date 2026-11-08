"use strict";
const express = require("express");
const router = express.Router();
const middleware = require("../middleware/middleware");
const { logoUpload } = require("../helper/upload");
const PartyController = require("../controller/party.controller");

const auth = middleware.isAuthenticated;
router.post("/party-create", auth, logoUpload.single("logo"), middleware.restoreAuth, PartyController.addParty);
router.get("/party-list", auth, PartyController.listParty);
router.delete("/party-delete/:id", auth, PartyController.removeParty);
router.put("/party-update/:id", auth, logoUpload.single("logo"), middleware.restoreAuth, PartyController.editParty);

module.exports = router;
