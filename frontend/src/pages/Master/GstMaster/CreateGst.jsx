import React, { useEffect, useState } from 'react';
import PageTitle from '../../../components/PageTitle';
import ActionArea from '../../../components/ActionArea';
import MainArea from '../../../components/MainArea';
import CustomButton from '../../../components/CustomButton';
import { toast } from 'sonner';
import { AiOutlineFileAdd, AiOutlineTable, AiOutlineRollback, AiOutlineEdit } from "react-icons/ai";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import useGstStore from '../../../store/GstStore';
import useAuthStore from '../../../store/AuthStore';

const CreateGst = () => {
  const { token } = useAuthStore();
  const { createGst, updateGst, getAllGst, gstData, gstLoading } = useGstStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const back = searchParams.get("back");
  const editId = searchParams.get("id");

  const [gst, setGst] = useState({ title: "", cgst: 0, sgst: 0, type: "percentage" });

  useEffect(() => {
    if (editId) {
      if (gstData?.length) {
        const editData = gstData.find(item => item.id.toString() === editId);
        if (editData) {
          setGst({
            title: editData.title,
            cgst: editData.cgst,
            sgst: editData.sgst,
            type: editData.type
          });
        }
      } else {
        getAllGst(token);
      }
    }
  }, [editId, gstData]);

  const submitData = async (e) => {
    if (e) e.preventDefault();
    if (!gst.title) return toast.error("Title is required");

    const total = parseFloat(gst.sgst || 0) + parseFloat(gst.cgst || 0);
    const payload = { ...gst, total_rate: total, igst: total, cgst: parseFloat(gst.cgst || 0), sgst: parseFloat(gst.sgst || 0) };

    try {
      let result;
      if (editId) {
        result = await updateGst({ data: { ...payload, id: editId }, token });
      } else {
        result = await createGst({ data: payload, token });
      }

      if (result.status === 200) {
        toast.success(result.message);
        navigate("/view-gst");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An error occurred while saving.");
    }
  };

  return (
    <>
      <PageTitle>{editId ? "Edit GST Details" : "Add GST Details"}</PageTitle>
      <div className="flex flex-col gap-1 text-sm">
        <ActionArea>
          {back || editId ? (
            <div onClick={() => navigate(-1)}>
              <CustomButton title={"Back"} color={"slate"}><AiOutlineRollback /></CustomButton>
            </div>
          ) : null}
          <div onClick={submitData}>
            <CustomButton title={editId ? "Update (Ctrl+S)" : "Save (Ctrl+S)"} color={"blue"}>
              {editId ? <AiOutlineEdit /> : <AiOutlineFileAdd />}
            </CustomButton>
          </div>
          <Link to="/view-gst">
            <CustomButton title={"View (Ctrl+I)"} color={"blue"}><AiOutlineTable /></CustomButton>
          </Link>
        </ActionArea>
        <br />

        <MainArea>
          <div className='flex flex-col w-full sm:md:lg:xl:w-[50%] gap-1'>
            <PageTitle>GST Information</PageTitle>
            <table className="w-full text-sm">
              <tbody>
                <tr className="dark:bg-slate-800">
                  <td className="p-1 text-slate-500">GST Title</td>
                  <td className="p-1">
                    <input
                      className="w-full p-1 rounded text-slate-900 border border-slate-300 dark:border-slate-600 outline-none"
                      placeholder="Example: 18% GST"
                      value={gst.title}
                      onChange={e => setGst({ ...gst, title: e.target.value })}
                    />
                  </td>
                </tr>
                <tr className="dark:bg-slate-800">
                  <td className="p-1 text-slate-500">Type</td>
                  <td className="p-1">
                    <select
                      className="w-full p-1 rounded text-slate-900 border border-slate-300 dark:border-slate-600 outline-none"
                      value={gst.type}
                      onChange={e => setGst({ ...gst, type: e.target.value })}
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed</option>
                    </select>
                  </td>
                </tr>
                <tr className="dark:bg-slate-800">
                  <td className="p-1 text-slate-500">CGST (%)</td>
                  <td className="p-1">
                    <input
                      className="w-full p-1 rounded text-slate-900 border border-slate-300 dark:border-slate-600 outline-none"
                      type="number"
                      value={gst.cgst}
                      onChange={e => setGst({ ...gst, cgst: e.target.value })}
                    />
                  </td>
                </tr>
                <tr className="dark:bg-slate-800">
                  <td className="p-1 text-slate-500">SGST (%)</td>
                  <td className="p-1">
                    <input
                      className="w-full p-1 rounded text-slate-900 border border-slate-300 dark:border-slate-600 outline-none"
                      type="number"
                      value={gst.sgst}
                      onChange={e => setGst({ ...gst, sgst: e.target.value })}
                    />
                  </td>
                </tr>
                <tr className="dark:bg-slate-800">
                  <td className="p-1 text-slate-500">Total Rate (%)</td>
                  <td className="p-1">
                    <input
                      className="w-full p-1 rounded bg-slate-100 text-slate-500 border border-slate-300 dark:border-slate-600 outline-none"
                      type="number"
                      value={parseFloat(gst.sgst || 0) + parseFloat(gst.cgst || 0)}
                      disabled
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

export default CreateGst;
