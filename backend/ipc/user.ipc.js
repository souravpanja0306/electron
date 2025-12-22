const { ipcMain } = require("electron");
const UserController = require("../controller/user.controller");

ipcMain.handle("user:create", (_, data) =>
    UserController.createUser(data)
);

ipcMain.handle("user:list", (_, params) =>
    UserController.getAllUser(params)
);

ipcMain.handle("user:delete", (_, params) =>
    UserController.deleteUser(params)
);
