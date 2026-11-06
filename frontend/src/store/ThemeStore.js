import { create } from "zustand";
import api from "../utils/axiosInterceptor";

const applyTheme = (theme) => {
    document.documentElement.classList.toggle("dark", theme === "dark");
};

// The database is the source of truth. The local copy only avoids a flash of the
// wrong theme while the request is in flight (and on the sign-in page).
const useThemeStore = create((set, get) => ({
    theme: "light",

    // Apply the locally cached theme immediately.
    loadCachedTheme: async () => {
        const cached = await window.api?.getItem("theme");
        if (cached === "dark" || cached === "light") {
            applyTheme(cached);
            set({ theme: cached });
        };
    },

    // Fetch the signed-in user's theme from the database and apply it.
    loadTheme: async () => {
        try {
            const result = await api({ method: "get", url: "/setting/theme" });
            const theme = result.data?.body?.theme === "dark" ? "dark" : "light";
            applyTheme(theme);
            set({ theme });
            window.api?.setItem("theme", theme);
            return theme;
        } catch (error) {
            console.error("Failed to load theme", error);
            return get().theme;
        };
    },

    // Apply instantly, save to the database, and roll back if saving fails.
    saveTheme: async (theme) => {
        const previous = get().theme;
        applyTheme(theme);
        set({ theme });
        try {
            const result = await api({ method: "put", url: "/setting/theme", data: { theme } });
            if (result.data?.status !== 200) throw new Error(result.data?.message || "Failed to save theme.");
            window.api?.setItem("theme", theme);
            return result.data;
        } catch (error) {
            applyTheme(previous);
            set({ theme: previous });
            throw error;
        };
    },
}));

export default useThemeStore;
