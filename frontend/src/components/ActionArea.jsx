import React from 'react'

const ActionArea = ({
    children
}) => {
    return (
        <div className='flex flex-col w-full rounded-md border-blue-600 border'>
            <span className='w-full text-xs cursor-not-allowed select-none p-1 rounded-md'>Action</span>
            <div className='flex gap-1 p-1'>
                {children}
            </div>
        </div>
    )
}

export default ActionArea