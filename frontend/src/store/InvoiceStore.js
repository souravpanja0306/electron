import { create } from 'zustand';
import api from "../utils/axiosInterceptor";


const useInvoiceStore = create((set) => ({
    invoiceData: [],
    invoiceLoading: false,
    invoiceNo: "",

    generateInvoiceNo: async ({ token, types }) => {
        try {
            set({ invoiceLoading: true });
            let result = await api({
                method: 'get',
                url: `/invoice/generate-invoice-no?types=${types}`,
            });
            if (result.data.status === 200) {
                set({ invoiceNo: result.data.body });
            };
            set({ invoiceLoading: false });
            return result.data;
        } catch (error) {
            set({ invoiceLoading: false });
            throw error;
        };
    },

    getAllInvoice: async ({
        id = "",
        token = "",
        startDate = "",
        endDate = "",
        search = ""
    }) => {
        try {
            set({ invoiceLoading: true });
            let queries = [];
            if (id) queries.push(`id=${id}`);
            if (startDate) queries.push(`startDate=${startDate}`);
            if (endDate) queries.push(`endDate=${endDate}`);
            if (search) queries.push(`search=${search}`);

            let queryStr = queries.length ? `?${queries.join("&")}` : "";
            let result = await api({
                method: 'get',
                maxBodyLength: Infinity,
                url: `/invoice/invoice-list${queryStr}`,
            });
            set({ invoiceData: result.data, invoiceLoading: false });
            return result.data;
        } catch (error) {
            set({ invoiceLoading: false });
            throw error;
        };
    },

    createInvoice: async (payload, token) => {
        try {
            set({ invoiceLoading: true });
            let result = await api({
                method: 'post',
                url: `/invoice/invoice-create`,
                data: JSON.stringify(payload),
            });
            set((state) => ({ invoiceLoading: false }));
            return result.data;
        } catch (error) {
            set({ invoiceLoading: false });
            throw error;
        };
    },

    deleteInvoice: async ({
        id = "",
        token = ""
    }) => {
        try {
            set({ invoiceLoading: true });
            let result = await api({
                method: 'delete',
                url: `/invoice/invoice-delete/${id}`,
            });
            set((state) => ({ invoiceLoading: false }));
            return result.data;
        } catch (error) {
            set({ invoiceLoading: false });
            throw error;
        };
    },

    updateInvoice: async (id, payload, token) => {
        try {
            set({ invoiceLoading: true });
            let result = await api({
                method: 'put',
                url: `/invoice/invoice-update`,
                data: JSON.stringify({ ...payload, id }),
            });
            set({ invoiceLoading: false });
            return result.data;
        } catch (error) {
            set({ invoiceLoading: false });
            throw error;
        };
    },

    printInvoice: async ({ id = "", token = "" }) => {
        try {
            set({ invoiceLoading: true });
            let result = await api({
                method: 'get',
                url: `/invoice/generate-invoice-pdf?id=${id}`,
            });
            set({ invoiceLoading: false });
            return result.data;
        } catch (error) {
            set({ invoiceLoading: false });
            throw error;
        }
    },
}));

export default useInvoiceStore;
