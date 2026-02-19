import React from "react";

const Alert = ({
    open,
    type = "info",
    title,
    message,
    onClose
}) => {
    if (!open) return null;

    const colors = {
        success: "border-green-600 text-green-600",
        error: "border-red-600 text-red-600",
        warning: "border-yellow-600 text-yellow-600",
        info: "border-slate-600 text-slate-600",
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="w-[340px] bg-slate-800 border border-slate-700 rounded-xl shadow-lg shadow-black/40 p-5">
                <h2 className="text-white text-sm font-semibold mb-2">
                    {title}
                </h2>
                <p className="text-slate-400 text-xs leading-relaxed">
                    {message}
                </p>
                <div className="flex justify-end mt-5">
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white transition"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Alert;
