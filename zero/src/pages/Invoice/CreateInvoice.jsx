import React from 'react'

const CreateInvoice = () => {
  return (
    <div className="w-full h-full p-4 text-white">

      <h1 className="text-2xl font-semibold mb-4">Create Invoice</h1>

      <div className="bg-slate-800 p-5 rounded-xl space-y-4">

        {/* Invoice Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-300">Invoice Number</label>
            <input className="w-full mt-1 p-2 rounded bg-slate-700" placeholder="INV-0001" />
          </div>

          <div>
            <label className="text-sm text-slate-300">Invoice Date</label>
            <input type="date" className="w-full mt-1 p-2 rounded bg-slate-700" />
          </div>
        </div>

        {/* Customer */}
        <div>
          <label className="text-sm text-slate-300">Customer Name</label>
          <input className="w-full mt-1 p-2 rounded bg-slate-700" placeholder="Customer" />
        </div>

        {/* Item List */}
        <div>
          <label className="text-sm text-slate-300">Item Description</label>
          <input className="w-full mt-1 p-2 rounded bg-slate-700" placeholder="Product / Service" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-slate-300">Qty</label>
            <input type="number" className="w-full mt-1 p-2 rounded bg-slate-700" />
          </div>

          <div>
            <label className="text-sm text-slate-300">Rate</label>
            <input type="number" className="w-full mt-1 p-2 rounded bg-slate-700" />
          </div>

          <div>
            <label className="text-sm text-slate-300">Amount</label>
            <input disabled className="w-full mt-1 p-2 rounded bg-slate-700 opacity-60" placeholder="Auto" />
          </div>
        </div>

        {/* Submit */}
        <button className="bg-blue-600 hover:bg-blue-700 w-full p-2 rounded-lg font-medium">
          Save Invoice
        </button>

      </div>

    </div>

  )
}

export default CreateInvoice