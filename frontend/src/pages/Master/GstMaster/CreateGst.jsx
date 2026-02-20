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
import useGstStore from '../../../store/GstStore';

const CreateGst = () => {
  const { gstData, getAllGst, createGst, loading } = useGstStore();

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

  const submitData = async (e) => {
    let result = await createGst(gst);
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
          <div onClick={(e) => submitData(e)}>
            <CustomButton title={"Save (Ctrl+S)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
          </div>
          <Link to="/view-gst">
            <CustomButton title={"View (Ctrl+I)"} color={"blue"}><AiOutlineTable /></CustomButton>
          </Link>
        </ActionArea>
        <br />

        <MainArea>
          <div className='flex flex-col w-full gap-1'>
            <PageTitle>GST Information</PageTitle>
            <table className="w-full border border-slate-300 dark:border-slate-600 text-sm">
              <tbody>
                <tr className="border border-slate-300 dark:border-slate-600">
                  <td className="p-1 w-1/3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600">
                    GST Title
                  </td>
                  <td className="p-1 border border-slate-300 dark:border-slate-600">
                    <input
                      className="w-full p-1 rounded text-slate-500 border border-slate-300 dark:border-slate-600"
                      placeholder="Example: 18% GST"
                      value={gst.title}
                      onChange={e => setGst({ ...gst, title: e.target.value })}
                    />
                  </td>
                </tr>

                <tr className="border border-slate-300 dark:border-slate-600">
                  <td className="p-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600">
                    Type
                  </td>
                  <td className="p-1 border border-slate-300 dark:border-slate-600">
                    <select
                      className="w-full p-1 rounded text-slate-500 border border-slate-300 dark:border-slate-600"
                      value={gst.type}
                      onChange={e => setGst({ ...gst, type: e.target.value })}
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed</option>
                    </select>
                  </td>
                </tr>

                <tr className="border border-slate-300 dark:border-slate-600">
                  <td className="p-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600">
                    CGST (%)
                  </td>
                  <td className="p-1 border border-slate-300 dark:border-slate-600">
                    <input
                      className="w-full p-1 rounded text-slate-500 border border-slate-300 dark:border-slate-600"
                      type="number"
                      value={gst.cgst}
                      onChange={e => setGst({ ...gst, cgst: e.target.value })}
                    />
                  </td>
                </tr>

                <tr className="border border-slate-300 dark:border-slate-600">
                  <td className="p-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600">
                    SGST (%)
                  </td>
                  <td className="p-1 border border-slate-300 dark:border-slate-600">
                    <input
                      className="w-full p-1 rounded text-slate-500 border border-slate-300 dark:border-slate-600"
                      type="number"
                      value={gst.sgst}
                      onChange={e => setGst({ ...gst, sgst: e.target.value })}
                    />
                  </td>
                </tr>

                <tr className="border border-slate-300 dark:border-slate-600">
                  <td className="p-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600">
                    Total Rate (%)
                  </td>
                  <td className="p-1 border border-slate-300 dark:border-slate-600">
                    <input
                      className="w-full p-1 rounded text-slate-500 border border-slate-300 dark:border-slate-600"
                      type="number"
                      value={parseFloat(gst.sgst) + parseFloat(gst.cgst)}
                      disabled
                    />
                  </td>
                </tr>

                <tr className="border border-slate-300 dark:border-slate-600">
                  <td className="p-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600">
                    IGST (%)
                  </td>
                  <td className="p-1 border border-slate-300 dark:border-slate-600">
                    <input
                      className="w-full p-1 rounded text-slate-500 border border-slate-300 dark:border-slate-600"
                      type="number"
                      value={gst.igst}
                      onChange={e => setGst({ ...gst, igst: e.target.value })}
                    />
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </MainArea>
      </div>
    </>
  )
}

export default CreateGst