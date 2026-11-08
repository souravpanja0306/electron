import React from 'react'

const CustomButton = ({
    children,
    title = "",
    color = "",
    type = "button",
    onClick,
    disabled,
    name,
    ...props
}) => {
    const COLORS = {
        // Primary action.
        blue: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus-visible:outline-blue-600",
        // Secondary / neutral action (Cancel, Reset, Back).
        slate: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600 dark:hover:bg-slate-600 dark:active:bg-slate-500",
        // Destructive action.
        red: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:outline-red-600",
        green: "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 focus-visible:outline-emerald-600",
        yellow: "bg-amber-500 text-amber-950 hover:bg-amber-400 active:bg-amber-600 focus-visible:outline-amber-500",
    };

    return (
        <button
            type={type}
            name={name}
            onClick={onClick}
            disabled={disabled}
            {...props}
            className={`h-8 min-w-20 p-2 cursor-pointer rounded text-xs flex gap-2 items-center justify-center select-none font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${COLORS[color] || COLORS.blue}`}
        >
            <span className="text-base">
                {children}
            </span>
            <span className="uppercase tracking-wide">
                {title}
            </span>
        </button>
    )
}

export default CustomButton