import {
    AiOutlineBarChart,
    AiOutlineHome,
    AiOutlineSetting,
    AiOutlinePieChart,
    AiOutlineFolder,
    AiOutlineMenu,
    AiOutlineMenuFold,
    AiOutlineAppstoreAdd,
    AiOutlineDown,
} from "react-icons/ai";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import MenuMap from "../utils/menuMap";
import { useState, useEffect } from "react";
import "../index.css"
import { Toaster } from 'sonner'

import Header from "./Header";

// Stores...
import useAuthStore from '../store/AuthStore';

const RAIL_TOP = [
    { id: "home", icon: <AiOutlineHome size={20} />, label: "Home" },
    { id: "work", icon: <AiOutlineFolder size={20} />, label: "Work" },
    { id: "dashboard", icon: <AiOutlineBarChart size={20} />, label: "Stats" },
    { id: "report", icon: <AiOutlinePieChart size={20} />, label: "Report" },
];

const RAIL_BOTTOM = [
    { id: "master", icon: <AiOutlineAppstoreAdd size={20} />, label: "Master" },
    { id: "settings", icon: <AiOutlineSetting size={20} />, label: "Setup" },
];

const MENU_TITLES = {
    home: "Home",
    work: "Work",
    dashboard: "Statistics",
    report: "Reports",
    master: "Master Data",
    settings: "Setup",
};

const RailButton = ({ item, active, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        title={item.label}
        aria-current={active ? "page" : undefined}
        className={`mx-auto w-12 py-2 rounded-lg flex flex-col justify-center items-center gap-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${active
            ? "bg-blue-600 text-white shadow-sm"
            : "text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}`}
    >
        {item.icon}
        <span className="text-[10px] font-medium leading-none">{item.label}</span>
    </button>
);

const Layout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [openMenuIndex, setOpenMenuIndex] = useState(null);
    const [currentMenu, setCurrentMenu] = useState(MenuMap["home"]);
    const [activeMenu, setActiveMenu] = useState("home");
    const [sideBar, setSideBar] = useState(true);
    const { authToken } = useAuthStore(); // Store...

    const getCurrentMenu = async () => {
        let currentMenuValue = await window.api?.getItem("currentMenu");
        if (currentMenuValue && MenuMap[currentMenuValue]) {
            setActiveMenu(currentMenuValue);
            setCurrentMenu(MenuMap[currentMenuValue]);
        };
    };

    useEffect(() => {
        authToken();
        getCurrentMenu();
    }, []);

    // Open the group that contains the page being viewed.
    useEffect(() => {
        const path = location.pathname;
        const index = currentMenu.findIndex(item =>
            item?.type === "main" &&
            item.submenu?.some(sub => path === sub.url || path.startsWith(`${sub.url}/`))
        );
        if (index >= 0) setOpenMenuIndex(index);
    }, [location.pathname, currentMenu]);

    const changeMenu = ({ menu = "" }) => {
        if (menu) {
            setSideBar(true)
            setActiveMenu(menu);
            setCurrentMenu(MenuMap[menu] || []);
            window.api?.setItem("currentMenu", menu);
            setOpenMenuIndex(null);
        };
    };

    const toggleSubMenu = (index) => {
        setOpenMenuIndex(openMenuIndex === index ? null : index);
    };

    const handleSignOut = (e) => {
        window.api?.clearAll();
        navigate("/signin");
    };

    const topLevelLink = (isActive) =>
        `text-[13px] mx-2 px-3 py-2 rounded-md flex gap-3 items-center transition-colors ${isActive
            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold"
            : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}`;

    return (
        <div className="flex flex-col h-screen select-none">
            <Toaster />
            {/* Custom Title Bar */}
            <Header />

            <div className="flex h-[calc(100vh-2.5rem)] bg-slate-100 dark:bg-slate-900 w-full overflow-hidden">
                {/* Left Rail */}
                <div className="w-[64px] shrink-0 bg-slate-50 dark:bg-slate-950 flex flex-col items-stretch border-r border-slate-300 dark:border-slate-800 overflow-y-auto overflow-x-hidden z-20">

                    <button
                        type="button"
                        onClick={() => setSideBar(!sideBar)}
                        className="mx-auto mt-2 mb-1 w-12 h-10 flex justify-center items-center rounded-lg transition-colors text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        title={sideBar ? "Collapse menu" : "Expand menu"}
                        aria-expanded={sideBar}
                    >
                        {sideBar ? <AiOutlineMenuFold size={20} /> : <AiOutlineMenu size={20} />}
                    </button>

                    <div className="mx-3 my-1 border-t border-slate-200 dark:border-slate-800" />

                    <div className="flex flex-col py-1 gap-1">
                        {RAIL_TOP.map(item => (
                            <RailButton
                                key={item.id}
                                item={item}
                                active={activeMenu === item.id}
                                onClick={() => changeMenu({ menu: item.id })}
                            />
                        ))}
                    </div>

                    {/* Bottom section */}
                    <div className="mt-auto flex flex-col pb-2 gap-1">
                        <div className="mx-3 mb-1 border-t border-slate-200 dark:border-slate-800" />
                        {RAIL_BOTTOM.map(item => (
                            <RailButton
                                key={item.id}
                                item={item}
                                active={activeMenu === item.id}
                                onClick={() => changeMenu({ menu: item.id })}
                            />
                        ))}
                    </div>
                </div>

                {/* Menu Panel */}
                <div className={`${sideBar ? "w-[240px] border-r" : "w-0 border-r-0"} shrink-0 overflow-hidden transition-[width] duration-200 bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-800 z-10`}>
                    <div className="w-[240px] h-full flex flex-col">
                        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                {MENU_TITLES[activeMenu] || activeMenu}
                            </h2>
                        </div>
                        <nav className="flex-1 overflow-y-auto py-2 space-y-0.5">
                            {currentMenu.length === 0 && (
                                <div className="px-4 py-6 text-center text-xs text-slate-400">Nothing here yet.</div>
                            )}
                            {currentMenu.map((item, index) => (
                                item?.type === "main"
                                    ? (
                                        <div key={index}>
                                            <button
                                                type="button"
                                                onClick={() => toggleSubMenu(index)}
                                                aria-expanded={openMenuIndex === index}
                                                className={`text-[13px] mx-2 w-[calc(100%-1rem)] px-3 py-2 rounded-md flex justify-between items-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${openMenuIndex === index
                                                    ? "text-blue-700 dark:text-blue-300 font-semibold"
                                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                                                    }`}
                                            >
                                                <span className="flex items-center gap-3">
                                                    <span className="opacity-70">{item.icon}</span>
                                                    <span>{item.title}</span>
                                                </span>
                                                <AiOutlineDown
                                                    size={12}
                                                    className={`opacity-60 transition-transform duration-200 ${openMenuIndex === index ? "rotate-180" : ""}`}
                                                />
                                            </button>
                                            <div className={`overflow-hidden transition-all duration-200 ${openMenuIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                                                <div className="ml-6 mr-2 my-1 pl-2 border-l border-slate-300 dark:border-slate-700 space-y-0.5">
                                                    {item?.submenu?.map((sub, i) => (
                                                        <NavLink
                                                            key={i}
                                                            to={sub.url}
                                                            tabIndex={openMenuIndex === index ? 0 : -1}
                                                            onClick={() => window.api?.setItem("lastPage", sub.url)}
                                                            className={({ isActive }) =>
                                                                `text-[12px] px-3 py-1.5 rounded-md flex gap-2.5 items-center transition-colors ${isActive
                                                                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold"
                                                                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                                                                }`
                                                            }
                                                        >
                                                            <span className="opacity-70">{sub.icon}</span>
                                                            <span className="truncate">{sub.title}</span>
                                                        </NavLink>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                    : (
                                        <NavLink
                                            key={index}
                                            to={item.url}
                                            onClick={() => window.api?.setItem("lastPage", item.url)}
                                            className={({ isActive }) => topLevelLink(isActive)}
                                        >
                                            <span className="opacity-70">{item.icon}</span>
                                            <span>{item.title}</span>
                                        </NavLink>
                                    )
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0 bg-white dark:bg-slate-800 flex flex-col overflow-hidden">
                    <main className="flex-1 p-2 overflow-auto bg-white dark:bg-slate-800 relative z-0">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div >
    );
};

export default Layout;
