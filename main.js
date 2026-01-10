const { app, BrowserWindow } = require("electron");
const path = require("path");

require(path.join(__dirname, "backend/router/user.ipc.js"));
require(path.join(__dirname, "backend/router/party.ipc.js"));
require(path.join(__dirname, "backend/router/auth.ipc.js"));

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 1000,
        minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    win.loadURL("http://localhost:3000");
}

app.whenReady().then(createWindow);
