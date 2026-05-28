import React from 'react'

const ActionArea = ({
    children
}) => {
    return (
        <div className='flex flex-col w-full rounded border border-slate-300 dark:border-slate-600 shadow'>
            <span className='font-semibold w-full text-xs cursor-default select-none p-1 rounded-t text-slate-500
            bg-slate-100 dark:bg-slate-900 dark:text-slate-100 border-b border-slate-300 dark:border-slate-600'>Action</span>
            <div className='flex gap-2 p-1 text-slate-500 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 rounded-b'>
                {children}
            </div>
        </div>
    )
}

export default ActionArea