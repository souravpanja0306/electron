import React from 'react'

const MainArea = ({
    children,
    background
}) => {
    return (
        <div className={`flex flex-col w-full rounded border border-slate-300 dark:border-slate-600 ${background}`}>
            <div className='flex gap-1 p-1 text-slate-500 dark:text-white bg-slate-50 dark:bg-slate-800 rounded'>
                {children}
            </div>
        </div>
    )
}

export default MainArea