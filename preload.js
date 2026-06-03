const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
    minimize: () => ipcRenderer.send("minimize"),
    maximize: () => ipcRenderer.send("maximize"),
    close: () => ipcRenderer.send("close"),
    openDevTools: () => ipcRenderer.send("openDevTools"),
    getMachineId: () => ipcRenderer.invoke("get-machine-id"),
    setItem: (key, value) => ipcRenderer.send('store-set', key, value),
    getItem: (key) => ipcRenderer.invoke('store-get', key),
    deleteItem: (key) => ipcRenderer.send('store-delete', key),
    clearAll: () => ipcRenderer.send("store-clear-all"),
});