import React from 'react'

const CreateInvoice = () => {
  return (
    <div>

      <form>

        <div className='flex flex-col text-slate-900'>
          <label className='text-white text-sm p-1'>Date</label>
          <input type="date" className='w-48 rounded-lg p-2 cursor-pointer' />
        </div>
      </form>
    </div>
  )
}

export default CreateInvoice