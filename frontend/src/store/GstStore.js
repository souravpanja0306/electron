import { create } from "zustand";
import axios from "axios";
import { baseURL } from "../utils/baseUrl";

const useGstStore = create((set) => ({
    gstData: [],
    gstLoading: false,

    getAllGst: async (token) => {
        try {
            set({ gstLoading: true });
            const result = await axios({
                method: "get",
                url: `http://localhost:3001/api/v1/admin/get-all-gst`,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                validateStatus: (status) => status < 500,
            });
            if (result.data.status === 200) {
                set({ gstData: result.data.body, gstLoading: false });
            } else {
                set({ gstData: [], gstLoading: false });
            };
            return result.data;
        } catch (error) {
            set({ gstLoading: false });
            throw error;
        };
    },

    createGst: async ({
        data = "",
        token = ""
    }) => {
        try {
            set({ gstLoading: true });
            const res = await axios({
                method: "post",
                url: `http://localhost:3001/api/v1/admin/create-gst`,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                data: data,
            });
            set((state) => ({
                gstLoading: false,
            }));
            return res.data;
        } catch (error) {
            set({ gstLoading: false });
            throw error;
        };
    },

    updateGst: async ({
        data = "",
        token = ""
    }) => {
        try {
            set({ gstLoading: true });
            const res = await axios({
                method: "put",
                url: `http://localhost:3001/api/v1/admin/update-gst`,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                data: data,
            });
            set({ gstLoading: false });
            return res.data;
        } catch (error) {
            set({ gstLoading: false });
            throw error;
        };
    },

    deleteGst: async (id, token) => {
        try {
            set({ gstLoading: true });
            const res = await axios({
                method: "delete",
                url: `http://localhost:3001/api/v1/admin/delete-gst/${id}`,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            set({ gstLoading: false });
            return res.data;
        } catch (error) {
            set({ gstLoading: false });
            throw error;
        };
    },
}));

export default useGstStore;

