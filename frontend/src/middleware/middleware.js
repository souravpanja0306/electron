import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

// Store...
import useAuthStore from "../store/AuthStore";
import useThemeStore from "../store/ThemeStore";

export const Middleware = ({ children }) => {
    const { authToken, token } = useAuthStore();
    const { loadCachedTheme, loadTheme } = useThemeStore();
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        await authToken();
        setLoading(false);
    };

    useEffect(() => {
        loadCachedTheme(); // instant, avoids a flash while the DB value loads
        checkAuth();
    }, []);

    // Once signed in, the theme stored in the database wins.
    useEffect(() => {
        if (token) loadTheme();
    }, [token]);

    if (loading) {
        return null; // Or a loading spinner
    }

    return token ? children : <Navigate to="/signin" replace />;
};