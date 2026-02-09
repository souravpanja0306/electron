import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import useMoneyReceiptStore from '../../store/MoneyReceiptStore';

// Icon...
import { AiOutlineFileAdd, AiOutlineSync, AiOutlinePrinter, AiOutlineDownload, AiOutlineMeh } from "react-icons/ai";

// Components...
import PageTitle from '../../components/PageTitle';
import ActionArea from '../../components/ActionArea';
import MainArea from '../../components/MainArea';
import CustomButton from '../../components/CustomButton';
import CustomLoader from "../../components/CustomLoader";
import Alert from '../../components/Alert';

const ViewMoneyReceipts = () => {
    const isAuth = localStorage.getItem("token");
    const { moneyReceipts, getAllMoneyReceipts, downloadMoneyReceipts, loading, downloadLoading } = useMoneyReceiptStore(); // Store...

    const navigate = useNavigate();
    const [alart, setAlart] = useState({ show: false });

    useEffect(() => {
        getAllMoneyReceipts(isAuth);
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
    };

    const importMoneyReceipts = async (id) => {
        let result = await downloadMoneyReceipts(id);
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

    if (loading) return <CustomLoader />;
    return (
        <>
            <PageTitle>View All Invoice</PageTitle>
            <div className='flex flex-col gap-1'>
                <ActionArea>
                    <div className="flex justify-between w-full">
                        <div className="flex gap-1">
                            <Link to="/create-moeny-receipts">
                                <CustomButton title={"New (Ctrl+N)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
                            </Link>
                            <div>
                                <CustomButton title={"Delete (Ctrl+D)"} color={"red"}><AiOutlineFileAdd /></CustomButton>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <div onClick={() => getAllMoneyReceipts(isAuth)}>
                                <CustomButton title={"Refrash"} color={"blue"}><AiOutlineSync /></CustomButton>
                            </div>
                        </div>
                    </div>
                </ActionArea>
                <MainArea>
                    <table className="table-fixed w-full overflow-auto">
                        <thead>
                            <tr className="border-b border-slate-300 p-1 text-slate-600 dark:text-white text-sm font-semibold text-center">
                                <th className="p-1 text-start w-8">
                                    <input type="checkbox" onChange={(e) => handleSelectAll(e)} />
                                </th>
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
                                                        checked={item.is_selected}
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
                                                                className="p-1 rounded-md text-xl text-slate-500 hover:text-yellow-500 hover:bg-yellow-500/10 active:text-yellow-700 transition"
                                                                title="Loading"
                                                            >
                                                                <AiOutlineMeh />
                                                            </button>
                                                            :
                                                            <button
                                                                onClick={() => importMoneyReceipts(item.id)}
                                                                className="p-1 rounded-md text-xl text-slate-500 hover:text-yellow-500 hover:bg-yellow-500/10 active:text-yellow-700 transition"
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

export default ViewMoneyReceipts