"use strict";
const express = require("express");
const router = express.Router();
const middleware = require("../middleware/middleware");
const AuthController = require("../controller/auth.controller");

router.post("/signup", AuthController.signup);
router.post("/signin", AuthController.signin);
router.get("/check-username/:username", AuthController.checkUsername);
router.get("/access-status", middleware.isSignedIn, AuthController.accessStatus);

module.exports = router;
