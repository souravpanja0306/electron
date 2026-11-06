import { Link, useNavigate, useSearchParams } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { toast } from 'sonner';

// Icons...
import {
    AiOutlineTable,
    AiOutlineRollback,
    AiOutlineSave,
} from "react-icons/ai";

// Components...
import PageTitle from '../../components/PageTitle';
import ActionArea from '../../components/ActionArea';
import CustomButton from '../../components/CustomButton';
import ReceiptForm, { newReceiptRow } from '../../components/ReceiptForm';
import { PartyQuickAddModal } from '../../components/FormKit';

// Stores...
import useMoneyReceiptStore from '../../store/MoneyReceiptStore';
import usePartyStore from '../../store/PartyStore';
import useCompanyStore from '../../store/CompanyStore';
import useAuthStore from '../../store/AuthStore';

// Utils / hooks...
import { errorMessage } from '../../utils/format';
import useShortcuts from "../../hooks/useShortcuts";
import usePartyQuickAdd from "../../hooks/usePartyQuickAdd";

const emptyDetails = (company_id = "") => ({
    company_id,
    party_id: "",
    receipt_no: "",
    receipt_date: moment().format("YYYY-MM-DD"),
    remarks: "",
    payment_mode: "Cash",
    reference: ""
});

const MoneyReceipts = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const back = searchParams.get("back");

    const { createMoneyReceipts, generateMoneyReceiptNo } = useMoneyReceiptStore();
    const { parties, getAllParty } = usePartyStore();
    const { companyData, getAllCompany } = useCompanyStore();
    const { token } = useAuthStore();

    const [details, setDetails] = useState(emptyDetails());
    const [items, setItems] = useState([newReceiptRow()]);
    const [saving, setSaving] = useState(false);

    const partyAdd = usePartyQuickAdd({
        token,
        onCreated: (id) => setDetails(prev => ({ ...prev, party_id: id })),
    });

    const loadReceiptNo = async () => {
        try {
            const result = await generateMoneyReceiptNo(token);
            if (result.status === 200) setDetails(prev => ({ ...prev, receipt_no: result.body }));
        } catch (error) {
            console.log(error);
            toast.error("Could not generate the receipt number.");
        }
    };

    useEffect(() => {
        loadReceiptNo();
        getAllParty(token);
        getAllCompany(token);
    }, []);

    // With a single company there is nothing to choose.
    useEffect(() => {
        if (!details.company_id && companyData?.length === 1) {
            setDetails(prev => ({ ...prev, company_id: companyData[0].id }));
        }
    }, [companyData]);

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

    const handleSubmitForm = async (e) => {
        if (e?.preventDefault) e.preventDefault();
        if (saving) return;

        if (!details.company_id) return toast.error("Please select a company.");
        if (!details.party_id) return toast.error("Please select who the payment was received from.");
        if (!details.receipt_no) return toast.error("Receipt number is not ready yet. Please wait a moment.");
        if (!details.receipt_date) return toast.error("Please enter the receipt date.");
        const filled = items.filter(item => item.description || Number(item.amount));
        if (!filled.length) return toast.error("Add at least one payment line.");
        if (!filled.some(item => Number(item.amount) > 0)) return toast.error("Enter the amount received.");
        if (filled.some(item => Number(item.amount) < 0)) return toast.error("Amounts cannot be negative.");

        try {
            setSaving(true);
            const result = await createMoneyReceipts({ payload: { ...details, data: filled }, token });
            if (result.status === 200) {
                toast.success(result.message);
                // Ready for the next receipt: keep the company, get the next number.
                setItems([newReceiptRow()]);
                setDetails(emptyDetails(details.company_id));
                await loadReceiptNo();
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

    useShortcuts({
        s: (e) => handleSubmitForm(e),
        i: () => navigate("/view-money-receipts"),
    }, !partyAdd.isOpen);

    return (
        <>
            <PageTitle>Create Money Receipt</PageTitle>

            <div className="flex flex-col gap-1">
                <ActionArea>
                    {back && (
                        <div onClick={() => navigate(-1)}>
                            <CustomButton title={"Back"} color={"slate"}><AiOutlineRollback /></CustomButton>
                        </div>
                    )}
                    <div onClick={handleSubmitForm}>
                        <CustomButton title={"Save (Ctrl+S)"} color={"blue"} disabled={saving}><AiOutlineSave /></CustomButton>
                    </div>
                    <Link to="/view-money-receipts">
                        <CustomButton title={"View (Ctrl+I)"} color={"blue"}><AiOutlineTable /></CustomButton>
                    </Link>
                </ActionArea>

                <ReceiptForm
                    details={details}
                    onDetailChange={handleDetailChange}
                    items={items}
                    onItemChange={handleItemChange}
                    onAddRow={handleAddRow}
                    onRemoveRow={handleRemoveRow}
                    onSubmit={handleSubmitForm}
                    companyData={companyData}
                    parties={parties?.body || []}
                    onAddParty={() => partyAdd.open()}
                />
            </div>

            <PartyQuickAddModal {...partyAdd.modalProps} />
        </>
    );
};

export default MoneyReceipts;
