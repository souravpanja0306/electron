import React, { useEffect, useState } from 'react';
import moment from 'moment';
import PageTitle from '../../components/PageTitle';
import ActionArea from '../../components/ActionArea';
import MainArea from '../../components/MainArea';
import CustomButton from '../../components/CustomButton';
import { inrToWords } from '../../utils/InWordConverter';
import useMoneyReceiptStore from '../../store/MoneyReceiptStore';
import usePartyStore from '../../store/PartyStore';

// Icon...
import {
    AiOutlinePlusSquare,
    AiOutlineFileAdd,
    AiOutlineMinusSquare,
    AiOutlinePrinter,
    AiOutlineTable,
    AiOutlineRollback,
} from "react-icons/ai";
import Alert from '../../components/Alert';
import { useNavigate, useSearchParams } from "react-router-dom";
import { Link, NavLink } from "react-router-dom";
import useCompanyStore from '../../store/CompnayStore';

const MoneyReceipts = () => {
    const { moneyReceipts, moneyReceiptNo, createMoneyReceipts, generateMoneyReceiptNo, loading } = useMoneyReceiptStore(); // Store...
    const { parties, getAllParty } = usePartyStore(); // Store...
    const { companyData, getAllCompany } = useCompanyStore();

    useEffect(() => {
        generateMoneyReceiptNo();
        getAllParty();
        getAllCompany();
    }, []);

    const [data, setData] = useState([
        { id: Math.floor(Math.random() * 10000000000), sl_no: "", payment_mode: "", description: "", amount: "", reference: "" },
    ]);
    const [form, setForm] = useState(
        { company_id: "", party_id: "", receipt_no: "", receipt_date: moment().format("YYYY-MM-DD"), data: data, remarks: "" }
    );

    const handleChange = (e) => {
        setForm({ ...form, receipt_no: moneyReceiptNo, [e.target.name]: e.target.value });
    };
    const handleChangeData = (e) => {
        setData((prev) =>
            prev.map((row) =>
                row.id == e.target.id ? { ...row, [e.target.name]: e.target.value } : row
            ),
        );
        setForm({ ...form, data: data, });
    };

    const handleSubmitForm = async (e) => {
        e.preventDefault();
        await createMoneyReceipts(form);
    };

    const printInvoice = (e) => {
        e.preventDefault();
        console.log(form);
    };

    const handleAddFields = () => {
        setData([...data, {
            id: Math.floor(Math.random() * 10000000000),
            sl_no: "",
            payment_mode: "",
            description: "",
            amount: "",
            reference: ""
        }]);
    };

    const handleRemoveFields = (id) => {
        let datas = data.find(item => item.id == id);
        if (datas) {
            if (datas.description != "") {
                // setAlart({
                //     show: true,
                //     title: "Error",
                //     type: "error",
                //     message: "You can’t delete this field because it contains datas."
                // });
                return;
            };
            if (datas.amount != "") {
                // setAlart({
                //     show: true,
                //     title: "Error",
                //     type: "error",
                //     message: "You can’t delete this field because it contains datas."
                // });
                return;
            };
        };
        setData(data.filter(item => item.id !== id));
    };

    return (
        <>
            <PageTitle>Create Money Receipt</PageTitle>

            <div className="flex flex-col gap-1">
                <ActionArea>
                    <div onClick={(e) => handleSubmitForm(e)}>
                        <CustomButton title={"Save (Ctrl+S)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
                    </div>
                    <Link to="/view-money-receipts">
                        <CustomButton title={"View (Ctrl+I)"} color={"blue"}><AiOutlineTable /></CustomButton>
                    </Link>
                    <div onClick={() => printInvoice()}>
                        <CustomButton title={"Print (Ctrl+P)"} color={"blue"} ><AiOutlinePrinter /></CustomButton>
                    </div>
                </ActionArea>
                <br />

                <PageTitle>Information</PageTitle>
                <MainArea>
                    <div className='flex gap-1 justify-between w-full'>

                        <div className='flex flex-col w-[250px] gap-1'>
                            <div className='flex flex-col w-full gap-1'>
                                <label className='text-xs uppercase'>Company</label>
                                <select
                                    className="p-1 rounded w-full uppercase text-slate-900 border border-slate-300 dark:border-slate-600"
                                    name="company_id"
                                    onChange={handleChange}
                                    required
                                >
                                    {companyData?.body?.map((item, index) => (
                                        <option key={item.id} value={item.id} selected={index == 0}>
                                            {item.company_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className='flex flex-col w-full gap-1'>
                                <label className='text-xs uppercase'>Receipt Name</label>
                                <select
                                    className="p-1 rounded w-full uppercase text-slate-900 border border-slate-300 dark:border-slate-600"
                                    name="party_id"
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="" disabled selected>Select Receipt</option>
                                    {parties?.body?.map(item => (
                                        <option key={item.id} value={item.id}>
                                            {item.company_name}
                                        </option>
                                    ))}
                                </select>
                                <span className='text-red-500 text-xs'>#Receipt not listed here?
                                    <Link to="/add-party?back=true" className='text-slate-800 dark:text-slate-100 hover:text-blue-600 underline'> Click to list.</Link>
                                </span>
                            </div>
                        </div>

                        <div className='flex flex-col w-[250px] gap-1'>
                            <div className='flex flex-col w-full gap-1'>
                                <label className='text-xs uppercase'>Receipt Number</label>
                                <input
                                    className="p-1 rounded w-full uppercase text-slate-900 border border-slate-300 dark:border-slate-600"
                                    type="text"
                                    name="receipt_no"
                                    value={moneyReceiptNo}
                                    onChange={handleChange}
                                    readOnly
                                    required
                                />
                            </div>
                            <div className='flex flex-col w-full gap-1'>
                                <label className='text-xs uppercase'>Date</label>
                                <input
                                    className="p-1 rounded w-full uppercase text-slate-900 border border-slate-300 dark:border-slate-600"
                                    placeholder="Date"
                                    type="date"
                                    name="receipt_date"
                                    value={form.receipt_date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </MainArea>

                <br />

                <PageTitle>Information</PageTitle>
                <MainArea>
                    <table className='w-full select-none'>
                        <thead>
                            <tr className='text-slate-600 dark:text-white text-sm font-semibold text-center'>
                                <th className='w-12'>Sl. No.</th>
                                <th className=''>Description</th>
                                <th className='w-36'>Payment Type</th>
                                <th className='w-24'>Reference No</th>
                                <th className='w-24'>Amount</th>
                                <th className='w-12'>#</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                data && data.map((item, index) => {
                                    const isLast = index === data.length - 1;
                                    return (
                                        <tr key={item.id} className='items-center text-black'>
                                            <td className=''>
                                                <input
                                                    className="w-full p-1 rounded border border-slate-300 dark:border-slate-600 text-center"
                                                    name="sl_no"
                                                    id={item.id}
                                                    value={index + 1}
                                                    onChange={(e) => handleChangeData(e)}
                                                    disabled
                                                />
                                            </td>
                                            <td className=''>
                                                <input
                                                    className="w-full p-1 rounded border border-slate-300 dark:border-slate-600 capitalize"
                                                    value={item.description}
                                                    id={item.id}
                                                    name="description"
                                                    onChange={(e) => handleChangeData(e)}
                                                    type="text"
                                                />
                                            </td>
                                            <td className=''>
                                                <div className='flex flex-col w-full gap-1'>
                                                    <select
                                                        className="w-full p-1 rounded border border-slate-300 dark:border-slate-600 uppercase"
                                                        value={item.payment_mode}
                                                        id={item.id}
                                                        name="payment_mode"
                                                        onChange={(e) => handleChangeData(e)}
                                                    >
                                                        <option selected disabled>Payment Type</option>
                                                        <option>Cash</option>
                                                        <option>UPI</option>
                                                        <option>Card</option>
                                                        <option>Bank Transfer</option>
                                                    </select>
                                                </div>
                                            </td>
                                            <td className=''>
                                                <input
                                                    className="w-full p-1 rounded border border-slate-300 dark:border-slate-600 text-right appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                    value={item.reference}
                                                    id={item.id}
                                                    name="reference"
                                                    onChange={(e) => handleChangeData(e)}
                                                    type='number'
                                                />
                                            </td>
                                            <td className=''>
                                                <input
                                                    className="w-full p-1 rounded border border-slate-300 dark:border-slate-600 text-right appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                    value={item.amount}
                                                    id={item.id}
                                                    name="amount"
                                                    onChange={(e) => handleChangeData(e)}
                                                    type='number'
                                                />
                                            </td>
                                            <td className=''>
                                                <div
                                                    className="w-full flex justify-center text-2xl cursor-pointer transition"
                                                    onClick={(e) => isLast ? handleAddFields(e) : handleRemoveFields(item.id)}
                                                >
                                                    {isLast ? (
                                                        <AiOutlinePlusSquare className="text-slate-600 hover:text-green-600" />
                                                    ) : (
                                                        <AiOutlineMinusSquare className="text-slate-600 hover:text-red-600" />
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </MainArea>

                <div className='flex gap-1'>
                    <div className='w-3/4'>
                        <PageTitle>Additonal Info</PageTitle>
                        <MainArea>
                            <div className='flex gap-1 justify-between w-full'>
                                <div className='flex flex-col w-[250px] gap-1'>
                                    <div className='flex flex-col w-full gap-1'>
                                        <label className='text-xs uppercase'>Remarks or Note</label>
                                        <textarea
                                            className="p-1 rounded w-full text-slate-900 border border-slate-300 dark:border-slate-600"
                                            placeholder="Remarks"
                                            type="text"
                                            name="remarks"
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </MainArea>
                    </div>

                    <div className='w-1/4'>
                        <PageTitle>Summary</PageTitle>
                        <MainArea>
                            <div className='flex flex-col justify-end gap-1 w-full'>
                                <div className='flex flex-col w-full gap-1'>
                                    <label className='text-xs uppercase'>Total Value</label>
                                    <input
                                        className="p-1 rounded w-full uppercase text-slate-900 border border-slate-300 dark:border-slate-600 text-end font-bold"
                                        type="number"
                                        // value={parseFloat(grandTotal.total_value).toFixed(2)}
                                        readOnly
                                    />
                                </div>
                            </div>
                        </MainArea>
                    </div>
                </div>
            </div>
        </>
    )
}

export default MoneyReceipts