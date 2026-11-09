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
            window.location.hash = "/signin";
        };
        // Account locked / subscription lapsed: AccessStore shows the lock screen.
        const access = error.response?.data?.body?.access;
        if (error.response?.status === 403 && access?.locked) {
            window.dispatchEvent(new CustomEvent("myerp:access", { detail: access }));
        };
        return Promise.reject(error);
    },
);

export default api;