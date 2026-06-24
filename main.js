const { app, BrowserWindow, Menu, globalShortcut, ipcMain } = require("electron");
const path = require("path");
const { machineIdSync } = require('node-machine-id');
const Store = require('electron-store').default;
const { Notification } = require("electron");

// Initialize the store
const store = new Store();

app.whenReady().then(() => {
    const iconPath = path.join(__dirname, "./public/icon/zero.png");
    const win = new BrowserWindow({
        frame: false,
        titleBarStyle: "hidden",
        width: 1400,
        height: 1400,
        minWidth: 1400,
        minHeight: 1400,
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
    ipcMain.on("store-set", (event, key, value) => {
        store.set(key, value);
    });
    ipcMain.handle("store-get", (event, key) => {
        return store.get(key);
    });
    ipcMain.on("store-delete", (event, key) => {
        store.delete(key);
    });
    ipcMain.on("store-clear-all", (event, key) => {
        store.clear();
    });
    ipcMain.on("show-notification", (_, data) => {
        new Notification({
            title: data.title,
            body: data.body,
        }).show();
    });
});

// Express Setup.................................
const dotenv = require("dotenv");
const express = require("express");
const exp = express();
const cors = require("cors");
const bodyParser = require('body-parser');
const { connectMongo } = require("./backend/database/connection");

// ENV CONFIG...
dotenv.config({
    path: path.join(__dirname, ".env"),
    quiet: true
});

connectMongo();

exp.use(cors());
exp.use(express.json({ limit: "50mb" }));
exp.use(express.urlencoded({ limit: "50mb", extended: true }));
exp.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
exp.use(bodyParser.json({ limit: "50mb" }));

exp.use(`/api/${process.env.VERSION}/party/`, require("./backend/router/party.routes"));
exp.use(`/api/${process.env.VERSION}/company/`, require("./backend/router/company.routes"));
exp.use(`/api/${process.env.VERSION}/invoice/`, require("./backend/router/invoice.routes"));
exp.use(`/api/${process.env.VERSION}/auth/`, require("./backend/router/auth.routes"));
exp.use(`/api/${process.env.VERSION}/user/`, require("./backend/router/user.routes"));
exp.use(`/api/${process.env.VERSION}/admin/`, require("./backend/router/admin.routes"));
exp.use(`/api/${process.env.VERSION}/report/`, require("./backend/router/report.routes"));
exp.use(`/api/${process.env.VERSION}/money-receipt/`, require("./backend/router/moneyReceipts.routes"));
exp.use(`/api/${process.env.VERSION}/challan/`, require("./backend/router/challan.routes"));

exp.get("/", (req, res) => {
    return res.json({
        status: "200",
        body: [],
        message: "Server is Ready To Go..."
    }).status(200);
});

exp.listen(process.env.PORT, () => {
    console.log(`Server started at http://localhost:${process.env.PORT}/`);
});

exp.use("/uploads", express.static(__dirname + "/uploads"));

// error handler middleware
exp.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send({
        status: 500,
        message: err.message,
        body: {},
    });
});
