import { create } from "zustand";
import api from "../utils/axiosInterceptor";

const useReportStore = create((set) => ({
    reportData: [],
    reportLoading: false,

    debtorDetails: [],
    debtorDetailsLoading: false,

    dashboardStats: null,
    dashboardStatsLoading: false,

    getDashboardStats: async ({ token }) => {
        try {
            set({ dashboardStatsLoading: true });
            const result = await api({
                method: "get",
                url: "/report/dashboard-stats",
            });
            if (result.data.status === 200) {
                set({ dashboardStats: result.data.body, dashboardStatsLoading: false });
            };
            return result.data;
        } catch (error) {
            set({ dashboardStatsLoading: false });
            throw error;
        };
    },

    getDebtors: async ({
        id = "",
        token = ""
    }) => {
        try {
            set({ reportLoading: true });
            const result = await api({
                method: "get",
                url: `/report/debtors`,
            });
            if (result.data.status === 200) {
                set({ reportData: result.data.body, reportLoading: false });
            };
            return result.data;
        } catch (error) {
            set({ reportLoading: false });
            throw error;
        };
    },

    getDebtorsDetails: async ({
        id = "",
        token = ""
    }) => {
        try {
            set({ debtorDetailsLoading: true });
            const result = await api({
                method: "get",
                url: `/report/customer-ledger?party_id=${id}`,
            });
            if (result.data.status === 200) {
                set({ debtorDetails: result.data.body, debtorDetailsLoading: false });
            };
            return result.data;
        } catch (error) {
            set({ debtorDetailsLoading: false });
            throw error;
        };
    },

    clearReport: () => {
        set({ reportData: [] });
    },
}));

export default useReportStore;