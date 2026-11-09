import { create } from "zustand";
import api from "../utils/axiosInterceptor";

/**
 * Subscription / account-lock status from the backend (see backend/service/access.service.js):
 * { locked, state: "active" | "expiring" | "grace" | "locked", code, title, message, reason,
 *   plan, expiry_date, days_left, lock_date, checked_at, offline, offline_days_left }
 */
const useAccessStore = create((set) => ({
    access: null,
    checking: false,

    setAccess: (access) => set({ access: access || null }),

    /** `refresh` asks the licence server now instead of using the cached answer. */
    fetchAccess: async ({ refresh = false } = {}) => {
        set({ checking: true });
        try {
            const result = await api.get("/auth/access-status", { params: refresh ? { refresh: 1 } : {} });
            const access = result.data?.body?.access || null;
            set({ access });
            return access;
        } catch (error) {
            const access = error?.response?.data?.body?.access;
            if (access) set({ access });
            return access || null;
        } finally {
            set({ checking: false });
        }
    },
}));

// Any API call refused with 403 + access (see utils/axiosInterceptor.js) shows the lock screen at once.
if (typeof window !== "undefined") {
    window.addEventListener("myerp:access", (e) => useAccessStore.getState().setAccess(e.detail));
}

export default useAccessStore;
