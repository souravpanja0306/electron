import React, { useEffect, useState } from 'react'
import PageTitle from '../components/PageTitle';
import ActionArea from '../components/ActionArea';
import CustomToggle from '../components/CustomToggle';

const Setting = () => {
    const [light, setLight] = useState(true);

    useEffect(() => {
        const theme = localStorage.getItem("theme");
        if (theme === "dark") {
            setLight(false);
            document.documentElement.classList.add("dark");
        } else {
            setLight(true);
            document.documentElement.classList.remove("dark");
        };
    }, []);
    const changeTheme = (e) => {
        setLight(e);
        localStorage.setItem("theme", e ? "light" : "dark");
        document.documentElement.classList.toggle("dark", !e);
    };

    return (
        <>
            <PageTitle>Settings</PageTitle>
            <ActionArea>
                <div className="w-full max-w-xl space-y-6">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Appearance</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Customize how the app looks for you</p>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-4">
                        <div>
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Theme</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Switch between light and dark mode</p>
                        </div>
                        <CustomToggle
                            activeColor="green"
                            inactiveColor="blue"
                            option={["Dark", "Light"]}
                            value={light}
                            onChange={changeTheme}
                        />
                    </div>
                    <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-600 p-4 text-center text-xs text-slate-400">
                        More settings coming soon…
                    </div>
                </div>
            </ActionArea>
        </>
    )
}

export default Setting