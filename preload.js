const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
    // USER
    getUsers: (data) => ipcRenderer.invoke("user:list", data),
    createUser: (data) => ipcRenderer.invoke("user:create", data),
    updateUser: (data) => ipcRenderer.invoke("user:update", data),
    deleteUser: (data) => ipcRenderer.invoke("user:delete", data),

    // PARTY
    getParty: (data) => ipcRenderer.invoke("party:list", data),
    createParty: (data) => ipcRenderer.invoke("party:create", data),
    updateParty: (data) => ipcRenderer.invoke("party:update", data),
    deleteParty: (data) => ipcRenderer.invoke("party:delete", data),

    // INVOICE
    getInvoices: () => ipcRenderer.invoke("invoice:list"),
    getInvoiceById: (id) => ipcRenderer.invoke("invoice:get", id),
    createInvoice: (data) => ipcRenderer.invoke("invoice:create", data),
    updateInvoice: (data) => ipcRenderer.invoke("invoice:update", data),
    deleteInvoice: (id) => ipcRenderer.invoke("invoice:delete", id),

    // SIGNIN
    signin: () => ipcRenderer.invoke("auth:signin"),
    forgotPassword: (id) => ipcRenderer.invoke("auth:forgot", id),
    resetPassword: (data) => ipcRenderer.invoke("auth:reset", data),
});