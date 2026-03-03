import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import PageTitle from '../../components/PageTitle';
import ActionArea from '../../components/ActionArea';
import MainArea from '../../components/MainArea';
import CustomButton from '../../components/CustomButton';
import { inrToWords } from '../../utils/InWordConverter';

// Icon...
import {
  AiOutlinePlusSquare,
  AiOutlineFileAdd,
  AiOutlineMinusSquare,
  AiOutlinePrinter,
  AiOutlineTable,
  AiOutlineRollback,
} from "react-icons/ai";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Link, NavLink } from "react-router-dom";


// Stores...
import useInvoiceStore from '../../store/InvoiceStore';
import useMoneyReceiptStore from "../../store/MoneyReceiptStore";
import useCompanyStore from "../../store/CompnayStore";
import usePartyStore from "../../store/PartyStore"


const CreateChallan = () => {
  const [searchParams] = useSearchParams();
  const back = searchParams.get("back");
  const navigate = useNavigate();


  return (
    <>
      <PageTitle>Create Challan</PageTitle>

      <div className="flex flex-col gap-1">
        <ActionArea>
          {
            back ?
              <div onClick={() => navigate(-1)}>
                <CustomButton title={"Back"} color={"slate"}><AiOutlineRollback /></CustomButton>
              </div>
              : ""
          }
          <div>
            <CustomButton title={"Save (Ctrl+S)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
          </div>
          <Link to="/view-invoice">
            <CustomButton title={"View (Ctrl+I)"} color={"blue"}><AiOutlineTable /></CustomButton>
          </Link>
          <div>
            <CustomButton title={"Print (Ctrl+P)"} color={"blue"} ><AiOutlinePrinter /></CustomButton>
          </div>
        </ActionArea>


        <div className="p-6 bg-white text-sm max-w-5xl mx-auto border border-slate-400">
          {/* Header */}
          <div className="text-center border-b pb-3">
            <h1 className="text-xl font-bold">SRIVASTAV ENTERPRISE</h1>
            <p>Contractor Transport Cargo Handling</p>
            <p>36/6, HIDE ROAD, KOLKATA - 700043</p>
            <p>GSTIN: 19DVZPS4753P1ZO</p>
          </div>
          {/* Top Section */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            {/* Left */}
            <div className="col-span-2 space-y-3">
              <div>
                <label className="font-semibold">Consignor</label>
                <textarea className="w-full border p-2 h-20"></textarea>
              </div>
              <div>
                <label className="font-semibold">Consignee</label>
                <textarea className="w-full border p-2 h-20"></textarea>
              </div>
              <div>
                <label className="font-semibold">CHA</label>
                <input className="w-full border p-2" />
              </div>
            </div>
            {/* Right */}
            <div className="space-y-3">
              <input placeholder="C/N No" className="w-full border p-2" />
              <input type="date" className="w-full border p-2" />
              <input placeholder="Invoice No" className="w-full border p-2" />
              <input placeholder="From" className="w-full border p-2" />
              <input placeholder="To" className="w-full border p-2" />
              <input placeholder="Truck No" className="w-full border p-2" />
              <input placeholder="Way Bill No" className="w-full border p-2" />
            </div>
          </div>
          {/* Items Table */}
          <div className="mt-6 border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b bg-slate-100">
                  <th className="border p-2">Sl No</th>
                  <th className="border p-2">No. of Packages</th>
                  <th className="border p-2">Particulars of Goods</th>
                  <th className="border p-2">Weight (KG)</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(3)].map((_, i) => (
                  <tr key={i}>
                    <td className="border p-2 text-center">{i + 1}</td>
                    <td className="border p-2"><input className="w-full outline-none" /></td>
                    <td className="border p-2"><input className="w-full outline-none" /></td>
                    <td className="border p-2"><input className="w-full outline-none" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="grid grid-cols-3 gap-4 mt-8 text-center">
            <div>
              <p>Consignee Signature</p>
              <div className="h-16 border mt-2"></div>
            </div>
            <div>
              <p>Driver Signature</p>
              <div className="h-16 border mt-2"></div>
            </div>
            <div>
              <p>Authorised Signature</p>
              <div className="h-16 border mt-2"></div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

export default CreateChallan