import { create } from "zustand";
import axios from "axios";

// Service...
import { signinUser, signupUser, getToken } from "../services/authService";
import { getProfile, updateProfile } from "../services/userService";

const useAuthStore = create((set, get) => ({
    token: null,
    signinData: [],
    signinLoading: false,
    profileData: null,
    profileLoading: false,

    authToken: async () => {
        const result = await getToken();
        set({ token: result });
    },

    getProfileData: async (token) => {
        try {
            set({ profileLoading: true });
            const result = await getProfile(token);
            if (result.status === 200) {
                set({ profileData: result.body, profileLoading: false });
            } else {
                set({ profileLoading: false });
            }
            return result;
        } catch (error) {
            set({ profileLoading: false });
            throw error;
        }
    },

    updateProfileData: async (payload, token) => {
        try {
            set({ profileLoading: true });
            const result = await updateProfile(payload, token);
            if (result.status === 200) {
                await get().getProfileData(token);
            }
            set({ profileLoading: false });
            return result;
        } catch (error) {
            set({ profileLoading: false });
            throw error;
        }
    },

    signin: async (payload) => {
        try {
            set({ signinLoading: true });
            const result = await signinUser(payload);
            console.log("🚀 ~ result:", result)
            set({ signinData: result, signinLoading: false, token: result?.body?.token });
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