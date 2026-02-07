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
    AiOutlineFileAdd,
    AiOutlinePercentage
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
            title: "Money Recipts",
            url: "#",
            icon: <AiOutlineDiff />,
            submenu: [
                { title: "Create Money Recipts", url: "/create-moeny-receipts", icon: <AiOutlinePlusSquare /> },
                { title: "View Money Recipts", url: "/view-money-receipts", icon: <AiOutlineFileSearch /> },
            ],
        },
        {
            type: "main",
            title: "Tax/Proforma Invoices",
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
        {
            type: "main",
            title: "Create/Update Party",
            url: "#",
            icon: <AiOutlineUser />,
            submenu: [
                { title: "Create Party", url: "/add-party", icon: <AiOutlineFileAdd /> },
                { title: "View Parties", url: "/party", icon: <AiOutlineDatabase /> },
            ]
        },
        {
            type: "main",
            title: "Create/Update Company",
            url: "#",
            icon: <AiOutlineBank />,
            submenu: [
                { title: "Create Company", url: "/add-company", icon: <AiOutlineFileAdd /> },
                { title: "View Companies", url: "/company", icon: <AiOutlineDatabase /> },
            ]
        },
        {
            type: "main",
            title: "Create/ Update HSN-SAC",
            url: "#",
            icon: <AiOutlineEdit />,
            submenu: [
                { title: "Create HSN/SAC", url: "/create-hsn-sac", icon: <AiOutlineUsergroupAdd /> },
                { title: "View HSN/SAC", url: "/view-hsn-sac", icon: <AiOutlineUsergroupAdd /> },
            ]
        },
        {
            type: "main",
            title: "Create/Update GST",
            url: "#",
            icon: <AiOutlinePercentage />,
            submenu: [
                { title: "Create GST", url: "/create-gst", icon: <AiOutlinePercentage /> },
                { title: "View All GST", url: "/view-gst", icon: <AiOutlinePercentage /> },
            ]
        },
    ],
    "settings": [
        { title: "Profile", url: "/profile", icon: <AiOutlineUser /> },
        { title: "Change Password", url: "/change-password", icon: <AiOutlineLock /> },
        { title: "Forgot Password", url: "/forgot-password", icon: <AiOutlineUnlock /> }
    ],
};

export default MenuMap