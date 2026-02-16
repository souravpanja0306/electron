// Package...
const express = require("express");
const router = express.Router();

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


module.exports = router;