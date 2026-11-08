import React from 'react'

const ActionArea = ({
    children
}) => {
    return (
        <div className='flex flex-col w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm'>
            <span className='font-semibold w-full text-[11px] uppercase tracking-wide cursor-default select-none px-2 py-1 rounded-t-md text-slate-500 dark:text-slate-400
            bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700'>Action</span>
            <div className='flex gap-2 p-1 text-slate-700 dark:text-slate-200 rounded-b-md'>
                {children}
            </div>
        </div>
    )
}

export default ActionArea