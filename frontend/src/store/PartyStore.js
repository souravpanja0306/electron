import { create } from "zustand";
import axios from "axios";

const usePartyStore = create((set) => ({
    parties: [],
    partyLoading: false,

    getAllParty: async (token) => {
        try {
            set({ loading: true });
            const result = await axios({
                method: "get",
                url: "http://localhost:3001/api/v1/party/party-list",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
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
            const result = await axios({
                method: "get",
                url: `http://localhost:3001/api/v1/party/party-list?id=${id}`,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            set({ partyLoading: false });
            return result.data;
        } catch (error) {
            set({ partyLoading: false });
            throw error;
        }
    },

    updateParty: async (id, payload, token) => {
        try {
            set({ partyLoading: true });
            const result = await axios({
                method: "put",
                url: `http://localhost:3001/api/v1/party/party-update/${id}`,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
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
}));

export default usePartyStore;