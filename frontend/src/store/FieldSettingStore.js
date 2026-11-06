import { create } from "zustand";
import api from "../utils/axiosInterceptor";

/**
 * App-wide field visibility, stored in the database (user_setting table).
 * One value drives the CHA toggle on BOTH settings pages and the CHA field on
 * BOTH Create Invoice and Create Challan, so flipping it anywhere applies everywhere.
 */
const useFieldSettingStore = create((set, get) => ({
    showCha: true,
    loaded: false,

    fetchFieldSettings: async () => {
        try {
            const response = await api.get("/setting/field-settings");
            set({ showCha: response.data?.body?.show_cha !== 0, loaded: true });
        } catch (error) {
            console.log("Could not load field settings:", error.message || error);
            set({ loaded: true });
        };
    },

    // Updates the screen immediately, then saves; rolls back if the save fails.
    saveShowCha: async (on) => {
        const previous = get().showCha;
        set({ showCha: on });
        try {
            const response = await api.put("/setting/field-settings", { show_cha: on });
            if (response.data?.status !== 200) throw new Error(response.data?.message || "Save failed");
        } catch (error) {
            set({ showCha: previous });
            throw error;
        };
    },
}));

export default useFieldSettingStore;
