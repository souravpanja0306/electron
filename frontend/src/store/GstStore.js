import { create } from "zustand";
import axios from "axios";

const useGstStore = create((set) => ({
    gstData: [],
    gstLoading: false,

    getAllGst: async (token) => {
        try {
            set({ gstLoading: true });
            const result = await axios({
                method: "get",
                url: "http://localhost:3001/api/v1/admin/get-all-gst",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                validateStatus: (status) => status < 500,
            });
            if (result.data.status === 200) {
                set({ gstData: result.data.body, gstLoading: false });
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
                url: "http://localhost:3001/api/v1/admin/create-gst",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                data: data,
            });
            set((state) => ({
                gstData: [...state.gstData, res.data],
                gstLoading: false,
            }));
            return res.data;
        } catch (error) {
            set({ gstLoading: false });
            throw error;
        };
    },
}));

export default useGstStore;
