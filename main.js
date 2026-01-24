const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");
// require("./backend/server.js");

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 1200,
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
