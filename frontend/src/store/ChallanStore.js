import { create } from 'zustand';
import api from "../utils/axiosInterceptor";

const useChallanStore = create((set) => ({
    challanData: { body: [] },
    challanLoading: false,
    challanNo: "",

    getAllChallan: async ({ id = "", token = "", startDate = "", endDate = "", search = "" }) => {
        try {
            set({ challanLoading: true });
            let queries = [];
            if (id) queries.push(`id=${id}`);
            if (startDate) queries.push(`startDate=${startDate}`);
            if (endDate) queries.push(`endDate=${endDate}`);
            if (search) queries.push(`search=${search}`);

            let queryStr = queries.length ? `?${queries.join("&")}` : "";
            let result = await api({
                method: 'get',
                url: `/challan/list${queryStr}`,
            });
            set({ challanData: result.data, challanLoading: false });
            return result.data;
        } catch (error) {
            set({ challanLoading: false });
            throw error;
        }
    },

    generateChallanNo: async (token, company_id) => {
        try {
            set({ challanLoading: true });
            let result = await api({
                method: 'get',
                url: `/challan/generate-challan-no?types=challan&company_id=${company_id}`,
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
            let result = await api({
                method: 'post',
                url: `/challan/create`,
                data: JSON.stringify(payload),
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
            let result = await api({
                method: 'delete',
                url: `/challan/delete/${id}`,
            });
            set({ challanLoading: false });
            return result.data;
        } catch (error) {
            set({ challanLoading: false });
            throw error;
        }
    },

    updateChallan: async (id, payload, token) => {
        try {
            set({ challanLoading: true });
            let result = await api({
                method: 'put',
                url: `/challan/update/${id}`,
                data: JSON.stringify(payload),
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
            let result = await api({
                method: 'get',
                url: `/challan/generate-pdf?id=${id}`,
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