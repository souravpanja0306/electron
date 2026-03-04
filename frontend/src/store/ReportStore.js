import { create } from "zustand";
import axios from "axios";

const useReportStore = create((set) => ({
    reportData: [],
    reportLoading: false,

    debtorDetails: [],
    debtorDetailsLoading: false,

    getDebtors: async ({
        id = "",
        token = ""
    }) => {
        try {
            set({ reportLoading: true });
            const result = await axios({
                method: "get",
                url: `http://localhost:3001/api/v1/report/debtors`,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
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
            const result = await axios({
                method: "get",
                url: `http://localhost:3001/api/v1/report/customer-ledger?party_id=${id}`,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
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