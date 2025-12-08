import React from "react";
import {
    AiOutlineBarChart,
    AiOutlineHome,
    AiFillAlert,
    AiFillBell,
    AiFillControl,
    AiFillMediumCircle,
    AiOutlineUser,
    AiOutlineSetting
} from "react-icons/ai";
import { NavLink } from "react-router-dom";
import mainMenu from "../utils/Menu"

const Layout = ({ children }) => {
    const sideBase = "text-xl w-full p-2 rounded-lg flex flex-col justify-center items-center transition";
    const sideActive = "bg-blue-600 text-white";
    const sideInactive = "bg-slate-800 hover:bg-slate-700 text-slate-300";

    const menuBase = "text-xl w-full p-2 rounded-lg flex gap-2 items-center border border-slate-700 transition";
    const menuActive = "bg-blue-600 text-white";
    const menuInactive = "bg-slate-800 hover:bg-slate-700 text-slate-300";

    return (
        <div className="flex min-h-screen bg-black text-white w-full">

            {/* Left Sidebar */}
            <div className="w-[60px] bg-slate-900 p-2 flex flex-col items-center gap-2">

                {/* Top Menu */}
                <NavLink
                    to="/"
                    className={({ isActive }) => `${sideBase} ${isActive ? sideActive : sideInactive}`}
                    title="Home"
                >
                    <AiOutlineHome />
                </NavLink>

                <NavLink
                    to="/dashboard"
                    className={({ isActive }) => `${sideBase} ${isActive ? sideActive : sideInactive}`}
                    title="Dashboard"
                >
                    <AiOutlineBarChart />
                </NavLink>

                <NavLink
                    to="/notification"
                    className={({ isActive }) => `${sideBase} ${isActive ? sideActive : sideInactive}`}
                    title="Notification"
                >
                    <AiFillBell />
                </NavLink>

                {/* Push bottom section down */}
                <div className="mt-auto flex flex-col items-center gap-2">

                    <NavLink
                        to="/profile"
                        className={({ isActive }) => `${sideBase} ${isActive ? sideActive : sideInactive}`}
                        title="Profile"
                    >
                        <AiOutlineUser />
                    </NavLink>

                    <NavLink
                        to="/settings"
                        className={({ isActive }) => `${sideBase} ${isActive ? sideActive : sideInactive}`}
                        title="Settings"
                    >
                        <AiOutlineSetting />
                    </NavLink>

                </div>
            </div>

            {/* Middle Sidebar */}
            <div className="w-[240px] bg-slate-800 p-2 flex flex-col gap-2">
                {
                    mainMenu.map((item, index) => (
                        <NavLink key={index} to={item.url} className={({ isActive }) => `${menuBase} ${isActive ? menuActive : menuInactive}`}>
                            {item.icon}
                            <span className="text-xs">{item.title}</span>
                        </NavLink>
                    ))
                }
            </div>

            {/* Content */}
            <div className="w-full bg-slate-700 p-3">{children}</div>
        </div>
    );
};

export default Layout;
