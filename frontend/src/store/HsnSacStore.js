import { create } from "zustand";
import axios from "axios";

const useHsnSacStore = create((set) => ({
    hsnData: [],
    loading: false,

    getAllHsnSac: async (token) => {
        try {
            set({ loading: true });
            const result = await axios.get("http://localhost:3001/api/v1/admin/get-hsn-code", {
                headers: { Authorization: `Bearer ${token}` }
            });
            set({ hsnData: result.data.body || [], loading: false });
            return result.data;
        } catch (error) {
            set({ loading: false, hsnData: [] });
            return { status: 500, message: "Server Error" };
        }
    },

    createHsnSac: async (payload, token) => {
        try {
            set({ loading: true });
            const res = await axios.post("http://localhost:3001/api/v1/admin/create-hsn-code", payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            set({ loading: false });
            return res.data;
        } catch (error) {
            set({ loading: false });
            return { status: 500, message: "Server Error" };
        }
    },

    updateHsnSac: async (payload, token) => {
        try {
            set({ loading: true });
            const res = await axios.put("http://localhost:3001/api/v1/admin/update-hsn-code", payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            set({ loading: false });
            return res.data;
        } catch (error) {
            set({ loading: false });
            return { status: 500, message: "Server Error" };
        }
    },

    deleteHsnSac: async (id, token) => {
        try {
            set({ loading: true });
            const res = await axios.delete(`http://localhost:3001/api/v1/admin/delete-hsn-code/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            set({ loading: false });
            return res.data;
        } catch (error) {
            set({ loading: false });
            return { status: 500, message: "Server Error" };
        }
    },
}));

export default useHsnSacStore;
