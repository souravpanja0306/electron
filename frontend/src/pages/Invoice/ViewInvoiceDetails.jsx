import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from 'react-toastify';
import moment from 'moment';

// Icon...
import {
    AiOutlineFileAdd,
    AiOutlineSync,
    AiOutlinePrinter,
    AiOutlineDelete,
    AiOutlineEdit,
    AiOutlineRollback,
    AiOutlineTable,
    AiOutlineSave,
    AiOutlinePlusSquare,
    AiOutlineMinusSquare
} from "react-icons/ai";

// Components...
import PageTitle from '../../components/PageTitle';
import ActionArea from '../../components/ActionArea';
import MainArea from '../../components/MainArea';
import CustomButton from '../../components/CustomButton';
import SearchableSelect from '../../components/SearchableSelect';
import Alert from '../../components/Alert';
import { inrToWords } from '../../utils/InWordConverter';

// Stores...
import useInvoiceStore from '../../store/InvoiceStore';
import useCompanyStore from "../../store/CompanyStore";
import usePartyStore from "../../store/PartyStore";
import useAuthStore from '../../store/AuthStore';
import useGstStore from "../../store/GstStore";

const ViewInvoiceDetails = () => {
    const navigate = useNavigate();
    const { invoiceData, getAllInvoice, deleteInvoice, printInvoice, updateInvoice, invoiceLoading } = useInvoiceStore();
    const { companyData, getAllCompany } = useCompanyStore();
    const { parties, getAllParty } = usePartyStore();
    const { gstData, getAllGst } = useGstStore();
    const { authToken, token } = useAuthStore();

    const [searchParams] = useSearchParams();
    const back = searchParams.get("back");
    const invoiceId = searchParams.get("id");

    const [alert, setAlert] = useState({ show: false });
    const [isSameState, setIsSameState] = useState(true);
    const [grandTotal, setGrandTotal] = useState({
        total_quantity: 0,
        total_value: 0,
        total_cgst: 0,
        total_sgst: 0,
        total_igst: 0,
        grand_total: 0,
        inWord: ""
    });

    const [invoiceDetails, setInvoiceDetails] = useState({
        type: "tax",
        company_id: "",
        invoice_no: "",
        invoice_date: "",
        transporter: "",
        eway_bill: "",
        party_id: "",
        placeOfSupply: "",
        lorry_no: "",
        lr_no: ""
    });

    const [invoiceFields, setInvoiceFields] = useState([]);

    const calculateGrandTotal = (fields, billFromId, billToId) => {
        let finalQuantity = 0;
        let finalValue = 0;
        let finalCGST = 0;
        let finalSGST = 0;
        let finalIGST = 0;

        const company = companyData.find(c => String(c.id) === String(billFromId));
        const selectedParty = parties?.body?.find(p => String(p.id) === String(billToId));

        if (!company || !selectedParty) return;

        const companyState = (company?.state || "").toLowerCase().trim();
        const partyState = (selectedParty?.state || "").toLowerCase().trim();
        const sameState = companyState === partyState;
        setIsSameState(sameState);

        fields.forEach(item => {
            let qty = parseFloat(item.quantity || 0);
            let rate = parseFloat(item.rate || 0);
            let gstRate = parseFloat(item.gst || 0);
            let subtotal = qty * rate;

            finalQuantity += qty;
            finalValue += subtotal;

            let taxAmount = subtotal * (gstRate / 100);

            if (sameState) {
                finalCGST += taxAmount / 2;
                finalSGST += taxAmount / 2;
            } else {
                finalIGST += taxAmount;
            }
        });

        const grandTotalValue = finalValue + finalCGST + finalSGST + finalIGST;

        setGrandTotal({
            total_quantity: finalQuantity,
            total_value: finalValue,
            total_cgst: finalCGST,
            total_sgst: finalSGST,
            total_igst: finalIGST,
            grand_total: grandTotalValue,
            inWord: inrToWords(grandTotalValue)
        });
    };

    const fetchInvoiceData = async () => {
        try {
            let result = await getAllInvoice({ id: invoiceId, token: token });
            if (result.status === 200 && result.body.length > 0) {
                const item = result.body[0];
                const updatedDetails = {
                    type: item.type || "tax",
                    company_id: item.company_id?.id || "",
                    invoice_no: item.invoice_no || "",
                    invoice_date: item.invoice_date || "",
                    transporter: item.transporter || "",
                    eway_bill: item.eway_bill || "",
                    party_id: item.party_id?.id || "",
                    placeOfSupply: item.placeOfSupply || "",
                    lorry_no: item.lorry_no || "",
                    lr_no: item.lr_no || ""
                };
                setInvoiceDetails(updatedDetails);
                const fields = item.data.map(f => ({
                    ...f,
                    id: f.id || Math.floor(Math.random() * 10000000000)
                }));
                setInvoiceFields(fields);
            } else {
                toast.error("Invoice not found");
                navigate("/view-invoice");
            }
        } catch (error) {
            console.error("Error fetching invoice:", error);
        }
    };

    useEffect(() => {
        authToken();
        getAllParty(token);
        getAllCompany(token);
        getAllGst(token);
        if (invoiceId) {
            fetchInvoiceData();
        }
    }, [invoiceId, token]);

    useEffect(() => {
        if (invoiceFields.length > 0 && companyData.length > 0 && parties?.body?.length > 0) {
            calculateGrandTotal(invoiceFields, invoiceDetails.company_id, invoiceDetails.party_id);
        }
    }, [invoiceDetails.company_id, invoiceDetails.party_id, companyData, parties, invoiceFields]);

    const handleAddFields = () => {
        const newFields = [...invoiceFields, {
            id: Math.floor(Math.random() * 10000000000),
            description: "",
            hsn: "",
            quantity: 0,
            rate: 0,
            gst: 0,
            total: 0
        }];
        setInvoiceFields(newFields);
    };

    const handleRemoveFields = (id) => {
        const newFields = invoiceFields.filter(item => item.id !== id);
        setInvoiceFields(newFields);
        calculateGrandTotal(newFields, invoiceDetails.company_id, invoiceDetails.party_id);
    };

    const handleChangeField = (id, key, value) => {
        const updatedFields = invoiceFields.map(item =>
            item.id === id ? { ...item, [key]: value } : item
        );
        setInvoiceFields(updatedFields);
        calculateGrandTotal(updatedFields, invoiceDetails.company_id, invoiceDetails.party_id);
    };

    const handleUpdate = async () => {
        try {
            if (!invoiceDetails.party_id) {
                return setAlert({
                    show: true,
                    title: "Error",
                    type: "error",
                    message: "Party is required."
                });
            }

            let payload = { ...invoiceDetails, data: invoiceFields };
            let result = await updateInvoice(invoiceId, payload, token);
            if (result.status === 200) {
                toast.success(result.message);
                if (back) navigate(-1);
                else navigate("/view-invoice");
            } else {
                setAlert({
                    show: true,
                    title: "Error",
                    type: "error",
                    message: result?.message
                });
            }
        } catch (error) {
            console.error(error);
            setAlert({
                show: true,
                title: "Error",
                type: "error",
                message: "Something went wrong!"
            });
        }
    };

    const handleDelete = async () => {
        try {
            if (!invoiceId) return;
            let result = await deleteInvoice({ id: invoiceId, token: token });
            if (result.status === 200) {
                toast.success(result.message);
                navigate("/view-invoice");
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handlePrint = async () => {
        try {
            if (!invoiceId) return toast("Please select which one you want to print.", { theme: "dark" });
            let result = await printInvoice({ id: invoiceId, token: token });
            if (result.status === 200) {
                const newWindow = window.open();
                newWindow.document.write(result.body.html);
                toast.info("PDF generated.", { theme: "dark" });
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <>
            <PageTitle>Edit Invoice Details</PageTitle>
            <div className='flex flex-col gap-1'>
                <ActionArea>
                    <div className="flex justify-between w-full">
                        <div className="flex gap-1">
                            <div onClick={() => navigate(-1)}>
                                <CustomButton title={"Back"} color={"slate"}><AiOutlineRollback /></CustomButton>
                            </div>
                            <div onClick={handleUpdate}>
                                <CustomButton title={"Update (Ctrl+S)"} color={"blue"}><AiOutlineSave /></CustomButton>
                            </div>
                            <Link to="/view-invoice">
                                <CustomButton title={"View (Ctrl+I)"} color={"blue"}><AiOutlineTable /></CustomButton>
                            </Link>
                            <div onClick={handlePrint}>
                                <CustomButton title={"Print (Ctrl+P)"} color={"blue"}><AiOutlinePrinter /></CustomButton>
                            </div>
                            <div onClick={handleDelete}>
                                <CustomButton title={"Delete (Ctrl+D)"} color={"red"}><AiOutlineDelete /></CustomButton>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <div onClick={() => fetchInvoiceData()}>
                                <CustomButton title={"Refresh"} color={"blue"}><AiOutlineSync /></CustomButton>
                            </div>
                        </div>
                    </div>
                </ActionArea>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-1'>
                    <div className='flex flex-col gap-1'>
                        <PageTitle>Party Information</PageTitle>
                        <MainArea>
                            <div className='flex flex-col w-full gap-2 p-1'>
                                <div className='flex justify-between items-center w-full gap-1'>
                                    <label className='text-xs w-[25%]'>Bill From</label>
                                    <div className='flex items-center gap-1 w-[75%]'>
                                        <SearchableSelect
                                            className="w-full"
                                            name="company_id"
                                            value={invoiceDetails.company_id}
                                            onChange={(e) =>
                                                setInvoiceDetails({ ...invoiceDetails, company_id: e.target.value })
                                            }
                                            options={companyData?.map(item => ({ id: item.id, label: item.company_name }))}
                                            placeholder="Select Company"
                                            required
                                        />
                                        <Link
                                            to="/add-company?back=true"
                                            className="h-8 px-3 flex items-center justify-center rounded-md bg-blue-600 text-white hover:bg-blue-700 transition whitespace-nowrap text-xs"
                                        >
                                            + New
                                        </Link>
                                    </div>
                                </div>
                                <div className='flex justify-between items-center w-full gap-1'>
                                    <label className='text-xs w-[25%]'>Bill To</label>
                                    <div className='flex items-center gap-1 w-[75%]'>
                                        <SearchableSelect
                                            className="w-full"
                                            name="party_id"
                                            value={invoiceDetails.party_id}
                                            onChange={(e) =>
                                                setInvoiceDetails({ ...invoiceDetails, party_id: e.target.value })
                                            }
                                            options={parties?.body?.map(item => ({ id: item.id, label: item.company_name }))}
                                            placeholder="Select Party"
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
                                    <label className='text-xs w-[25%]'>Place of Supply</label>
                                    <input
                                        className="h-8 p-1 rounded w-[75%] text-slate-900 border border-slate-400 dark:border-slate-600"
                                        value={invoiceDetails.placeOfSupply}
                                        onChange={(e) =>
                                            setInvoiceDetails({ ...invoiceDetails, placeOfSupply: e.target.value })
                                        }
                                        type="text"
                                    />
                                </div>
                            </div>
                        </MainArea>
                    </div>

                    <div className='flex flex-col gap-1'>
                        <PageTitle>Invoice Info</PageTitle>
                        <MainArea>
                            <div className='flex flex-col w-full gap-2 p-1'>
                                <div className='flex justify-between items-center w-full gap-1'>
                                    <label className='text-xs w-[25%]'>Date</label>
                                    <input
                                        className="h-8 p-1 rounded w-[75%] text-slate-900 border border-slate-400 dark:border-slate-600"
                                        type="date"
                                        value={invoiceDetails.invoice_date}
                                        onChange={(e) =>
                                            setInvoiceDetails({ ...invoiceDetails, invoice_date: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <div className='flex justify-between items-center w-full gap-1'>
                                    <label className='text-xs w-[25%]'>Invoice No</label>
                                    <input
                                        className="h-8 p-1 rounded w-[75%] text-slate-900 border border-slate-400 dark:border-slate-600 bg-slate-50"
                                        type="text"
                                        value={invoiceDetails.invoice_no}
                                        readOnly
                                    />
                                </div>
                            </div>
                        </MainArea>
                    </div>
                </div>

                <PageTitle>Invoice Details</PageTitle>
                <MainArea>
                    <table className='w-full select-none'>
                        <thead>
                            <tr className='text-slate-600 dark:text-white text-sm font-semibold text-center'>
                                <th className='w-12'>Sl. No.</th>
                                <th className=''>Description</th>
                                <th className='w-24'>HSN</th>
                                <th className='w-20'>Qty</th>
                                <th className='w-24'>Rate</th>
                                <th className='w-24'>Subtotal</th>
                                <th className='w-24'>Tax (%)</th>
                                {isSameState ? (
                                    <>
                                        <th className='w-20'>CGST</th>
                                        <th className='w-20'>SGST</th>
                                    </>
                                ) : (
                                    <th className='w-20'>IGST</th>
                                )}
                                <th className='w-24'>Total</th>
                                <th className='w-12'>#</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                invoiceFields.map((item, index) => {
                                    const isLast = index === invoiceFields.length - 1;
                                    const subtotal = parseFloat(item.quantity || 0) * parseFloat(item.rate || 0);
                                    const taxAmount = subtotal * (parseFloat(item.gst || 0) / 100);
                                    const cgst = isSameState ? (taxAmount / 2).toFixed(2) : "0.00";
                                    const sgst = isSameState ? (taxAmount / 2).toFixed(2) : "0.00";
                                    const igst = !isSameState ? taxAmount.toFixed(2) : "0.00";
                                    const total = subtotal + taxAmount;

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
                                                    className="w-full h-8 p-1 rounded border border-slate-400 dark:border-slate-600"
                                                    value={item.hsn}
                                                    onChange={(e) => handleChangeField(item.id, "hsn", e.target.value)}
                                                    type="text"
                                                />
                                            </td>
                                            <td className=''>
                                                <input
                                                    className="w-full h-8 p-1 rounded border border-slate-400 dark:border-slate-600 text-right"
                                                    value={item.quantity}
                                                    onChange={(e) => handleChangeField(item.id, "quantity", e.target.value)}
                                                    type='number'
                                                />
                                            </td>
                                            <td className=''>
                                                <input
                                                    className="w-full h-8 p-1 rounded border border-slate-400 dark:border-slate-600 text-right"
                                                    value={item.rate}
                                                    onChange={(e) => handleChangeField(item.id, "rate", e.target.value)}
                                                    type='number'
                                                />
                                            </td>
                                            <td className=''>
                                                <input
                                                    className="w-full h-8 p-1 rounded border border-slate-400 dark:border-slate-600 text-right"
                                                    value={subtotal.toFixed(2)}
                                                    readOnly
                                                />
                                            </td>
                                            <td className=''>
                                                <select
                                                    className="h-8 p-1 rounded w-full text-slate-900 border border-slate-400 dark:border-slate-600"
                                                    value={item.gst}
                                                    onChange={(e) => handleChangeField(item.id, "gst", e.target.value)}
                                                >
                                                    <option value={0}>0%</option>
                                                    {gstData?.map(g => (
                                                        <option key={g.id} value={g.total_rate}>{g.title}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            {isSameState ? (
                                                <>
                                                    <td className=''>
                                                        <input
                                                            className="w-full h-8 p-1 rounded border border-slate-400 dark:border-slate-600 text-right"
                                                            value={cgst}
                                                            readOnly
                                                        />
                                                    </td>
                                                    <td className=''>
                                                        <input
                                                            className="w-full h-8 p-1 rounded border border-slate-400 dark:border-slate-600 text-right"
                                                            value={sgst}
                                                            readOnly
                                                        />
                                                    </td>
                                                </>
                                            ) : (
                                                <td className=''>
                                                    <input
                                                        className="w-full h-8 p-1 rounded border border-slate-400 dark:border-slate-600 text-right"
                                                        value={igst}
                                                        readOnly
                                                    />
                                                </td>
                                            )}
                                            <td className=''>
                                                <input
                                                    className="w-full h-8 p-1 rounded border border-slate-400 dark:border-slate-600 text-right font-bold"
                                                    value={total.toFixed(2)}
                                                    readOnly
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
                                    <label className='text-xs w-[25%]'>E-Way Bill</label>
                                    <input
                                        className="h-8 p-1 rounded w-[75%] text-slate-900 border border-slate-400 dark:border-slate-600"
                                        type="text"
                                        value={invoiceDetails.eway_bill}
                                        onChange={(e) =>
                                            setInvoiceDetails({ ...invoiceDetails, eway_bill: e.target.value })
                                        }
                                    />
                                </div>
                                <div className='flex justify-between items-center w-full gap-1'>
                                    <label className='text-xs w-[25%]'>Transporter</label>
                                    <input
                                        className="h-8 p-1 rounded w-[75%] text-slate-900 border border-slate-400 dark:border-slate-600"
                                        type="text"
                                        value={invoiceDetails.transporter}
                                        onChange={(e) =>
                                            setInvoiceDetails({ ...invoiceDetails, transporter: e.target.value })
                                        }
                                    />
                                </div>
                                <div className='flex justify-between items-center w-full gap-1'>
                                    <label className='text-xs w-[25%]'>Lorry No</label>
                                    <input
                                        className="h-8 p-1 rounded w-[75%] text-slate-900 border border-slate-400 dark:border-slate-600"
                                        type="text"
                                        value={invoiceDetails.lorry_no}
                                        onChange={(e) =>
                                            setInvoiceDetails({ ...invoiceDetails, lorry_no: e.target.value })
                                        }
                                    />
                                </div>
                                <div className='flex justify-between items-center w-full gap-1'>
                                    <label className='text-xs w-[25%]'>LR No</label>
                                    <input
                                        className="h-8 p-1 rounded w-[75%] text-slate-900 border border-slate-400 dark:border-slate-600"
                                        type="text"
                                        value={invoiceDetails.lr_no}
                                        onChange={(e) =>
                                            setInvoiceDetails({ ...invoiceDetails, lr_no: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                        </MainArea>
                    </div>
                    <div className='w-full lg:w-1/4'>
                        <PageTitle>Summary</PageTitle>
                        <MainArea>
                            <div className='flex flex-col justify-end gap-1 w-full p-1'>
                                <div className='flex justify-between w-full gap-1 font-bold'>
                                    <span className=''>Total Quantity</span>
                                    <span className=' text-blue-600'>{grandTotal.total_quantity}</span>
                                </div>
                                <hr />
                                <div className='flex justify-between w-full gap-1 font-bold'>
                                    <span className=''>Subtotal</span>
                                    <span className=' text-blue-600'>{grandTotal.total_value.toLocaleString("en-IN", {
                                        style: "currency",
                                        currency: "INR",
                                    })}</span>
                                </div>
                                <hr />
                                {grandTotal.total_igst > 0 ? (
                                    <div className='flex justify-between w-full gap-1'>
                                        <span className=''>IGST</span>
                                        <span className=''>{grandTotal.total_igst.toLocaleString("en-IN", {
                                            style: "currency",
                                            currency: "INR",
                                        })}</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className='flex justify-between w-full gap-1'>
                                            <span className=''>SGST</span>
                                            <span className=''>{grandTotal.total_sgst.toLocaleString("en-IN", {
                                                style: "currency",
                                                currency: "INR",
                                            })}</span>
                                        </div>
                                        <hr />
                                        <div className='flex justify-between w-full gap-1'>
                                            <span className=''>CGST</span>
                                            <span className=''>{grandTotal.total_cgst.toLocaleString("en-IN", {
                                                style: "currency",
                                                currency: "INR",
                                            })}</span>
                                        </div>
                                    </>
                                )}
                                <hr />
                                <div className='text-lg flex justify-between w-full gap-1 font-bold'>
                                    <span className=' text-xl'>Grand Total</span>
                                    <span className=' text-blue-600 text-xl'>{grandTotal.grand_total.toLocaleString("en-IN", {
                                        style: "currency",
                                        currency: "INR",
                                    })}</span>
                                </div>
                                <div className='bg-white flex flex-col justify-between w-full gap-1 text-black p-1 rounded'>
                                    <span className=' font-bold'>In Rupees :</span>
                                    <span className=' text-xs italic'>{grandTotal.inWord}</span>
                                </div>
                            </div>
                        </MainArea>
                    </div>
                </div>
            </div>
            <Alert
                open={alert.show}
                type={alert.type}
                title={alert.title}
                message={alert.message}
                onClose={() => setAlert({ ...alert, show: false })}
            />
        </>
    );
};

export default ViewInvoiceDetails;