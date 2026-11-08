import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useNavigate, useSearchParams, useParams } from "react-router-dom";

// Components...
import PageTitle from '../../components/PageTitle';
import ActionArea from '../../components/ActionArea';
import CustomButton from '../../components/CustomButton';
import ChallanForm, { QuickAddModals } from '../../components/ChallanForm';

// Icon...
import {
    AiOutlinePrinter,
    AiOutlineTable,
    AiOutlineRollback,
    AiOutlineSave,
} from "react-icons/ai";

// Stores...
import useCompanyStore from "../../store/CompanyStore";
import useAuthStore from '../../store/AuthStore';
import useChallanStore from "../../store/ChallanStore";

// Custom Hooks...
import { usePartyHook } from '../../hooks/usePartyHook';
import { useChaHook } from '../../hooks/useChaHook';
import useShortcuts from "../../hooks/useShortcuts";
import useFormFieldSettings from "../../hooks/useFormFieldSettings";

const newRow = () => ({
    id: Math.floor(Math.random() * 10000000000),
    packages: "",
    description: "",
    weight: "",
    amount: ""
});

// The list API returns "--" for empty values (for display); never load that into an input.
const clean = (value) => (value === "--" || value === null || value === undefined ? "" : value);

const EditChallan = () => {
    const { token } = useAuthStore();
    const [chaModal, isChaModal] = useState(false);
    const [partyModal, isPartyModal] = useState(false);
    const [searchParams] = useSearchParams();
    const { id } = useParams();
    const back = searchParams.get("back");
    const navigate = useNavigate();

    const { companyData, getAllCompany } = useCompanyStore();
    const { updateChallan, getAllChallan, challanLoading, printChallan } = useChallanStore();

    const { handlePartySubmit, parties, getParty, loading: partyLoading, error: partyError } = usePartyHook({
        onSuccess: () => {
            isPartyModal(false);
        }
    });
    const { handleChaSubmit, chaData, getCha, loading: chaLoading, error: chaError } = useChaHook({
        onSuccess: () => {
            isChaModal(false);
        }
    });

    const [data, setData] = useState([newRow()]);
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
        way_bill_date: "",
        container: "",
        booking_number: "",
        cha: "",
        note: "",
        total_amount: 0,
        data: [],
    });

    const { showCha } = useFormFieldSettings();

    const fetchChallanData = async () => {
        try {
            let result = await getAllChallan({ id, token });
            if (result.status === 200 && result.body.length > 0) {
                const item = result.body[0];
                const rows = (item.data || []).map(row => ({
                    ...row,
                    id: row.id ?? Math.floor(Math.random() * 10000000000),
                }));
                setForm({
                    company_id: item.company_id?.id || "",
                    consignor_id: item.consignor_id?.id || "",
                    consignee_id: item.consignee_id?.id || "",
                    cn_no: clean(item.cn_no),
                    date: clean(item.date),
                    invoice_no: clean(item.invoice_no),
                    from_loc: clean(item.from_loc),
                    to_loc: clean(item.to_loc),
                    truck_no: clean(item.truck_no),
                    way_bill_no: clean(item.way_bill_no),
                    way_bill_date: clean(item.way_bill_date),
                    container: clean(item.container),
                    booking_number: clean(item.booking_number),
                    cha: item.cha?.id || "",
                    note: clean(item.note),
                    total_amount: item.total_amount || 0,
                    data: rows,
                });
                setData(rows.length ? rows : [newRow()]);
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
        getParty({});
        getAllCompany(token);
        getCha();
        if (id) {
            fetchChallanData();
        }
    }, [id, token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
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
        setData(prev => [...prev, newRow()]);
    };

    const handleRemoveFields = (rowId) => {
        setData(prev => (prev.length > 1 ? prev.filter(item => item.id !== rowId) : prev));
    };

    const handleSubmitForm = async (e) => {
        if (e) e.preventDefault();
        if (challanLoading) return;
        try {
            if (!form.company_id || !form.consignor_id || !form.consignee_id) {
                return toast.error("Company, Consignor and Consignee are required.");
            };
            if (!String(form.cn_no).trim()) {
                return toast.error("C/N No is required.");
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
            toast.error(error.response?.data?.message || error.message);
        };
    };

    const handlePrint = async (e) => {
        if (e) e.preventDefault();
        try {
            let result = await printChallan({ id, token });
            if (result.status === 200) {
                const newWindow = window.open();
                if (!newWindow) return toast.error("Pop-up blocked. Allow pop-ups to print.");
                newWindow.document.write(result.body.html);
                newWindow.document.close();
                toast.info("PDF generated.");
            } else {
                toast.error(result.message);
            };
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        };
    };

    // Page shortcuts stay off while a quick-add dialog is open.
    useShortcuts({
        s: (e) => handleSubmitForm(e),
        p: (e) => handlePrint(e),
        i: () => navigate("/view-challan"),
    }, !chaModal && !partyModal);

    return (
        <>
            <PageTitle>Edit Challan{form.cn_no ? ` — ${form.cn_no}` : ""}</PageTitle>

            <div className="flex flex-col gap-1">
                <ActionArea>
                    <div onClick={() => navigate(-1)}>
                        <CustomButton title={"Back"} color={"slate"}><AiOutlineRollback /></CustomButton>
                    </div>
                    <div onClick={handleSubmitForm}>
                        <CustomButton title={"Update (Ctrl+S)"} color={"blue"} disabled={challanLoading}><AiOutlineSave /></CustomButton>
                    </div>
                    <div onClick={handlePrint}>
                        <CustomButton title={"Print (Ctrl+P)"} color={"blue"} ><AiOutlinePrinter /></CustomButton>
                    </div>
                    <div onClick={() => navigate("/view-challan")}>
                        <CustomButton title={"View (Ctrl+I)"} color={"blue"}><AiOutlineTable /></CustomButton>
                    </div>
                </ActionArea>

                <ChallanForm
                    form={form}
                    data={data}
                    onChange={handleChange}
                    onChangeData={handleChangeData}
                    onAddRow={handleAddFields}
                    onRemoveRow={handleRemoveFields}
                    onSubmit={handleSubmitForm}
                    companyData={companyData}
                    parties={parties}
                    chaData={chaData}
                    onAddParty={() => isPartyModal(true)}
                    onAddCha={() => isChaModal(true)}
                    showCha={showCha}
                />
            </div>

            <QuickAddModals
                chaOpen={chaModal}
                onCloseCha={() => isChaModal(false)}
                onSubmitCha={handleChaSubmit}
                chaLoading={chaLoading}
                chaError={chaError}
                partyOpen={partyModal}
                onCloseParty={() => isPartyModal(false)}
                onSubmitParty={handlePartySubmit}
                partyLoading={partyLoading}
                partyError={partyError}
            />
        </>
    )
}

export default EditChallan
