import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'sonner';

// Icon...
import { AiOutlineFileAdd, AiOutlineSync, AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";

// Components...
import PageTitle from '../../../components/PageTitle';
import ActionArea from '../../../components/ActionArea';
import MainArea from '../../../components/MainArea';
import CustomButton from '../../../components/CustomButton';
import CustomLoader from "../../../components/CustomLoader";

// Stores...
import useGstStore from "../../../store/GstStore";
import useChallanStore from "../../../store/ChallanStore";
import useAuthStore from '../../../store/AuthStore';
import useHsnSacStore from "../../../store/HsnSacStore";

const GstTable = () => {
    const { token } = useAuthStore();
    const { gstData, getAllGst, deleteGst, gstLoading } = useGstStore();
    const navigate = useNavigate();
    const [checkedIds, setCheckedIds] = useState(null);

    useEffect(() => {
        getAllGst(token);
    }, []);

    const handleChecked = (e, id) => {
        setCheckedIds(null);
        if (e.target.checked) setCheckedIds(id);
    };

    const handleDelete = async () => {
        if (!checkedIds) return toast.error("Please select a GST record to delete.");
        if (window.confirm("Are you sure you want to delete this GST record?")) {
            try {
                const res = await deleteGst(checkedIds, token);
                if (res.status === 200) {
                    toast.success(res.message);
                    getAllGst(token);
                    setCheckedIds(null);
                } else {
                    toast.error(res.message);
                }
            } catch (error) {
                toast.error("Failed to delete record.");
            }
        }
    };

    if (gstLoading) return <CustomLoader />;

    return (
        <>
            <PageTitle>View All GST Settings</PageTitle>
            <div className='flex flex-col gap-1'>
                <ActionArea>
                    <div className="flex justify-between w-full">
                        <div className="flex gap-1">
                            <Link to="/create-gst">
                                <CustomButton title={"New (Ctrl+N)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
                            </Link>
                            <div className={`${!checkedIds ? "hidden" : "block"}`} onClick={() => navigate(`/create-gst?id=${checkedIds}`)}>
                                <CustomButton title={"Edit (Ctrl+E)"} color={"blue"}><AiOutlineEdit /></CustomButton>
                            </div>
                            <div className={`${!checkedIds ? "hidden" : "block"}`} onClick={handleDelete}>
                                <CustomButton title={"Delete (Ctrl+D)"} color={"red"}><AiOutlineDelete /></CustomButton>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <div onClick={() => getAllGst(token)}>
                                <CustomButton title={"Refresh"} color={"blue"}><AiOutlineSync /></CustomButton>
                            </div>
                        </div>
                    </div>
                </ActionArea>

                <MainArea>
                    <table className="table-fixed w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-300 dark:border-slate-600 p-1 font-semibold text-slate-600 dark:text-white">
                                <th className="p-1 text-start w-16">Select</th>
                                <th className="p-1 text-start">Title</th>
                                <th className="p-1 text-right">Total %</th>
                                <th className="p-1 text-right">CGST %</th>
                                <th className="p-1 text-right">SGST %</th>
                                <th className="p-1 text-right">IGST %</th>
                                <th className="p-1 text-center w-24">Type</th>
                                <th className="p-1 text-center w-24">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gstData && gstData.length > 0 ? (
                                gstData.map((item) => (
                                    <tr key={item.id} className="border-b border-slate-300 p-1 hover:bg-blue-200 dark:hover:bg-slate-600 duration-200 cursor-pointer">
                                        <td className="p-1 text-start">
                                            <input
                                                type="checkbox"
                                                onChange={(e) => handleChecked(e, item.id)}
                                                checked={checkedIds === item.id}
                                            />
                                        </td>
                                        <td className="p-1 text-start truncate">{item.title || "--"}</td>
                                        <td className="p-1 text-right">{item.total_rate}%</td>
                                        <td className="p-1 text-right">{item.cgst}%</td>
                                        <td className="p-1 text-right">{item.sgst}%</td>
                                        <td className="p-1 text-right">{item.igst}%</td>
                                        <td className="p-1 text-center capitalize">{item.type || "--"}</td>
                                        <td className="p-1 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {item.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr className="p-1 hover:bg-blue-200 dark:hover:bg-slate-600 duration-200 cursor-pointer">
                                    <td className="p-1 text-center font-semibold text-slate-500" colSpan={8}>No Data Found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </MainArea>
            </div>
        </>
    );
};

export default GstTable;
