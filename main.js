const { app, BrowserWindow, Menu, globalShortcut, ipcMain } = require("electron");
const path = require("path");
const { machineIdSync } = require('node-machine-id');
const { validateLicense } = require("./licenseService.js");
const Store = require('electron-store').default;

// Initialize the store
const store = new Store();

require("./server.js");
app.whenReady().then(() => {
    validateLicense();
    const iconPath = path.join(__dirname, "./public/icon/truck.png");
    const win = new BrowserWindow({
        frame: false,
        titleBarStyle: "hidden",
        width: 1000,
        height: 500,
        minWidth: 600,
        minHeight: 300,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        },
        icon: iconPath,
        title: "Zero® ERP — Complete Solution",
    });
    win.loadURL("http://localhost:3000/");
    // win.loadFile(path.join(__dirname, "frontend/build/index.html")); // This code is ready for Production.


    win.webContents.openDevTools(); // For Permanents for Developments.
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
    // Listeners to read/write hardware files safely
    ipcMain.on('store-set', (event, key, value) => {
        store.set(key, value);
    });
    ipcMain.handle('store-get', (event, key) => {
        return store.get(key);
    });
    ipcMain.on('store-delete', (event, key) => {
        store.delete(key);
    });
    ipcMain.on('store-clear-all', (event, key) => {
        store.clear();
    });
});
