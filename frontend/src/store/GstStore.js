import { create } from "zustand";
import axios from "axios";

const useGstStore = create((set) => ({
    gstData: [],
    gstLoading: false,

    getAllGst: async (token) => {
        try {
            set({ gstLoading: true });
            const result = await axios.get("http://localhost:3001/api/v1/admin/get-all-gst", {
                headers: { Authorization: `Bearer ${token}` }
            });
            set({ gstData: result.data.body || [], gstLoading: false });
            return result.data;
        } catch (error) {
            set({ gstLoading: false, gstData: [] });
            return { status: 500, message: "Server Error" };
        }
    },

    createGst: async ({ data, token }) => {
        try {
            set({ gstLoading: true });
            const res = await axios.post("http://localhost:3001/api/v1/admin/create-gst", data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            set({ gstLoading: false });
            return res.data;
        } catch (error) {
            set({ gstLoading: false });
            return { status: 500, message: "Server Error" };
        }
    },

    updateGst: async ({ data, token }) => {
        try {
            set({ gstLoading: true });
            const res = await axios.put("http://localhost:3001/api/v1/admin/update-gst", data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            set({ gstLoading: false });
            return res.data;
        } catch (error) {
            set({ gstLoading: false });
            return { status: 500, message: "Server Error" };
        }
    },

    deleteGst: async (id, token) => {
        try {
            set({ gstLoading: true });
            const res = await axios.delete(`http://localhost:3001/api/v1/admin/delete-gst/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            set({ gstLoading: false });
            return res.data;
        } catch (error) {
            set({ gstLoading: false });
            return { status: 500, message: "Server Error" };
        }
    },
}));

export default useGstStore;
