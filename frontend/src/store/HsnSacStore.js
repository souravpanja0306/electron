import { create } from "zustand";
import axios from "axios";
import { baseURL } from "../utils/baseUrl";

const useHsnSacStore = create((set) => ({
    hsnData: [],
    loading: false,

    getAllHsnSac: async (token) => {
        try {
            set({ loading: true });
            const result = await axios({
                method: "get",
                url: `http://localhost:3001/api/v1/admin/get-hsn-code`,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            set({ hsnData: result.data, loading: false });
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
                url: `http://localhost:3001/api/v1/admin/create-hsn-code`,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                data: payload,
            });
            set((state) => ({
                loading: false,
            }));
            return res.data;
        } catch (error) {
            set({ loading: false });
            throw error;
        };
    },

    updateHsnSac: async (payload, token) => {
        try {
            set({ loading: true });
            const res = await axios({
                method: "put",
                url: `http://localhost:3001/api/v1/admin/update-hsn-code`,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                data: payload,
            });
            set({ loading: false });
            return res.data;
        } catch (error) {
            set({ loading: false });
            throw error;
        };
    },

    deleteHsnSac: async (id, token) => {
        try {
            set({ loading: true });
            const res = await axios({
                method: "delete",
                url: `http://localhost:3001/api/v1/admin/delete-hsn-code/${id}`,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            set({ loading: false });
            return res.data;
        } catch (error) {
            set({ loading: false });
            throw error;
        };
    },
}));

export default useHsnSacStore;