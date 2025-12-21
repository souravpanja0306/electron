const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
    getUsers: () => ipcRenderer.invoke("user:list"),
    createUser: (data) => ipcRenderer.invoke("user:create", data),
    deleteUser: (data) => ipcRenderer.invoke("user:delete", data),
});