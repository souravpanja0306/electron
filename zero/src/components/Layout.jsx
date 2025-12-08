import React from "react";
import {
    AiFillAlert,
    AiFillBell,
    AiFillControl,
    AiFillMediumCircle,
} from "react-icons/ai";
import { NavLink } from "react-router-dom";

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
                <NavLink to="/" className={({ isActive }) =>
                    `${sideBase} ${isActive ? sideActive : sideInactive}`
                }>
                    <AiFillAlert />
                    <span className="text-xs">Home</span>
                </NavLink>

                <NavLink to="/about" className={({ isActive }) =>
                    `${sideBase} ${isActive ? sideActive : sideInactive}`
                }>
                    <AiFillBell />
                    <span className="text-xs">About</span>
                </NavLink>

                <NavLink to="/cello" className={({ isActive }) =>
                    `${sideBase} ${isActive ? sideActive : sideInactive}`
                }>
                    <AiFillControl />
                    <span className="text-xs">Cello</span>
                </NavLink>

                <NavLink to="/mello" className={({ isActive }) =>
                    `${sideBase} ${isActive ? sideActive : sideInactive}`
                }>
                    <AiFillMediumCircle />
                    <span className="text-xs">Mello</span>
                </NavLink>
            </div>

            {/* Middle Sidebar */}
            <div className="w-[240px] bg-slate-800 p-2 flex flex-col gap-2">
                {[1, 2, 3].map((_, i) => (
                    <NavLink
                        key={i}
                        to={`/mello${i}`}
                        className={({ isActive }) =>
                            `${menuBase} ${isActive ? menuActive : menuInactive}`
                        }
                    >
                        <AiFillMediumCircle />
                        <span className="text-xs">Mello {i + 1}</span>
                    </NavLink>
                ))}
            </div>

            {/* Content */}
            <div className="w-full bg-slate-700 p-3">{children}</div>
        </div>
    );
};

export default Layout;
