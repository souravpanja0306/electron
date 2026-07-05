import { create } from "zustand";
import api from "../utils/axiosInterceptor";

const useMoneyReceiptStore = create((set) => ({
    moneyReceipts: [],
    moneyReceiptNo: "",
    loading: false,
    downloadLoading: false,

    generateMoneyReceiptNo: async (token) => {
        try {
            set({ loading: true });
            const result = await api({
                method: "get",
                url: `/money-receipt/generate-receipt-no?types=moneyreceipt`,
            });
            set({ moneyReceiptNo: result.data.body, loading: false });
            return result.data;
        } catch (error) {
            set({ loading: false });
            throw error;
        };
    },

    getAllMoneyReceipts: async (token, startDate = "", endDate = "", search = "") => {
        try {
            set({ loading: true });
            let queries = [];
            if (startDate) queries.push(`startDate=${startDate}`);
            if (endDate) queries.push(`endDate=${endDate}`);
            if (search) queries.push(`search=${search}`);

            let queryStr = queries.length ? `?${queries.join("&")}` : "";
            const result = await api({
                method: "get",
                url: `/money-receipt/get-money-receipt${queryStr}`,
            });
            set({ moneyReceipts: result.data, loading: false });
            return result.data;
        } catch (error) {
            set({ loading: false });
            throw error;
        };
    },

    downloadMoneyReceipts: async ({
        id = "",
        token = ""
    }) => {
        try {
            set({ downloadLoading: true });
            const result = await api({
                method: "get",
                url: `/money-receipt/generate-money-receipt-pdf/${id}`,
            });
            set({ downloadLoading: false });
            return result.data;
        } catch (error) {
            set({ downloadLoading: false });
            throw error;
        };
    },

    createMoneyReceipts: async ({
        payload = "",
        token = ""
    }) => {
        try {
            set({ loading: true });
            const res = await api({
                method: "post",
                url: `/money-receipt/create-money-receipt`,
                data: payload,
            });
            set((state) => ({ moneyReceipts: [], loading: false, }));
            return res.data;
        } catch (error) {
            set({ loading: false });
            throw error;
        };
    },

    deleteMoneyReceipts: async ({
        id = "",
        token = ""
    }) => {
        try {
            set({ loading: true });
            const result = await api({
                method: "delete",
                url: `/money-receipt/delete-money-receipt/${id}`,
            });
            set({ loading: false });
            return result.data;
        } catch (error) {
            set({ loading: false });
            throw error;
        };
    },

    updateMoneyReceipts: async ({ id, payload, token }) => {
        try {
            set({ loading: true });
            const result = await api({
                method: "put",
                url: `/money-receipt/update-money-receipt`,
                data: { ...payload, id },
            });
            set({ loading: false });
            return result.data;
        } catch (error) {
            set({ loading: false });
            throw error;
        };
    },

    printMoneyReceipt: async ({ id, token }) => {
        try {
            set({ downloadLoading: true });
            const result = await api({
                method: "get",
                url: `/money-receipt/print-money-receipt?id=${id}`,
            });
            set({ downloadLoading: false });
            return result.data;
        } catch (error) {
            set({ downloadLoading: false });
            throw error;
        }
    },
}));


export default useMoneyReceiptStore;
