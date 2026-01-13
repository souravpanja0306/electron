// Package...
const express = require("express");
const router = express.Router()

// Controllers...
const AuthController = require("../controller/auth.controller");

router.post("auth:signin",
    AuthController.signin()
);

router.post("auth:forgot",
    AuthController.forgot()
);

router.post("auth:reset",
    AuthController.reset()
);
