import { create } from "zustand";
import axios from "axios";

const usePartyStore = create((set) => ({
    parties: [],
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

    getAllParty: async (token) => {
        try {
            set({ loading: true });
            const result = await axios({
                method: "get",
                url: "http://localhost:3001/api/v1/party/party-list",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            set({ parties: result.data, loading: false });
            return result.data;
        } catch (error) {
            set({ loading: false });
            throw error;
        };
    },

    createGst: async (payload, token) => {
        try {
            set({ loading: true });
            const res = await axios({
                method: "post",
                url: "http://localhost:3001/api/v1/admin/create-gst",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                data: payload,
            });
            set((state) => ({
                gstData: [...state.gstData, res.data],
                loading: false,
            }));
            return res.data;
        } catch (error) {
            set({ loading: false });
            throw error;
        };
    },
}));

export default usePartyStore;