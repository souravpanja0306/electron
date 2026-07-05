import { create } from "zustand";
import api from "../utils/axiosInterceptor";


const useCompanyStore = create((set) => ({
    companyData: [],
    companyLoading: false,

    createCompany: async (payload, token) => {
        try {
            set({ companyLoading: true });
            const result = await api({
                method: "post",
                url: "/company/create-company",
               
                data: payload,
            });
            if (result.data.status === 200) {
                const result = await api({
                    method: "get",
                    url: "/company/get-company",
                });
                if (result.data.status === 200) {
                    set({ companyData: result.data.body, companyLoading: false });
                };
            };
            return result.data;
        } catch (error) {
            set({ companyLoading: false });
            throw error;
        };
    },

    getAllCompany: async (token) => {
        try {
            set({ companyLoading: true });
            const result = await api({
                method: "get",
                url: "/company/get-company",
            });
            if (result.data.status === 200) {
                set({ companyData: result.data.body, companyLoading: false });
            } else {
                set({ companyData: [], companyLoading: false });
            };
            return result.data;
        } catch (error) {
            set({ companyLoading: false });
            throw error;
        };
    },

    deleteCompany: async ({ ids, token }) => {
        try {
            set({ companyLoading: true });
            const result = await api({
                method: "delete",
                url: "/company/company-delete",
                data: { ids: ids },
            });
            set({ companyLoading: false });
            return result.data;
        } catch (error) {
            set({ companyLoading: false });
            throw error;
        }
    },

    getCompanyById: async (id, token) => {
        try {
            set({ companyLoading: true });
            const result = await api({
                method: "get",
                url: `/company/get-company?id=${id}`,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            set({ companyData: result.data.body, companyLoading: false });
            return result.data;
        } catch (error) {
            set({ companyLoading: false });
            throw error;
        }
    },

    updateCompany: async (id, payload, token) => {
        try {
            set({ companyLoading: true });
            const result = await api({
                method: "put",
                url: `/company/update-company/${id}`,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                data: payload,
            });
            set({ companyLoading: false });
            return result.data;
        } catch (error) {
            set({ companyLoading: false });
            throw error;
        }
    },
}));

export default useCompanyStore;