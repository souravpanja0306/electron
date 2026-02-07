import React, { useState } from "react";

const ToggleButton = ({
    onChange = "",
    option = [],
    value = false,
    activeColor = "blue",
    inactiveColor = "blue",
}) => {
    const [on, setOn] = useState(value);

    const COLORS = {
        blue: "bg-blue-600",
        slate: "bg-slate-600",
        red: "bg-red-600",
        green: "bg-green-600",
        yellow: "bg-yellow-600",
    };
    const SendValue = () => {
        setOn(!on)
        onChange(!on)
    };

    return (
        <div className="flex justify-start items-center gap-1">
            <span className="text-xs">{option[0]}</span>
            <div
                onClick={() => SendValue()}
                className={`w-12 h-5 rounded-full cursor-pointer p-1 transition ${on ? COLORS[activeColor] : COLORS[inactiveColor]}`}
            >
                <div className={`h-3 w-3 bg-white rounded-full shadow transition-transform ${on ? "translate-x-7" : "translate-x-0"}`} />
            </div>
            <span className="text-xs">{option[1]}</span>
        </div>
    );
};

export default ToggleButton;