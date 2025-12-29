const { ipcMain } = require("electron");
const PartyController = require("../controller/party.controller");

ipcMain.handle("party:create", (_, data) =>
    PartyController.addParty(data)
);

ipcMain.handle("party:list", (_, params) =>
    PartyController.listParty(params)
);

ipcMain.handle("party:delete", (_, params) =>
    PartyController.removeParty(params)
);
