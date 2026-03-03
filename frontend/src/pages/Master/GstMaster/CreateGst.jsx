import React, { useEffect, useState } from 'react';
import PageTitle from '../../../components/PageTitle';
import ActionArea from '../../../components/ActionArea';
import MainArea from '../../../components/MainArea';
import CustomButton from '../../../components/CustomButton';
import { inrToWords } from '../../../utils/InWordConverter';
import CustomToggle from '../../../components/CustomToggle';

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
import useGstStore from '../../../store/GstStore';

const CreateGst = () => {
  let token = localStorage.getItem("token");
  const { gstData, getAllGst, createGst, loading } = useGstStore();

  const [isProforma, setIsProforma] = useState(true);
  const [searchParams] = useSearchParams();
  const back = searchParams.get("back");

  const navigate = useNavigate();

  const [gst, setGst] = useState({
    title: "",
    total_rate: "",
    cgst: "",
    sgst: "",
    igst: "",
    type: "percentage"
  });

  const submitData = async (e) => {
    e.preventDefault();

    const total = parseFloat(gst.sgst) + parseFloat(gst.cgst);
    const updatedGst = { ...gst, total_rate: total, igst: total };

    let result = await createGst({ data: updatedGst, token: token });
    if (result) {
      console.log(result);
    };
  };

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
          <button type="submit" form="gst-form">
            <CustomButton title={"Save (Ctrl+S)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
          </button>
          <Link to="/view-gst">
            <CustomButton title={"View (Ctrl+I)"} color={"blue"}><AiOutlineTable /></CustomButton>
          </Link>
        </ActionArea>
        <br />

        <MainArea>
          <form className='flex flex-col w-full sm:md:lg:xl:w-[50%] gap-1' id="gst-form" onSubmit={(e) => submitData(e)}>
            <PageTitle>GST Information</PageTitle>
            <table className="w-full text-sm">
              <tbody>
                <tr className="dark:bg-slate-800">
                  <td className="p-1">GST Title</td>
                  <td className="p-1">
                    <input
                      className="w-full p-1 rounded text-slate-500 border border-slate-300 dark:border-slate-600"
                      placeholder="Example: 18% GST"
                      value={gst.title}
                      required
                      onChange={e => setGst({ ...gst, title: e.target.value })}
                    />
                  </td>
                </tr>
                <tr className="dark:bg-slate-800">
                  <td className="p-1">Type</td>
                  <td className="p-1">
                    <select
                      className="w-full p-1 rounded text-slate-500 border border-slate-300 dark:border-slate-600"
                      value={gst.type}
                      required
                      onChange={e => setGst({ ...gst, type: e.target.value })}
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed</option>
                    </select>
                  </td>
                </tr>
                <tr className="dark:bg-slate-800">
                  <td className="p-1">CGST (%)</td>
                  <td className="p-1">
                    <input
                      className="w-full p-1 rounded text-slate-500 border border-slate-300 dark:border-slate-600"
                      type="number"
                      required
                      value={gst.cgst}
                      onChange={e => setGst({ ...gst, cgst: e.target.value })}
                    />
                  </td>
                </tr>
                <tr className="dark:bg-slate-800">
                  <td className="p-1">SGST (%)</td>
                  <td className="p-1">
                    <input
                      className="w-full p-1 rounded text-slate-500 border border-slate-300 dark:border-slate-600"
                      type="number"
                      value={gst.sgst}
                      required
                      onChange={e => setGst({ ...gst, sgst: e.target.value })}
                    />
                  </td>
                </tr>
                <tr className="dark:bg-slate-800">
                  <td className="p-1">Total Rate (%)</td>
                  <td className="p-1">
                    <input
                      className="w-full p-1 rounded text-slate-500 border border-slate-300 dark:border-slate-600"
                      type="number"
                      value={parseFloat(gst.sgst) + parseFloat(gst.cgst)}
                      disabled
                    />
                  </td>
                </tr>
                <tr className="dark:bg-slate-800">
                  <td className="p-1">IGST (%)</td>
                  <td className="p-1">
                    <input
                      className="w-full p-1 rounded text-slate-500 border border-slate-300 dark:border-slate-600"
                      type="number"
                      value={parseFloat(gst.sgst) + parseFloat(gst.cgst)}
                      disabled
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </form>
        </MainArea>
      </div>
    </>
  )
}

export default CreateGst