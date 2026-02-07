import { create } from "zustand";
import axios from "axios";

const useGstStore = create((set) => ({
    gstData: [],
    loading: false,

    getAllGst: async (token) => {
        try {
            set({ loading: true });
            const result = await axios({
                method: "get",
                url: "http://localhost:3001/api/v1/admin/get-all-gst",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            set({ gstData: result.data, loading: false });
            return result.data;
        } catch (error) {
            set({ loading: false });
            throw error;
        };
    },

    createGst: async (payload, token) => {
        try {
            set({ loading: true });
            const res = await axios({
                method: "post",
                url: "http://localhost:3001/api/v1/admin/create-gst",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                data: payload,
            });
            set((state) => ({
                gstData: [...state.gstData, res.data],
                loading: false,
            }));
            return res.data;
        } catch (error) {
            set({ loading: false });
            throw error;
        };
    },
}));

export default useGstStore;
