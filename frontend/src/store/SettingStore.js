import { create } from "zustand";
import api from "../utils/axiosInterceptor";

const LAST_BACKUP_KEY = "lastBackupAt";

// "attachment; filename=\"myerp-backup-2026-11-08_1030.db\"" -> "myerp-backup-2026-11-08_1030.db"
const fileNameFrom = (disposition) => {
    const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition || "");
    return match ? decodeURIComponent(match[1]) : `myerp-backup-${new Date().toISOString().slice(0, 10)}.db`;
};

// Error responses for blob requests arrive as a Blob; read the JSON message out of it.
const blobErrorMessage = async (error, fallback) => {
    try {
        const text = await error?.response?.data?.text?.();
        return JSON.parse(text).message || fallback;
    } catch {
        return error?.response?.data?.message || fallback;
    }
};

const useSettingStore = create((set) => ({
    lastBackupAt: null,

    loadLastBackup: async () => {
        const value = await window.api?.getItem(LAST_BACKUP_KEY);
        set({ lastBackupAt: value || null });
    },

    /** Downloads a consistent snapshot of the database. */
    dumpDatabase: async () => {
        try {
            const response = await api({ url: "/admin/dump-db", method: "GET", responseType: "blob" });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/x-sqlite3" }));
            const link = document.createElement("a");
            link.href = url;
            link.download = fileNameFrom(response.headers?.["content-disposition"]);
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 10000);

            const now = new Date().toISOString();
            window.api?.setItem(LAST_BACKUP_KEY, now);
            set({ lastBackupAt: now });
            return { status: 200, message: "Backup downloaded.", fileName: link.download };
        } catch (error) {
            return { status: error?.response?.status || 500, message: await blobErrorMessage(error, "Could not create the backup.") };
        }
    },

    /** Uploads a backup file; on success the app restarts to swap it in. */
    restoreDatabase: async (file) => {
        try {
            const body = new FormData();
            body.append("backup", file);
            // The shared client defaults to JSON, which would serialise the FormData; say multipart.
            const response = await api({
                url: "/admin/restore-db",
                method: "POST",
                data: body,
                headers: { "Content-Type": "multipart/form-data" },
                timeout: 5 * 60 * 1000,
            });
            return response.data;
        } catch (error) {
            return { status: error?.response?.status || 500, message: error?.response?.data?.message || "Could not restore the backup." };
        }
    },

    /** scope: "transactions" | "all". `confirm` must be the word DELETE. */
    resetData: async ({ scope, confirm }) => {
        try {
            const response = await api({ url: "/admin/reset-data", method: "POST", data: { scope, confirm } });
            return response.data;
        } catch (error) {
            return { status: error?.response?.status || 500, message: error?.response?.data?.message || "Could not reset the data." };
        }
    },

    /** { invoice: 12, party: 30, ... } */
    getDataSummary: async () => {
        try {
            const response = await api({ url: "/admin/data-summary", method: "GET" });
            return response.data?.body || {};
        } catch {
            return null;
        }
    },
}));

export default useSettingStore;
