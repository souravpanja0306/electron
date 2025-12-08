const { app, BrowserWindow } = require("electron");

function createWindow() {
    const win = new BrowserWindow({ width: 1024, height: 1024 });
    win.loadURL("http://localhost:3000");
};
app.whenReady().then(createWindow);