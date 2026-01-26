
import { Link, useNavigate, Navigate } from 'react-router-dom';

export const Middleware = ({ children }) => {
    const isAuth = localStorage.getItem("token");
    return isAuth ? children : <Navigate to="/signin" replace />;
};