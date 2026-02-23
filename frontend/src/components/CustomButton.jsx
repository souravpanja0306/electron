import React from 'react'

const CustomButton = ({
    children,
    title = "",
    color = "",
}) => {
    const COLORS = {
        blue: "bg-blue-600 text-white hover:bg-blue-700 border-blue-600",
        slate: "bg-slate-600 text-white hover:bg-slate-700 border-slate-600",
        red: "bg-red-600 text-white hover:bg-red-700 border-red-600",
        green: "bg-green-600 text-white hover:bg-green-700 border-green-600",
        yellow: "bg-yellow-600 text-white hover:bg-yellow-700 border-yellow-600",
    };

    return (
        <div
            className={`min-w-16 px-3 py-1.5 cursor-pointer rounded text-xs flex gap-2 items-center justify-center select-none font-medium transition-all active:bg-slate-600 active:dark:bg-slate-900 shadow-sm ${COLORS[color]}`}
        >
            <span className="text-base">
                {children}
            </span>
            <span className="uppercase tracking-wide">
                {title}
            </span>
        </div>
    )
}

export default CustomButton