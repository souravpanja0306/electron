const { app, BrowserWindow } = require("electron");
const path = require("path");
require("./server");

function createWindow() {
    const win = new BrowserWindow({
        width: 8,
        height: 8,
        minWidth: 1000,
        minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        }
    });
    win.loadURL("http://localhost:3000");
};

app.whenReady().then(createWindow);
