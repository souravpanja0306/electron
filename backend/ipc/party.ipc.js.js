const { ipcMain } = require("electron");
const PartyController = require("../controller/party.controller");

ipcMain.handle("party:create", (_, data) =>
    PartyController.createParty(data)
);

ipcMain.handle("party:list", (_, params) =>
    PartyController.getAllParty(params)
);

ipcMain.handle("party:delete", (_, params) =>
    PartyController.deleteParty(params)
);
