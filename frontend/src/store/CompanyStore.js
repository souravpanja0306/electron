import { create } from "zustand";
import axios from "axios";

const useCompanyStore = create((set) => ({
    companyData: [],
    companyLoading: false,

    createCompany: async (payload, token) => {
        try {
            set({ companyLoading: true });
            const result = await axios({
                method: "post",
                url: "http://localhost:3001/api/v1/company/create-company",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                data: payload,
            });
            if (result.data.status === 200) {
                const result = await axios({
                    method: "get",
                    url: "http://localhost:3001/api/v1/company/get-company",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
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
            const result = await axios({
                method: "get",
                url: "http://localhost:3001/api/v1/company/get-company",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
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
            const result = await axios({
                method: "delete",
                url: "http://localhost:3001/api/v1/company/company-delete",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
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
            const result = await axios({
                method: "get",
                url: `http://localhost:3001/api/v1/company/get-company?id=${id}`,
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
            const result = await axios({
                method: "put",
                url: `http://localhost:3001/api/v1/company/update-company/${id}`,
                headers: {
                    "Content-Type": "application/json",
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