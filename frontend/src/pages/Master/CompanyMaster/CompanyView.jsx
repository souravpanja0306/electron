import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { toast } from 'sonner';

// Icon...
import {
    AiOutlineFileAdd,
    AiOutlineSync,
    AiOutlineFilter,
    AiOutlineDelete
} from "react-icons/ai";

// Components...
import PageTitle from '../../../components/PageTitle';
import ActionArea from '../../../components/ActionArea';
import MainArea from '../../../components/MainArea';
import CustomButton from '../../../components/CustomButton';
import CustomLoader from "../../../components/CustomLoader";

// Stores...
import useCompanyStore from "../../../store/CompanyStore";
import useAuthStore from "../../../store/AuthStore";

const ViewCompany = () => {
    const { companyData, getAllCompany, deleteCompany, companyLoading } = useCompanyStore();
    const { authToken, token } = useAuthStore();

    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [checkedIds, setCheckedIds] = useState([]);

    useEffect(() => {
        if (token) {
            getAllCompany(token);
        } else {
            authToken();
        }
    }, [token]);

    const handleChecked = (e, id) => {
        if (e.target.checked) {
            setCheckedIds([...checkedIds, id]);
        } else {
            setCheckedIds(checkedIds.filter(itemId => itemId !== id));
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = companyData.map(item => item.id);
            setCheckedIds(allIds);
        } else {
            setCheckedIds([]);
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this record? This cannot be undone.")) {
            try {
                if (!checkedIds.length) {
                    toast.warning("Please select an item to delete.");
                    return;
                }
                if (window.confirm("Are you sure you want to delete selected companies?")) {
                    let result = await deleteCompany({ ids: checkedIds, token: token });
                    if (result.status === 200) {
                        toast.success(result.message);
                        setCheckedIds([]);
                        getAllCompany(token);
                    } else {
                        toast.error(result.message);
                    };
                };
            } catch (error) {
                console.log(error);
                toast.error("Something went wrong!");
            };
        };
    };

    const handleRefresh = () => {
        getAllCompany(token);
        toast.info("Company Data Refreshing.");
    };

    useEffect(() => {
        const onKey = (e) => {
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                navigate("/add-company");
            };

            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                handleDelete()
            };

            if (e.ctrlKey && e.key === 'e') {
                e.preventDefault();
                if (checkedIds.length === 1) {
                    navigate(`/edit-company/${checkedIds[0]}`);
                } else {
                    toast.warning("Please select exactly one company to edit.");
                }
            };
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [checkedIds]);

    const limit = 10;
    const total = companyData?.length || 0;
    const totalPages = Math.ceil(total / limit);

    const start = total === 0 ? 0 : (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);

    const currentData = companyData?.slice((page - 1) * limit, page * limit) || [];

    if (companyLoading) return <CustomLoader />;

    return (
        <>
            <PageTitle>View All Company</PageTitle>
            <div className='flex flex-col gap-1'>
                <ActionArea>
                    <div className="flex justify-between w-full">
                        <div className="flex gap-1">
                            <Link to="/add-company">
                                <CustomButton title={"New (Ctrl+N)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
                            </Link>
                            <div onClick={handleDelete} className={`${!checkedIds.length ? "hidden" : "block"}`}>
                                <CustomButton title={"Delete (Ctrl+D)"} color={"red"}><AiOutlineDelete /></CustomButton>
                            </div>
                            <div className={`${checkedIds.length === 1 ? "block" : "hidden"}`}>
                                <Link to={`/edit-company/${checkedIds[0]}`}>
                                    <CustomButton title={"Edit (Ctrl+E)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
                                </Link>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <div onClick={handleRefresh}>
                                <CustomButton title={"Refresh"} color={"blue"}><AiOutlineSync /></CustomButton>
                            </div>
                            <div>
                                <CustomButton title={"Filter"} color={"blue"}><AiOutlineFilter /></CustomButton>
                            </div>
                        </div>
                    </div>
                </ActionArea>

                <MainArea>
                    <table className="table-fixed w-full">
                        <thead>
                            <tr className="border-b border-slate-300 dark:border-slate-600 p-1 text-slate-600 dark:text-white text-sm font-semibold">
                                <th className="p-1 text-start truncate w-16">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={checkedIds.length === companyData.length && companyData.length > 0}
                                    />
                                </th>
                                <th className="p-1 text-start truncate w-16">Logo</th>
                                <th className="p-1 text-start truncate">Company</th>
                                <th className="p-1 text-start truncate">Mobile</th>
                                <th className="p-1 text-start truncate">Email</th>
                                <th className="p-1 text-start truncate">Owner</th>
                                <th className="p-1 text-start truncate">Pan</th>
                                <th className="p-1 text-start truncate">GST</th>
                                <th className="p-1 text-start truncate">Trade Licence</th>
                                <th className="p-1 text-start truncate">Bank a/c No</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                currentData && currentData.length
                                    ?
                                    <>
                                        {
                                            currentData.map((item, index) => {
                                                return (
                                                    <tr key={item.id} className="border-b border-slate-300 p-1 hover:bg-blue-200 dark:hover:bg-slate-600 duration-200 cursor-pointer text-sm text-slate-500 dark:text-slate-300">
                                                        <td className="p-1 text-start truncate">
                                                            <input
                                                                type="checkbox"
                                                                onChange={(e) => handleChecked(e, item.id)}
                                                                checked={checkedIds.includes(item.id)}
                                                            />
                                                        </td>
                                                        <td className="p-1 text-start truncate">
                                                            {item.logo ? <img src={`${item.logo}`} alt="Logo" className="w-10 h-10 object-contain" /> : "--"}
                                                        </td>
                                                        <td className="p-1 text-start truncate capitalize hover:underline hover:text-blue-500">
                                                            <Link to={`/view-company-details/${item.id}?back=true`}>
                                                                {item.company_name ? item.company_name : "--"}
                                                            </Link>
                                                        </td>
                                                        <td className="p-1 text-start truncate">{item.mobile ? item.mobile : "--"}</td>
                                                        <td className="p-1 text-start truncate">{item.email ? item.email : "--"}</td>
                                                        <td className="p-1 text-start truncate capitalize">{item.owner ? item.owner : "--"}</td>
                                                        <td className="p-1 text-start truncate uppercase">{item.pan ? item.pan : "--"}</td>
                                                        <td className="p-1 text-start truncate uppercase">{item.gst ? item.gst : "--"}</td>
                                                        <td className="p-1 text-start truncate uppercase">{item.trade_licence ? item.trade_licence : "--"}</td>
                                                        <td className="p-1 text-start truncate">{item.account_no ? item.account_no : "--"}</td>
                                                    </tr>
                                                )
                                            })
                                        }
                                    </>
                                    :
                                    <>
                                        {
                                            <tr className="p-1 hover:bg-blue-200 dark:hover:bg-slate-600 duration-200 cursor-pointer">
                                                <td className="p-1 text-center" colSpan={10}>No Company Found</td>
                                            </tr>
                                        }
                                    </>
                            }
                        </tbody>
                    </table>
                </MainArea>

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
            </div >
        </>
    )
}

export default ViewCompany