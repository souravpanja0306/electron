import {
    AiOutlineBarChart,
    AiOutlineHome,
    AiOutlineBell,
    AiOutlineUser,
    AiOutlineSetting,
    AiOutlinePieChart,
    AiOutlineFolder
} from "react-icons/ai";
import { NavLink } from "react-router-dom";
import MenuMap from "../utils/menuMap";
import { useState } from "react";


const Layout = ({ children }) => {

    const [currentMenu, setCurrentMenu] = useState(MenuMap["home"]);
    const [activeMenu, setActiveManu] = useState("home");

    const changeMenu = ({ menu = "" }) => {
        if (menu) {
            setActiveManu(menu);
            setCurrentMenu(MenuMap[menu] || []);
        };
    };

    return (
        <div className="flex min-h-screen bg-black text-white w-full">

            {/* Left Sidebar */}
            <div className="min-w-[70px] bg-slate-950 p-1 flex flex-col items-center gap-1">

                {/* Top Menu */}
                <div
                    onClick={() => changeMenu({ menu: "home" })}
                    className={`text-2xl w-full p-2 rounded-lg flex flex-col justify-center items-center transition cursor-pointer ${activeMenu === "home" ? "bg-blue-600 text-white" : "hover:bg-slate-700 hover:text-slate-200 text-slate-500"}`}
                    title="Home"
                >
                    <AiOutlineHome />
                    <span className="text-xs">Home</span>
                </div>
                <div
                    onClick={() => changeMenu({ menu: "work" })}
                    className={`text-2xl w-full p-2 rounded-lg flex flex-col justify-center items-center transition cursor-pointer ${activeMenu === "work" ? "bg-blue-600 text-white" : "hover:bg-slate-700 hover:text-slate-200 text-slate-500"}`}
                    title="Work"
                >
                    <AiOutlineFolder />
                    <span className="text-xs">Work</span>
                </div>
                <div
                    onClick={() => changeMenu({ menu: "dashboard" })}
                    className={`text-2xl w-full p-2 rounded-lg flex flex-col justify-center items-center transition cursor-pointer ${activeMenu === "dashboard" ? "bg-blue-600 text-white" : "hover:bg-slate-700 hover:text-slate-200 text-slate-500"}`}
                    title="Dashboard"
                >
                    <AiOutlineBarChart />
                    <span className="text-xs">Dashboard</span>
                </div>
                <div
                    onClick={() => changeMenu({ menu: "report" })}
                    className={`text-2xl w-full p-2 rounded-lg flex flex-col justify-center items-center transition cursor-pointer ${activeMenu === "report" ? "bg-blue-600 text-white" : "hover:bg-slate-700 hover:text-slate-200 text-slate-500"}`}
                    title="Reports"
                >
                    <AiOutlinePieChart />
                    <span className="text-xs">Reports</span>
                </div>

                {/* Push bottom section down */}
                <div className="mt-auto p-1 flex flex-col items-center gap-1">
                    <div
                        onClick={() => changeMenu({ menu: "notification" })}
                        className={`text-2xl w-full p-2 rounded-lg flex flex-col justify-center items-center transition cursor-pointer ${activeMenu === "notification" ? "bg-blue-600 text-white" : "hover:bg-slate-700 hover:text-slate-200 text-slate-500"}`}
                        title="Notification"
                    >
                        <AiOutlineBell />
                        <span className="text-xs">Notification</span>
                    </div>
                    <div
                        onClick={() => changeMenu({ menu: "profile" })}
                        className={`text-2xl w-full p-2 rounded-lg flex flex-col justify-center items-center transition cursor-pointer ${activeMenu === "profile" ? "bg-blue-600 text-white" : "hover:bg-slate-700 hover:text-slate-200 text-slate-500"}`}
                        title="Profile"
                    >
                        <AiOutlineUser />
                        <span className="text-xs">Profile</span>
                    </div>
                    <div
                        onClick={() => changeMenu({ menu: "settings" })}
                        className={`text-2xl w-full p-2 rounded-lg flex flex-col justify-center items-center transition cursor-pointer ${activeMenu === "settings" ? "bg-blue-600 text-white" : "hover:bg-slate-700 hover:text-slate-200 text-slate-500"}`}
                        title="Settings"
                    >
                        <AiOutlineSetting />
                        <span className="text-xs">Settings</span>
                    </div>
                </div>
            </div>

            {/* Middle Sidebar */}
            <div className="min-w-[270px] bg-slate-900 p-1 flex flex-col gap-1">
                {currentMenu.map((item, index) => (
                    <NavLink
                        key={index}
                        to={item.url}
                        className={({ isActive }) =>
                            `text-xl w-full p-2 rounded-lg flex gap-1 items-center border border-slate-700 transition ${isActive
                                ? "bg-blue-600 text-white"
                                : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                            }`
                        }
                    >
                        {item.icon}
                        <span className="text-xs">{item.title}</span>
                    </NavLink>
                ))}
            </div>

            {/* Content */}
            <div className="w-full bg-slate-800 p-1">{children}</div>
        </div>
    );
};

export default Layout;
