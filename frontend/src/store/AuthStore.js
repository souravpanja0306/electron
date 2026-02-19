import { create } from "zustand";
import axios from "axios";

const useAuthStore = create((set) => ({
    signinData: [],
    signinLoading: false,

    signin: async (payload) => {
        try {
            set({ companyLoading: true });
            const result = await axios({
                method: "post",
                url: "http://localhost:3001/api/v1/auth/signin",
                headers: {
                    "Content-Type": "application/json",
                },
                data: payload,
                validateStatus: (status) => status < 500,
            });
            set({ companyData: result.data, companyLoading: false });
            return result.data;
        } catch (error) {
            set({ companyLoading: false });
            throw error;
        };
    },

    signup: async (payload) => {
        try {
            set({ companyLoading: true });
            const result = await axios({
                method: "post",
                url: "http://localhost:3001/api/v1/auth/signup",
                headers: {
                    "Content-Type": "application/json",
                },
                data: payload,
                validateStatus: (status) => status < 500,
            });
            set({ companyData: result.data, companyLoading: false });
            return result.data;
        } catch (error) {
            set({ companyLoading: false });
            throw error;
        };
    },
}));

export default useAuthStore;