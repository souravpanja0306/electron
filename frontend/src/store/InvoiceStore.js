import { create } from 'zustand';
import { baseURL } from "../utils/baseUrl";
import axios from "axios";


const useInvoiceStore = create((set) => ({
    invoiceData: [],
    invoiceLoading: false,
    invoiceNo: "",

    generateInvoiceNo: async (token) => {
        try {
            set({ invoiceLoading: true });
            let result = await axios.request({
                method: 'get',
                url: `${baseURL.invoice}generate-invoice-no?types=invoice`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                validateStatus: (status) => status < 500,
            });
            if (result.data.status === 200) {
                set({ invoiceNo: result.data.body, invoiceLoading: false });
                return result.data;
            };
        } catch (error) {
            set({ invoiceLoading: false });
            throw error;
        };
    },

    getAllInvoice: async ({
        id = "",
        token = "",
    }) => {
        try {
            set({ invoiceLoading: true });
            let queries = `?`;
            if (id) queries += `id=${id}`;

            let result = await axios({
                method: 'get',
                maxBodyLength: Infinity,
                url: `${baseURL.invoice}invoice-list${queries}`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                validateStatus: (status) => status < 500,
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
            let result = await axios.request({
                method: 'post',
                url: `${baseURL.invoice}invoice-create`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                data: JSON.stringify(payload),
                validateStatus: (status) => status < 500,
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
            let result = await axios.request({
                method: 'delete',
                url: `${baseURL.invoice}invoice-delete/${id}`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                validateStatus: (status) => status < 500,
            });
            set((state) => ({ invoiceLoading: false }));
            return result.data;
        } catch (error) {
            set({ invoiceLoading: false });
            throw error;
        };
    },
}));

export default useInvoiceStore;
