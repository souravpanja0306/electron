import { create } from "zustand";
import axios from "axios";

const useHsnSacStore = create((set) => ({
    gstData: [],
    loading: false,

    getAllHsnSac: async (token) => {
        try {
            set({ loading: true });
            const result = await axios({
                method: "get",
                url: "http://localhost:3001/api/v1/admin/get-hsn-code",
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

    createHsnSac: async (payload, token) => {
        try {
            set({ loading: true });
            const res = await axios({
                method: "post",
                url: "http://localhost:3001/api/v1/admin/create-hsn-code",
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

export default useHsnSacStore;