"use strict";
const express = require("express");
const router = express.Router();
const middleware = require("../middleware/middleware");
const UserController = require("../controller/user.controller");

const auth = middleware.isAuthenticated;

// The signed-in user's own account only.
router.get("/get-profile", auth, UserController.getProfile);
router.put("/update-profile", auth, UserController.updateProfile);
router.post("/change-password", auth, UserController.changePassword);
router.get("/license", auth, UserController.getLicense);

module.exports = router;
