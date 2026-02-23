import React from 'react'

const ActionArea = ({
    children
}) => {
    return (
        <div className='flex flex-col w-full rounded border border-slate-300 dark:border-slate-600'>
            <span className='font-semibold w-full text-xs cursor-not-allowed select-none p-1 rounded text-slate-500
            bg-slate-50 dark:bg-slate-800 dark:text-slate-100'>Action</span>
            <div className='flex gap-1 p-1 text-slate-500 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 rounded'>
                {children}
            </div>
        </div>
    )
}

export default ActionArea