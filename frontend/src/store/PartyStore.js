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
            set({ parties: result.data, loading: false });
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
                url: `/party/party-update/${id}`,
                data: payload,
            });
            set({ partyLoading: false });
            return result.data;
        } catch (error) {
            set({ partyLoading: false });
            throw error;
        }
    },
}));

export default usePartyStore;