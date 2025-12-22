import React from 'react'

const PageTitle = ({ children }) => {
    return (
        <div className='select-none cursor-not-allowed p-1'>
            <p className='capitalize font-semibold text-xs'>
                {children}
            </p>
        </div>
    )
}

export default PageTitle