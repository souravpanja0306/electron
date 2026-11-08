import React from 'react'

const PageTitle = ({ children }) => {
    return (
        <div className='select-none cursor-not-allowed p-1'>
            <p className='capitalize font-semibold text-lg tracking-tight text-slate-800 dark:text-slate-100'>
                {children}
            </p>
        </div>
    )
}

export default PageTitle