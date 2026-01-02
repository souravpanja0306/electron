const { ipcMain } = require("electron");
const AuthController = require("../controller/auth.controller");

ipcMain.handle("auth:signin", (_, data) =>
    AuthController.signin(data)
);

ipcMain.handle("auth:forgot", (_, params) =>
    AuthController.forgot(params)
);

ipcMain.handle("auth:reset", (_, params) =>
    AuthController.reset(params)
);
