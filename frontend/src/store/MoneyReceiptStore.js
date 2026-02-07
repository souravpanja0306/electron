import { create } from "zustand";
import axios from "axios";

const useMoneyReceiptStore = create((set) => ({
    moneyReceipts: [],
    moneyReceiptNo: "",
    loading: false,

    generateMoneyReceiptNo: async (token) => {
        try {
            set({ loading: true });
            const result = await axios({
                method: "get",
                url: "http://localhost:3001/api/v1/money-receipt/generate-receipt-no?types=moneyreceipt",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            set({ moneyReceiptNo: result.data.body, loading: false });
            return result.data;
        } catch (error) {
            set({ loading: false });
            throw error;
        };
    },

    getAllGst: async (token) => {
        try {
            set({ loading: true });
            const result = await axios({
                method: "get",
                url: "http://localhost:3001/api/v1/admin/get-all-gst",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            set({ gstData: result.data, loading: false });
            return result.data;
        } catch (error) {
            set({ loading: false });
            throw error;
        };
    },

    createMoneyReceipts: async (payload, token) => {
        try {
            set({ loading: true });
            const res = await axios({
                method: "post",
                url: "http://localhost:3001/api/v1/money-receipt/create-money-receipt",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                data: payload,
            });
            set((state) => ({ moneyReceipts: [...state.moneyReceipts, res.data], loading: false, }));
            return res.data;
        } catch (error) {
            set({ loading: false });
            throw error;
        };
    },
}));

export default useMoneyReceiptStore;
