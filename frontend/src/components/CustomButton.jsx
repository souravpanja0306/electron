import React from 'react'

const CustomButton = ({
    children,
    title = "",
    color = "",
}) => {
    return (
        <div className={`min-w-16 bg-${color}-600 p-1 cursor-pointer rounded-md text-xs flex gap-1 items-center justify-center hover:bg-${color}-700`}>
            <div className='text-lg'>
                {children}
            </div>
            <span className='uppercase'>
                {title}
            </span>
        </div>
    )
}

export default CustomButton