import React from 'react'
import { AiOutlinePlusSquare } from "react-icons/ai";


const CreateInvoice = () => {

  let party = [
    "TechNova",
    "CloudNest",
    "CodeCraft",
    "DataSpark",
    "NextGen Labs",
    "AppVibe",
    "DigitalHive",
    "StackFlow",
    "PixelWorks",
    "SoftEdge",
    "ByteWave",
    "InnoTech",
    "WebOrbit",
    "LogicLoop",
    "DevSphere",
    "SmartOps",
    "NetFusion",
    "CodeMint",
    "AIForge",
    "CyberNest",
    "TechBridge",
    "CloudMatrix",
    "AppCore",
    "DataPulse",
    "SoftNest"
  ]

  return (
    <div className="w-full h-full p-4 text-white">

      <h1 className="text-2xl font-semibold mb-4">Create Invoice</h1>
      <div className='flex flex-col gap-1'>

        <div className='flex justify-between border-solid border border-blue-600 rounded-lg p-1'>
          <div className='flex flex-col w-[250px]'>
            <div className='w-full flex flex-col'>
              <label>Party/Customer</label>
              <select className='p-1 w-full rounded-lg text-black'>
                <option selected disabled>Please Select Party</option>
                {
                  party && party.map(item => {
                    return (
                      <div>
                        <option>{item}</option>
                      </div>
                    )
                  })
                }
              </select>
            </div>
            <div className='w-full flex flex-col'>
              <label>Date</label>
              <input className='p-1 w-full rounded-lg text-black' />
            </div>
          </div>
          <div className='flex flex-col w-[250px]'>
            <div className='w-full flex flex-col'>
              <label>Date</label>
              <input type='date' className='p-1 w-full rounded-lg text-black' />
            </div>
            <div className='w-full flex flex-col'>
              <label>Invoice No</label>
              <input className='p-1 w-full rounded-lg text-black' />
            </div>
          </div>
        </div>

        <div className="border border-blue-600 rounded-xl p-1 space-y-2">
          {/* Header */}
          <div className="grid grid-cols-[100px_1fr_100px_150px_150px_150px_60px] gap-1 text-white text-sm font-semibold text-center">
            <div className='p-1 rounded-lg'>Sl. No</div>
            <div className='p-1 rounded-lg'>Description</div>
            <div className='p-1 rounded-lg'>HSN</div>
            <div className='p-1 rounded-lg'>Quantity</div>
            <div className='p-1 rounded-lg'>Rate</div>
            <div className='p-1 rounded-lg'>Total</div>
            <div className='p-1 rounded-lg'>#</div>
          </div>

          {/* Row */}
          <div className="grid grid-cols-[100px_1fr_100px_150px_150px_150px_60px] gap-1 items-center text-black">
            <input className="p-1 rounded-lg border border-blue-600 text-center " placeholder="1" />
            <input className="p-1 rounded-lg border border-blue-600 capitalize" placeholder="Description" />
            <input className="p-1 rounded-lg border border-blue-600 uppercase text-center " placeholder="HSN" />
            <input className="p-1 rounded-lg border border-blue-600 text-right appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" placeholder="Qty" type='number' />
            <input className="p-1 rounded-lg border border-blue-600 text-right appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" placeholder="Rate" type='number' />
            <input className="p-1 rounded-lg border border-blue-600 text-right appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" placeholder="Total" type='number' />
            <button className="flex justify-center text-2xl text-blue-600 hover:text-green-600 transition">
              <AiOutlinePlusSquare />
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default CreateInvoice