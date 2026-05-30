import { create } from 'zustand';
import { baseURL } from "../utils/baseUrl";
import axios from "axios";

const useChallanStore = create((set) => ({
    challanData: { body: [] },
    challanLoading: false,
    challanNo: "",

    getAllChallan: async ({ id = "", token = "" }) => {
        try {
            set({ challanLoading: true });
            let queries = id ? `?id=${id}` : "";
            let result = await axios({
                method: 'get',
                url: `${baseURL.challan}list${queries}`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                validateStatus: (status) => status < 500,
            });
            set({ challanData: result.data, challanLoading: false });
            return result.data;
        } catch (error) {
            set({ challanLoading: false });
            throw error;
        }
    },

    generateChallanNo: async (token) => {
        try {
            set({ challanLoading: true });
            let result = await axios({
                method: 'get',
                url: `${baseURL.challan}generate-challan-no?types=challan`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                validateStatus: (status) => status < 500,
            });
            if (result.data.status === 200) {
                set({ challanNo: result.data.body, challanLoading: false });
            } else {
                set({ challanLoading: false });
            }
            return result.data;
        } catch (error) {
            set({ challanLoading: false });
            throw error;
        }
    },

    createChallan: async (payload, token) => {
        try {
            set({ challanLoading: true });
            let result = await axios.request({
                method: 'post',
                url: `${baseURL.challan}create`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                data: JSON.stringify(payload),
                validateStatus: (status) => status < 500,
            });
            set({ challanLoading: false });
            return result.data;
        } catch (error) {
            set({ challanLoading: false });
            throw error;
        }
    },

    deleteChallan: async ({ id = "", token = "" }) => {
        try {
            set({ challanLoading: true });
            let result = await axios.request({
                method: 'delete',
                url: `${baseURL.challan}delete/${id}`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                validateStatus: (status) => status < 500,
            });
            set({ challanLoading: false });
            return result.data;
        } catch (error) {
            set({ challanLoading: false });
            throw error;
        }
    },

    printChallan: async ({ id = "", token = "" }) => {
        try {
            set({ challanLoading: true });
            let result = await axios({
                method: 'get',
                url: `${baseURL.challan}generate-pdf?id=${id}`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                validateStatus: (status) => status < 500,
            });
            set({ challanLoading: false });
            return result.data;
        } catch (error) {
            set({ challanLoading: false });
            throw error;
        }
    },
}));

export default useChallanStore;