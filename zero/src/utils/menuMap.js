import {
    AiOutlineDiff,
    AiOutlineUser,
    AiOutlineLock,
    AiOutlineUnlock,
    AiOutlineEdit,
    AiOutlinePlusSquare,
    AiOutlineFileSearch
} from "react-icons/ai";

const MenuMap = {
    "home": [
        { title: "Home", url: "/", icon: <AiOutlineDiff /> },
    ],
    "work": [
        {
            type: "main",
            title: "Recipts/Challans",
            url: "#",
            icon: <AiOutlineDiff />,
            submenu: [
                { title: "Create Challan", url: "/create-invoice", icon: <AiOutlinePlusSquare /> },
                { title: "View Challans", url: "/view-invoice", icon: <AiOutlineFileSearch /> },
            ],
        },
        {
            type: "main",
            title: "Invoices",
            url: "#",
            icon: <AiOutlineDiff />,
            submenu: [
                { title: "Create Invoice", url: "/create-invoice", icon: <AiOutlinePlusSquare /> },
                { title: "View Invoices", url: "/view-invoice", icon: <AiOutlineFileSearch /> },
            ]
        },
        {
            type: "main",
            title: "Vehicle",
            url: "#",
            icon: <AiOutlineDiff />,
            submenu: [
                { title: "Add Vehicle", url: "/create-invoice", icon: <AiOutlinePlusSquare /> },
                { title: "View Vehicles", url: "/view-invoice", icon: <AiOutlineFileSearch /> },
            ]
        }
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