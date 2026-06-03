import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

// Store...
import useAuthStore from "../store/AuthStore";

export const Middleware = ({ children }) => {
    const { authToken, token } = useAuthStore();
    const [theme, setTheme] = useState("light");

    const getThemeData = async () => {
        const getTheme = await window.api?.getItem("theme");
        if (getTheme) setTheme(getTheme)
    };

    useEffect(() => {
        authToken();
        getThemeData();
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [token]);

    return token ? children : <Navigate to="/signin" replace />;
};