import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

// Icons...
import { AiOutlineDownload, AiOutlineDelete } from 'react-icons/ai';

// Components...
import PageTitle from '../../components/PageTitle';
import ActionArea from '../../components/ActionArea';
import MainArea from '../../components/MainArea';
import CustomToggle from '../../components/CustomToggle';
import CustomButton from '../../components/CustomButton';

// Stores...
import useThemeStore from '../../store/ThemeStore';

const Setting = () => {
    const { theme, saveTheme } = useThemeStore();
    const light = theme !== "dark";

    const changeTheme = async (isLight) => {
        try {
            await saveTheme(isLight ? "light" : "dark");
        } catch (error) {
            console.log(error);
            toast.error("Could not save the theme. Please try again.");
        };
    };


    return (
        <div className='flex flex-col gap-1'>
            <PageTitle>Appearance/Theme</PageTitle>
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
        </div>
    )
}

export default Setting