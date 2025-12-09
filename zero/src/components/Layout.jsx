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
            <div className="w-[60px] bg-slate-900 p-2 flex flex-col items-center gap-2">

                {/* Top Menu */}
                <div
                    onClick={() => changeMenu({ menu: "home" })}
                    className={`text-2xl w-full p-2 rounded-lg flex flex-col justify-center items-center transition cursor-pointer ${activeMenu === "home" ? "bg-blue-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-300"}`}
                    title="Home"
                >
                    <AiOutlineHome />
                </div>
                <div
                    onClick={() => changeMenu({ menu: "work" })}
                    className={`text-2xl w-full p-2 rounded-lg flex flex-col justify-center items-center transition cursor-pointer ${activeMenu === "work" ? "bg-blue-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-300"}`}
                    title="Work"
                >
                    <AiOutlineFolder />
                </div>
                <div
                    onClick={() => changeMenu({ menu: "dashboard" })}
                    className={`text-2xl w-full p-2 rounded-lg flex flex-col justify-center items-center transition cursor-pointer ${activeMenu === "dashboard" ? "bg-blue-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-300"}`}
                    title="Dashboard"
                >
                    <AiOutlineBarChart />
                </div>
                <div
                    onClick={() => changeMenu({ menu: "report" })}
                    className={`text-2xl w-full p-2 rounded-lg flex flex-col justify-center items-center transition cursor-pointer ${activeMenu === "report" ? "bg-blue-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-300"}`}
                    title="Reports"
                >
                    <AiOutlinePieChart />
                </div>

                {/* Push bottom section down */}
                <div className="mt-auto flex flex-col items-center gap-2">
                    <div
                        onClick={() => changeMenu({ menu: "notification" })}
                        className={`text-2xl w-full p-2 rounded-lg flex flex-col justify-center items-center transition cursor-pointer ${activeMenu === "notification" ? "bg-blue-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-300"}`}
                        title="Notification"
                    >
                        <AiOutlineBell />
                    </div>
                    <div
                        onClick={() => changeMenu({ menu: "profile" })}
                        className={`text-2xl w-full p-2 rounded-lg flex flex-col justify-center items-center transition cursor-pointer ${activeMenu === "profile" ? "bg-blue-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-300"}`}
                        title="Profile"
                    >
                        <AiOutlineUser />
                    </div>
                    <div
                        onClick={() => changeMenu({ menu: "settings" })}
                        className={`text-2xl w-full p-2 rounded-lg flex flex-col justify-center items-center transition cursor-pointer ${activeMenu === "settings" ? "bg-blue-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-300"}`}
                        title="Settings"
                    >
                        <AiOutlineSetting />
                    </div>
                </div>
            </div>

            {/* Middle Sidebar */}
            <div className="w-[300px] bg-slate-800 p-2 flex flex-col gap-2">
                {currentMenu.map((item, index) => (
                    <NavLink
                        key={index}
                        to={item.url}
                        className={({ isActive }) =>
                            `text-xl w-full p-2 rounded-lg flex gap-2 items-center border border-slate-700 transition ${isActive
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
            <div className="w-full bg-slate-700 p-3">{children}</div>
        </div>
    );
};

export default Layout;
