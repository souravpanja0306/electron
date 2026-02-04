import React, { useEffect, useState } from 'react';
import PageTitle from '../../components/PageTitle';
import ActionArea from '../../components/ActionArea';
import MainArea from '../../components/MainArea';
import CustomButton from '../../components/CustomButton';
import { inrToWords } from '../../utils/InWordConverter';

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


// Functions...
import { handleSubmit, handleGetParty, handleGenerateMoneyReceiptNo, printInvoice } from "./MoneyReceiptService";


const MoneyReceipts = () => {
    const [searchParams] = useSearchParams();
    const back = searchParams.get("back");
    const [party, setParty] = useState([]);

    const [form, setForm] = useState({
        company_id: "",
        party_id: "",
        receipt_no: "",
        receipt_date: "",
        data: [
            { sl_no: "", },
            { sl_no: "", },
            { sl_no: "", },
        ],
        payment_mode: "",
        reference_no: "",
        remarks: "",
    });
    

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmitForm = (e) => {
        e.preventDefault();
        console.log(form);
    };
    const printInvoice = (e) => {
        e.preventDefault();
        console.log(form);
    };
    const handleAddFields = (e) => {
        e.preventDefault();
        console.log(form);
    };
    const handleRemoveFields = (e) => {
        e.preventDefault();
        console.log(form);
    };



    return (
        <>
            <PageTitle>Create Money Receipt</PageTitle>

            <div className="flex flex-col gap-1">
                <ActionArea>
                    <div>
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
                                <label className='text-xs uppercase'>Bill To</label>
                                <select
                                    className="p-1 rounded-md w-full uppercase text-slate-900"
                                    // value={invoiceDetails.billTo}
                                    // onChange={(e) =>
                                    //     setInvoiceDetails({ ...invoiceDetails, billTo: e.target.value })
                                    // }
                                    required
                                >
                                    <option value="" disabled>Select Party</option>
                                    {party?.map(item => (
                                        <option key={item.id} value={item.id}>
                                            {item.company_name}
                                        </option>
                                    ))}
                                </select>
                                <span className='text-red-500 text-xs'>#Party not listed here?
                                    <Link to="/add-party?back=true" className='text-white hover:text-blue-600 underline'> Click to list.</Link>
                                </span>
                            </div>
                        </div>

                        <div className='flex flex-col w-[250px] gap-1'>
                            <div className='flex flex-col w-full gap-1'>
                                <label className='text-xs uppercase'>Receipt Number</label>
                                <input
                                    className="p-1 rounded-md w-full uppercase text-slate-900"
                                    type="text"
                                    readOnly
                                    required
                                />
                            </div>
                            <div className='flex flex-col w-full gap-1'>
                                <label className='text-xs uppercase'>Date</label>
                                <input
                                    className="p-1 rounded-md w-full uppercase text-slate-900"
                                    placeholder="Date"
                                    type="date"
                                    name="date"
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    {/* <form
                        onSubmit={handleSubmitForm}
                        className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow space-y-4"
                    >
                        <h2 className="text-xl font-semibold">Money Receipt</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input name="company_id" placeholder="Company ID" className="input" onChange={handleChange} />
                            <input name="party_id" placeholder="Party ID" className="input" onChange={handleChange} />

                            <input name="receipt_no" placeholder="Receipt No" className="input" onChange={handleChange} />
                            <input type="date" name="receipt_date" className="input" onChange={handleChange} />

                            <input type="number" name="amount" placeholder="Amount" required className="input" onChange={handleChange} />

                            <select name="payment_mode" className="input" onChange={handleChange}>
                                <option value="">Payment Mode</option>
                                <option>Cash</option>
                                <option>UPI</option>
                                <option>Card</option>
                                <option>Bank Transfer</option>
                            </select>

                            <input name="reference_no" placeholder="Reference No" className="input" onChange={handleChange} />
                        </div>

                        <textarea
                            name="remarks"
                            placeholder="Remarks"
                            className="input h-20"
                            onChange={handleChange}
                        />

                        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                            Save Receipt
                        </button>
                    </form> */}
                </MainArea>
                <br />

                <PageTitle>Information</PageTitle>
                <MainArea>
                    <table className='w-full select-none'>
                        <thead>
                            <tr className='text-white text-sm font-semibold text-center'>
                                <th className='w-12'>Sl. No.</th>
                                <th className=''>Description</th>
                                <th className='w-36'>Payment Type</th>
                                <th className='w-24'>Amount</th>
                                <th className='w-12'>#</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                form && form.data.map((item, index) => {
                                    const isLast = index === form.data.length - 1;
                                    return (
                                        <tr key={item.id} className='items-center text-black'>
                                            <td className=''>
                                                <input
                                                    className="w-full p-1 rounded-md border border-slate-600 text-center"
                                                    value={index + 1}
                                                    disabled
                                                />
                                            </td>
                                            <td className=''>
                                                <input
                                                    className="w-full p-1 rounded-md border border-slate-600 capitalize"
                                                    value={item.description}
                                                    onChange={(e) => handleChange({ value: e.target.value, id: item.id, key: "description" })}
                                                    type="text"
                                                />
                                            </td>
                                            <td className=''>
                                                <div className='flex flex-col w-full gap-1'>
                                                    <select
                                                        className="w-full p-1 rounded-md border border-slate-600 uppercase"
                                                        defaultValue=""
                                                        onChange={(e) => handleChange({ value: e.target.value, id: item.id, key: "hsn" })}
                                                    >
                                                        <option selected disabled>Select Payment Type</option>
                                                        <option>Cash</option>
                                                        <option>UPI</option>
                                                        <option>Card</option>
                                                        <option>Bank Transfer</option>
                                                    </select>
                                                </div>
                                            </td>
                                            <td className=''>
                                                <input
                                                    className="w-full p-1 rounded-md border border-slate-600 text-right appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                    value={item.quantity}
                                                    name=""
                                                    onChange={(e) => handleChange({ value: e.target.value, id: item.id, key: "quantity" })}
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
            </div>
        </>
    )
}

export default MoneyReceipts