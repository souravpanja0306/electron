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


const Header = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({ name: "User" });
    useEffect(() => {
        try {
            const userData = JSON.parse(localStorage.getItem("user"));
            if (userData) setUser(userData);
        } catch (error) {
            console.error("Error parsing user data:", error);
        }
    }, []);
    const handleSignOut = (e) => {
        localStorage.clear();
        sessionStorage.clear();
        navigate("/signin");
    };
    return (
        <div className="titlebar border-b border-slate-300 dark:border-slate-700 w-full h-10 bg-slate-200 dark:bg-slate-950 text-slate-900 dark:text-white flex items-center justify-between px-3 shadow-sm z-50">
            <div className="flex items-center gap-4 no-drag">
                <div className="font-bold tracking-tight text-blue-600 dark:text-blue-400">
                    <Link to="/" className="hover:opacity-80">HelloWorld</Link>
                </div>
                <div className="flex text-xs space-x-1">
                    {/* File */}
                    <div className="relative group">
                        <button className="btn px-2 py-1 hover:bg-slate-300 dark:hover:bg-slate-800 rounded transition-colors">File</button>
                        <div className="p-1 absolute left-0 top-[20px] hidden group-hover:block bg-white dark:bg-slate-800 text-black dark:text-white min-w-60 rounded shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-[60]">
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
                        <div className="p-1 absolute left-0 top-[20px] hidden group-hover:block bg-white dark:bg-slate-800 text-black dark:text-white min-w-60 rounded shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-[60]">
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
                        <div className="p-1 absolute left-0 top-[20px] hidden group-hover:block bg-white dark:bg-slate-800 text-black dark:text-white min-w-60 rounded shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-[60]">
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
                        <div className="p-1 absolute left-0 top-full hidden group-hover:block bg-white dark:bg-slate-800 text-black dark:text-white min-w-48 rounded shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-[60]">
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
    )
}

export default Header