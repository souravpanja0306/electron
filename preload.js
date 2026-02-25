const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
    minimize: () => ipcRenderer.send("minimize"),
    maximize: () => ipcRenderer.send("maximize"),
    close: () => ipcRenderer.send("close"),
    openDevTools: () => ipcRenderer.send("openDevTools"),
    getMachineId: () => ipcRenderer.invoke("get-machine-id")
});