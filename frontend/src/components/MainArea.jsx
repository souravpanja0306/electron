import React from 'react'

const MainArea = ({
    children,
    background
}) => {
    return (
        <div className={`flex flex-col w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm ${background || ""}`}>
            <div className='flex gap-1 p-1 text-slate-700 dark:text-slate-200 rounded-md'>
                {children}
            </div>
        </div>
    )
}

export default MainArea