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


const Header = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({ name: "User" });
    const [activeMenu, setActiveMenu] = useState("home");

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

    const toggleMenu = (menu) => {
        setActiveMenu(activeMenu === menu ? null : menu);
    };

    const handleSignOut = async (e) => {
        await window.api?.clearAll();
        navigate("/signin");
    };

    return (
        <div className="titlebar border-b border-slate-300 dark:border-slate-700 w-full h-10 bg-slate-200 dark:bg-slate-950 text-slate-900 dark:text-white flex items-center justify-between px-3 shadow-sm z-50">
            <div className="flex items-center gap-4 no-drag">
                <div className="font-bold tracking-tight text-blue-600 dark:text-blue-400">
                    <Link to="/" className="hover:opacity-80">ZeroERP</Link>
                </div>
                <div className="flex text-xs space-x-1">
                    {/* File */}
                    <div className="relative menu-container">
                        <button
                            onClick={() => toggleMenu('file')}
                            className={`btn px-2 py-1 rounded transition-colors ${activeMenu === 'file' ? 'bg-slate-300 dark:bg-slate-800' : 'hover:bg-slate-300 dark:hover:bg-slate-800'}`}>
                            File
                        </button>
                        <div className={`p-1 absolute left-0 top-[28px] ${activeMenu === 'file' ? 'block' : 'hidden'} bg-white dark:bg-slate-800 text-black dark:text-white min-w-60 rounded shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-[60]`}>
                            <button
                                onClick={() => { window.api?.openDevTools(); setActiveMenu(null); }}
                                className="btn block w-full text-left px-3 py-2 hover:rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                                <div className="flex justify-between items-center">
                                    <span>Open Dev Tools</span>
                                    <span className="text-slate-500 text-[10px] font-mono">Ctrl+Shift+I</span>
                                </div>
                            </button>
                            <button
                                onClick={() => { window.api?.close(); setActiveMenu(null); }}
                                className="btn block w-full text-left px-3 py-2 hover:rounded hover:bg-red-500 dark:hover:bg-red-600 hover:text-white transition-colors">
                                Exit
                            </button>
                        </div>
                    </div>

                    {/* Edit */}
                    <div className="relative menu-container">
                        <button
                            onClick={() => toggleMenu('edit')}
                            className={`btn px-2 py-1 rounded transition-colors ${activeMenu === 'edit' ? 'bg-slate-300 dark:bg-slate-800' : 'hover:bg-slate-300 dark:hover:bg-slate-800'}`}>
                            Edit
                        </button>
                        <div className={`p-1 absolute left-0 top-[28px] ${activeMenu === 'edit' ? 'block' : 'hidden'} bg-white dark:bg-slate-800 text-black dark:text-white min-w-60 rounded shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-[60]`}>
                            <button
                                onClick={() => { window.location.reload(); setActiveMenu(null); }}
                                className="btn block w-full text-left px-3 py-2 hover:rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                            >
                                Reload
                            </button>
                        </div>
                    </div>

                    {/* Help */}
                    <div className="relative menu-container">
                        <button
                            onClick={() => toggleMenu('help')}
                            className={`btn px-2 py-1 rounded transition-colors ${activeMenu === 'help' ? 'bg-slate-300 dark:bg-slate-800' : 'hover:bg-slate-300 dark:hover:bg-slate-800'}`}>
                            Help
                        </button>
                        <div className={`p-1 absolute left-0 top-[28px] ${activeMenu === 'help' ? 'block' : 'hidden'} bg-white dark:bg-slate-800 text-black dark:text-white min-w-60 rounded shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-[60]`}>
                            <Link to="/contact-us" onClick={() => setActiveMenu(null)} className="flex justify-between w-full text-left px-3 py-2 hover:rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                                <span>Contact Us</span>
                                <span className="text-slate-500 text-[10px] font-mono">Ctrl+Alt+C</span>
                            </Link>
                            <Link to="/documentation" onClick={() => setActiveMenu(null)} className="flex justify-between w-full text-left px-3 py-2 hover:rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                                <span>Documentation</span>
                                <span className="text-slate-500 text-[10px] font-mono"></span>
                            </Link>
                            <Link to="/updates" onClick={() => setActiveMenu(null)} className="flex justify-between w-full text-left px-3 py-2 hover:rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                                <span>Check for Updates</span>
                                <span className="text-slate-500 text-[10px] font-mono"></span>
                            </Link>
                            <Link to="/about" onClick={() => setActiveMenu(null)} className="flex justify-between w-full text-left px-3 py-2 hover:rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                                <span>About</span>
                                <span className="text-slate-500 text-[10px] font-mono"></span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 text-sm no-drag">
                <div className="flex items-center gap-2 pr-2 border-r border-slate-300 dark:border-slate-700">
                    <div className="relative menu-container">
                        <button
                            onClick={() => toggleMenu('user')}
                            className="btn w-7 h-7 flex items-center justify-center bg-blue-600 text-white hover:bg-blue-500 rounded-full text-[10px] font-bold uppercase shadow-sm">
                            {user?.name?.[0] || "U"}
                        </button>
                        <div className={`p-1 absolute right-0 top-full ${activeMenu === 'user' ? 'block' : 'hidden'} bg-white dark:bg-slate-800 text-black dark:text-white min-w-48 rounded shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-[60]`}>
                            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700 mb-1">
                                <p className="text-xs font-semibold truncate">{user?.name}</p>
                                <p className="text-[10px] text-slate-500 truncate">{user?.email || "User Profile"}</p>
                            </div>
                            <Link to="/profile" onClick={() => setActiveMenu(null)} className="btn block w-full text-left px-3 py-2 hover:rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                                Profile
                            </Link>
                            <button
                                onClick={(e) => { handleSignOut(e); setActiveMenu(null); }}
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
    )
}

export default Header