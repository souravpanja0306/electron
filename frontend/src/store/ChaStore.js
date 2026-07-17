import { create } from "zustand";
import api from "../utils/axiosInterceptor";

const useChaStore = create((set) => ({
    chaData: [],
    loading: false,

    getAllCha: async (token) => {
        try {
            set({ loading: true });
            const result = await api({
                method: "get",
                url: "/admin/get-cha",
            });
            set({ chaData: result.data.body || [], loading: false });
            return result.data;
        } catch (error) {
            set({ loading: false, chaData: [] });
            return { status: 500, message: "Server Error" };
        };
    },

    createCha: async (payload, token) => {
        try {
            set({ loading: true });
            const res = await api({
                method: "post",
                url: "/admin/create-cha",
                data: payload,
            });
            set({ loading: false });
            return res.data;
        } catch (error) {
            set({ loading: false });
            return { status: 500, message: "Server Error" };
        };
    },

    updateCha: async (payload, token) => {
        try {
            set({ loading: true });
            const res = await api({
                method: "put",
                url: "/admin/update-cha",
                data: payload
            });
            set({ loading: false });
            return res.data;
        } catch (error) {
            set({ loading: false });
            return { status: 500, message: "Server Error" };
        };
    },

    deleteCha: async (id, token) => {
        try {
            set({ loading: true });
            const res = await api({
                method: "delete",
                url: `/admin/delete-cha/${id}`
            });
            set({ loading: false });
            return res.data;
        } catch (error) {
            set({ loading: false });
            return { status: 500, message: "Server Error" };
        };
    },
}));

export default useChaStore;
