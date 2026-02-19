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
import { Link, NavLink, useNavigate } from "react-router-dom";
import MenuMap from "../utils/menuMap";
import { useState, useEffect } from "react";


const Layout = ({ children }) => {
    const navigate = useNavigate();
    const currentMenuValue = localStorage.getItem("currentMenu") ? localStorage.getItem("currentMenu") : "home";
    const [subMenu, setSubMenu] = useState({ index: null, active: false })
    const [currentMenu, setCurrentMenu] = useState(MenuMap[currentMenuValue]);
    const [activeMenu, setActiveManu] = useState(currentMenuValue);
    const [sideBar, setSideBar] = useState(true);

    const changeMenu = ({ menu = "" }) => {
        if (menu) {
            setSideBar(true)
            setActiveManu(menu);
            setCurrentMenu(MenuMap[menu] || []);
            localStorage.setItem("currentMenu", menu);
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
        <div className="flex flex-col min-h-screen">

            <div className="w-full h-10 bg-[#141d31] text-white flex items-center justify-between p-2 shadow-md">
                <div className="flex items-center gap-2">
                    <div className="text-lg font-semibold tracking-wide">
                        <Link to="/">HelloWorld</Link>
                    </div>
                    <div className="flex text-sm">
                        {/* File */}
                        <div className="relative group">
                            <button className="p-2 hover:bg-slate-800 hover:text-blue-400">File</button>

                            <div className="absolute left-0 top-6 hidden group-hover:block bg-white text-black w-40 rounded shadow-lg py-1 z-50">
                                <button className="block w-full text-left px-3 py-1 hover:bg-gray-200">New</button>
                                <button className="block w-full text-left px-3 py-1 hover:bg-gray-200">Open</button>
                                <button className="block w-full text-left px-3 py-1 hover:bg-gray-200">Save</button>
                                <hr />
                                <button className="block w-full text-left px-3 py-1 hover:bg-gray-200">Exit</button>
                            </div>
                        </div>

                        {/* Edit */}
                        <div className="relative group">
                            <button className="p-2 hover:bg-slate-800 hover:text-blue-400">Edit</button>

                            <div className="absolute left-0 top-6 hidden group-hover:block bg-white text-black w-40 rounded shadow-lg py-1 z-50">
                                <button className="block w-full text-left px-3 py-1 hover:bg-gray-200">Undo</button>
                                <button className="block w-full text-left px-3 py-1 hover:bg-gray-200">Redo</button>
                                <button className="block w-full text-left px-3 py-1 hover:bg-gray-200">Copy</button>
                                <button className="block w-full text-left px-3 py-1 hover:bg-gray-200">Paste</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm uppercase">
                        {JSON.parse(localStorage.getItem("user"))?.name[0]}
                    </div>
                    <span className="hover:text-blue-400 capitalize">{JSON.parse(localStorage.getItem("user"))?.name}</span>
                </div>
            </div>

            <div className="flex min-h-[calc(100vh-2.5rem)] bg-slate-100 dark:bg-slate-900 w-full">
                {/* Left Sidebar */}
                <div className="w-[70px] bg-slate-100 dark:bg-slate-900 flex flex-col items-center select-none border-r border-slate-300 dark:border-slate-600">

                    {/* Top Menu */}
                    <div
                        onClick={() => setSideBar(!sideBar)}
                        className={`text-2xl w-full p-2 flex flex-col justify-center items-center transition cursor-pointer hover:text-slate-900 hover:dark:text-slate-300 text-slate-500`}
                        title="Menu"
                    >
                        {sideBar ? <AiOutlineMenuFold /> : <AiOutlineMenu />}
                    </div>
                    {/* <div
                    onClick={() => changeMenu({ menu: "home" })}
                    className={`text-2xl w-full p-2 flex flex-col justify-center items-center transition cursor-pointer ${activeMenu === "home" ? "bg-blue-600 text-white" : "hover:text-slate-900 hover:dark:text-slate-300 text-slate-500"}`}
                    title="Home"
                >
                    <AiOutlineHome />
                    <span className="text-xs">Home</span>
                </div> */}
                    <div
                        onClick={() => changeMenu({ menu: "work" })}
                        className={`text-2xl w-full p-2 flex flex-col justify-center items-center transition cursor-pointer ${activeMenu === "work" ? "bg-blue-600 text-white" : "hover:text-slate-900 hover:dark:text-slate-300 text-slate-500"}`}
                        title="Work"
                    >
                        <AiOutlineFolder />
                        <span className="text-xs">Work</span>
                    </div>
                    <div
                        onClick={() => changeMenu({ menu: "dashboard" })}
                        className={`text-2xl w-full p-2 flex flex-col justify-center items-center transition cursor-pointer ${activeMenu === "dashboard" ? "bg-blue-600 text-white" : "hover:text-slate-900 hover:dark:text-slate-300 text-slate-500"}`}
                        title="Dashboard"
                    >
                        <AiOutlineBarChart />
                        <span className="text-xs">Dashboard</span>
                    </div>
                    <div
                        onClick={() => changeMenu({ menu: "report" })}
                        className={`text-2xl w-full p-2 flex flex-col justify-center items-center transition cursor-pointer ${activeMenu === "report" ? "bg-blue-600 text-white" : "hover:text-slate-900 hover:dark:text-slate-300 text-slate-500"}`}
                        title="Reports"
                    >
                        <AiOutlinePieChart />
                        <span className="text-xs">Reports</span>
                    </div>

                    {/* Push bottom section down */}
                    <div className="mt-auto p-1 flex flex-col items-center">
                        <div
                            onClick={() => changeMenu({ menu: "notification" })}
                            className={`text-2xl w-full p-2 flex flex-col justify-center items-center transition cursor-pointer ${activeMenu === "notification" ? "bg-blue-600 text-white" : "hover:text-slate-900 hover:dark:text-slate-300 text-slate-500"}`}
                            title="Notification"
                        >
                            <AiOutlineBell />
                            <span className="text-xs">Notification</span>
                        </div>
                        <div
                            onClick={() => changeMenu({ menu: "master" })}
                            className={`text-2xl w-full p-2 flex flex-col justify-center items-center transition cursor-pointer ${activeMenu === "master" ? "bg-blue-600 text-white" : "hover:text-slate-900 hover:dark:text-slate-300 text-slate-500"}`}
                            title="Master"
                        >
                            <AiOutlineAppstoreAdd />
                            <span className="text-xs">Masters</span>
                        </div>
                        <div
                            onClick={() => changeMenu({ menu: "settings" })}
                            className={`text-2xl w-full p-2 flex flex-col justify-center items-center transition cursor-pointer ${activeMenu === "settings" ? "bg-blue-600 text-white" : "hover:text-slate-900 hover:dark:text-slate-300 text-slate-500"}`}
                            title="Settings"
                        >
                            <AiOutlineSetting />
                            <span className="text-xs">Settings</span>
                        </div>
                        <div
                            onClick={(e) => handleSignOut(e)}
                            className={`text-2xl w-full p-2 flex flex-col justify-center items-center transition cursor-pointer ${"hover:bg-red-600 hover:text-slate-900 hover:dark:text-slate-300 text-slate-500"}`}
                            title="Signout"
                        >
                            <AiOutlineLogout />
                            <span className="text-xs">Signout</span>
                        </div>
                    </div>
                </div>

                {/* Middle Sidebar */}
                <div className={`${sideBar ? "min-w-[270px]" : "max-w-0 p-0"} bg-slate-100 dark:bg-slate-900 flex flex-col select-none border-r border-slate-300 dark:border-slate-600`}>

                    {currentMenu.map((item, index) => (
                        item?.type === "main"
                            ? (
                                <div key={index}>
                                    <div
                                        onClick={() => changeSubMenu(index)}
                                        className={`text-sm w-full px-3 py-2 flex justify-between items-center cursor-pointer transition-all ${subMenu.index === index && subMenu.active
                                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-l-4 border-blue-600"
                                            : "border-b border-slate-300 dark:border-slate-500 text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {item.icon}
                                            <span>{item.title}</span>
                                        </div>
                                        {subMenu.index === index && subMenu.active ? <AiOutlineUpSquare /> : <AiOutlineDownSquare />}
                                    </div>
                                    <div className={`ml-3 border-l border-slate-300 dark:border-slate-700 ${subMenu.index === index && subMenu.active ? "block" : "hidden"} bg-slate-50 dark:bg-slate-900 transition-all`}>
                                        {item?.submenu?.map((sub, i) => (
                                            <NavLink
                                                key={i}
                                                to={sub.url}
                                                className={({ isActive }) =>
                                                    `text-sm w-full px-3 py-2 flex gap-2 items-center transition-all ${isActive
                                                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-l-4 border-blue-600"
                                                        : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    }`
                                                }
                                            >
                                                {sub.icon}
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
                                        `text-sm w-full px-3 py-2 flex gap-2 items-center transition-all ${isActive
                                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-l-4 border-blue-600"
                                            : "border-b border-slate-300 text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                        }`
                                    }
                                >
                                    {item.icon}
                                    <span>{item.title}</span>
                                </NavLink>
                            )
                    ))}

                </div>

                {/* Main Content */}
                <div className="max-h-screen w-full bg-white dark:bg-slate-800 p-1 overflow-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;
