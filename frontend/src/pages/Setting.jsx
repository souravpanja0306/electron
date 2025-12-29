import React from 'react'
import PageTitle from '../components/PageTitle'
import ActionArea from '../components/ActionArea'

const Setting = () => {
    return (
        <>
            <PageTitle>Settings</PageTitle>
            <ActionArea>
                <div className='flex flex-col w-full gap-1'>
                    <label className='text-white text-xs uppercase'>Theme</label>
                    <select className='bg-slate-900 p-1 text-white rounded-md w-48'>
                        <option selected disabled>Select Theme</option>
                        <option>Light</option>
                        <option>Dark</option>
                        <option>Systems Default</option>
                    </select>
                </div>
            </ActionArea>
        </>
    )
}

export default Setting