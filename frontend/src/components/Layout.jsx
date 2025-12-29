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
    AiOutlineMenuFold,
} from "react-icons/ai";
import { NavLink } from "react-router-dom";
import MenuMap from "../utils/menuMap";
import { useState } from "react";


const Layout = ({ children }) => {
    const currentMenuValue = localStorage.getItem("currentMenu") ? localStorage.getItem("currentMenu") : "home"
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

    return (
        <div className="flex min-h-screen bg-slate-900 text-white w-full">

            {/* Left Sidebar */}
            <div className="w-[70px] bg-slate-900 p-1 flex flex-col items-center gap-1 select-none border-r border-slate-600">

                {/* Top Menu */}
                <div
                    onClick={() => setSideBar(!sideBar)}
                    className={`text-2xl w-full p-2 rounded-md flex flex-col justify-center items-center transition cursor-pointer hover:bg-slate-600 hover:text-slate-200 text-slate-600`}
                    title="Home"
                >
                    {sideBar ? <AiOutlineMenuFold /> : <AiOutlineMenu />}
                </div>
                <div
                    onClick={() => changeMenu({ menu: "home" })}
                    className={`text-2xl w-full p-2 rounded-md flex flex-col justify-center items-center transition cursor-pointer ${activeMenu === "home" ? "bg-slate-600 text-white" : "hover:bg-slate-600 hover:text-slate-200 text-slate-600"}`}
                    title="Home"
                >
                    <AiOutlineHome />
                    <span className="text-xs">Home</span>
                </div>
                <div
                    onClick={() => changeMenu({ menu: "work" })}
                    className={`text-2xl w-full p-2 rounded-md flex flex-col justify-center items-center transition cursor-pointer ${activeMenu === "work" ? "bg-slate-600 text-white" : "hover:bg-slate-600 hover:text-slate-200 text-slate-600"}`}
                    title="Work"
                >
                    <AiOutlineFolder />
                    <span className="text-xs">Work</span>
                </div>
                <div
                    onClick={() => changeMenu({ menu: "dashboard" })}
                    className={`text-2xl w-full p-2 rounded-md flex flex-col justify-center items-center transition cursor-pointer ${activeMenu === "dashboard" ? "bg-slate-600 text-white" : "hover:bg-slate-600 hover:text-slate-200 text-slate-600"}`}
                    title="Dashboard"
                >
                    <AiOutlineBarChart />
                    <span className="text-xs">Dashboard</span>
                </div>
                <div
                    onClick={() => changeMenu({ menu: "report" })}
                    className={`text-2xl w-full p-2 rounded-md flex flex-col justify-center items-center transition cursor-pointer ${activeMenu === "report" ? "bg-slate-600 text-white" : "hover:bg-slate-600 hover:text-slate-200 text-slate-600"}`}
                    title="Reports"
                >
                    <AiOutlinePieChart />
                    <span className="text-xs">Reports</span>
                </div>

                {/* Push bottom section down */}
                <div className="mt-auto p-1 flex flex-col items-center gap-1">
                    <div
                        onClick={() => changeMenu({ menu: "notification" })}
                        className={`text-2xl w-full p-2 rounded-md flex flex-col justify-center items-center transition cursor-pointer ${activeMenu === "notification" ? "bg-slate-600 text-white" : "hover:bg-slate-600 hover:text-slate-200 text-slate-600"}`}
                        title="Notification"
                    >
                        <AiOutlineBell />
                        <span className="text-xs">Notification</span>
                    </div>
                    <div
                        onClick={() => changeMenu({ menu: "profile" })}
                        className={`text-2xl w-full p-2 rounded-md flex flex-col justify-center items-center transition cursor-pointer ${activeMenu === "profile" ? "bg-slate-600 text-white" : "hover:bg-slate-600 hover:text-slate-200 text-slate-600"}`}
                        title="Profile"
                    >
                        <AiOutlineUser />
                        <span className="text-xs">Profile</span>
                    </div>
                    <div
                        onClick={() => changeMenu({ menu: "settings" })}
                        className={`text-2xl w-full p-2 rounded-md flex flex-col justify-center items-center transition cursor-pointer ${activeMenu === "settings" ? "bg-slate-600 text-white" : "hover:bg-slate-600 hover:text-slate-200 text-slate-600"}`}
                        title="Settings"
                    >
                        <AiOutlineSetting />
                        <span className="text-xs">Settings</span>
                    </div>
                </div>
            </div>

            {/* Middle Sidebar */}
            <div className={`${sideBar ? "min-w-[270px] p-1" : "max-w-0 p-0"} bg-slate-900 flex flex-col gap-1 select-none border-r border-slate-600`}>
                {currentMenu.map((item, index) => (
                    item?.type === "main" ? (
                        <div key={index}>
                            <div
                                onClick={() => setSubMenu({ index, active: subMenu.index !== index ? true : !subMenu.active })}
                                className={`${subMenu.index === index && subMenu.active ? "bg-slate-600" : "border-b border-slate-600 hover:bg-slate-600"} text-xl w-full p-1 flex justify-between gap-1 items-center transition text-slate-300 cursor-pointer`}
                            >
                                <div className="flex justify-center items-center gap-2">
                                    {item.icon}
                                    <span className="text-xs">{item.title}</span>
                                </div>
                                {subMenu.index === index && subMenu.active ? <AiOutlineUpSquare /> : <AiOutlineDownSquare />}
                            </div>
                            <div className={`${subMenu.index === index && subMenu.active ? "min-h-12" : "hidden"} p-1 rounded-b-md bg-slate-900 flex flex-col gap-1 transition-all duration-500 border border-slate-600`} >
                                {item?.submenu?.map((sub, i) => (
                                    <NavLink
                                        key={i}
                                        to={sub.url}
                                        className={({ isActive }) =>
                                            `text-xl w-full p-1 rounded-md flex gap-1 border border-slate-600 items-center transition ${isActive
                                                ? "bg-slate-600 text-white"
                                                : "bg-slate-900 hover:bg-slate-600 text-slate-300"
                                            }`
                                        }
                                    >
                                        {sub.icon}
                                        <span className="text-xs">{sub.title}</span>
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <NavLink
                            key={index}
                            to={item.url}
                            className={({ isActive }) =>
                                `text-xl w-full p-1 rounded-md flex gap-1 border border-slate-600 items-center transition ${isActive
                                    ? "bg-slate-600 text-white"
                                    : "bg-slate-900 hover:bg-slate-600 text-slate-300"
                                }`
                            }
                        >
                            {item.icon}
                            <span className="text-xs">{item.title}</span>
                        </NavLink>
                    )
                ))}
            </div>

            {/* Main Content */}
            <div className="h-screen w-full bg-slate-800 p-1 overflow-auto">
                {children}
            </div>
        </div>
    );
};

export default Layout;
