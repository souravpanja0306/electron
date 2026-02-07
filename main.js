const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");
require("./server.js");

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 800,
        minWidth: 800,
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
};

app.whenReady().then(() => {
    const template = [
        { label: "File", submenu: [{ role: "quit" }] },
        {
            label: "Edit", submenu: [
                { role: "undo" }, { role: "redo" }, { type: "separator" },
                { role: "cut" }, { role: "copy" }, { role: "paste" },
                { role: "selectAll" }
            ]
        },
        {
            label: "View", submenu: [
                { role: "reload" },
                { role: "forceReload" },
                { role: "toggleDevTools" },
                { type: "separator" },
                { role: "resetZoom" },
                { role: "zoomIn" },
                { role: "zoomOut" },
                { role: "togglefullscreen" }
            ]
        },
        {
            label: "Window", submenu: [
                { role: "minimize" },
                { role: "close" }
            ]
        },
        {
            label: "Help", submenu: [
                { role: "about" }
            ]
        },
        { type: "separator" },
        {
            label: "[Sourav Panja]",
        },
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    createWindow();
});
