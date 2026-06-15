import { create } from "zustand";
import axios from "axios";

// Service...
import { signinUser, signupUser, getToken, checkUsernameAvailability } from "../services/authService";
import { getProfile, updateProfile } from "../services/userService";

const useAuthStore = create((set, get) => ({
    token: null,
    signinData: [],
    signinLoading: false,
    profileData: null,
    profileLoading: false,
    usernameExists: false,

    authToken: async () => {
        const result = await getToken();
        set({ token: result });
    },

    checkUsername: async (username) => {
        try {
            const result = await checkUsernameAvailability(username);
            if (result.status === 409) {
                set({ usernameExists: true });
            } else {
                set({ usernameExists: false });
            }
            return result;
        } catch (error) {
            set({ usernameExists: false });
            throw error;
        }
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