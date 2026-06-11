import { Link, useNavigate, useSearchParams } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { toast } from 'sonner';

// Icons...
import {
    AiOutlinePlusSquare,
    AiOutlineFileAdd,
    AiOutlineMinusSquare,
    AiOutlineTable,
    AiOutlineRollback,
    AiOutlineSave,
    AiOutlineSync
} from "react-icons/ai";

// Components...
import PageTitle from '../../components/PageTitle';
import ActionArea from '../../components/ActionArea';
import MainArea from '../../components/MainArea';
import CustomButton from '../../components/CustomButton';
import SearchableSelect from '../../components/SearchableSelect';
import { inrToWords } from '../../utils/InWordConverter';

// Stores...
import useMoneyReceiptStore from '../../store/MoneyReceiptStore';
import usePartyStore from '../../store/PartyStore';
import useCompanyStore from '../../store/CompanyStore';
import useAuthStore from '../../store/AuthStore';

const MoneyReceipts = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const back = searchParams.get("back");

    const { moneyReceiptNo, createMoneyReceipts, generateMoneyReceiptNo, loading } = useMoneyReceiptStore();
    const { parties, getAllParty } = usePartyStore();
    const { companyData, getAllCompany } = useCompanyStore();
    const { authToken, token } = useAuthStore();

    const [grandTotal, setGrandTotal] = useState({
        total_value: 0,
        inWord: ""
    });

    const [form, setForm] = useState({
        company_id: "",
        party_id: "",
        receipt_no: "",
        receipt_date: moment().format("YYYY-MM-DD"),
        remarks: "",
        payment_mode: "Cash",
        reference: ""
    });

    const [receiptFields, setReceiptFields] = useState([
        { id: Math.floor(Math.random() * 10000000000), description: "", amount: 0 }
    ]);

    useEffect(() => {
        authToken();
        generateMoneyReceiptNo(token);
        getAllParty(token);
        getAllCompany(token);
    }, []);

    useEffect(() => {
        if (moneyReceiptNo) {
            setForm(prev => ({ ...prev, receipt_no: moneyReceiptNo }));
        }
    }, [moneyReceiptNo]);

    const calculateGrandTotal = (fields) => {
        let finalValue = 0;
        fields.forEach(item => {
            finalValue += parseFloat(item.amount || 0);
        });
        setGrandTotal({
            total_value: finalValue,
            inWord: inrToWords(finalValue)
        });
    };

    const handleAddFields = () => {
        const newFields = [...receiptFields, {
            id: Math.floor(Math.random() * 10000000000),
            description: "",
            amount: 0
        }];
        setReceiptFields(newFields);
    };

    const handleRemoveFields = (id) => {
        if (receiptFields.length > 1) {
            const newFields = receiptFields.filter(item => item.id !== id);
            setReceiptFields(newFields);
            calculateGrandTotal(newFields);
        } else {
            return toast.info("At least one row is required.");
        };
    };

    const handleChangeField = (id, key, value) => {
        const updatedFields = receiptFields.map(item =>
            item.id === id ? { ...item, [key]: value } : item
        );
        setReceiptFields(updatedFields);
        calculateGrandTotal(updatedFields);
    };

    const handleSubmitForm = async () => {
        try {
            if (!form.company_id || !form.party_id) {
                return toast.error("Company and Party are required.");
            }

            let payload = { ...form, data: receiptFields };
            let result = await createMoneyReceipts({ payload, token });
            if (result.status === 200) {
                toast.success(result.message);
                setReceiptFields([{ id: Math.floor(Math.random() * 10000000000), description: "", amount: 0 }]);
                setForm({
                    company_id: "",
                    party_id: "",
                    receipt_no: "",
                    receipt_date: moment().format("YYYY-MM-DD"),
                    remarks: "",
                    payment_mode: "Cash",
                    reference: ""
                });
                await generateMoneyReceiptNo(token);
                setGrandTotal({ total_value: 0, inWord: "" });
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong!");
        }
    };

    return (
        <>
            <PageTitle>Create Money Receipt</PageTitle>

            <div className="flex flex-col gap-1 text-sm">
                <ActionArea>
                    <div className="flex justify-between w-full">
                        <div className="flex gap-1">
                            {back && (
                                <div onClick={() => navigate(-1)}>
                                    <CustomButton title={"Back"} color={"slate"}><AiOutlineRollback /></CustomButton>
                                </div>
                            )}
                            <div onClick={handleSubmitForm}>
                                <CustomButton title={"Save (Ctrl+S)"} color={"blue"}><AiOutlineSave /></CustomButton>
                            </div>
                            <Link to="/view-money-receipts">
                                <CustomButton title={"View (Ctrl+I)"} color={"blue"}><AiOutlineTable /></CustomButton>
                            </Link>
                        </div>
                        <div className="flex gap-1">
                            <div onClick={() => generateMoneyReceiptNo(token)}>
                                <CustomButton title={"Regenerate No"} color={"blue"}><AiOutlineSync /></CustomButton>
                            </div>
                        </div>
                    </div>
                </ActionArea>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-1'>
                    <div className='flex flex-col gap-1'>
                        <PageTitle>Recipient Details</PageTitle>
                        <MainArea>
                            <div className='flex flex-col w-full gap-2 p-1'>
                                <div className='flex justify-between items-center w-full gap-1'>
                                    <label className='text-xs w-[25%]'>Company</label>
                                    <div className='flex items-center gap-1 w-[75%]'>
                                        <SearchableSelect
                                            className="w-full"
                                            name="company_id"
                                            value={form.company_id}
                                            onChange={(e) => setForm({ ...form, company_id: e.target.value })}
                                            options={companyData?.map(item => ({ id: item.id, label: item.company_name }))}
                                            placeholder="Select Company"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className='flex justify-between items-center w-full gap-1'>
                                    <label className='text-xs w-[25%]'>Recipient</label>
                                    <div className='flex items-center gap-1 w-[75%]'>
                                        <SearchableSelect
                                            className="w-full"
                                            name="party_id"
                                            value={form.party_id}
                                            onChange={(e) => setForm({ ...form, party_id: e.target.value })}
                                            options={parties?.body?.map(item => ({ id: item.id, label: item.company_name }))}
                                            placeholder="Select Recipient"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </MainArea>
                    </div>

                    <div className='flex flex-col gap-1'>
                        <PageTitle>Receipt Info</PageTitle>
                        <MainArea>
                            <div className='flex flex-col w-full gap-2 p-1'>
                                <div className='flex justify-between items-center w-full gap-1'>
                                    <label className='text-xs w-[25%]'>Date</label>
                                    <input
                                        className="h-8 p-1 rounded w-[75%] text-slate-900 border border-slate-400 dark:border-slate-600"
                                        type="date"
                                        value={form.receipt_date}
                                        onChange={(e) => setForm({ ...form, receipt_date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className='flex justify-between items-center w-full gap-1'>
                                    <label className='text-xs w-[25%]'>Receipt No</label>
                                    <input
                                        className="h-8 p-1 rounded w-[75%] text-slate-900 border border-slate-400 dark:border-slate-600 bg-slate-50"
                                        type="text"
                                        value={form.receipt_no}
                                        readOnly
                                    />
                                </div>
                            </div>
                        </MainArea>
                    </div>
                </div>

                <PageTitle>Payment Information</PageTitle>
                <MainArea>
                    <table className='w-full select-none'>
                        <thead>
                            <tr className='text-slate-600 dark:text-white text-sm font-semibold text-center'>
                                <th className='w-12'>Sl. No.</th>
                                <th className=''>Particulars</th>
                                <th className='w-32'>Amount</th>
                                <th className='w-12'>#</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                receiptFields.map((item, index) => {
                                    const isLast = index === receiptFields.length - 1;
                                    return (
                                        <tr key={item.id} className='items-center text-black'>
                                            <td className=''>
                                                <input
                                                    className="w-full h-8 p-1 rounded border border-slate-400 dark:border-slate-600 text-center"
                                                    value={index + 1}
                                                    disabled
                                                />
                                            </td>
                                            <td className=''>
                                                <input
                                                    className="w-full h-8 p-1 rounded border border-slate-400 dark:border-slate-600 capitalize"
                                                    value={item.description}
                                                    onChange={(e) => handleChangeField(item.id, "description", e.target.value)}
                                                    type="text"
                                                />
                                            </td>
                                            <td className=''>
                                                <input
                                                    className="w-full h-8 p-1 rounded border border-slate-400 dark:border-slate-600 text-right"
                                                    value={item.amount}
                                                    onChange={(e) => handleChangeField(item.id, "amount", e.target.value)}
                                                    type='number'
                                                />
                                            </td>
                                            <td className=''>
                                                <div
                                                    className="w-full flex justify-center text-2xl cursor-pointer transition"
                                                    onClick={() => isLast ? handleAddFields() : handleRemoveFields(item.id)}
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

                <div className='flex flex-col lg:flex-row gap-1'>
                    <div className='w-full lg:w-3/4'>
                        <PageTitle>Additional Info</PageTitle>
                        <MainArea>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-2 w-full p-1'>
                                <div className='flex justify-between items-center w-full gap-1'>
                                    <label className='text-xs w-[25%]'>Payment Mode</label>
                                    <select
                                        className="h-8 p-1 rounded w-[75%] text-slate-900 border border-slate-400 dark:border-slate-600"
                                        value={form.payment_mode}
                                        onChange={(e) => setForm({ ...form, payment_mode: e.target.value })}
                                    >
                                        <option value="Cash">Cash</option>
                                        <option value="UPI">UPI</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                        <option value="Cheque">Cheque</option>
                                    </select>
                                </div>
                                <div className='flex justify-between items-center w-full gap-1'>
                                    <label className='text-xs w-[25%]'>Reference</label>
                                    <input
                                        className="h-8 p-1 rounded w-[75%] text-slate-900 border border-slate-400 dark:border-slate-600"
                                        type="text"
                                        value={form.reference}
                                        onChange={(e) => setForm({ ...form, reference: e.target.value })}
                                    />
                                </div>
                                <div className='flex justify-between items-start w-full gap-1 md:col-span-2'>
                                    <label className='text-xs w-[12.5%]'>Remarks</label>
                                    <textarea
                                        className="p-1 rounded w-[87.5%] text-slate-900 border border-slate-400 dark:border-slate-600"
                                        rows="2"
                                        value={form.remarks}
                                        onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                                    />
                                </div>
                            </div>
                        </MainArea>
                    </div>
                    <div className='w-full lg:w-1/4'>
                        <PageTitle>Summary</PageTitle>
                        <MainArea>
                            <div className='flex flex-col justify-end gap-1 w-full p-1'>
                                <div className='text-lg flex justify-between w-full gap-1 font-bold'>
                                    <span className=''>Total Amount</span>
                                    <span className=' text-blue-600'>{grandTotal.total_value.toLocaleString("en-IN", {
                                        style: "currency",
                                        currency: "INR",
                                    })}</span>
                                </div>
                                <div className='bg-white flex flex-col justify-between w-full gap-1 text-black p-1 rounded border border-slate-200'>
                                    <span className=' font-bold'>In Words :</span>
                                    <span className=' text-xs italic'>{grandTotal.inWord}</span>
                                </div>
                            </div>
                        </MainArea>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MoneyReceipts;