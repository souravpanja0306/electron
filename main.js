const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");
require("./server.js");

app.whenReady().then(() => {
    const win = new BrowserWindow({
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


    const template = [
        {
            label: "View", submenu: [
                { role: "reload" },
                { role: "forceReload" },
                { role: "toggleDevTools" },
            ]
        },
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
});
