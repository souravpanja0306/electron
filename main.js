const { app, BrowserWindow, Menu, globalShortcut, ipcMain } = require("electron");
const path = require("path");
require("./server.js");

app.whenReady().then(() => {

    const win = new BrowserWindow({
        frame: false,
        titleBarStyle: "hidden",
        width: 1400,
        height: 800,
        minWidth: 1400,
        minHeight: 800,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        },
        icon: path.join(__dirname, "./public/icon/icon.ico")
    });
    win.loadURL("http://localhost:3000");
    // win.loadFile(path.join(__dirname, "frontend/build/index.html"));


    win.webContents.openDevTools();
    globalShortcut.register("Control+Shift+I", () => {
        win.webContents.openDevTools();
    });
    ipcMain.on("minimize", () => win.minimize());
    ipcMain.on("maximize", () => { win.isMaximized() ? win.unmaximize() : win.maximize() });
    ipcMain.on("close", () => {
        console.log("IPC CLOSE RECEIVED");
        win.close()
    });
});
