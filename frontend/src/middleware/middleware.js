import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

// Store...
import useAuthStore from "../store/AuthStore";

export const Middleware = ({ children }) => {
    const { authToken, token } = useAuthStore();
    const [theme, setTheme] = useState("light");
    const [loading, setLoading] = useState(true);

    const getThemeData = async () => {
        const getTheme = await window.api?.getItem("theme");
        if (getTheme) setTheme(getTheme)
    };

    const checkAuth = async () => {
        await authToken();
        setLoading(false);
    };

    useEffect(() => {
        checkAuth();
        getThemeData();
    }, []);

    useEffect(() => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [theme]);

    if (loading) {
        return null; // Or a loading spinner
    }

    return token ? children : <Navigate to="/signin" replace />;
};