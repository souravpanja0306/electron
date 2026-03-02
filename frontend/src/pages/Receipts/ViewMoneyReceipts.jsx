import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';

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
import useCompanyStore from "../../store/CompnayStore";
import usePartyStore from "../../store/PartyStore"
import useMoneyReceiptStore from '../../store/MoneyReceiptStore';

const ViewMoneyReceipts = () => {
    let token = localStorage.getItem("token");
    const { moneyReceipts, getAllMoneyReceipts, downloadMoneyReceipts, deleteMoneyReceipts, loading, downloadLoading } = useMoneyReceiptStore(); // Store...

    const navigate = useNavigate();
    const [alart, setAlart] = useState({ show: false });
    const [page, setPage] = useState(1);

    useEffect(() => {
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

    const importMoneyReceipts = async (id) => {
        let result = await downloadMoneyReceipts({ id: id, token: token });
        if (result.status == 200) {
            window.open(result.body.downloadLink, "_black");
        };
    };

    useEffect(() => {
        const onKey = (e) => {
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                navigate("/create-invoice");
            };

            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                handleDelete()
            };
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);



    const limit = 10;
    const total = moneyReceipts?.total || 0;
    const totalPages = Math.ceil(total / limit);

    const start = (page - 1) * limit + 1;
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
                                <th className="p-1 text-start truncate">Select</th>
                                <th className="p-1 text-start truncate">Receipt No</th>
                                <th className="p-1 text-start truncate">Receipt Date</th>
                                <th className="p-1 text-start truncate">Party</th>
                                <th className="p-1 text-start truncate">Value</th>
                                <th className="p-1 text-start truncate">Remark</th>
                                <th className="p-1 text-center w-16">#</th>
                            </tr>
                        </thead>
                        <tbody>
                            {moneyReceipts?.body && moneyReceipts?.body?.length
                                ?
                                <>
                                    {moneyReceipts?.body?.map((item, index) => {
                                        return (
                                            <tr key={item.id} className="border-b border-slate-300 p-1 hover:bg-blue-200 dark:hover:bg-slate-600 duration-200 cursor-pointer">
                                                <td className="p-1 text-start truncate capitalize">
                                                    <input
                                                        type="checkbox"
                                                        onChange={(e) => handleChecked(e, item.id)}
                                                        checked={checkedIds === item.id}
                                                    />
                                                </td>
                                                <td className="p-1 text-start truncate capitalize hover:underline hover:text-slate-600 dark:hover:text-slate-300">
                                                    <Link to={`/view-invoice/details?id=${item.id}&back=true`}>
                                                        {item.receipt_no ? item.receipt_no : "--"}
                                                    </Link>
                                                </td>
                                                <td className="p-1 text-start truncate capitalize">{item.receipt_date ? item.receipt_date : "--"}</td>
                                                <td className="p-1 text-start truncate capitalize">{item.party_id ? item.party_id.name : "--"}</td>
                                                <td className="p-1 text-start truncate capitalize">{item.total_value ? (parseFloat(item.total_value)).toFixed(2) : "--"}</td>
                                                <td className="p-1 text-start truncate capitalize">{item.remarks ? item.remarks : "--"}</td>
                                                <td className="flex justify-center items-center gap-2 p-1 w-16">
                                                    {
                                                        downloadLoading ?
                                                            <button
                                                                className="p-1 rounded text-xl text-slate-500 hover:text-yellow-500 hover:bg-yellow-500/10 active:text-yellow-700 transition"
                                                                title="Loading"
                                                            >
                                                                <AiOutlineMeh />
                                                            </button>
                                                            :
                                                            <button
                                                                onClick={() => importMoneyReceipts(item.id)}
                                                                className="p-1 rounded text-xl text-slate-500 hover:text-yellow-500 hover:bg-yellow-500/10 active:text-yellow-700 transition"
                                                                title="Download"
                                                            >
                                                                <AiOutlinePrinter />
                                                            </button>
                                                    }
                                                </td>

                                            </tr>
                                        )
                                    })}
                                </>
                                :
                                <>
                                    {
                                        <tr className="p-1 hover:bg-blue-200 dark:hover:bg-slate-600 duration-200 cursor-pointer">
                                            <td className="p-1 text-center" colSpan={9}>No Data Found</td>
                                        </tr>
                                    }
                                </>
                            }
                        </tbody>
                    </table>
                </MainArea>

                <div className="flex justify-between items-center mt-3 px-2 py-2 text-sm">
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

            </div >
        </>
    )
}

export default ViewMoneyReceipts