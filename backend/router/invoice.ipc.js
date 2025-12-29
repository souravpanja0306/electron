const { ipcMain } = require("electron");
const InvoiceController = require("../controller/");

ipcMain.handle("user:create", (_, data) =>
    InvoiceController.addUser(data)
);

ipcMain.handle("user:list", (_, params) =>
    InvoiceController.listUsers(params)
);

ipcMain.handle("user:delete", (_, params) =>
    InvoiceController.removeUsers(params)
);
