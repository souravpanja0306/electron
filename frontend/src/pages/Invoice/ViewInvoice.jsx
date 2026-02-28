import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';

// Icon...
import {
    AiOutlineFileAdd,
    AiOutlineSync,
    AiOutlinePrinter,
    AiOutlineDownload,
    AiOutlineFilter,
    AiOutlineDelete
} from "react-icons/ai";

// Components...
import PageTitle from '../../components/PageTitle';
import ActionArea from '../../components/ActionArea';
import MainArea from '../../components/MainArea';
import CustomButton from '../../components/CustomButton';
import CustomLoader from "../../components/CustomLoader";

// Stores...
import useInvoiceStore from '../../store/InvoiceStore';
import useMoneyReceiptStore from "../../store/MoneyReceiptStore";
import useCompanyStore from "../../store/CompnayStore";
import usePartyStore from "../../store/PartyStore"


const ViewInvoices = () => {
    let token = localStorage.getItem("token");
    const { moneyReceipts, moneyReceiptNo, createMoneyReceipts, generateMoneyReceiptNo, loading } = useMoneyReceiptStore();
    const { invoiceData, getAllInvoice, deleteInvoice, printInvoice, invoiceLoading } = useInvoiceStore();
    const { companyData, getAllCompany } = useCompanyStore();
    const { parties, getAllParty, partyLoading } = usePartyStore();

    const navigate = useNavigate();
    const [alart, setAlart] = useState({ show: false });

    useEffect(() => {
        getAllInvoice({ token: token });
    }, []);

    const [checkedIds, setCheckedIds] = useState(null);
    const handleChecked = (e, id) => {
        setCheckedIds(null);
        if (e.target.checked) setCheckedIds(id);
    };

    const handleDelete = async () => {
        try {
            if (checkedIds == null) toast("Please select which one you want to delete.", { theme: "dark" });
            let result = await deleteInvoice({ id: checkedIds, token: token });
            if (result) {
                getAllInvoice({ token: token });
            };
            toast(result.message, { theme: "dark" });
        } catch (error) {
            console.log(error);
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

    if (invoiceLoading) return <CustomLoader />;
    return (
        <>
            <PageTitle>View All Invoice</PageTitle>
            <div className='flex flex-col gap-1'>
                <ActionArea>
                    <div className="flex justify-between w-full">
                        <div className="flex gap-1">
                            <Link to="/create-invoice">
                                <CustomButton title={"New (Ctrl+N)"} color={"green"}><AiOutlineFileAdd /></CustomButton>
                            </Link>
                            <div onClick={(e) => handleDelete(e)} className={`${!checkedIds ? "hidden" : "block"}`}>
                                <CustomButton title={"Delete (Ctrl+D)"} color={"red"}><AiOutlineDelete /></CustomButton>
                            </div>
                            <div onClick={(e) => handleDelete(e)}>
                                <CustomButton title={"Export (Ctrl+E)"} color={"blue"}><AiOutlineDownload /></CustomButton>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <div onClick={(e) => getAllInvoice({ token: token })}>
                                <CustomButton title={"Refrash"} color={"blue"}><AiOutlineSync /></CustomButton>
                            </div>
                            <div onClick={(e) => getAllInvoice({ token: token })}>
                                <CustomButton title={"Filter"} color={"blue"}><AiOutlineFilter /></CustomButton>
                            </div>
                        </div>
                    </div>
                </ActionArea>
                <MainArea>
                    <table className="table-fixed w-full overflow-auto">
                        <thead>
                            <tr className="border-b border-slate-300 p-1 text-slate-600 dark:text-white text-sm font-semibold text-center">
                                <th className="p-1 text-start text-slate-500">Select</th>
                                <th className="p-1 text-start text-slate-500">Invoice No</th>
                                <th className="p-1 text-start text-slate-500">Bill To</th>
                                <th className="p-1 text-start text-slate-500">Date</th>
                                <th className="p-1 text-start text-slate-500">Quantity</th>
                                <th className="p-1 text-start text-slate-500">SGST</th>
                                <th className="p-1 text-start text-slate-500">CGST</th>
                                <th className="p-1 text-start text-slate-500">IGST</th>
                                <th className="p-1 text-start text-slate-500">Total</th>
                                <th className="p-1 text-start text-slate-500">Trasnporter</th>
                                <th className="p-1 text-center w-16 text-slate-500">#</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceData.body && invoiceData.body.length
                                ?
                                <>
                                    {invoiceData?.body?.map((item, index) => {
                                        return (
                                            <tr key={item.id} className="border-b border-slate-300 p-1 hover:bg-blue-200 dark:hover:bg-slate-600 duration-200 cursor-pointer">
                                                <td className="p-1 text-start truncate capitalize">
                                                    <input
                                                        type="checkbox"
                                                        checked={checkedIds === item.id}
                                                        onChange={(e) => handleChecked(e, item.id)}
                                                    />
                                                </td>
                                                <td className="p-1 text-start truncate capitalize hover:underline text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                                                    <Link to={`/view-invoice/details?id=${item.id}&back=true`}>
                                                        {item.invoice_no ? item.invoice_no : "--"}
                                                    </Link>
                                                </td>
                                                <td className="p-1 text-start truncate capitalize text-slate-500">{item.party_id ? item.party_id.company_name : "--"}</td>
                                                <td className="p-1 text-start truncate capitalize text-slate-500">{item.invoice_date ? item.invoice_date : "--"}</td>
                                                <td className="p-1 text-start truncate capitalize text-slate-500">{item.total_quantity ? item.total_quantity : "--"}</td>
                                                <td className="p-1 text-start truncate capitalize text-slate-500">{item.total_sgst ? item.total_sgst : "--"}</td>
                                                <td className="p-1 text-start truncate capitalize text-slate-500">{item.total_cgst ? item.total_cgst : "--"}</td>
                                                <td className="p-1 text-start truncate capitalize text-slate-500">{item.total_igst ? item.total_igst : "--"}</td>
                                                <td className="p-1 text-start truncate capitalize text-slate-500">{item.total_amount ? (parseFloat(item.total_amount)).toFixed(2) : "--"}</td>
                                                <td className="p-1 text-start truncate capitalize text-slate-500">{item.transporter ? item.transporter : "--"}</td>
                                                <td className="flex justify-center items-center gap-1 p-1 text-center w-16 truncate capitalize ">
                                                    <button
                                                        className="p-1 rounded text-xl text-slate-500 hover:text-yellow-500 hover:bg-yellow-500/10 active:text-yellow-700 transition"
                                                        title="Download"
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
                                            <td className="p-1 text-center" colSpan={11}>No Data Found</td>
                                        </tr>
                                    }
                                </>
                            }
                        </tbody>
                    </table>
                </MainArea>
            </div >
            <ToastContainer />
        </>
    )
}

export default ViewInvoices