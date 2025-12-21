const { ipcMain } = require("electron");
const Controller = require("../controller/user.controller");

ipcMain.handle("user:create", (_, data) =>
    Controller.createUser(data)
);

ipcMain.handle("user:list", (_, params) =>
    Controller.getAllUser(params)
);

ipcMain.handle("user:delete", (_, params) =>
    Controller.deleteUser(params)
);
