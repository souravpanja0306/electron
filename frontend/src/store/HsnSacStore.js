import { create } from "zustand";
import api from "../utils/axiosInterceptor";

const useHsnSacStore = create((set) => ({
    hsnData: [],
    loading: false,

    getAllHsnSac: async (token) => {
        try {
            set({ loading: true });
            const result = await api({
                method: "get",
                url: "/admin/get-hsn-code",
            });
            set({ hsnData: result.data.body || [], loading: false });
            return result.data;
        } catch (error) {
            set({ loading: false, hsnData: [] });
            return { status: 500, message: "Server Error" };
        };
    },

    createHsnSac: async (payload, token) => {
        try {
            set({ loading: true });
            const res = await api({
                method: "post",
                url: "/admin/create-hsn-code",
                data: payload,
            });
            set({ loading: false });
            return res.data;
        } catch (error) {
            set({ loading: false });
            return { status: 500, message: "Server Error" };
        };
    },

    updateHsnSac: async (payload, token) => {
        try {
            set({ loading: true });
            const res = await api({
                method: "put",
                url: "/admin/update-hsn-code",
                data: payload
            });
            set({ loading: false });
            return res.data;
        } catch (error) {
            set({ loading: false });
            return { status: 500, message: "Server Error" };
        };
    },

    deleteHsnSac: async (id, token) => {
        try {
            set({ loading: true });
            const res = await api({
                method: "delete",
                url: `/admin/delete-hsn-code/${id}`
            });
            set({ loading: false });
            return res.data;
        } catch (error) {
            set({ loading: false });
            return { status: 500, message: "Server Error" };
        };
    },
}));

export default useHsnSacStore;
