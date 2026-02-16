import { create } from "zustand";
import axios from "axios";
let token = localStorage.getItem("token");

const useMoneyReceiptStore = create((set) => ({
    moneyReceipts: [],
    moneyReceiptNo: "",
    loading: false,
    downloadLoading: false,

    generateMoneyReceiptNo: async () => {
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

    getAllMoneyReceipts: async () => {
        try {
            set({ loading: true });
            const result = await axios({
                method: "get",
                url: `http://localhost:3001/api/v1/money-receipt/get-money-receipt`,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            set({ moneyReceipts: result.data, loading: false });
            return result.data;
        } catch (error) {
            set({ loading: false });
            throw error;
        };
    },

    downloadMoneyReceipts: async (id) => {
        try {
            set({ downloadLoading: true });
            const result = await axios({
                method: "get",
                url: `http://localhost:3001/api/v1/money-receipt/generate-money-receipt-pdf/${id}`,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            set({ downloadLoading: false });
            return result.data;
        } catch (error) {
            set({ downloadLoading: false });
            throw error;
        };
    },

    createMoneyReceipts: async (payload) => {
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
            set((state) => ({ moneyReceipts: [], loading: false, }));
            return res.data;
        } catch (error) {
            set({ loading: false });
            throw error;
        };
    },

    deleteMoneyReceipts: async (id) => {
        try {
            set({ downloadLoading: true });
            const result = await axios({
                method: "get",
                url: `http://localhost:3001/api/v1/money-receipt/delete-money-receipt/${id}`,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            set({ downloadLoading: false });
            return result.data;
        } catch (error) {
            set({ downloadLoading: false });
            throw error;
        };
    },
}));

export default useMoneyReceiptStore;
