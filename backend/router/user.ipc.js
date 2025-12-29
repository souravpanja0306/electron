const { ipcMain } = require("electron");
const UserController = require("../controller/user.controller");

ipcMain.handle(
    "user:create",
    (_, data) => UserController.addUser(data)
);

ipcMain.handle(
    "user:list",
    (_, params) => UserController.listUsers(params)
);

ipcMain.handle(
    "user:delete",
    (_, params) => UserController.removeUsers(params)
);
