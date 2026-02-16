import { create } from "zustand";
import axios from "axios";
let token = localStorage.getItem("token");

const useCompanyStore = create((set) => ({
    companyData: [],
    companyLoading: false,

    getAllCompany: async () => {
        try {
            set({ companyLoading: true });
            const result = await axios({
                method: "get",
                url: "http://localhost:3001/api/v1/company/get-company",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            set({ companyData: result.data, companyLoading: false });
            return result.data;
        } catch (error) {
            set({ companyLoading: false });
            throw error;
        };
    },
}));

export default useCompanyStore;