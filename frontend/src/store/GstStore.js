import { create } from "zustand";
import api from "../utils/axiosInterceptor";

const useGstStore = create((set) => ({
    gstData: [],
    gstLoading: false,

    getAllGst: async (token) => {
        try {
            set({ gstLoading: true });
            const result = await api({
                method: "get",
                url: "/admin/get-all-gst",
            });
            set({ gstData: result.data.body || [], gstLoading: false });
            return result.data;
        } catch (error) {
            set({ gstLoading: false, gstData: [] });
            return { status: 500, message: "Server Error" };
        };
    },

    createGst: async ({ data, token }) => {
        try {
            set({ gstLoading: true });
            const res = await api({
                method: "post",
                url: "/admin/create-gst",
                data: data,
            });
            set({ gstLoading: false });
            return res.data;
        } catch (error) {
            set({ gstLoading: false });
            return { status: 500, message: "Server Error" };
        };
    },

    updateGst: async ({ data, token }) => {
        try {
            set({ gstLoading: true });
            const res = await api({
                method: "put",
                url: "/admin/update-gst",
                data: data,
            });
            set({ gstLoading: false });
            return res.data;
        } catch (error) {
            set({ gstLoading: false });
            return { status: 500, message: "Server Error" };
        };
    },

    deleteGst: async (id, token) => {
        try {
            set({ gstLoading: true });
            const res = await api({
                method: "delete",
                url: `/admin/delete-gst/${id}`
            });
            set({ gstLoading: false });
            return res.data;
        } catch (error) {
            set({ gstLoading: false });
            return { status: 500, message: "Server Error" };
        };
    },
}));

export default useGstStore;
