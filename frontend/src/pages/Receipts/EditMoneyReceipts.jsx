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
import ReceiptForm, { newReceiptRow } from '../../components/ReceiptForm';
import { PartyQuickAddModal } from '../../components/FormKit';

// Stores...
import useMoneyReceiptStore from '../../store/MoneyReceiptStore';
import useCompanyStore from "../../store/CompanyStore";
import usePartyStore from "../../store/PartyStore";
import useAuthStore from '../../store/AuthStore';

// Utils / hooks...
import { errorMessage, openPrintWindow } from '../../utils/format';
import useShortcuts from "../../hooks/useShortcuts";
import usePartyQuickAdd from "../../hooks/usePartyQuickAdd";

const EditMoneyReceipts = () => {
    const navigate = useNavigate();
    const { getMoneyReceiptById, deleteMoneyReceipts, printMoneyReceipt, updateMoneyReceipts } = useMoneyReceiptStore();
    const { companyData, getAllCompany } = useCompanyStore();
    const { parties, getAllParty } = usePartyStore();
    const { token } = useAuthStore();

    const [searchParams] = useSearchParams();
    const back = searchParams.get("back");
    const receiptId = searchParams.get("id");

    const [details, setDetails] = useState({
        company_id: "",
        party_id: "",
        receipt_no: "",
        receipt_date: "",
        remarks: "",
        payment_mode: "Cash",
        reference: ""
    });
    const [items, setItems] = useState([newReceiptRow()]);
    const [saving, setSaving] = useState(false);

    const partyAdd = usePartyQuickAdd({
        token,
        onCreated: (id) => setDetails(prev => ({ ...prev, party_id: id })),
    });

    const fetchReceiptData = async () => {
        try {
            const result = await getMoneyReceiptById(receiptId);
            const item = result.status === 200 ? result.body?.[0] : null;
            if (!item) {
                toast.error("Money Receipt not found");
                navigate("/view-money-receipts");
                return;
            }
            setDetails({
                company_id: item.company_id || "",
                party_id: item.party_id?.id || "",
                receipt_no: item.receipt_no || "",
                receipt_date: item.receipt_date || "",
                remarks: item.remarks || "",
                payment_mode: item.payment_mode || "Cash",
                reference: item.reference || ""
            });
            const rows = (Array.isArray(item.data) ? item.data : []).map(row => ({
                ...newReceiptRow(),
                ...row,
                id: row.id || Math.floor(Math.random() * 10000000000),
            }));
            setItems(rows.length ? rows : [newReceiptRow()]);
        } catch (error) {
            console.error("Error fetching receipt:", error);
            toast.error(errorMessage(error, "Could not load the receipt."));
        }
    };

    useEffect(() => {
        getAllParty(token);
        getAllCompany(token);
        if (receiptId) fetchReceiptData();
    }, [receiptId, token]);

    const handleDetailChange = (e) => {
        const { name, value } = e.target;
        setDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (id, patch) => {
        setItems(prev => prev.map(item => (item.id === id ? { ...item, ...patch } : item)));
    };

    const handleAddRow = () => setItems(prev => [...prev, newReceiptRow()]);

    const handleRemoveRow = (id) => {
        setItems(prev => (prev.length > 1 ? prev.filter(item => item.id !== id) : prev));
    };

    const handleUpdate = async (e) => {
        if (e?.preventDefault) e.preventDefault();
        if (saving) return;

        if (!details.company_id) return toast.error("Please select a company.");
        if (!details.party_id) return toast.error("Please select who the payment was received from.");
        if (!details.receipt_date) return toast.error("Please enter the receipt date.");
        const filled = items.filter(item => item.description || Number(item.amount));
        if (!filled.length) return toast.error("Add at least one payment line.");
        if (!filled.some(item => Number(item.amount) > 0)) return toast.error("Enter the amount received.");
        if (filled.some(item => Number(item.amount) < 0)) return toast.error("Amounts cannot be negative.");

        try {
            setSaving(true);
            const result = await updateMoneyReceipts({ id: receiptId, payload: { ...details, data: filled }, token });
            if (result.status === 200) {
                toast.success(result.message);
                if (back) navigate(-1);
                else navigate("/view-money-receipts");
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
        if (!receiptId) return;
        if (!window.confirm("Are you sure you want to delete this record? This cannot be undone.")) return;
        try {
            const result = await deleteMoneyReceipts({ id: receiptId, token: token });
            if (result.status === 200) {
                toast.success(result.message);
                navigate("/view-money-receipts");
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(errorMessage(error));
        }
    };

    const handlePrint = async () => {
        if (!receiptId) return;
        try {
            const result = await printMoneyReceipt({ id: receiptId, token });
            if (result.status !== 200) return toast.error(result.message);
            if (!openPrintWindow(result.body.html)) return toast.error("Nothing to print.");
        } catch (error) {
            console.log(error);
            toast.error(errorMessage(error));
        }
    };

    useShortcuts({
        s: (e) => handleUpdate(e),
        p: () => handlePrint(),
        d: () => handleDelete(),
        i: () => navigate("/view-money-receipts"),
    }, !partyAdd.isOpen);

    return (
        <>
            <PageTitle>Edit Money Receipt{details.receipt_no ? ` — ${details.receipt_no}` : ""}</PageTitle>
            <div className="flex flex-col gap-2">
                <ActionArea>
                    <div className="flex flex-wrap justify-between w-full gap-1">
                        <div className="flex flex-wrap gap-1">
                            <CustomButton onClick={() => navigate(-1)} title={"Back"} color={"slate"}><AiOutlineRollback /></CustomButton>
                            <CustomButton onClick={handleUpdate} title={"Update (Ctrl+S)"} color={"blue"} disabled={saving}><AiOutlineSave /></CustomButton>
                            <CustomButton onClick={handlePrint} title={"Print (Ctrl+P)"} color={"slate"}><AiOutlinePrinter /></CustomButton>
                            <CustomButton onClick={() => navigate("/view-money-receipts")} title={"View (Ctrl+I)"} color={"slate"}><AiOutlineTable /></CustomButton>
                            <CustomButton onClick={handleDelete} title={"Delete (Ctrl+D)"} color={"red"}><AiOutlineDelete /></CustomButton>
                        </div>
                        <CustomButton onClick={() => fetchReceiptData()} title={"Reload"} color={"slate"}><AiOutlineSync /></CustomButton>
                    </div>
                </ActionArea>

                <ReceiptForm
                    details={details}
                    onDetailChange={handleDetailChange}
                    items={items}
                    onItemChange={handleItemChange}
                    onAddRow={handleAddRow}
                    onRemoveRow={handleRemoveRow}
                    onSubmit={handleUpdate}
                    companyData={companyData}
                    parties={parties?.body || []}
                    onAddParty={() => partyAdd.open()}
                />
            </div>

            <PartyQuickAddModal {...partyAdd.modalProps} />
        </>
    );
};

export default EditMoneyReceipts;
