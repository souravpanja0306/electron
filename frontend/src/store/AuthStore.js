import { create } from "zustand";
import axios from "axios";

// Service...
import { signinUser, signupUser, getToken } from "../services/authService";

const useAuthStore = create((set) => ({
    token: null,
    signinData: [],
    signinLoading: false,

    authToken: async () => {
        const result = await getToken();
        set({ token: result });
    },

    signin: async (payload) => {
        try {
            set({ signinLoading: true });
            const result = await signinUser(payload);
            set({ signinData: result, signinLoading: false });
            return result;
        } catch (error) {
            set({ signinLoading: false });
            throw error;
        };
    },

    signup: async (payload) => {
        try {
            set({ signinLoading: true });
            const result = await signupUser(payload);
            set({ signinData: result, signinLoading: false });
            return result;
        } catch (error) {
            set({ signinLoading: false });
            throw error;
        };
    },
}));

export default useAuthStore;