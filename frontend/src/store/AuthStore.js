import { create } from "zustand";
import axios from "axios";

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
            const result = await axios({
                method: "get",
                url: `http://localhost:3001/api/v1/auth/check-username/${username}`,
                validateStatus: (status) => status < 500,
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
            const result = await axios({
                method: "get",
                url: `http://localhost:3001/api/v1/user/get-profile`,
                headers: {
                    Authorization: `Bearer ${token}`
                }
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
            const result = await axios({
                method: "put",
                url: `http://localhost:3001/api/v1/user/update-profile`,
                data: payload,
                headers: {
                    Authorization: `Bearer ${token}`
                }
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
            const result = await await axios({
                method: "post",
                url: "http://localhost:3001/api/v1/auth/signin",
                headers: {
                    "Content-Type": "application/json",
                },
                data: payload,
                validateStatus: (status) => status < 500,
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
            const result = await axios({
                method: "post",
                url: "http://localhost:3001/api/v1/auth/signup",
                headers: {
                    "Content-Type": "application/json",
                },
                data: payload,
                validateStatus: (status) => status < 500,
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