import axios from "axios";
import { getToken } from "./authService";

export const getDashboardData = async (token) => {
    try {
        let token = await getToken();
        const response = await axios({
            method: "get",
            url: "http://localhost:3001/api/v1/report/dashboard-stats",
            headers: {
                Authorization: `Bearer ${token}`
            },
        });
        return response.data;
    } catch (error) {
        console.log("Something went wrong", error);
    };
};