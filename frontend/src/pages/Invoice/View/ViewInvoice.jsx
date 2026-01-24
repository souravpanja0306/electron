import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";


// Icon...
import { AiOutlineFileAdd, AiOutlineSync, AiOutlinePrinter, AiOutlineDownload  } from "react-icons/ai";

// Components...
import PageTitle from '../../../components/PageTitle';
import ActionArea from '../../../components/ActionArea';
import MainArea from '../../../components/MainArea';
import CustomButton from '../../../components/CustomButton';
import Alert from '../../../components/Alert';

// Service...
import { handleGetParty, handleGetAllInvoice } from "./ViewInvoiceService"


const ViewInvoices = () => {
    const navigate = useNavigate();
    const [alart, setAlart] = useState({ show: false });
    const [invoices, setInvoices] = useState([]);

    const getAllInvoice = async () => {
        let result = await handleGetAllInvoice({});
        setInvoices(result);
    };

    useEffect(() => {
        getAllInvoice();
    }, []);

    const [checkedIds, setCheckedIds] = useState([]);
    const handleChecked = (e, id) => {
        // setParty(prev =>
        //     prev.map(item =>
        //         item.id === id ? { ...item, is_selected: e.target.checked } : item
        //     )
        // );
        // setCheckedIds(prev =>
        //     e.target.checked ? [...prev, id] : prev.filter(itemId => itemId !== id)
        // );
    };

    const handleSelectAll = (e) => {
        // const checked = e.target.checked;
        // setParty(prev =>
        //     prev.map(item => ({ ...item, is_selected: checked })),
        // );
        // setCheckedIds(checked ? party.map(item => item.id) : []);
    };

    const handleDelete = async () => {
        try {
            // if (!checkedIds.length) {
            //     setAlart({
            //         show: true,
            //         title: "Error",
            //         type: "error",
            //         message: "Please select data."
            //     });
            // } else {
            //     await window.api.deleteParty({ ids: checkedIds }).then((res) => {
            //         if (res.status === 200) {
            //             setCheckedIds([])
            //         };
            //     });
            //     await window.api.getParty({}).then((data) => {
            //         setParty(data.body);
            //     });

            // };
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
                            <div onClick={(e) => handleDelete(e)}>
                                <CustomButton title={"Delete (Ctrl+D)"} color={"red"}><AiOutlineFileAdd /></CustomButton>
                            </div>
                            <div onClick={(e) => handleDelete(e)}>
                                <CustomButton title={"Export (Ctrl+E)"} color={"green"}><AiOutlineDownload  /></CustomButton>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <div onClick={(e) => getAllInvoice(e)}>
                                <CustomButton title={"Refrash"} color={"green"}><AiOutlineSync /></CustomButton>
                            </div>
                        </div>
                    </div>
                </ActionArea>
                <MainArea>
                    <table className="table-fixed w-full">
                        <thead>
                            <tr className="border-b border-slate-600 p-1 ">
                                <th className="p-1 text-start w-8">
                                    <input type="checkbox" onChange={(e) => handleSelectAll(e)} />
                                </th>
                                <th className="p-1 text-start">Invoice No</th>
                                <th className="p-1 text-start">Bill To</th>
                                <th className="p-1 text-start">Date</th>
                                <th className="p-1 text-start">Amount</th>
                                <th className="p-1 text-start">Trasnporter</th>
                                <th className="p-1 text-start w-8">#</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                invoices && invoices.length
                                    ?
                                    <>
                                        {
                                            invoices.map((item, index) => {
                                                return (
                                                    <tr key={item.id} className="border-b border-slate-600 p-1 hover:bg-slate-600 duration-200 cursor-pointer">
                                                        <td className="p-1 text-start truncate capitalize">
                                                            <input
                                                                type="checkbox"
                                                                onChange={(e) => handleChecked(e, item.id)}
                                                                checked={item.is_selected}
                                                            />
                                                        </td>
                                                        <td className="p-1 text-start truncate capitalize hover:underline hover:text-slate-300">
                                                            <Link to={`/`}>
                                                                {item.invoice_no ? item.invoice_no : "--"}
                                                            </Link>
                                                        </td>
                                                        <td className="p-1 text-start truncate capitalize">{item.party_id ? item.party_id : "--"}</td>
                                                        <td className="p-1 text-start truncate capitalize">{item.invoice_date ? item.invoice_date : "--"}</td>
                                                        <td className="p-1 text-start truncate capitalize">{item.total_amount ? item.total_amount : "--"}</td>
                                                        <td className="p-1 text-start truncate capitalize">{item.transporter ? item.transporter : "--"}</td>
                                                        <td className="p-1 text-start truncate capitalize w-8 hover:text-green-500 active:text-red-500">
                                                            <AiOutlinePrinter />
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        }
                                    </>
                                    :
                                    <>
                                        {
                                            <tr className="border-b border-slate-600 p-1 hover:bg-slate-600 duration-200 cursor-pointer">
                                                <td className="p-1 text-center" colSpan={9}>No Data Found</td>
                                            </tr>
                                        }
                                    </>
                            }
                        </tbody>
                    </table>
                </MainArea>
            </div >

            <Alert
                open={alart.show}
                type={alart.type}
                title={alart.title}
                message={alart.message}
                onClose={() => setAlart({ ...alart, show: false })}
            />
        </>
    )
}

export default ViewInvoices