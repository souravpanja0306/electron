import { useEffect, useState } from "react";
import { toast } from 'sonner';

// Icon...
import { AiOutlineFileAdd, AiOutlineSync, AiOutlineDelete, AiOutlineEdit, AiOutlineSearch } from "react-icons/ai";

// Components...
import PageTitle from '../../../components/PageTitle';
import ActionArea from '../../../components/ActionArea';
import MainArea from '../../../components/MainArea';
import CustomButton from '../../../components/CustomButton';
import CustomLoader from "../../../components/CustomLoader";
import { Link, useNavigate } from "react-router-dom";

// Stores...
import useChallanStore from "../../../store/ChallanStore";
import useAuthStore from '../../../store/AuthStore';
import useHsnSacStore from "../../../store/HsnSacStore";

const ViewHsnSac = () => {
    const { authToken, token } = useAuthStore();
    const { hsnData, getAllHsnSac, deleteHsnSac, loading } = useHsnSacStore();
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        getAllHsnSac(token);
        authToken()
    }, []);

    const [checkedIds, setCheckedIds] = useState(null);
    const handleChecked = (e, id) => {
        setCheckedIds(null);
        if (e.target.checked) setCheckedIds(id);
    };

    const handleDelete = async () => {
        if (!checkedIds) return toast.error("Please select a record to delete.");
        if (window.confirm("Are you sure you want to delete this record?")) {
            try {
                const res = await deleteHsnSac(checkedIds, token);
                if (res.status === 200) {
                    toast.success(res.message);
                    getAllHsnSac(token);
                    setCheckedIds(null);
                } else {
                    toast.error(res.message);
                }
            } catch (error) {
                toast.error("Failed to delete record.");
            }
        }
    };

    const filteredData = hsnData?.filter(item =>
        item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    if (loading) return <CustomLoader />;

    return (
        <>
            <PageTitle>View All HSN/SAC Code</PageTitle>
            <div className='flex flex-col gap-1'>
                <ActionArea>
                    <div className="flex justify-between w-full">
                        <div className="flex gap-1">
                            <Link to="/create-hsn-sac">
                                <CustomButton title={"New (Ctrl+N)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
                            </Link>
                            <div className={`${!checkedIds ? "hidden" : "block"}`} onClick={() => navigate(`/create-hsn-sac?id=${checkedIds}`)}>
                                <CustomButton title={"Edit (Ctrl+E)"} color={"blue"}><AiOutlineEdit /></CustomButton>
                            </div>
                            <div className={`${!checkedIds ? "hidden" : "block"}`} onClick={handleDelete}>
                                <CustomButton title={"Delete (Ctrl+D)"} color={"red"}><AiOutlineDelete /></CustomButton>
                            </div>
                        </div>
                        <div className="flex gap-1 items-center">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="h-8 p-1 px-2 rounded text-xs border border-slate-400 dark:border-slate-600 bg-transparent w-48 outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div onClick={() => getAllHsnSac(token)}>
                                <CustomButton title={"Refresh"} color={"blue"}><AiOutlineSync /></CustomButton>
                            </div>
                        </div>
                    </div>
                </ActionArea>
                <MainArea>
                    <table className="table-fixed w-full overflow-auto text-sm">
                        <thead>
                            <tr className="border-b border-slate-300 p-1 text-slate-600 dark:text-white text-sm font-semibold text-center">
                                <th className="p-1 text-start truncate w-16">Select</th>
                                <th className="p-1 text-start truncate">Code</th>
                                <th className="p-1 text-start truncate">Type</th>
                                <th className="p-1 text-start truncate">Description</th>
                                <th className="p-1 text-start truncate w-24 text-right">GST Rate</th>
                                <th className="p-1 text-center w-24">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData && filteredData.length > 0 ? (
                                filteredData.map((item) => (
                                    <tr key={item.id} className="border-b border-slate-300 p-1 hover:bg-blue-200 dark:hover:bg-slate-600 duration-200 cursor-pointer">
                                        <td className="p-1 text-start">
                                            <input
                                                type="checkbox"
                                                onChange={(e) => handleChecked(e, item.id)}
                                                checked={checkedIds === item.id}
                                            />
                                        </td>
                                        <td className="p-1 text-start truncate">{item.code || "--"}</td>
                                        <td className="p-1 text-start truncate">{item.type || "--"}</td>
                                        <td className="p-1 text-start truncate" title={item.description}>
                                            {item.description || "--"}
                                        </td>
                                        <td className="p-1 text-right truncate">
                                            {item.gst_rate ? `${item.gst_rate}%` : "0%"}
                                        </td>
                                        <td className="p-1 text-center truncate">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {item.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr className="p-1 hover:bg-blue-200 dark:hover:bg-slate-600 duration-200 cursor-pointer">
                                    <td className="p-1 text-center font-semibold text-slate-500" colSpan={6}>No Data Found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </MainArea>
            </div>
        </>
    );
};

export default ViewHsnSac;
