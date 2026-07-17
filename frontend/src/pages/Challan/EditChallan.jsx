import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import PageTitle from '../../components/PageTitle';
import ActionArea from '../../components/ActionArea';
import MainArea from '../../components/MainArea';
import CustomButton from '../../components/CustomButton';
import SearchableSelect from '../../components/SearchableSelect';
import { inrToWords } from '../../utils/InWordConverter';
import moment from 'moment';

// Icon...
import {
    AiOutlinePlusSquare,
    AiOutlineFileAdd,
    AiOutlineMinusSquare,
    AiOutlinePrinter,
    AiOutlineTable,
    AiOutlineRollback,
    AiOutlineSave,
    AiOutlineDelete
} from "react-icons/ai";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { Link } from "react-router-dom";


// Stores...
import useCompanyStore from "../../store/CompanyStore";
import useAuthStore from '../../store/AuthStore';
import usePartyStore from "../../store/PartyStore"
import useChallanStore from "../../store/ChallanStore";
import useChaStore from "../../store/ChaStore";


const EditChallan = () => {
    const { token } = useAuthStore();
    const [alart, setAlart] = useState({ show: false });
    const [searchParams] = useSearchParams();
    const { id } = useParams();
    const back = searchParams.get("back");
    const navigate = useNavigate();

    const { parties, getAllParty } = usePartyStore();
    const { companyData, getAllCompany } = useCompanyStore();
    const { updateChallan, getAllChallan, challanLoading, printChallan } = useChallanStore();
    const { chaData, getAllCha } = useChaStore();

    const [data, setData] = useState([]);
    const [form, setForm] = useState({
        company_id: "",
        consignor_id: "",
        consignee_id: "",
        cn_no: "",
        date: "",
        invoice_no: "",
        from_loc: "",
        to_loc: "",
        truck_no: "",
        way_bill_no: "",
        note: "",
        total_amount: 0,
        data: [],
    });

    const fetchChallanData = async () => {
        try {
            let result = await getAllChallan({ id, token });
            if (result.status === 200 && result.body.length > 0) {
                const item = result.body[0];
                setForm({
                    company_id: item.company_id?.id || "",
                    consignor_id: item.consignor_id?.id || "",
                    consignee_id: item.consignee_id?.id || "",
                    cn_no: item.cn_no || "",
                    date: item.date || "",
                    invoice_no: item.invoice_no || "",
                    from_loc: item.from_loc || "",
                    to_loc: item.to_loc || "",
                    truck_no: item.truck_no || "",
                    way_bill_no: item.way_bill_no || "",
                    way_bill_date: item.way_bill_date || "",
                    container: item.container || "",
                    booking_number: item.booking_number || "",
                    cha: item.cha || "",
                    note: item.note || "",
                    total_amount: item.total_amount || 0,
                    data: item.data || [],
                });
                setData(item.data || []);
            } else {
                toast.error("Challan not found");
                navigate("/view-challan");
            };
        } catch (error) {
            console.error("Error fetching challan:", error);
            toast.error(error.message);
        };
    };

    useEffect(() => {
        getAllParty(token);
        getAllCompany(token);
        getAllCha(token);
        if (id) {
            fetchChallanData();
        }
    }, [id, token]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleChangeData = (e) => {
        setData((prev) =>
            prev.map((row) =>
                row.id == e.target.id ? { ...row, [e.target.name]: e.target.value } : row
            ),
        );
    };

    useEffect(() => {
        const total = data.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
        setForm(prev => ({ ...prev, data: data, total_amount: total }));
    }, [data]);


    const handleAddFields = () => {
        setData([...data, {
            id: Math.floor(Math.random() * 10000000000),
            packages: "",
            description: "",
            weight: "",
            amount: ""
        }]);
    };

    const handleRemoveFields = (id) => {
        setData(data.filter(item => item.id !== id));
    };

    const handleSubmitForm = async (e) => {
        if (e) e.preventDefault();
        try {
            if (!form.company_id || !form.consignor_id || !form.consignee_id) {
                return setAlart({
                    show: true,
                    title: "Error",
                    type: "error",
                    message: "Company, Consignor and Consignee are required."
                });
            };

            let payload = { ...form, data: data };
            let result = await updateChallan(id, payload, token);
            if (result.status === 200) {
                toast.success(result.message);
                if (back) navigate(-1);
                else navigate("/view-challan");
            } else {
                toast.error(result.message);
            };
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        };
    };

    const handlePrint = async (e) => {
        if (e) e.preventDefault();
        try {
            let result = await printChallan({ id, token });
            if (result.status === 200) {
                const newWindow = window.open();
                newWindow.document.write(result.body.html);
                toast.info("PDF generated.");
            } else {
                toast.error(result.message);
            };
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        };
    };

    return (
        <>
            <PageTitle>Edit Challan</PageTitle>

            <div className="flex flex-col gap-1">
                <ActionArea>
                    <div onClick={() => navigate(-1)}>
                        <CustomButton title={"Back"} color={"slate"}><AiOutlineRollback /></CustomButton>
                    </div>
                    <div onClick={handleSubmitForm}>
                        <CustomButton title={"Update (Ctrl+S)"} color={"blue"}><AiOutlineSave /></CustomButton>
                    </div>
                    <div onClick={handlePrint}>
                        <CustomButton title={"Print (Ctrl+P)"} color={"blue"} ><AiOutlinePrinter /></CustomButton>
                    </div>
                    {/* <div onClick={handleDelete}>
                        <CustomButton title={"Delete (Ctrl+D)"} color={"red"}><AiOutlineDelete /></CustomButton>
                    </div> */}
                </ActionArea>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-1'>
                    <div className='flex flex-col gap-1'>
                        <PageTitle>Consignor & Consignee</PageTitle>
                        <MainArea>
                            <div className='flex flex-col w-full gap-2 p-1'>
                                <div className='grid grid-cols-1 gap-2 w-full'>
                                    <div className='flex justify-between items-center w-full gap-1'>
                                        <label className='text-xs w-[20%]'>From Company</label>
                                        <div className='flex items-center gap-1 w-[80%]'>
                                            <SearchableSelect
                                                className="w-full"
                                                name="company_id"
                                                value={form.company_id}
                                                onChange={handleChange}
                                                options={companyData?.map(item => ({ id: item.id, label: item.company_name }))}
                                                placeholder="Select Company"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className='flex justify-between items-center w-full gap-1'>
                                        <label className='text-xs w-[20%]'>Consignor</label>
                                        <div className='flex items-center gap-1 w-[80%]'>
                                            <SearchableSelect
                                                className="w-full"
                                                name="consignor_id"
                                                value={form.consignor_id}
                                                onChange={handleChange}
                                                options={parties?.body?.map(item => ({ id: item.id, label: item.company_name }))}
                                                placeholder="Select Consignor"
                                                required
                                            />
                                            <Link
                                                to="/add-party?back=true"
                                                className="h-8 px-3 flex items-center justify-center rounded-md bg-blue-600 text-white hover:bg-blue-700 transition whitespace-nowrap text-xs"
                                            >
                                                + New
                                            </Link>
                                        </div>
                                    </div>

                                    <div className='flex justify-between items-center w-full gap-1'>
                                        <label className='text-xs w-[20%]'>Consignee</label>
                                        <div className='flex items-center gap-1 w-[80%]'>
                                            <SearchableSelect
                                                className="w-full"
                                                name="consignee_id"
                                                value={form.consignee_id}
                                                onChange={handleChange}
                                                options={parties?.body?.map(item => ({ id: item.id, label: item.company_name }))}
                                                placeholder="Select Consignee"
                                                required
                                            />
                                            <Link
                                                to="/add-party?back=true"
                                                className="h-8 px-3 flex items-center justify-center rounded-md bg-blue-600 text-white hover:bg-blue-700 transition whitespace-nowrap text-xs"
                                            >
                                                + New
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </MainArea>
                    </div>

                    <div className='flex flex-col gap-1'>
                        <PageTitle>Transport Details</PageTitle>
                        <MainArea>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-2 w-full p-1'>
                                <div className='flex flex-col w-full gap-1'>
                                    <label className='text-xs'>C/N No</label>
                                    <input
                                        className="h-8 p-1 rounded w-full text-slate-900 border border-slate-400 dark:border-slate-600"
                                        type="text"
                                        name="cn_no"
                                        value={form.cn_no}
                                        onChange={handleChange}
                                        placeholder="C/N No"
                                        required
                                    />
                                </div>
                                <div className='flex flex-col w-full gap-1'>
                                    <label className='text-xs'>Date</label>
                                    <input
                                        className="h-8 p-1 rounded w-full text-slate-900 border border-slate-400 dark:border-slate-600"
                                        type="date"
                                        name="date"
                                        value={form.date}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className='flex flex-col w-full gap-1'>
                                    <label className='text-xs'>From</label>
                                    <input
                                        className="capitalize h-8 p-1 rounded w-full text-slate-900 border border-slate-400 dark:border-slate-600"
                                        type="text"
                                        name="from_loc"
                                        value={form.from_loc}
                                        onChange={handleChange}
                                        placeholder="From"
                                    />
                                </div>
                                <div className='flex flex-col w-full gap-1'>
                                    <label className='text-xs'>To</label>
                                    <input
                                        className="capitalize h-8 p-1 rounded w-full text-slate-900 border border-slate-400 dark:border-slate-600"
                                        type="text"
                                        name="to_loc"
                                        value={form.to_loc}
                                        onChange={handleChange}
                                        placeholder="To"
                                    />
                                </div>
                            </div>
                        </MainArea>
                    </div>
                </div>

                <PageTitle>Item Details</PageTitle>
                <MainArea>
                    <div className="flex flex-col w-full">
                        <table className='w-full select-none'>
                            <thead>
                                <tr className='text-slate-600 dark:text-white text-sm font-semibold text-center'>
                                    <th className='w-12'>Sl. No.</th>
                                    <th className='w-32'>No. of Packages</th>
                                    <th className=''>Particulars of Goods</th>
                                    <th className='w-32'>Weight (KG)</th>
                                    <th className='w-32'>Amount</th>
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
                                                        className="w-full p-1 rounded border border-slate-400 dark:border-slate-600 text-center"
                                                        value={index + 1}
                                                        disabled
                                                    />
                                                </td>
                                                <td className=''>
                                                    <input
                                                        className="w-full p-1 rounded border border-slate-400 dark:border-slate-600"
                                                        value={item.packages}
                                                        id={item.id}
                                                        name="packages"
                                                        onChange={(e) => handleChangeData(e)}
                                                        type="number"
                                                    />
                                                </td>
                                                <td className=''>
                                                    <input
                                                        className="capitalize w-full p-1 rounded border border-slate-400 dark:border-slate-600"
                                                        value={item.description}
                                                        id={item.id}
                                                        name="description"
                                                        onChange={(e) => handleChangeData(e)}
                                                        type="text"
                                                    />
                                                </td>
                                                <td className=''>
                                                    <input
                                                        className="w-full p-1 rounded border border-slate-400 dark:border-slate-600 text-right"
                                                        value={item.weight}
                                                        id={item.id}
                                                        name="weight"
                                                        onChange={(e) => handleChangeData(e)}
                                                        type='number'
                                                    />
                                                </td>
                                                <td className=''>
                                                    <input
                                                        className="w-full p-1 rounded border border-slate-400 dark:border-slate-600 text-right"
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
                        <div className='flex flex-col items-end w-full p-1 gap-1'>
                            <div className='flex items-center gap-2'>
                                <span className='text-sm font-semibold'>Total Amount:</span>
                                <span className='text-lg font-bold text-blue-600'>₹ {form.total_amount}</span>
                            </div>
                            <div className='text-xs italic text-slate-500'>
                                {inrToWords(form.total_amount)}
                            </div>
                        </div>
                    </div>
                </MainArea>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-1'>
                    <div className='flex flex-col gap-1'>
                        <PageTitle>Document & Vehicle Info</PageTitle>
                        <MainArea>
                            <div className='grid gap-2 w-full p-1'>
                                <div className='flex items-center justify-between w-full gap-1'>
                                    <label className='text-xs w-[20%]'>Invoice No</label>
                                    <input
                                        className="h-8 p-1 rounded w-[80%] text-slate-900 border border-slate-400 dark:border-slate-600"
                                        type="text"
                                        name="invoice_no"
                                        value={form.invoice_no}
                                        onChange={handleChange}
                                        placeholder="Invoice No"
                                    />
                                </div>
                                <div className='flex items-center justify-between w-full gap-1'>
                                    <label className='text-xs w-[20%]'>Way Bill No</label>
                                    <input
                                        className="h-8 p-1 rounded w-[80%] text-slate-900 border border-slate-400 dark:border-slate-600"
                                        type="number"
                                        name="way_bill_no"
                                        value={form.way_bill_no}
                                        onChange={handleChange}
                                        placeholder="Way Bill No"
                                    />
                                </div>
                                <div className='flex items-center justify-between w-full gap-1'>
                                    <label className='text-xs w-[20%]'>Way Bill Date</label>
                                    <input
                                        className="h-8 p-1 rounded w-[80%] text-slate-900 border border-slate-400 dark:border-slate-600"
                                        type="date"
                                        name="way_bill_date"
                                        value={form.way_bill_date}
                                        onChange={handleChange}
                                        placeholder="Way Bill Date"
                                    />
                                </div>
                                <div className='flex items-center justify-between w-full gap-1'>
                                    <label className='text-xs w-[20%]'>Truck No</label>
                                    <input
                                        className="h-8 p-1 rounded w-[80%] text-slate-900 border border-slate-400 dark:border-slate-600"
                                        type="text"
                                        name="truck_no"
                                        value={form.truck_no}
                                        onChange={handleChange}
                                        placeholder="Truck No"
                                    />
                                </div>
                            </div>
                        </MainArea>
                    </div>

                    <div className='flex flex-col gap-1'>
                        <PageTitle>Additional Remarks</PageTitle>
                        <MainArea>
                            <div className='flex flex-col w-full gap-1 p-1'>
                                <div className='flex items-center justify-between w-full gap-1'>
                                    <label className='text-xs w-[20%]'>Container</label>
                                    <input
                                        className="h-8 p-1 rounded w-[80%] text-slate-900 border border-slate-400 dark:border-slate-600"
                                        type="text"
                                        name="container"
                                        value={form.container}
                                        onChange={handleChange}
                                        placeholder="Container"
                                    />
                                </div>
                                <div className='flex items-center justify-between w-full gap-1'>
                                    <label className='text-xs w-[20%]'>CHA</label>
                                    <div className='w-[80%]'>
                                        <SearchableSelect
                                            className="w-full"
                                            name="cha"
                                            value={form.cha}
                                            onChange={handleChange}
                                            options={chaData?.map(item => ({ id: item.id, label: item.name }))}
                                            placeholder="Select CHA"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className='flex items-center justify-between w-full gap-1'>
                                    <label className='text-xs w-[20%]'>Booking Number</label>
                                    <input
                                        className="h-8 p-1 rounded w-[80%] text-slate-900 border border-slate-400 dark:border-slate-600"
                                        type="text"
                                        name="booking_number"
                                        value={form.booking_number}
                                        onChange={handleChange}
                                        placeholder="Booking Number"
                                    />
                                </div>
                                <div className='flex items-center justify-between w-full gap-1'>
                                    <label className='text-xs w-[20%]'>Additonal Info</label>
                                    <textarea
                                        className="p-1 rounded w-[80%] text-slate-900 border border-slate-400 dark:border-slate-600"
                                        name="note"
                                        rows="2"
                                        value={form.note}
                                        onChange={handleChange}
                                        placeholder="Info"
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

export default EditChallan