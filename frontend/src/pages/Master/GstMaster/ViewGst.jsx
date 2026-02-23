import { useEffect, useState } from "react";
import PageTitle from '../../../components/PageTitle';
import ActionArea from '../../../components/ActionArea';
import MainArea from '../../../components/MainArea';
import CustomButton from '../../../components/CustomButton';
import CustomLoader from "../../../components/CustomLoader";
import useGstStore from "../../../store/GstStore";
import { Link, NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";

// Icon...
import { AiOutlineFileAdd, AiOutlineSync, AiOutlineDownload, AiOutlineDelete } from "react-icons/ai";

const GstTable = () => {
  const isAuth = localStorage.getItem("token");
  const { gstData, getAllGst, loading } = useGstStore();

  useEffect(() => {
    getAllGst(isAuth);
  }, []);

  if (loading) return <CustomLoader />;

  return (
    <>
      <PageTitle>View All Party</PageTitle>
      <div className='flex flex-col gap-1'>
        <ActionArea>
          <div className="flex justify-between w-full">
            <div className="flex gap-1">
              <Link to="/create-gst">
                <CustomButton title={"New (Ctrl+N)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
              </Link>
              <div>
                <CustomButton title={"Delete (Ctrl+D)"} color={"blue"}><AiOutlineDelete /></CustomButton>
              </div>
            </div>
            <div className="flex gap-1">
              <div onClick={(e) => getAllGst(isAuth)}>
                <CustomButton title={"Refrash"} color={"blue"}><AiOutlineSync /></CustomButton>
              </div>
            </div>
          </div>
        </ActionArea>
        <MainArea>
          <table className="table-fixed w-full">
            <thead>
              <tr className="border-b border-slate-300 dark:border-slate-600 p-1 ">
                <th className="p-1 text-start w-8">#</th>
                <th className="p-1 text-start">Title</th>
                <th className="p-1 text-start">Total Percentage</th>
                <th className="p-1 text-start">CGST</th>
                <th className="p-1 text-start">SGST</th>
                <th className="p-1 text-start">IGST</th>
                <th className="p-1 text-start">Type</th>
                <th className="p-1 text-start">Status</th>
              </tr>
            </thead>
            <tbody>
              {
                gstData?.body?.length ?
                  gstData?.body?.map((item) => (
                    <tr key={item.id} className="border-b border-slate-300 p-1 hover:bg-blue-200 dark:hover:bg-slate-600 duration-200 cursor-pointer">
                      <td className="p-1 text-start truncate capitalize">
                        <input
                          type="checkbox"
                        // onChange={(e) => handleChecked(e, item.id)}
                        // checked={item.is_selected}
                        />
                      </td>
                      <td className="p-1 text-start truncate capitalize">{item.title}</td>
                      <td className="p-1 text-start truncate capitalize">{item.total_rate}</td>
                      <td className="p-1 text-start truncate capitalize">{item.cgst}</td>
                      <td className="p-1 text-start truncate capitalize">{item.sgst}</td>
                      <td className="p-1 text-start truncate capitalize">{item.igst}</td>
                      <td className="p-1 text-start truncate capitalize">{item.type}</td>
                      <td className="p-1 text-start truncate capitalize">{item.type}</td>
                    </tr>
                  ))
                  :
                  <tr className="p-1 hover:bg-blue-200 dark:hover:bg-slate-600 duration-200 cursor-pointer">
                    <td className="p-1 text-center" colSpan={9}>No Data Found</td>
                  </tr>
              }
            </tbody>
          </table>
        </MainArea>
      </div>
    </>
  );
};

export default GstTable;
