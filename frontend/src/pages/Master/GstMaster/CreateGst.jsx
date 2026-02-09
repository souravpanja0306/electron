import React, { useEffect, useState } from 'react';
import PageTitle from '../../../components/PageTitle';
import ActionArea from '../../../components/ActionArea';
import MainArea from '../../../components/MainArea';
import CustomButton from '../../../components/CustomButton';
import { inrToWords } from '../../../utils/InWordConverter';
import CustomToggle from '../../../components/CustomToggle';
import Alert from '../../../components/Alert';

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


// Functions...
// import { handleSubmit, handleGetParty, handleGenerateInvoiceNo, printInvoice } from "./InvoiceService";

const CreateGst = () => {
  const [isProforma, setIsProforma] = useState(true);
  const [searchParams] = useSearchParams();
  const back = searchParams.get("back");

  const navigate = useNavigate();

  const [gst, setGst] = useState({
    title: "",
    total_rate: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    type: "percentage"
  });


  return (
    <>
      <PageTitle>Add GST Details</PageTitle>
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
          <Link to="/view-gst">
            <CustomButton title={"View (Ctrl+I)"} color={"blue"}><AiOutlineTable /></CustomButton>
          </Link>
        </ActionArea>
        <br />

        <PageTitle>GST Information</PageTitle>
        <MainArea>
          <div className="flex gap-1 justify-start w-full">

            <div className="flex flex-col w-[250px] gap-1">
              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase">GST Title</label>
                <input
                  className="p-1 rounded-md w-full uppercase text-slate-900 border border-slate-300 dark:border-slate-600"
                  placeholder="18% GST"
                  value={gst.title}
                  onChange={e => setGst({ ...gst, title: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase">Total Rate (%)</label>
                <input
                  className="p-1 rounded-md w-full text-slate-900 border border-slate-300 dark:border-slate-600"
                  type="number"
                  value={gst.total_rate}
                  onChange={e => setGst({ ...gst, total_rate: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase">Type</label>
                <select
                  className="p-1 rounded-md w-full text-slate-900 uppercase border border-slate-300 dark:border-slate-600"
                  value={gst.type}
                  onChange={e => setGst({ ...gst, type: e.target.value })}
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col w-[250px] gap-1">
              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase">CGST (%)</label>
                <input
                  className="p-1 rounded-md w-full text-slate-900 border border-slate-300 dark:border-slate-600"
                  type="number"
                  value={gst.cgst}
                  onChange={e => setGst({ ...gst, cgst: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase">SGST (%)</label>
                <input
                  className="p-1 rounded-md w-full text-slate-900 border border-slate-300 dark:border-slate-600"
                  type="number"
                  value={gst.sgst}
                  onChange={e => setGst({ ...gst, sgst: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase">IGST (%)</label>
                <input
                  className="p-1 rounded-md w-full text-slate-900 border border-slate-300 dark:border-slate-600"
                  type="number"
                  value={gst.igst}
                  onChange={e => setGst({ ...gst, igst: e.target.value })}
                />
              </div>
            </div>
          </div>
        </MainArea>
      </div>
    </>
  )
}

export default CreateGst