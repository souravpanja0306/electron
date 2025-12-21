const { app, BrowserWindow } = require("electron");
const path = require("path");

// 🔥 MUST be here
require(path.join(__dirname, "backend/ipc/user.ipc.js"));

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    win.loadURL("http://localhost:3000");
}

app.whenReady().then(createWindow);
