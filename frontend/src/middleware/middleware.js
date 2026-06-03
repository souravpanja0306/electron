import { Navigate } from "react-router-dom";
import { useEffect } from "react";

// Store...
import useAuthStore from "../store/AuthStore";

export const Middleware = ({ children }) => {
    const { authToken, token } = useAuthStore();
    useEffect(() => {
        authToken();
        const theme = window.api?.getItem("theme");

        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, []);

    return token ? children : <Navigate to="/signin" replace />;
};