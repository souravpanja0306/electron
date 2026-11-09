const { app, BrowserWindow, Menu, globalShortcut, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
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
    // Printing: the HTML is loaded into a hidden window, so the printed page is exactly the document
    // (not the app around it). print-html opens the system printer dialog; save-pdf writes a PDF file.
    const withPrintWindow = async (html, job) => {
        if (typeof html !== "string" || !html.trim()) return { ok: false, error: "Nothing to print." };
        const file = path.join(app.getPath("temp"), `myerp-print-${process.pid}-${Date.now()}.html`);
        const printWin = new BrowserWindow({
            show: false,
            parent: win,
            webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false },
        });
        try {
            fs.writeFileSync(file, html, "utf8");
            await printWin.loadFile(file);
            // Wait for web fonts and images (capped, in case the font host is offline).
            await printWin.webContents.executeJavaScript(`Promise.race([
                Promise.all([
                    document.fonts ? document.fonts.ready : null,
                    ...Array.from(document.images).filter(i => !i.complete).map(i => new Promise(r => { i.onload = i.onerror = r; })),
                ]),
                new Promise(r => setTimeout(r, 3000)),
            ]).then(() => true)`);
            return await job(printWin.webContents);
        } catch (error) {
            return { ok: false, error: error.message };
        } finally {
            if (!printWin.isDestroyed()) printWin.destroy();
            fs.unlink(file, () => { });
        }
    };
    ipcMain.handle("print-html", (_, html) => withPrintWindow(html, (contents) => new Promise((resolve) => {
        contents.print({ silent: false, printBackground: true }, (success, failureReason) =>
            resolve({ ok: success, error: success ? "" : String(failureReason || "") }));
    })));
    ipcMain.handle("save-pdf", async (_, html, suggestedName) => {
        const name = String(suggestedName || "document.pdf").replace(/[\\/:*?"<>|]+/g, "_");
        const { canceled, filePath } = await dialog.showSaveDialog(win, {
            title: "Save as PDF",
            defaultPath: path.join(app.getPath("documents"), name.endsWith(".pdf") ? name : `${name}.pdf`),
            filters: [{ name: "PDF", extensions: ["pdf"] }],
        });
        if (canceled || !filePath) return { ok: false, error: "" };
        return withPrintWindow(html, async (contents) => {
            const pdf = await contents.printToPDF({ printBackground: true, pageSize: "A4", margins: { marginType: "default" } });
            fs.writeFileSync(filePath, pdf);
            return { ok: true, filePath };
        });
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
    "note": "note.routes",
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
