import { create } from "zustand";
import axios from "axios";

const useReportStore = create((set) => ({
    reportData: [],
    reportLoading: false,

    getDebtors: async ({
        id = "",
        token = ""
    }) => {
        try {
            set({ reportLoading: true });
            const result = await axios({
                method: "get",
                url: `http://localhost:3001/api/v1/report/debtors?party_id=${id}`,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            set({ reportData: result.data, reportLoading: false });
            return result.data;
        } catch (error) {
            set({ reportLoading: false });
            throw error;
        };
    },
    clearReport: () => {
        set({ reportData: [] });
    },
}));

export default useReportStore;