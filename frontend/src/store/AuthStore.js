import { create } from "zustand";
import api from "../utils/axiosInterceptor";

// Keep the title bar's cached user (set at sign-in) in step with the profile's name/email.
const syncCachedUser = async (profile) => {
    try {
        const cached = JSON.parse((await window.api?.getItem("user")) || "{}");
        const next = { ...cached, name: profile.name, email: profile.email, username: profile.username };
        window.api?.setItem("user", JSON.stringify(next));
        window.dispatchEvent(new CustomEvent("myerp:user-updated", { detail: next }));
    } catch { /* best-effort */ }
};

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

    getProfileData: async () => {
        try {
            set({ profileLoading: true });
            const result = await api({
                method: "get",
                url: `/user/get-profile`,
            });
            if (result.data.status === 200) {
                set({ profileData: result.data.body, profileLoading: false });
                syncCachedUser(result.data.body);
            } else {
                set({ profileLoading: false });
            };
            return result.data;
        } catch (error) {
            set({ profileLoading: false });
            return error?.response?.data || { status: 500, message: "Could not load the profile." };
        };
    },

    updateProfileData: async (payload) => {
        try {
            const result = await api({
                method: "put",
                url: `/user/update-profile`,
                data: payload,
            });
            if (result.data.status === 200 && result.data.body) {
                set({ profileData: result.data.body });
                syncCachedUser(result.data.body);
            };
            return result.data;
        } catch (error) {
            return error?.response?.data || { status: 500, message: "Could not update the profile." };
        };
    },

    changePassword: async ({ current_password, new_password }) => {
        try {
            const result = await api({ method: "post", url: "/user/change-password", data: { current_password, new_password } });
            return result.data;
        } catch (error) {
            return error?.response?.data || { status: 500, message: "Could not change the password." };
        };
    },

    /** { plan, is_active, start_date, expiry_date, days_left, max_devices, license_key } or an error result. */
    getLicense: async () => {
        try {
            const result = await api({ method: "get", url: "/user/license" });
            return result.data;
        } catch (error) {
            return error?.response?.data || { status: 500, message: "Could not load licence details." };
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