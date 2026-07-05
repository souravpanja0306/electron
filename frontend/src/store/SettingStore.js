import { create } from "zustand";
import api from "../utils/axiosInterceptor";

const useSettingStore = create((set) => ({

    dumpDatabase: async ({ token }) => {
        try {
            const response = await api({
                url: "/admin/dump-db",
                method: 'GET',
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'backup.db');
            document.body.appendChild(link);
            link.click();
            link.remove();
            return { status: 200, message: "Download started" };
        } catch (error) {
            console.error("Failed to dump database", error);
            throw error;
        };
    },

    resetAllTables: async ({
        tableNames = "",
        token = ""
    }) => {
        try {
            const response = await api({
                method: "get",
                url: `/admin/reset-all-table?tableNames=${tableNames}`
            });
            return response.data;
        } catch (error) {
            console.error("Failed to reset tables", error);
            throw error;
        };
    },

    migrateDatabase: async ({
        payload = {},
        token = ""
    }) => {
        try {
            const response = await api({
                method: "post",
                url: `/admin/migrate-table`,
                data: payload,
            });
            return response.data;
        } catch (error) {
            console.error("Failed to migrate database", error);
            throw error;
        };
    },

}));

export default useSettingStore;