import { create } from "zustand";
import api from "../utils/axiosInterceptor";

const useAuthStore = create((set, get) => ({
    token: null,
    signinData: [],
    signinLoading: false,
    profileData: null,
    profileLoading: false,
    usernameExists: false,

    authToken: async () => {
        const result = await window.api?.getItem("token");
        set({ token: result });
    },

    checkUsername: async (username) => {
        try {
            const result = await api({
                method: "get",
                url: `/auth/check-username/${username}`,
            });
            if (result.data.status === 409) {
                set({ usernameExists: true });
            } else {
                set({ usernameExists: false });
            };
            return result.data;
        } catch (error) {
            set({ usernameExists: false });
            throw error;
        };
    },

    getProfileData: async (token) => {
        try {
            set({ profileLoading: true });
            const result = await api({
                method: "get",
                url: `/user/get-profile`,
            });
            if (result.data.status === 200) {
                set({ profileData: result.data.body, profileLoading: false });
            } else {
                set({ profileLoading: false });
            };
            return result.data;
        } catch (error) {
            set({ profileLoading: false });
            throw error;
        };
    },

    updateProfileData: async (payload, token) => {
        try {
            set({ profileLoading: true });
            const result = await api({
                method: "put",
                url: `/user/update-profile`,
                data: payload,
            });
            if (result.data.status === 200) {
                await get().getProfileData(token);
            };
            set({ profileLoading: false });
            return result.data;
        } catch (error) {
            set({ profileLoading: false });
            throw error;
        };
    },

    signin: async (payload) => {
        try {
            set({ signinLoading: true });
            const result = await api({
                method: "post",
                url: "/auth/signin",
                data: payload,
            });
            set({ signinData: result.data, signinLoading: false, token: result.data?.body?.token });
            return result.data;
        } catch (error) {
            set({ signinLoading: false });
            throw error;
        };
    },

    signup: async (payload) => {
        try {
            set({ signinLoading: true });
            const result = await api({
                method: "post",
                url: "/auth/signup",
                data: payload,
            });
            set({ signinData: result.data, signinLoading: false });
            return result.data;
        } catch (error) {
            set({ signinLoading: false });
            throw error;
        };
    },
}));

export default useAuthStore;