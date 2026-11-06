import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from 'sonner';

// Icon...
import {
    AiOutlineSync,
    AiOutlinePrinter,
    AiOutlineDelete,
    AiOutlineRollback,
    AiOutlineSave,
    AiOutlineTable,
} from "react-icons/ai";

// Components...
import PageTitle from '../../components/PageTitle';
import ActionArea from '../../components/ActionArea';
import CustomButton from '../../components/CustomButton';
import InvoiceForm from '../../components/InvoiceForm';
import { PartyQuickAddModal } from '../../components/FormKit';

// Stores...
import useInvoiceStore from '../../store/InvoiceStore';
import useCompanyStore from "../../store/CompanyStore";
import usePartyStore from "../../store/PartyStore";
import useAuthStore from '../../store/AuthStore';
import useGstStore from "../../store/GstStore";
import useHsnSacStore from "../../store/HsnSacStore";

// Utils / hooks...
import { newInvoiceRow, toInvoicePayloadItems } from '../../utils/invoiceTotals';
import { errorMessage, openPrintWindow } from '../../utils/format';
import useShortcuts from "../../hooks/useShortcuts";
import usePartyQuickAdd from "../../hooks/usePartyQuickAdd";

const ViewInvoiceDetails = () => {
    const navigate = useNavigate();
    const { getAllInvoice, deleteInvoice, printInvoice, updateInvoice } = useInvoiceStore();
    const { companyData, getAllCompany } = useCompanyStore();
    const { parties, getAllParty } = usePartyStore();
    const { gstData, getAllGst } = useGstStore();
    const { hsnData, getAllHsnSac } = useHsnSacStore();
    const { token } = useAuthStore();

    const [searchParams] = useSearchParams();
    const back = searchParams.get("back");
    const invoiceId = searchParams.get("id");

    const [details, setDetails] = useState({
        type: "tax",
        company_id: "",
        invoiceNo: "",
        date: "",
        transporter: "",
        ewayBill: "",
        billTo: "",
        shipTo: "",
        placeOfSupply: "",
        lorry_no: "",
        lr_no: ""
    });
    const [items, setItems] = useState([newInvoiceRow()]);
    const [sameShip, setSameShip] = useState(true);
    const [fromChallan, setFromChallan] = useState(false);
    const [saving, setSaving] = useState(false);

    const partyAdd = usePartyQuickAdd({
        token,
        onCreated: (id, field) => {
            if (field === "shipTo") setSameShip(false);
            setDetails(prev => ({ ...prev, [field]: id }));
        },
    });

    const partyList = parties?.body || [];

    const fetchInvoiceData = async () => {
        try {
            const result = await getAllInvoice({ id: invoiceId, token: token });
            if (result.status === 200 && result.body.length > 0) {
                const item = result.body[0];
                const billTo = item.party_id?.id || "";
                setDetails({
                    type: item.type || "tax",
                    company_id: item.company_id?.id || "",
                    invoiceNo: item.invoice_no || "",
                    date: item.invoice_date || "",
                    transporter: item.transporter || "",
                    ewayBill: item.eway_bill || "",
                    billTo,
                    shipTo: item.ship_to || billTo,
                    placeOfSupply: item.placeOfSupply || "",
                    lorry_no: item.lorry_no || "",
                    lr_no: item.lr_no || ""
                });
                setSameShip(!item.ship_to || String(item.ship_to) === String(billTo));
                setFromChallan(Boolean(item.challan_id));
                const rows = (Array.isArray(item.data) ? item.data : []).map(row => ({
                    ...newInvoiceRow(),
                    ...row,
                    id: row.id || Math.floor(Math.random() * 10000000000),
                }));
                setItems(rows.length ? rows : [newInvoiceRow()]);
            } else {
                toast.error("Invoice not found");
                navigate("/view-invoice");
            }
        } catch (error) {
            console.error("Error fetching invoice:", error);
            toast.error(errorMessage(error, "Could not load the invoice."));
        }
    };

    useEffect(() => {
        getAllParty(token);
        getAllCompany(token);
        getAllGst(token);
        getAllHsnSac(token);
        if (invoiceId) fetchInvoiceData();
    }, [invoiceId, token]);

    const handleDetailChange = (e) => {
        const { name, value } = e.target;
        setDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (id, patch) => {
        setItems(prev => prev.map(item => (item.id === id ? { ...item, ...patch } : item)));
    };

    const handleAddRow = () => setItems(prev => [...prev, newInvoiceRow()]);

    const handleRemoveRow = (id) => {
        setItems(prev => (prev.length > 1 ? prev.filter(item => item.id !== id) : prev));
    };

    const handleUpdate = async (e) => {
        if (e?.preventDefault) e.preventDefault();
        if (saving) return;

        if (!details.company_id) return toast.error("Please select a company.");
        if (!details.billTo) return toast.error("Please select who the invoice is billed to.");
        if (!details.date) return toast.error("Please enter the invoice date.");
        const filled = items.filter(item => item.description || Number(item.quantity) || Number(item.rate));
        if (!filled.length) return toast.error("Add at least one item.");
        if (filled.some(item => !String(item.description).trim())) return toast.error("Every item needs a description.");

        const payload = {
            type: details.type,
            company_id: details.company_id,
            invoice_no: details.invoiceNo,
            invoice_date: details.date,
            transporter: details.transporter,
            eway_bill: details.ewayBill,
            party_id: details.billTo,
            ship_to: sameShip ? details.billTo : (details.shipTo || details.billTo),
            placeOfSupply: details.placeOfSupply,
            lorry_no: details.lorry_no,
            lr_no: details.lr_no,
            data: toInvoicePayloadItems(filled),
        };

        try {
            setSaving(true);
            const result = await updateInvoice(invoiceId, payload, token);
            if (result.status === 200) {
                toast.success(result.message);
                if (back) navigate(-1);
                else navigate("/view-invoice");
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(errorMessage(error));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!invoiceId) return;
        const message = fromChallan
            ? "Delete this invoice? Its challan will become available for a new invoice. This cannot be undone."
            : "Are you sure you want to delete this record? This cannot be undone.";
        if (!window.confirm(message)) return;
        try {
            const result = await deleteInvoice({ id: invoiceId, token: token });
            if (result.status === 200) {
                toast.success(result.message);
                navigate("/view-invoice");
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(errorMessage(error));
        }
    };

    const handlePrint = async () => {
        if (!invoiceId) return;
        try {
            const result = await printInvoice({ id: invoiceId, token: token });
            if (result.status !== 200) return toast.error(result.message);
            if (!openPrintWindow(result.body.html)) return toast.error("Pop-up blocked. Allow pop-ups to print.");
            toast.info("Generating Print View...");
        } catch (error) {
            console.log(error);
            toast.error(errorMessage(error));
        }
    };

    useShortcuts({
        s: (e) => handleUpdate(e),
        p: () => handlePrint(),
        d: () => handleDelete(),
        i: () => navigate("/view-invoice"),
    }, !partyAdd.isOpen);

    return (
        <>
            <PageTitle>Edit Invoice{details.invoiceNo ? ` — ${details.invoiceNo}` : ""}</PageTitle>
            <div className='flex flex-col gap-1'>
                <ActionArea>
                    <div className="flex flex-wrap justify-between w-full gap-1">
                        <div className="flex flex-wrap gap-1">
                            <div onClick={() => navigate(-1)}>
                                <CustomButton title={"Back"} color={"slate"}><AiOutlineRollback /></CustomButton>
                            </div>
                            <div onClick={handleUpdate}>
                                <CustomButton title={"Update (Ctrl+S)"} color={"blue"} disabled={saving}><AiOutlineSave /></CustomButton>
                            </div>
                            <div onClick={handlePrint}>
                                <CustomButton title={"Print (Ctrl+P)"} color={"blue"}><AiOutlinePrinter /></CustomButton>
                            </div>
                            <div onClick={() => navigate("/view-invoice")}>
                                <CustomButton title={"View (Ctrl+I)"} color={"blue"}><AiOutlineTable /></CustomButton>
                            </div>
                            <div onClick={handleDelete}>
                                <CustomButton title={"Delete (Ctrl+D)"} color={"red"}><AiOutlineDelete /></CustomButton>
                            </div>
                        </div>
                        <div onClick={() => fetchInvoiceData()}>
                            <CustomButton title={"Reload"} color={"blue"}><AiOutlineSync /></CustomButton>
                        </div>
                    </div>
                </ActionArea>

                <InvoiceForm
                    details={details}
                    onDetailChange={handleDetailChange}
                    sameShip={sameShip}
                    onSameShipChange={setSameShip}
                    items={items}
                    onItemChange={handleItemChange}
                    onAddRow={handleAddRow}
                    onRemoveRow={handleRemoveRow}
                    onSubmit={handleUpdate}
                    companyData={companyData}
                    parties={partyList}
                    gstData={gstData}
                    hsnData={hsnData}
                    onAddParty={partyAdd.open}
                    notice={fromChallan ? (
                        <div className="rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-600 dark:text-slate-300">
                            This invoice was created from a challan. Changes here don't change the challan.
                        </div>
                    ) : null}
                />
            </div>

            <PartyQuickAddModal {...partyAdd.modalProps} />
        </>
    );
};

export default ViewInvoiceDetails;
