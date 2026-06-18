import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from 'sonner';

// Icon...
import {
    AiOutlineFileAdd,
    AiOutlineSync,
    AiOutlinePrinter,
    AiOutlineDownload,
    AiOutlineFilter,
    AiOutlineDelete,
    AiOutlineEdit,
    AiOutlineRollback
} from "react-icons/ai";

// Components...
import PageTitle from '../../components/PageTitle';
import ActionArea from '../../components/ActionArea';
import MainArea from '../../components/MainArea';
import CustomButton from '../../components/CustomButton';
import CustomLoader from "../../components/CustomLoader";

// Stores...
import useChallanStore from "../../store/ChallanStore";
import useAuthStore from '../../store/AuthStore';

const ViewChallan = () => {
    const { token } = useAuthStore();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const back = searchParams.get("back");

    const { challanData, challanLoading, getAllChallan, deleteChallan, printChallan } = useChallanStore();
    const [page, setPage] = useState(1);
    const [checkedIds, setCheckedIds] = useState(null);
    const [filters, setFilters] = useState({
        startDate: "",
        endDate: "",
        search: ""
    });

    useEffect(() => {
        getAllChallan({ token: token, ...filters });
    }, [filters]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleChecked = (e, id) => {
        setCheckedIds(null);
        if (e.target.checked) setCheckedIds(id);
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this record? This cannot be undone.")) {
            try {
                if (checkedIds == null) {
                    toast("Please select which one you want to delete.");
                    return;
                }
                let result = await deleteChallan({ id: checkedIds, token: token });
                if (result.status === 200) {
                    getAllChallan({ token: token });
                    setCheckedIds(null);
                    toast.success(result.message);
                } else {
                    toast.error(result.message);
                }
            } catch (error) {
                console.log(error);
                toast.error("Something went wrong!");
            };
        };
    };

    const handleRefresh = () => {
        setFilters({ startDate: "", endDate: "", search: "" });
        getAllChallan({ token: token });
        toast.info("Data refreshed.");
    };

    const handlePrint = async (id) => {
        try {
            let result = await printChallan({ id, token });
            if (result.status === 200) {
                const newWindow = window.open();
                newWindow.document.write(result.body.html);
                toast.info("Generating Print View...");
            } else {
                toast.error(result.message);
            };
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong!");
        };
    };

    useEffect(() => {
        const onKey = (e) => {
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                navigate("/create-challan");
            };

            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                handleDelete()
            };

            if (e.ctrlKey && e.key === 'e') {
                e.preventDefault();
                if (checkedIds) navigate(`/edit-challan/${checkedIds}`);
            };
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [checkedIds]);

    const limit = 10;
    const total = challanData.body?.length || 0;
    const totalPages = Math.ceil(total / limit);

    const start = total === 0 ? 0 : (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);

    if (challanLoading) return <CustomLoader />;

    return (
        <>
            <PageTitle>View All Challans</PageTitle>
            <div className='flex flex-col gap-1'>
                <ActionArea>
                    <div className="flex flex-col md:flex-row justify-between w-full gap-2">
                        <div className="flex gap-1">
                            {
                                back ?
                                    <div onClick={() => navigate(-1)}>
                                        <CustomButton title={"Back"} color={"slate"}><AiOutlineRollback /></CustomButton>
                                    </div>
                                    : ""
                            }
                            <Link to="/create-challan">
                                <CustomButton title={"New (Ctrl+N)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
                            </Link>
                            <Link to={`/edit-challan/${checkedIds}?back=true`} className={`${!checkedIds ? "hidden" : "block"}`}>
                                <CustomButton title={"Edit (Ctrl+E)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
                            </Link>
                            <div onClick={handleDelete} className={`${!checkedIds ? "hidden" : "block"}`}>
                                <CustomButton title={"Delete (Ctrl+D)"} color={"red"}><AiOutlineDelete /></CustomButton>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1">
                                <label className="text-xs font-semibold">From:</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={filters.startDate}
                                    onChange={handleFilterChange}
                                    className="h-8 p-1 rounded border border-slate-300 dark:border-slate-600 text-xs"
                                />
                            </div>
                            <div className="flex items-center gap-1">
                                <label className="text-xs font-semibold">To:</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={filters.endDate}
                                    onChange={handleFilterChange}
                                    className="h-8 p-1 rounded border border-slate-300 dark:border-slate-600 text-xs"
                                />
                            </div>
                            <input
                                type="text"
                                name="search"
                                placeholder="Search C/N, Truck..."
                                value={filters.search}
                                onChange={handleFilterChange}
                                className="h-8 p-1 rounded border border-slate-300 dark:border-slate-600 text-xs w-32 md:w-48"
                            />
                            <div onClick={handleRefresh}>
                                <CustomButton title={"Refresh"} color={"blue"}><AiOutlineSync /></CustomButton>
                            </div>
                        </div>
                    </div>
                </ActionArea>

                <MainArea>
                    <table className="table-fixed w-full overflow-auto">
                        <thead>
                            <tr className="border-b border-slate-300 p-1 text-slate-600 dark:text-white text-sm font-semibold text-center">
                                <th className="p-1 text-start text-slate-500 w-16">Select</th>
                                <th className="p-1 text-start text-slate-500">Company</th>
                                <th className="p-1 text-start text-slate-500">C/N No</th>
                                <th className="p-1 text-start text-slate-500">Consignor</th>
                                <th className="p-1 text-start text-slate-500">Consignee</th>
                                <th className="p-1 text-start text-slate-500">Date</th>
                                <th className="p-1 text-start text-slate-500">From</th>
                                <th className="p-1 text-start text-slate-500">To</th>
                                <th className="p-1 text-start text-slate-500">Truck No</th>
                                <th className="p-1 text-start text-slate-500">Amount</th>
                                <th className="p-1 text-center w-16 text-slate-500">#</th>
                            </tr>
                        </thead>
                        <tbody>
                            {challanData.body && challanData.body.length
                                ?
                                <>
                                    {challanData?.body?.map((item, index) => {
                                        return (
                                            <tr key={item.id} className="border-b border-slate-300 p-1 hover:bg-blue-200 dark:hover:bg-slate-600 duration-200 cursor-pointer text-sm">
                                                <td className="p-1 text-start truncate capitalize">
                                                    <input
                                                        type="checkbox"
                                                        checked={checkedIds === item.id}
                                                        onChange={(e) => handleChecked(e, item.id)}
                                                    />
                                                </td>
                                                <td className="p-1 text-start truncate capitalize text-slate-500">{item.company_id ? item.company_id.company_name : "--"}</td>
                                                <td className="p-1 text-start truncate capitalize hover:underline text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                                                    <Link to={`/edit-challan/${item.id}?back=true`}>
                                                        {item.cn_no ? item.cn_no : "--"}
                                                    </Link>
                                                </td>
                                                <td className="p-1 text-start truncate capitalize text-slate-500">{item.consignor_id ? item.consignor_id.company_name : "--"}</td>
                                                <td className="p-1 text-start truncate capitalize text-slate-500">{item.consignee_id ? item.consignee_id.company_name : "--"}</td>
                                                <td className="p-1 text-start truncate capitalize text-slate-500">{item.date ? item.date : "--"}</td>
                                                <td className="p-1 text-start truncate capitalize text-slate-500">{item.from_loc ? item.from_loc : "--"}</td>
                                                <td className="p-1 text-start truncate capitalize text-slate-500">{item.to_loc ? item.to_loc : "--"}</td>
                                                <td className="p-1 text-start truncate capitalize text-slate-500">{item.truck_no ? item.truck_no : "--"}</td>
                                                <td className="p-1 text-start truncate capitalize text-slate-500">{item.total_amount ? `₹ ${item.total_amount}` : "--"}</td>
                                                <td className="flex justify-center items-center gap-1 p-1 text-center w-16 truncate capitalize ">
                                                    <button
                                                        onClick={() => handlePrint(item.id)}
                                                        className="p-1 rounded text-xl text-slate-500 hover:text-yellow-500 hover:bg-yellow-500/10 active:text-yellow-700 transition"
                                                        title="Print"
                                                    >
                                                        <AiOutlinePrinter />
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </>
                                :
                                <>
                                    {
                                        <tr className="p-1 hover:bg-blue-200 dark:hover:bg-slate-600 duration-200 cursor-pointer">
                                            <td className="p-1 text-center text-slate-500" colSpan={11}>No Data Found</td>
                                        </tr>
                                    }
                                </>
                            }
                        </tbody>
                    </table>
                </MainArea>

                {/* Pagination */}
                <MainArea>
                    <div className="w-full flex justify-between items-center text-sm">
                        <div className="text-slate-600 dark:text-slate-300">Showing {start} to {end} of {total}</div>
                        <div className="flex items-center gap-1">
                            <button
                                disabled={page === 1 || total === 0}
                                onClick={() => setPage(page - 1)}
                                className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-blue-200 dark:hover:bg-slate-600 disabled:opacity-40">
                                Prev
                            </button>
                            {totalPages > 0 && [...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`px-2 py-1 rounded border ${page === i + 1 ? "bg-blue-500 text-white border-blue-500" : "border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-blue-200 dark:hover:bg-slate-600"}`}>
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                disabled={page === totalPages || total === 0}
                                onClick={() => setPage(page + 1)}
                                className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-blue-200 dark:hover:bg-slate-600 disabled:opacity-40">
                                Next
                            </button>
                        </div>
                    </div>
                </MainArea>
            </div>
        </>
    )
}

export default ViewChallan