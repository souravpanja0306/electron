const { app, BrowserWindow } = require("electron");
const path = require("path");
require("./server");

function createWindow() {
    const win = new BrowserWindow({ width: 1024, height: 1024 });
    win.loadURL("http://localhost:3000");
    // win.loadFile(path.join(__dirname, "zero/build/index.html"));
};

app.whenReady().then(createWindow);