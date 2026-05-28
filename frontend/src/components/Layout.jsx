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


const Layout = ({ children }) => {
    const navigate = useNavigate();
    const currentMenuValue = localStorage.getItem("currentMenu") ? localStorage.getItem("currentMenu") : "home";
    const [subMenu, setSubMenu] = useState({ index: null, active: false })
    const [currentMenu, setCurrentMenu] = useState(MenuMap[currentMenuValue]);
    const [activeMenu, setActiveManu] = useState(currentMenuValue);
    const [sideBar, setSideBar] = useState(true);

    // Safe user data retrieval
    const [user, setUser] = useState({ name: "User" });
    useEffect(() => {
        try {
            const userData = JSON.parse(localStorage.getItem("user"));
            if (userData) setUser(userData);
        } catch (error) {
            console.error("Error parsing user data:", error);
        }
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

            {/* Custom Title Bar */}
            <div className="titlebar border-b border-slate-300 dark:border-slate-700 w-full h-10 bg-slate-200 dark:bg-slate-950 text-slate-900 dark:text-white flex items-center justify-between px-3 shadow-sm z-50">
                <div className="flex items-center gap-4 no-drag">
                    <div className="font-bold tracking-tight text-blue-600 dark:text-blue-400">
                        <Link to="/" className="hover:opacity-80">HelloWorld</Link>
                    </div>
                    <div className="flex text-xs space-x-1">
                        {/* File */}
                        <div className="relative group">
                            <button className="btn px-2 py-1 hover:bg-slate-300 dark:hover:bg-slate-800 rounded transition-colors">File</button>
                            <div className="p-1 absolute left-0 top-full hidden group-hover:block bg-white dark:bg-slate-800 text-black dark:text-white min-w-60 rounded shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-[60]">
                                <button
                                    onClick={() => window.api?.openDevTools()}
                                    className="btn block w-full text-left px-3 py-2 hover:rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                                    <div className="flex justify-between items-center">
                                        <span>Open Dev Tools</span>
                                        <span className="text-slate-500 text-[10px] font-mono">Ctrl+Shift+I</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => window.api?.close()}
                                    className="btn block w-full text-left px-3 py-2 hover:rounded hover:bg-red-500 dark:hover:bg-red-600 hover:text-white transition-colors">
                                    Exit
                                </button>
                            </div>
                        </div>

                        {/* Edit */}
                        <div className="relative group">
                            <button className="btn px-2 py-1 hover:bg-slate-300 dark:hover:bg-slate-800 rounded transition-colors">Edit</button>
                            <div className="p-1 absolute left-0 top-full hidden group-hover:block bg-white dark:bg-slate-800 text-black dark:text-white min-w-60 rounded shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-[60]">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="btn block w-full text-left px-3 py-2 hover:rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                                >
                                    Reload
                                </button>
                            </div>
                        </div>

                        {/* Work */}
                        <div className="relative group">
                            <button className="btn px-2 py-1 hover:bg-slate-300 dark:hover:bg-slate-800 rounded transition-colors">Work</button>
                            <div className="p-1 absolute left-0 top-full hidden group-hover:block bg-white dark:bg-slate-800 text-black dark:text-white min-w-60 rounded shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-[60]">
                                <Link to="/create-invoice" className="flex justify-between w-full text-left px-3 py-2 hover:rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                                    <span>Create Invoice</span>
                                    <span className="text-slate-500 text-[10px] font-mono">Ctrl+I</span>
                                </Link>
                                <Link to="" className="btn block w-full text-left px-3 py-2 hover:rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                                    Create Challan
                                </Link>
                                <Link to="" className="btn block w-full text-left px-3 py-2 hover:rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                                    Create Money Receipts
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 text-sm no-drag">
                    <div className="flex items-center gap-2 pr-2 border-r border-slate-300 dark:border-slate-700">
                        <div className="relative group">
                            <button className="btn w-7 h-7 flex items-center justify-center bg-blue-600 text-white hover:bg-blue-500 rounded-full text-[10px] font-bold uppercase shadow-sm">
                                {user?.name?.[0] || "U"}
                            </button>
                            <div className="p-1 absolute right-0 top-full hidden group-hover:block bg-white dark:bg-slate-800 text-black dark:text-white min-w-48 rounded shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-[60]">
                                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700 mb-1">
                                    <p className="text-xs font-semibold truncate">{user?.name}</p>
                                    <p className="text-[10px] text-slate-500 truncate">{user?.email || "User Profile"}</p>
                                </div>
                                <Link to="/profile" className="btn block w-full text-left px-3 py-2 hover:rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                                    Profile
                                </Link>
                                <button
                                    onClick={(e) => handleSignOut(e)}
                                    className="btn block w-full text-left px-3 py-2 hover:rounded hover:bg-red-500 dark:hover:bg-red-600 hover:text-white transition-colors">
                                    Signout
                                </button>
                            </div>
                        </div>
                        <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium capitalize truncate max-w-[100px]">
                            {user?.name}
                        </span>
                    </div>
                    
                    <div className="flex items-center">
                        <button
                            title="Minimize"
                            onClick={() => window.api?.minimize()}
                            className="btn p-2 hover:bg-slate-300 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400">
                            <MdHorizontalRule />
                        </button>
                        <button
                            title="Restore"
                            onClick={() => window.api?.maximize()}
                            className="btn p-2 hover:bg-slate-300 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400">
                            <MdCropSquare size={14} />
                        </button>
                        <button
                            title="Close"
                            onClick={() => window.api?.close()}
                            className="btn p-2 hover:bg-red-500 dark:hover:bg-red-600 transition-colors text-slate-600 dark:text-slate-400 hover:text-white">
                            <MdOutlineClose size={16} />
                        </button>
                    </div>
                </div>
            </div>

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
                    <main className="flex-1 p-4 overflow-auto bg-white dark:bg-slate-800 relative z-0">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Layout;
