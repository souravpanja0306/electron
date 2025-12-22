const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
    getUsers: () => ipcRenderer.invoke("user:list"),
    createUser: (data) => ipcRenderer.invoke("user:create", data),
    deleteUser: (data) => ipcRenderer.invoke("user:delete", data),

    getParty: () => ipcRenderer.invoke("party:list"),
    createParty: (data) => ipcRenderer.invoke("party:create", data),
    deleteParty: (data) => ipcRenderer.invoke("party:delete", data),
    updateParty: (data) => ipcRenderer.invoke("party:update", data),
});