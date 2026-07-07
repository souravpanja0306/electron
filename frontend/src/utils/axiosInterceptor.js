import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3001/api/v1",
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    async (config) => {
        const token = await window.api?.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        };
        return config;
    },
    (error) => Promise.reject(error),
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            window.api?.clearAll();
            window.location.href = "/signin";
        };
        return Promise.reject(error);
    },
);

export default api;