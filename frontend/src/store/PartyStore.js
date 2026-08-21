import { create } from "zustand";
import api from "../utils/axiosInterceptor";

const usePartyStore = create((set) => ({
    parties: [],
    partyLoading: false,

    createParty: async ({
        data: data,
        token: token
    }) => {
        try {
            set({ loading: true });
            const result = await api({
                method: "post",
                url: "/party/party-create",
                data: data,
            });
            set({ loading: false });
            return result.data;
        } catch (error) {
            set({ loading: false });
            throw error;
        };
    },

    getAllParty: async (token) => {
        try {
            set({ loading: true });
            const result = await api({
                method: "get",
                url: "/party/party-list",
            });
            set({ parties: result.data, loading: false });
            return result.data;
        } catch (error) {
            set({ loading: false });
            throw error;
        };
    },

    getPartyById: async (id, token) => {
        try {
            set({ partyLoading: true });
            const result = await api({
                method: "get",
                url: `/party/party-list?id=${id}`,
            });
            set({ partyLoading: false });
            return result.data;
        } catch (error) {
            set({ partyLoading: false });
            throw error;
        };
    },

    updateParty: async (id, payload, token) => {
        try {
            set({ partyLoading: true });
            const result = await api({
                method: "put",
                url: `http://localhost:3001/api/v1/party/party-update/${id}`,
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${token}`,
                },
                data: payload,
            });
            set({ partyLoading: false });
            return result.data;
        } catch (error) {
            set({ partyLoading: false });
            throw error;
        }
    },

    deleteParty: async (id) => {
        try {
            set({ partyLoading: true });
            const result = await api({
                method: "delete",
                url: `/party/party-delete/${id}`,
            });
            set({ partyLoading: false });
            return result.data;
        } catch (error) {
            set({ partyLoading: false });
            throw error;
        };
    },
}));

export default usePartyStore;