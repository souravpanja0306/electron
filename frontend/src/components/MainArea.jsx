import React from 'react'

const MainArea = ({
    children
}) => {
    return (
        <div className='flex flex-col w-full rounded-md border-slate-600 border'>
            <div className='flex gap-1 p-1 w-full'>
                {children}
            </div>
        </div>
    )
}

export default MainArea