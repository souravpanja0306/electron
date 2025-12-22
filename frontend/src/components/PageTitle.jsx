import React from 'react'

const PageTitle = ({ children }) => {
    return (
        <div className='select-none cursor-not-allowed'>
            <p className='capitalize font-semibold text-lg'>
                {children}
            </p>
        </div>
    )
}

export default PageTitle