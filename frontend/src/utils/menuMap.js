import {
    AiOutlineDiff,
    AiOutlineUser,
    AiOutlineLock,
    AiOutlineUnlock,
    AiOutlineEdit,
    AiOutlinePlusSquare,
    AiOutlineFileSearch,
    AiOutlineBank,
    AiOutlineUsergroupAdd,
    AiOutlineShopping,
    AiOutlineUserAdd,
    AiOutlineDatabase,
    AiOutlineFileAdd
} from "react-icons/ai";

const MenuMap = {
    "home": [
        { title: "Home", url: "/", icon: <AiOutlineDiff /> },
    ],
    "work": [
        {
            type: "main",
            title: "Challans",
            url: "#",
            icon: <AiOutlineDiff />,
            submenu: [
                { title: "Create Challan", url: "/create-invoice", icon: <AiOutlinePlusSquare /> },
                { title: "View Challans", url: "/view-invoice", icon: <AiOutlineFileSearch /> },
            ],
        },
        {
            type: "main",
            title: "Recipts",
            url: "#",
            icon: <AiOutlineDiff />,
            submenu: [
                { title: "Create Recipts", url: "/create-invoice", icon: <AiOutlinePlusSquare /> },
                { title: "View Recipts", url: "/view-invoice", icon: <AiOutlineFileSearch /> },
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
        },
        {
            type: "main",
            title: "Vendor Expenses(Creditors)",
            url: "#",
            icon: <AiOutlineDiff />,
            submenu: [
                { title: "Add Invoice", url: "/create-creditors", icon: <AiOutlinePlusSquare /> },
                { title: "View Invoice", url: "/view-all-creditors", icon: <AiOutlineFileSearch /> },
            ]
        }
    ],
    "dashboard": [
        { title: "Dashboard", url: "/dashboard", icon: <AiOutlineDiff /> },
    ],
    "report": [
        {
            type: "main",
            title: "Ladgers",
            url: "#",
            icon: <AiOutlineDiff />,
            submenu: [
                { title: "Party Ladger", url: "/sales-reports", icon: <AiOutlinePlusSquare /> },
                { title: "Debtors", url: "/debtors", icon: <AiOutlineFileSearch /> },
                { title: "Creditors", url: "/creditors", icon: <AiOutlineFileSearch /> },
            ],
        },
    ],
    "notification": [],
    "profile": [
        { title: "Profile", url: "/profile", icon: <AiOutlineUser /> },
        {
            type: "main",
            title: "Party",
            url: "#",
            icon: <AiOutlineUser />,
            submenu: [
                { title: "Create Party", url: "/add-party", icon: <AiOutlineFileAdd /> },
                { title: "View Parties", url: "/party", icon: <AiOutlineDatabase /> },
            ]
        },
        {
            type: "main",
            title: "Company",
            url: "#",
            icon: <AiOutlineBank />,
            submenu: [
                { title: "Create Company", url: "/add-company", icon: <AiOutlineFileAdd /> },
                { title: "View Companies", url: "/company", icon: <AiOutlineDatabase /> },
            ]
        },
        {
            type: "main",
            title: "HSN",
            url: "#",
            icon: <AiOutlineEdit />,
            submenu: [
                { title: "signin signin", url: "/signin", icon: <AiOutlineUsergroupAdd /> },
            ]
        },
    ],
    "settings": [
        { title: "Change Password", url: "/change-password", icon: <AiOutlineLock /> },
        { title: "Forgot Password", url: "/forgot-password", icon: <AiOutlineUnlock /> }
    ],
};

export default MenuMap