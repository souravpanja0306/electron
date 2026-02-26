const { app, BrowserWindow, Menu, globalShortcut, ipcMain } = require("electron");
const path = require("path");
const { machineIdSync } = require('node-machine-id');
const { validateLicense } = require("./licenseService.js")

require("./server.js");
app.whenReady().then(() => {
    validateLicense();
    const win = new BrowserWindow({
        frame: false,
        titleBarStyle: "hidden",
        width: 1400,
        height: 800,
        minWidth: 600,
        minHeight: 300,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        },
        icon: path.join(__dirname, "./public/icon/icon.ico")
    });
    win.loadURL("http://localhost:3000");
    // win.loadFile(path.join(__dirname, "frontend/build/index.html")); // This code is ready for Production.


    // win.webContents.openDevTools(); // For Permanents for Developments.
    globalShortcut.register("Control+Shift+I", () => {
        win.webContents.openDevTools();
    });
    ipcMain.on("minimize", () => win.minimize());
    ipcMain.on("maximize", () => { win.isMaximized() ? win.unmaximize() : win.maximize() });
    ipcMain.on("close", () => {
        win.close()
    });
    ipcMain.on("openDevTools", () => {
        win.webContents.isDevToolsOpened() ? win.webContents.closeDevTools() : win.webContents.openDevTools();
    });
    ipcMain.handle("get-machine-id", () => { return machineIdSync({ original: false }) });
});
