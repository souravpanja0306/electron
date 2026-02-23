import React, { useEffect, useState } from 'react'
import PageTitle from '../components/PageTitle';
import ActionArea from '../components/ActionArea';
import MainArea from '../components/MainArea';
import CustomToggle from '../components/CustomToggle';

const Setting = () => {
    const [active, setActive] = useState(0);
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
        <div className='flex flex-col gap-1'>
            <PageTitle>Settings</PageTitle>
            <div className="flex border-slate-700">
                <span
                    onClick={() => setActive(0)}
                    className={`cursor-pointer px-4 py-2 text-sm font-medium transition ${active === 0 ? "bg-slate-200 dark:bg-slate-900 border-b-2 border-blue-600 text-blue-600 dark:text-white" : "text-slate-800 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-200"}`}
                >Appearance/Theme</span>
                <span
                    onClick={() => setActive(1)}
                    className={`cursor-pointer px-4 py-2 text-sm font-medium transition ${active === 1 ? "bg-slate-200 dark:bg-slate-900 border-b-2 border-blue-600 text-blue-600 dark:text-white" : "text-slate-800 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-200"}`}
                >Invoice Setup
                </span>
                <span
                    onClick={() => setActive(2)}
                    className={`cursor-pointer px-4 py-2 text-sm font-medium transition ${active === 2 ? "bg-slate-200 dark:bg-slate-900 border-b-2 border-blue-600 text-blue-600 dark:text-white" : "text-slate-800 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-200"}`}
                >Print Setup</span>
            </div>

            {active === 0 &&
                <MainArea>
                    <div className="w-full max-w-xl space-y-1">
                        <div className="flex items-center justify-between rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-4">
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
                        <div className="rounded border border-dashed border-slate-300 dark:border-slate-600 p-4 text-center text-xs text-slate-400">
                            More settings coming soon…
                        </div>
                    </div>
                </MainArea>
            }
            {active === 1 &&
                <MainArea>
                    <div className="w-full max-w-xl space-y-1">
                        <div className="flex items-center justify-between rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-4">
                            <div>
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">GST</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Switch between GST and NON-GST invoice</p>
                            </div>
                            <CustomToggle
                                activeColor="green"
                                inactiveColor="blue"
                                option={["GST", "NON-GST"]}
                                value={light}
                                onChange={changeTheme}
                            />
                        </div>
                        <div className="flex items-center justify-between rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-4">
                            <div>
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">GST</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Switch between GST and NON-GST invoice</p>
                            </div>
                            <CustomToggle
                                activeColor="green"
                                inactiveColor="blue"
                                option={["Dark", "Light"]}
                                value={light}
                                onChange={changeTheme}
                            />
                        </div>
                        <div className="rounded border border-dashed border-slate-300 dark:border-slate-600 p-4 text-center text-xs text-slate-400">
                            More settings coming soon…
                        </div>
                    </div>
                </MainArea>
            }
            {active === 2 &&
                <MainArea>
                    <div className="w-full max-w-xl space-y-1">
                        <div className="flex items-center justify-between rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-4">
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
                        <div className="rounded border border-dashed border-slate-300 dark:border-slate-600 p-4 text-center text-xs text-slate-400">
                            More settings coming soon…
                        </div>
                    </div>
                </MainArea>
            }
        </div>
    )
}

export default Setting