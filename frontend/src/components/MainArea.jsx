import React from 'react'

const MainArea = ({
    children
}) => {
    return (
        <div className='flex flex-col w-full rounded-md border-blue-600 border'>
            <div className='flex gap-1 p-1'>
                {children}
            </div>
        </div>
    )
}

export default MainArea