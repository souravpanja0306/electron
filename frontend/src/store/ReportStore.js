import { create } from "zustand";
import api from "../utils/axiosInterceptor";

const useReportStore = create((set) => ({
    reportData: [],
    reportLoading: false,

    debtorDetails: [],
    debtorDetailsLoading: false,

    dashboardStats: null,
    dashboardStatsLoading: false,

    /** { company_id, from, to } — all optional; the server defaults to this financial year. */
    getDashboardStats: async ({ company_id = "", from = "", to = "" } = {}) => {
        try {
            set({ dashboardStatsLoading: true });
            const result = await api({
                method: "get",
                url: "/report/dashboard-stats",
                params: { company_id: company_id || undefined, from: from || undefined, to: to || undefined },
            });
            if (result.data.status === 200) set({ dashboardStats: result.data.body });
            set({ dashboardStatsLoading: false });
            return result.data;
        } catch (error) {
            set({ dashboardStatsLoading: false });
            return error?.response?.data || { status: 500, message: "Could not load the dashboard." };
        };
    },

    /** Invoice-level sales register for a period: { period, rows }. */
    getSalesRegister: async ({ company_id = "", party_id = "", from = "", to = "" } = {}) => {
        try {
            const result = await api({
                method: "get",
                url: "/report/sales-report",
                params: { company_id: company_id || undefined, party_id: party_id || undefined, from: from || undefined, to: to || undefined },
            });
            return result.data;
        } catch (error) {
            return error?.response?.data || { status: 500, message: "Could not load the sales register." };
        };
    },

    getDebtors: async ({
        id = "",
        token = "",
        company_id = ""
    }) => {
        try {
            set({ reportLoading: true });
            const result = await api({
                method: "get",
                url: `/report/debtors${company_id ? `?company_id=${company_id}` : ""}`,
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

    getCreditors: async ({ token = "", company_id = "" }) => {
        try {
            set({ reportLoading: true });
            const result = await api({
                method: "get",
                url: `/report/creditors${company_id ? `?company_id=${company_id}` : ""}`,
            });
            if (result.data.status === 200) {
                set({ reportData: result.data.body, reportLoading: false });
            }
            return result.data;
        } catch (error) {
            set({ reportLoading: false });
            throw error;
        }
    },

    getDebtorsDetails: async ({
        id = "",
        token = "",
        company_id = ""
    }) => {
        try {
            set({ debtorDetailsLoading: true });
            const result = await api({
                method: "get",
                url: `/report/customer-ledger?party_id=${id}${company_id ? `&company_id=${company_id}` : ""}`,
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
