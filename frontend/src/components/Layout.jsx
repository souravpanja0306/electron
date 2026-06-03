import {
    AiOutlineBarChart,
    AiOutlineHome,
    AiOutlineBell,
    AiOutlineUser,
    AiOutlineSetting,
    AiOutlinePieChart,
    AiOutlineFolder,
    AiOutlineUpSquare,
    AiOutlineDownSquare,
    AiOutlineMenu,
    AiOutlineLogout,
    AiOutlineMenuFold,
    AiOutlineAppstoreAdd,
} from "react-icons/ai";
import { MdCropSquare, MdOutlineClose, MdHorizontalRule } from "react-icons/md";
import { Link, NavLink, useNavigate } from "react-router-dom";
import MenuMap from "../utils/menuMap";
import { useState, useEffect } from "react";
import "../index.css"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from "./Header";


const Layout = ({ children }) => {
    const navigate = useNavigate();
    const currentMenuValue = localStorage.getItem("currentMenu") ? localStorage.getItem("currentMenu") : "home";
    const [subMenu, setSubMenu] = useState({ index: null, active: false })
    const [currentMenu, setCurrentMenu] = useState(MenuMap[currentMenuValue]);
    const [activeMenu, setActiveManu] = useState(currentMenuValue);
    const [sideBar, setSideBar] = useState(true);

    // Safe user data retrieval
    const [user, setUser] = useState({ name: "User" });
    const getUser = async () => {
        try {
            const userData = await window.api?.getItem("user");
            if (userData) setUser(JSON.parse(userData));
        } catch (error) {
            console.error("Error parsing user data:", error);
        };
    };
    useEffect(() => {
        getUser();
    }, []);

    const changeMenu = ({ menu = "" }) => {
        if (menu) {
            setSideBar(true)
            setActiveManu(menu);
            setCurrentMenu(MenuMap[menu] || []);
            localStorage.setItem("currentMenu", menu);
            setSubMenu({ index: 0, active: true });
        };
    };

    const changeSubMenu = (index) => {
        setSubMenu({ index: index, active: subMenu.index !== index ? true : !subMenu.active })
    };

    const handleSignOut = (e) => {
        localStorage.clear();
        sessionStorage.clear();
        navigate("/signin");
    };

    return (
        <div className="flex flex-col h-screen select-none">
            <ToastContainer style={{ zIndex: 99999 }} />
            {/* Custom Title Bar */}
            <Header />

            <div className="flex h-[calc(100vh-2.5rem)] bg-slate-100 dark:bg-slate-900 w-full overflow-hidden">
                {/* Left Sidebar */}
                <div className="w-[64px] bg-slate-50 dark:bg-slate-950 flex flex-col items-center border-r border-slate-300 dark:border-slate-800 overflow-y-auto overflow-x-hidden shadow-sm z-20">

                    {/* Top Menu */}
                    <div
                        onClick={() => setSideBar(!sideBar)}
                        className={`w-full p-4 flex justify-center items-center transition-all cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400`}
                        title="Toggle Sidebar"
                    >
                        {sideBar ? <AiOutlineMenuFold size={20} /> : <AiOutlineMenu size={20} />}
                    </div>

                    <div className="flex flex-col w-full py-2 space-y-1">
                        {[
                            { id: "home", icon: <AiOutlineHome size={20} />, label: "Home" },
                            { id: "work", icon: <AiOutlineFolder size={20} />, label: "Work" },
                            { id: "dashboard", icon: <AiOutlineBarChart size={20} />, label: "Stats" },
                            { id: "report", icon: <AiOutlinePieChart size={20} />, label: "Report" }
                        ].map(item => (
                            <div
                                key={item.id}
                                onClick={() => changeMenu({ menu: item.id })}
                                className={`w-full py-3 flex flex-col justify-center items-center transition-all cursor-pointer border-l-2 ${activeMenu === item.id
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900"}`}
                                title={item.label}
                            >
                                {item.icon}
                                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Bottom section */}
                    <div className="mt-auto flex flex-col w-full pb-2 space-y-1">
                        {[
                            { id: "notification", icon: <AiOutlineBell size={20} />, label: "Alert" },
                            { id: "master", icon: <AiOutlineAppstoreAdd size={20} />, label: "Master" },
                            { id: "settings", icon: <AiOutlineSetting size={20} />, label: "Setup" }
                        ].map(item => (
                            <div
                                key={item.id}
                                onClick={() => changeMenu({ menu: item.id })}
                                className={`w-full py-3 flex flex-col justify-center items-center transition-all cursor-pointer border-l-2 ${activeMenu === item.id
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900"}`}
                                title={item.label}
                            >
                                {item.icon}
                                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Middle Sidebar */}
                <div className={`${sideBar ? "w-[240px]" : "w-0 overflow-hidden"} bg-slate-50 dark:bg-slate-900 flex flex-col border-r border-slate-300 dark:border-slate-800 transition-all duration-300 ease-in-out z-10 shadow-sm`}>
                    <div className="p-3 border-b border-slate-200 dark:border-slate-800">
                        <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            {activeMenu} navigation
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto py-2">
                        {currentMenu.map((item, index) => (
                            item?.type === "main"
                                ? (
                                    <div key={index} className="mb-1">
                                        <div
                                            onClick={() => changeSubMenu(index)}
                                            className={`text-[13px] w-full px-4 py-2 flex justify-between items-center cursor-pointer transition-colors ${subMenu.index === index && subMenu.active
                                                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="opacity-70">{item.icon}</span>
                                                <span>{item.title}</span>
                                            </div>
                                            <span className="text-[10px] opacity-50 transition-transform duration-300" style={{ transform: subMenu.index === index && subMenu.active ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                                <AiOutlineDownSquare size={14} />
                                            </span>
                                        </div>
                                        <div className={`overflow-hidden transition-all duration-300 ${subMenu.index === index && subMenu.active ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
                                            {item?.submenu?.map((sub, i) => (
                                                <NavLink
                                                    key={i}
                                                    to={sub.url}
                                                    className={({ isActive }) =>
                                                        `text-[12px] w-full pl-11 pr-4 py-2 flex gap-3 items-center transition-all border-l-2 ${isActive
                                                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-600 font-medium"
                                                            : "border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                        }`
                                                    }
                                                >
                                                    <span className="scale-90 opacity-70">{sub.icon}</span>
                                                    <span>{sub.title}</span>
                                                </NavLink>
                                            ))}
                                        </div>
                                    </div>
                                )
                                : (
                                    <NavLink
                                        key={index}
                                        to={item.url}
                                        className={({ isActive }) =>
                                            `text-[13px] w-full px-4 py-2.5 flex gap-3 items-center transition-all border-l-2 ${isActive
                                                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-600 font-medium"
                                                : "border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                                            }`
                                        }
                                    >
                                        <span className="opacity-70">{item.icon}</span>
                                        <span>{item.title}</span>
                                    </NavLink>
                                )
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 bg-white dark:bg-slate-800 flex flex-col overflow-hidden">
                    <main className="flex-1 p-2 overflow-auto bg-white dark:bg-slate-800 relative z-0">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Layout;
