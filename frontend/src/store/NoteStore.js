import { create } from "zustand";
import api from "../utils/axiosInterceptor";

// Credit notes and debit notes (one API, `type` = "credit" | "debit").
const useNoteStore = create((set) => ({
    noteData: [],
    noteLoading: false,

    generateNoteNo: async ({ type, company_id }) => {
        const result = await api.get("/note/generate-note-no", { params: { type, company_id } });
        return result.data;
    },

    getNotes: async ({ type = "", id = "", startDate = "", endDate = "", search = "" } = {}) => {
        try {
            set({ noteLoading: true });
            const params = Object.fromEntries(Object.entries({ type, id, startDate, endDate, search }).filter(([, v]) => v));
            const result = await api.get("/note/note-list", { params });
            set({ noteData: result.data, noteLoading: false });
            return result.data;
        } catch (error) {
            set({ noteLoading: false });
            throw error;
        };
    },

    createNote: async (payload) => {
        try {
            set({ noteLoading: true });
            const result = await api.post("/note/note-create", payload);
            set({ noteLoading: false });
            return result.data;
        } catch (error) {
            set({ noteLoading: false });
            throw error;
        };
    },

    updateNote: async (id, payload) => {
        try {
            set({ noteLoading: true });
            const result = await api.put("/note/note-update", { ...payload, id });
            set({ noteLoading: false });
            return result.data;
        } catch (error) {
            set({ noteLoading: false });
            throw error;
        };
    },

    deleteNote: async (id) => {
        const result = await api.delete(`/note/note-delete/${id}`);
        return result.data;
    },

    printNote: async (id) => {
        const result = await api.get("/note/generate-note-pdf", { params: { id } });
        return result.data;
    },
}));

export default useNoteStore;
