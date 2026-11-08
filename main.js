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
        width: 1280,
        height: 720,
        minWidth: 1280,
        minHeight: 720,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        },
        icon: iconPath,
        title: "MyERP — Complete Solution",
    });
    if (app.isPackaged) {
        win.loadFile(path.join(__dirname, "frontend/build/index.html"));
    } else {
        win.loadURL("http://localhost:3000/");
        win.webContents.openDevTools();
        globalShortcut.register("Control+Shift+I", () => {
            win.webContents.openDevTools();
        });
    };
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
const multer = require("multer");

// ENV CONFIG (before anything that reads process.env)...
dotenv.config({ path: path.join(__dirname, ".env"), quiet: true });
const PORT = Number(process.env.PORT) || 3001;
const API_VERSION = process.env.VERSION || "v1";

const { connectMongo } = require("./backend/database/connection");
connectMongo();

exp.disable("x-powered-by");

// Only the app itself may call the API: the dev server, or the packaged build (file://).
// Requests without an Origin header (not from a browser page) are allowed.
const ALLOWED_ORIGINS = new Set([
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "file://",
    "null",
]);
exp.use(cors({
    origin: (origin, cb) => cb(null, !origin || ALLOWED_ORIGINS.has(origin)),
    exposedHeaders: ["Content-Disposition"],
}));

exp.use(express.json({ limit: "10mb" }));
exp.use(express.urlencoded({ limit: "10mb", extended: true, parameterLimit: 10000 }));

const ROUTES = {
    "party": "party.routes",
    "company": "company.routes",
    "invoice": "invoice.routes",
    "auth": "auth.routes",
    "user": "user.routes",
    "admin": "admin.routes",
    "report": "report.routes",
    "money-receipt": "moneyReceipts.routes",
    "challan": "challan.routes",
    "setting": "setting.routes",
};
for (const [base, file] of Object.entries(ROUTES)) {
    exp.use(`/api/${API_VERSION}/${base}/`, require(`./backend/router/${file}`));
};

exp.get("/", (req, res) => res.status(200).json({ status: 200, body: [], message: "Server is Ready To Go..." }));

const uploadPath = app.isPackaged
    ? path.join(app.getPath("userData"), "uploads")
    : path.join(__dirname, "uploads");
// Logos only; the temp upload folder is never served.
exp.use("/uploads/main", (req, res) => res.status(404).end());
exp.use("/uploads", express.static(uploadPath, { dotfiles: "deny", index: false }));

exp.use((req, res) => res.status(404).json({ status: 404, message: "Not found.", body: [] }));

// Errors thrown by routes, body parsing or uploads.
exp.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        const message = err.code === "LIMIT_FILE_SIZE" ? "The file is too large." : "The upload could not be processed.";
        return res.status(400).json({ status: 400, message, body: [] });
    };
    const status = err.status || err.statusCode || 500;
    if (status >= 500) console.error(err.stack || err);
    const message = status >= 500 ? "Something went wrong. Please try again." : (err.expose === false ? "Bad request." : err.message);
    return res.status(status).json({ status, message, body: [] });
});

// Loopback only: the API is never reachable from other machines on the network.
exp.listen(PORT, "127.0.0.1", () => {
    console.log(`Server started at http://localhost:${PORT}/`);
});
