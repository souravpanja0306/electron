// Package...
const express = require("express");
const router = express.Router();

// Controllers...
const PartyController = require("../controller/party.controller");

router.post(
    "/party-create",
    PartyController.addParty
);

router.get(
    "/party-list",
    PartyController.listParty
);

router.delete(
    "/party-delete",
    PartyController.removeParty
);


module.exports = router;