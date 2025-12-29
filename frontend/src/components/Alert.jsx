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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className={`w-[320px] bg-slate-900 border rounded-lg p-4 ${colors[type]}`}>
                <h2 className="text-sm font-semibold mb-1">{title}</h2>
                <p className="text-xs text-slate-300">{message}</p>

                <div className="flex justify-end mt-4">
                    <button
                        onClick={onClose}
                        className="px-3 py-1 text-xs rounded bg-slate-900 hover:bg-slate-600"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Alert;
