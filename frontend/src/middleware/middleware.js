
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useEffect } from "react";

export const Middleware = ({ children }) => {
    useEffect(() => {
        const theme = localStorage.getItem("theme");
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        };
    }, []);

    const isAuth = localStorage.getItem("token");
    return isAuth ? children : <Navigate to="/signin" replace />;
};