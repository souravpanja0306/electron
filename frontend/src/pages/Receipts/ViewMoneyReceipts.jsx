import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { toast } from 'sonner';

// Icon...
import { AiOutlineFileAdd, AiOutlineSync, AiOutlinePrinter, AiOutlineDownload, AiOutlineMeh } from "react-icons/ai";

// Components...
import PageTitle from '../../components/PageTitle';
import ActionArea from '../../components/ActionArea';
import MainArea from '../../components/MainArea';
import CustomButton from '../../components/CustomButton';
import CustomLoader from "../../components/CustomLoader";

// Stores...
import useInvoiceStore from '../../store/InvoiceStore';
import useCompanyStore from "../../store/CompanyStore";
import usePartyStore from "../../store/PartyStore"
import useMoneyReceiptStore from '../../store/MoneyReceiptStore';
import useAuthStore from '../../store/AuthStore';

const ViewMoneyReceipts = () => {
    const { moneyReceipts, getAllMoneyReceipts, printMoneyReceipt, deleteMoneyReceipts, loading, downloadLoading } = useMoneyReceiptStore(); // Store...
    const { authToken, token } = useAuthStore(); // Store...

    const navigate = useNavigate();
    const [alart, setAlart] = useState({ show: false });
    const [page, setPage] = useState(1);

    useEffect(() => {
        authToken();
        getAllMoneyReceipts(token);
    }, []);

    const [checkedIds, setCheckedIds] = useState(null);
    const handleChecked = (e, id) => {
        setCheckedIds(null);
        if (e.target.checked) setCheckedIds(id);
    };

    const handleDelete = async () => {
        try {
            if (checkedIds == null) toast("Please select which one you want to delete.", { theme: "dark" });
            let result = await deleteMoneyReceipts({ id: checkedIds, token: token });
            if (result) {
                getAllMoneyReceipts(token);
            };
            toast(result.message, { theme: "dark" });
        } catch (error) {
            console.log(error);
        };
    };

    const handlePrint = async (id) => {
        try {
            toast.info("Generating Print View...");
            let result = await printMoneyReceipt({ id, token });
            if (result.status === 200) {
                const newWindow = window.open();
                newWindow.document.write(result.body.html);
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
                navigate("/create-moeny-receipts");
            };

            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                handleDelete()
            };
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [checkedIds]);



    const limit = 10;
    const total = moneyReceipts?.body?.length || 0;
    const totalPages = Math.ceil(total / limit);

    const start = total === 0 ? 0 : (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);

    if (loading) return <CustomLoader />;
    return (
        <>
            <PageTitle>All Money Receipts</PageTitle>
            <div className='flex flex-col gap-1'>
                <ActionArea>
                    <div className="flex justify-between w-full">
                        <div className="flex gap-1">
                            <Link to="/create-moeny-receipts">
                                <CustomButton title={"New (Ctrl+N)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
                            </Link>
                            <div onClick={() => handleDelete()} className={`${!checkedIds ? "hidden" : "block"}`}>
                                <CustomButton title={"Delete (Ctrl+D)"} color={"red"}><AiOutlineFileAdd /></CustomButton>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <div onClick={() => getAllMoneyReceipts(token)}>
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
                                <th className="p-1 text-start truncate">Receipt No</th>
                                <th className="p-1 text-start truncate">Receipt Date</th>
                                <th className="p-1 text-start truncate">Party</th>
                                <th className="p-1 text-start truncate">Value</th>
                                <th className="p-1 text-start truncate">Remark</th>
                                <th className="p-1 text-center w-16 text-slate-500">#</th>
                            </tr>
                        </thead>
                        <tbody>
                            {moneyReceipts?.body && moneyReceipts?.body?.length
                                ?
                                <>
                                    {moneyReceipts?.body?.map((item, index) => {
                                        return (
                                            <tr key={item.id} className="border-b border-slate-300 p-1 hover:bg-blue-200 dark:hover:bg-slate-600 duration-200 cursor-pointer text-sm">
                                                <td className="p-1 text-start truncate capitalize">
                                                    <input
                                                        type="checkbox"
                                                        onChange={(e) => handleChecked(e, item.id)}
                                                        checked={checkedIds === item.id}
                                                    />
                                                </td>
                                                <td className="p-1 text-start truncate capitalize hover:underline hover:text-slate-600 dark:hover:text-slate-300">
                                                    <Link to={`/view-money-receipt/details?id=${item.id}&back=true`}>
                                                        {item.receipt_no ? item.receipt_no : "--"}
                                                    </Link>
                                                </td>
                                                <td className="p-1 text-start truncate capitalize text-slate-500">{item.receipt_date ? item.receipt_date : "--"}</td>
                                                <td className="p-1 text-start truncate capitalize text-slate-500">{item.party_id ? item.party_id.name : "--"}</td>
                                                <td className="p-1 text-start truncate capitalize text-slate-500">{item.total_value ? `₹ ${(parseFloat(item.total_value)).toFixed(2)}` : "--"}</td>
                                                <td className="p-1 text-start truncate capitalize text-slate-500">{item.remarks ? item.remarks : "--"}</td>
                                                <td className="flex justify-center items-center gap-2 p-1 w-16">
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
                                        <tr className="p-1 hover:bg-blue-200 dark:hover:bg-slate-600 duration-200 cursor-pointer text-sm">
                                            <td className="p-1 text-center text-slate-500" colSpan={7}>No Data Found</td>
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
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                                className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-blue-200 dark:hover:bg-slate-600 disabled:opacity-40">
                                Prev
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`px-2 py-1 rounded border ${page === i + 1 ? "bg-blue-500 text-white border-blue-500" : "border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-blue-200 dark:hover:bg-slate-600"}`}>
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                disabled={page === totalPages}
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

export default ViewMoneyReceipts