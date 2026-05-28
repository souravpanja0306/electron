import { useEffect, useState } from "react";
import PageTitle from '../../../components/PageTitle';
import ActionArea from '../../../components/ActionArea';
import MainArea from '../../../components/MainArea';
import CustomButton from '../../../components/CustomButton';
import CustomLoader from "../../../components/CustomLoader";
import useHsnSacStore from "../../../store/HsnSacStore";
import { Link } from "react-router-dom";

// Icon...
import { AiOutlineFileAdd, AiOutlineSync, AiOutlineDelete, AiOutlineSearch } from "react-icons/ai";

const ViewHsnSac = () => {
    const token = localStorage.getItem("token");
    const { gstData, getAllHsnSac, loading } = useHsnSacStore();
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        getAllHsnSac(token);
    }, []);

    const [checkedIds, setCheckedIds] = useState(null);
    const handleChecked = (e, id) => {
        setCheckedIds(null);
        if (e.target.checked) setCheckedIds(id);
    };

    const filteredData = gstData?.body?.filter(item => 
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
                            <div className={`${!checkedIds ? "hidden" : "block"}`}>
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
                                <CustomButton title={"Refrash"} color={"blue"}><AiOutlineSync /></CustomButton>
                            </div>
                        </div>
                    </div>
                </ActionArea>
                <MainArea>
                    <table className="table-fixed w-full overflow-auto">
                        <thead>
                            <tr className="border-b border-slate-300 p-1 text-slate-600 dark:text-white text-sm font-semibold text-center">
                                <th className="p-1 text-start truncate w-24">Select</th>
                                <th className="p-1 text-start truncate">Description</th>
                                <th className="p-1 text-start truncate">Code</th>
                                <th className="p-1 text-start truncate w-32">GST Rate</th>
                                <th className="p-1 text-start truncate w-24">Type</th>
                                <th className="p-1 text-start truncate w-24">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData && filteredData.length > 0 ? (
                                filteredData.map((item) => (
                                    <tr key={item.id} className="border-b border-slate-300 p-1 hover:bg-blue-200 dark:hover:bg-slate-600 duration-200 cursor-pointer text-sm">
                                        <td className="p-1 text-start truncate capitalize">
                                            <input
                                                type="checkbox"
                                                onChange={(e) => handleChecked(e, item.id)}
                                                checked={checkedIds === item.id}
                                            />
                                        </td>
                                        <td className="p-1 text-start truncate capitalize" title={item.description}>
                                            {item.description ? item.description : "--"}
                                        </td>
                                        <td className="p-1 text-start truncate capitalize">
                                            {item.code ? item.code : "--"}
                                        </td>
                                        <td className="p-1 text-start truncate capitalize">
                                            {item.gst_rate ? `${item.gst_rate}%` : "0%"}
                                        </td>
                                        <td className="p-1 text-start truncate capitalize">
                                            {item.type ? item.type : "--"}
                                        </td>
                                        <td className="p-1 text-start truncate capitalize">
                                            {item.is_active ? "Active" : "Inactive"}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr className="p-1 hover:bg-blue-200 dark:hover:bg-slate-600 duration-200 cursor-pointer">
                                    <td className="p-1 text-center font-semibold" colSpan={6}>No Data Found</td>
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