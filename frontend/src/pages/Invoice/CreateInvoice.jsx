import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import moment from 'moment';
import { useNavigate, useSearchParams, Link } from "react-router-dom";

// Components...
import PageTitle from '../../components/PageTitle';
import ActionArea from '../../components/ActionArea';
import CustomButton from '../../components/CustomButton';
import InvoiceForm from '../../components/InvoiceForm';
import { PartyQuickAddModal, ChaQuickAddModal, HsnQuickAddModal } from '../../components/FormKit';

// Icon...
import {
  AiOutlineFileAdd,
  AiOutlineTable,
  AiOutlineRollback,
} from "react-icons/ai";

// Stores...
import useInvoiceStore from '../../store/InvoiceStore';
import useAuthStore from '../../store/AuthStore';
import useCompanyStore from "../../store/CompanyStore";
import usePartyStore from "../../store/PartyStore";
import useGstStore from "../../store/GstStore";
import useHsnSacStore from "../../store/HsnSacStore";
import useChallanStore from "../../store/ChallanStore";

// Utils / hooks...
import { newInvoiceRow, toInvoicePayloadItems } from '../../utils/invoiceTotals';
import { errorMessage } from '../../utils/format';
import useShortcuts from "../../hooks/useShortcuts";
import usePartyQuickAdd from "../../hooks/usePartyQuickAdd";
import { useChaHook } from "../../hooks/useChaHook";
import useFormFieldSettings from "../../hooks/useFormFieldSettings";
import useHsnQuickAdd from "../../hooks/useHsnQuickAdd";

// The list API returns "--" for empty challan fields (for display).
const clean = (value) => (value === "--" || value === null || value === undefined ? "" : value);

const emptyDetails = (company_id = "") => ({
  type: "tax",
  invoiceNo: "",
  date: moment().format("YYYY-MM-DD"),
  transporter: "",
  ewayBill: "",
  company_id,
  billTo: "",
  shipTo: "",
  placeOfSupply: "",
  lorry_no: "",
  lr_no: "",
  container: "",
  cha: "",
  challan_id: "",
});

const CreateInvoice = () => {
  const { createInvoice, generateInvoiceNo, invoiceLoading } = useInvoiceStore();
  const { companyData, getAllCompany } = useCompanyStore();
  const { parties, getAllParty } = usePartyStore();
  const { gstData, getAllGst } = useGstStore();
  const { hsnData, getAllHsnSac } = useHsnSacStore();
  const { getAllChallan } = useChallanStore();
  const { token } = useAuthStore();

  const [searchParams] = useSearchParams();
  const back = searchParams.get("back");
  const challanId = searchParams.get("challanId");
  const navigate = useNavigate();

  const [details, setDetails] = useState(emptyDetails());
  const [items, setItems] = useState([newInvoiceRow()]);
  const [sameShip, setSameShip] = useState(true);
  const [sourceChallanNo, setSourceChallanNo] = useState("");
  const [saving, setSaving] = useState(false);

  // Creates the party and selects it in the field the "+" was clicked for.
  const partyAdd = usePartyQuickAdd({
    token,
    onCreated: (id, field) => {
      if (field === "shipTo") setSameShip(false);
      setDetails(prev => ({ ...prev, [field]: id }));
    },
  });

  const [chaModal, setChaModal] = useState(false);
  const { handleChaSubmit, chaData, getCha, loading: chaLoading, error: chaError } = useChaHook({
    onSuccess: () => setChaModal(false),
  });

  const { showCha } = useFormFieldSettings();
  const hsnAdd = useHsnQuickAdd({ token });

  const partyList = parties?.body || [];

  useEffect(() => {
    getCha();
    getAllParty(token);
    getAllCompany(token);
    getAllGst(token);
    getAllHsnSac(token);
  }, []);

  const generateInvoiceNumber = async (company_id) => {
    if (!company_id) return;
    try {
      const result = await generateInvoiceNo({ token, types: "invoice", company_id });
      if (result.status === 200) setDetails(prev => ({ ...prev, invoiceNo: result.body }));
    } catch (error) {
      console.log(error);
      toast.error("Could not generate the invoice number.");
    }
  };

  // A new number is needed whenever the company changes (each company has its own series).
  useEffect(() => {
    if (details.company_id) {
      setDetails(prev => ({ ...prev, invoiceNo: "" }));
      generateInvoiceNumber(details.company_id);
    }
  }, [details.company_id]);

  // With a single company there is nothing to choose.
  useEffect(() => {
    if (!details.company_id && !challanId && companyData?.length === 1) {
      setDetails(prev => ({ ...prev, company_id: companyData[0].id }));
    }
  }, [companyData]);

  // Prefill from a challan when opened via "Create Invoice" on the challan list.
  useEffect(() => {
    const loadChallanDraft = async () => {
      if (!challanId) return;
      try {
        const result = await getAllChallan({ id: challanId, token });
        const challan = result.body?.[0];
        if (!challan) {
          toast.error("Source challan was not found.");
          navigate("/view-challan");
          return;
        }
        if (challan.invoiced) {
          toast.info("An invoice has already been created for this challan.");
          navigate("/view-challan");
          return;
        }
        setSourceChallanNo(clean(challan.cn_no));
        setDetails(prev => ({
          ...prev,
          challan_id: challan.id,
          date: clean(challan.date) || prev.date,
          company_id: challan.company_id?.id || "",
          billTo: challan.consignee_id?.id || "",
          shipTo: challan.consignee_id?.id || "",
          ewayBill: clean(challan.way_bill_no),
          lorry_no: clean(challan.truck_no),
          lr_no: clean(challan.cn_no),
          container: clean(challan.container),
          cha: challan.cha?.id || "",
          placeOfSupply: clean(challan.to_loc),
        }));
        setSameShip(true);
        const rows = (challan.data || []).filter(row => row.description || row.packages);
        setItems(rows.length
          ? rows.map((row, index) => ({
            ...newInvoiceRow(),
            id: Math.floor(Math.random() * 10000000000) + index,
            description: row.description || "",
            quantity: Number(row.packages) || 1,
          }))
          : [newInvoiceRow()]);
      } catch (error) {
        console.log(error);
        toast.error("Unable to load the source challan.");
      }
    };
    loadChallanDraft();
  }, [challanId]);

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

  const handleSubmitForm = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (saving || invoiceLoading) return;

    if (!details.company_id) return toast.error("Please select a company.");
    if (!details.billTo) return toast.error("Please select who the invoice is billed to.");
    if (!details.invoiceNo) return toast.error("Invoice number is not ready yet. Please wait a moment.");
    if (!details.date) return toast.error("Please enter the invoice date.");
    const filled = items.filter(item => item.description || Number(item.quantity) || Number(item.rate));
    if (!filled.length) return toast.error("Add at least one item.");
    if (filled.some(item => !String(item.description).trim())) return toast.error("Every item needs a description.");

    const payload = {
      ...details,
      shipTo: sameShip ? details.billTo : (details.shipTo || details.billTo),
      challan_id: details.challan_id || undefined,
      // CHA switched off in settings: don't save one.
      ...(showCha ? {} : { cha: "" }),
      data: toInvoicePayloadItems(filled),
    };

    try {
      setSaving(true);
      const result = await createInvoice(payload, token);
      if (result.status === 200) {
        toast.success(result.message || "Invoice created.");
        if (details.challan_id) {
          navigate("/view-invoice");
          return;
        }
        // Ready for the next invoice: keep the company, get the next number.
        const companyId = details.company_id;
        setItems([newInvoiceRow()]);
        setSameShip(true);
        setDetails(emptyDetails(companyId));
        generateInvoiceNumber(companyId);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  useShortcuts({
    s: (e) => handleSubmitForm(e),
    i: () => navigate("/view-invoice"),
  }, !partyAdd.isOpen && !chaModal && !hsnAdd.isOpen);

  return (
    <>
      <PageTitle>Create Tax Invoice</PageTitle>

      <div className="flex flex-col gap-1">
        <ActionArea>
          {back && (
            <div onClick={() => navigate(-1)}>
              <CustomButton title={"Back"} color={"slate"}><AiOutlineRollback /></CustomButton>
            </div>
          )}
          <div onClick={handleSubmitForm}>
            <CustomButton title={"Save (Ctrl+S)"} color={"blue"} disabled={saving}><AiOutlineFileAdd /></CustomButton>
          </div>
          <Link to="/view-invoice">
            <CustomButton title={"View (Ctrl+I)"} color={"blue"}><AiOutlineTable /></CustomButton>
          </Link>
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
          onSubmit={handleSubmitForm}
          companyData={companyData}
          parties={partyList}
          gstData={gstData}
          hsnData={hsnData}
          onAddParty={partyAdd.open}
        onAddHsn={hsnAdd.open}
          chaData={chaData}
          onAddCha={() => setChaModal(true)}
          showCha={showCha}
          notice={sourceChallanNo ? (
            <div className="rounded border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 px-3 py-2 text-xs text-blue-800 dark:text-blue-200">
              Creating an invoice from challan <strong>{sourceChallanNo}</strong>. Party, transport details and items were copied from it. Add the rates and GST before saving.
            </div>
          ) : null}
        />
      </div>

      <PartyQuickAddModal {...partyAdd.modalProps} />
      <ChaQuickAddModal isOpen={chaModal} onClose={() => setChaModal(false)} onSubmit={handleChaSubmit} loading={chaLoading} error={chaError} />
    <HsnQuickAddModal {...hsnAdd.modalProps} />
    </>
  );
};

export default CreateInvoice;
