import { AiOutlineDiff, AiOutlineUser, AiOutlineLock, AiOutlineUnlock, AiOutlineEdit } from "react-icons/ai";

const MenuMap = {
    "home": [
        { title: "Home", url: "/", icon: <AiOutlineDiff /> },
    ],
    "work": [
        { title: "Create Invoice", url: "/create-invoice", icon: <AiOutlineDiff /> },
        { title: "View Invoice", url: "/view-invoice", icon: <AiOutlineDiff /> },
    ],
    "dashboard": [
        { title: "Dashboard", url: "/dashboard", icon: <AiOutlineDiff /> },
    ],
    "report": [
        { title: "Sales Reports", url: "/sales-reports", icon: <AiOutlineDiff /> },
    ],
    "notification": [],
    "profile": [
        { title: "Profile", url: "/profile", icon: <AiOutlineUser /> },
        { title: "Edit Profile", url: "/edit-profile", icon: <AiOutlineEdit /> },
    ],
    "settings": [
        { title: "Change Password", url: "/change-password", icon: <AiOutlineLock /> },
        { title: "Forgot Password", url: "/forgot-password", icon: <AiOutlineUnlock /> }
    ],
};

export default MenuMap