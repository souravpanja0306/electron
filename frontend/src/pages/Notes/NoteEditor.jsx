import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import moment from 'moment';
import { useNavigate, useSearchParams } from "react-router-dom";

// Icon...
import {
  AiOutlineFileAdd,
  AiOutlineSave,
  AiOutlineTable,
  AiOutlineRollback,
  AiOutlinePrinter,
  AiOutlineDelete,
  AiOutlineSync,
  AiOutlineInfoCircle,
} from "react-icons/ai";

// Components...
import PageTitle from '../../components/PageTitle';
import ActionArea from '../../components/ActionArea';
import CustomButton from '../../components/CustomButton';
import NoteForm from '../../components/NoteForm';
import { PartyQuickAddModal, HsnQuickAddModal, Notice } from '../../components/FormKit';

// Stores...
import useNoteStore from '../../store/NoteStore';
import useInvoiceStore from '../../store/InvoiceStore';
import useAuthStore from '../../store/AuthStore';
import useCompanyStore from "../../store/CompanyStore";
import usePartyStore from "../../store/PartyStore";
import useGstStore from "../../store/GstStore";
import useHsnSacStore from "../../store/HsnSacStore";

// Utils / hooks...
import { newInvoiceRow, toInvoicePayloadItems } from '../../utils/invoiceTotals';
import { errorMessage, openPrintWindow } from '../../utils/format';
import { noteConfig } from '../../utils/noteTypes';
import useShortcuts from "../../hooks/useShortcuts";
import usePartyQuickAdd from "../../hooks/usePartyQuickAdd";
import useHsnQuickAdd from "../../hooks/useHsnQuickAdd";

const emptyDetails = (company_id = "") => ({
  company_id,
  party_id: "",
  invoice_id: "",
  note_no: "",
  note_date: moment().format("YYYY-MM-DD"),
  placeOfSupply: "",
  reason: "",
});

const toRows = (data) => {
  const rows = (Array.isArray(data) ? data : []).map((row, index) => ({
    ...newInvoiceRow(),
    ...row,
    id: row.id || Math.floor(Math.random() * 10000000000) + index,
  }));
  return rows.length ? rows : [newInvoiceRow()];
};

/**
 * Create and edit a credit note or debit note (`type`).
 * - /create-credit-note                    new note
 * - /create-credit-note?invoiceId=12       new note prefilled from an invoice
 * - /view-credit-note/details?id=5         edit an existing note
 */
const NoteEditor = ({ type }) => {
  const config = noteConfig(type);
  const { generateNoteNo, getNotes, createNote, updateNote, deleteNote, printNote } = useNoteStore();
  const { invoiceData, getAllInvoice } = useInvoiceStore();
  const { companyData, getAllCompany } = useCompanyStore();
  const { parties, getAllParty } = usePartyStore();
  const { gstData, getAllGst } = useGstStore();
  const { hsnData, getAllHsnSac } = useHsnSacStore();
  const { token } = useAuthStore();

  const [searchParams] = useSearchParams();
  const back = searchParams.get("back");
  const noteId = searchParams.get("id");
  const sourceInvoiceId = searchParams.get("invoiceId");
  const isEdit = Boolean(noteId);
  const navigate = useNavigate();

  const [details, setDetails] = useState(emptyDetails());
  const [items, setItems] = useState([newInvoiceRow()]);
  const [saving, setSaving] = useState(false);
  const [sourceInvoiceNo, setSourceInvoiceNo] = useState("");

  const partyAdd = usePartyQuickAdd({
    token,
    onCreated: (id) => setDetails(prev => ({ ...prev, party_id: id, invoice_id: "" })),
  });
  const hsnAdd = useHsnQuickAdd({ token });

  const partyList = parties?.body || [];
  const invoices = invoiceData?.body || [];

  const generateNumber = async (company_id) => {
    if (!company_id || isEdit) return;
    try {
      const result = await generateNoteNo({ type, company_id });
      if (result.status === 200) setDetails(prev => ({ ...prev, note_no: result.body }));
    } catch (error) {
      console.log(error);
      toast.error(errorMessage(error, "Could not generate the note number."));
    }
  };

  const loadNote = async () => {
    try {
      const result = await getNotes({ id: noteId });
      const note = result.status === 200 ? result.body?.[0] : null;
      if (!note) {
        toast.error(`${config.title} not found.`);
        navigate(config.listUrl);
        return;
      }
      // Opened under the wrong type's URL: show it on its own page.
      if (note.note_type !== type) {
        navigate(noteConfig(note.note_type).detailsUrl(note.id), { replace: true });
        return;
      }
      setDetails({
        company_id: note.company_id?.id || "",
        party_id: note.party_id?.id || "",
        invoice_id: note.invoice?.id || "",
        note_no: note.note_no || "",
        note_date: note.note_date || "",
        placeOfSupply: note.placeOfSupply || "",
        reason: note.reason || "",
      });
      setItems(toRows(note.data));
    } catch (error) {
      console.log(error);
      toast.error(errorMessage(error, "Could not load the note."));
    }
  };

  useEffect(() => {
    getAllCompany(token);
    getAllParty(token);
    getAllGst(token);
    getAllHsnSac(token);
    getAllInvoice({ token }).catch(() => { });
    if (isEdit) loadNote();
  }, [noteId]);

  // Each company has its own CN / DN series, so a new number is needed when it changes.
  useEffect(() => {
    if (!isEdit && details.company_id) {
      setDetails(prev => ({ ...prev, note_no: "" }));
      generateNumber(details.company_id);
    }
  }, [details.company_id]);

  // With a single company there is nothing to choose.
  useEffect(() => {
    if (!isEdit && !sourceInvoiceId && !details.company_id && companyData?.length === 1) {
      setDetails(prev => ({ ...prev, company_id: companyData[0].id }));
    }
  }, [companyData]);

  // Prefill from an invoice ("Credit Note" / "Debit Note" on the invoice page).
  useEffect(() => {
    if (isEdit || !sourceInvoiceId || !invoices.length) return;
    const invoice = invoices.find(inv => String(inv.id) === String(sourceInvoiceId));
    if (!invoice) return;
    setSourceInvoiceNo(invoice.invoice_no);
    setDetails(prev => ({
      ...prev,
      company_id: invoice.company_id?.id || "",
      party_id: invoice.party_id?.id || "",
      invoice_id: invoice.id,
      placeOfSupply: invoice.placeOfSupply || "",
    }));
    setItems(toRows(invoice.data));
  }, [sourceInvoiceId, invoices.length]);

  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setDetails(prev => {
      const next = { ...prev, [name]: value };
      // A different party or company can't keep the old invoice reference.
      if ((name === "party_id" || name === "company_id") && String(value) !== String(prev[name])) next.invoice_id = "";
      if (name === "invoice_id" && value && !prev.placeOfSupply) {
        const invoice = invoices.find(inv => String(inv.id) === String(value));
        if (invoice?.placeOfSupply) next.placeOfSupply = invoice.placeOfSupply;
      }
      return next;
    });
  };

  const handleItemChange = (id, patch) => {
    setItems(prev => prev.map(item => (item.id === id ? { ...item, ...patch } : item)));
  };
  const handleAddRow = () => setItems(prev => [...prev, newInvoiceRow()]);
  const handleRemoveRow = (id) => setItems(prev => (prev.length > 1 ? prev.filter(item => item.id !== id) : prev));

  const handleSave = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (saving) return;

    if (!details.company_id) return toast.error("Please select a company.");
    if (!details.party_id) return toast.error("Please select the party.");
    if (!details.note_no) return toast.error("Note number is not ready yet. Please wait a moment.");
    if (!details.note_date) return toast.error("Please enter the date.");
    const filled = items.filter(item => item.description || Number(item.quantity) || Number(item.rate));
    if (!filled.length) return toast.error("Add at least one item.");
    if (filled.some(item => !String(item.description).trim())) return toast.error("Every item needs a description.");

    const payload = {
      note_type: type,
      company_id: details.company_id,
      party_id: details.party_id,
      invoice_id: details.invoice_id || null,
      note_no: details.note_no,
      note_date: details.note_date,
      placeOfSupply: details.placeOfSupply,
      reason: details.reason,
      data: toInvoicePayloadItems(filled),
    };

    try {
      setSaving(true);
      const result = isEdit ? await updateNote(noteId, payload) : await createNote(payload);
      if (result.status === 200) {
        toast.success(result.message);
        if (isEdit && back) navigate(-1);
        else navigate(config.listUrl);
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

  const handleDelete = async () => {
    if (!isEdit) return;
    if (!window.confirm(`Delete this ${config.title.toLowerCase()}? This cannot be undone.`)) return;
    try {
      const result = await deleteNote(noteId);
      if (result.status === 200) {
        toast.success(result.message);
        navigate(config.listUrl);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(errorMessage(error));
    }
  };

  const handlePrint = async () => {
    if (!isEdit) return;
    try {
      const result = await printNote(noteId);
      if (result.status !== 200) return toast.error(result.message);
      if (!openPrintWindow(result.body.html)) return toast.error("Nothing to print.");
    } catch (error) {
      console.log(error);
      toast.error(errorMessage(error));
    }
  };

  useShortcuts({
    s: (e) => handleSave(e),
    i: () => navigate(config.listUrl),
    ...(isEdit ? { p: () => handlePrint(), d: () => handleDelete() } : {}),
  }, !partyAdd.isOpen && !hsnAdd.isOpen);

  const heading = isEdit
    ? `Edit ${config.title}${details.note_no ? ` — ${details.note_no}` : ""}`
    : `Create ${config.title}`;

  return (
    <>
      <PageTitle>{heading}</PageTitle>

      <div className="flex flex-col gap-2">
        <ActionArea>
          <div className="flex flex-wrap justify-between w-full gap-1">
            <div className="flex flex-wrap gap-1">
              {(back || isEdit) && (
                <CustomButton onClick={() => navigate(-1)} title={"Back"} color={"slate"}><AiOutlineRollback /></CustomButton>
              )}
              {isEdit ? (
                <CustomButton onClick={handleSave} title={"Update (Ctrl+S)"} color={"blue"} disabled={saving}><AiOutlineSave /></CustomButton>
              ) : (
                <CustomButton onClick={handleSave} title={"Save (Ctrl+S)"} color={"blue"} disabled={saving}><AiOutlineFileAdd /></CustomButton>
              )}
              {isEdit && <CustomButton onClick={handlePrint} title={"Print (Ctrl+P)"} color={"slate"}><AiOutlinePrinter /></CustomButton>}
              <CustomButton onClick={() => navigate(config.listUrl)} title={"View (Ctrl+I)"} color={"slate"}><AiOutlineTable /></CustomButton>
              {isEdit && <CustomButton onClick={handleDelete} title={"Delete (Ctrl+D)"} color={"red"}><AiOutlineDelete /></CustomButton>}
            </div>
            {isEdit && <CustomButton onClick={loadNote} title={"Reload"} color={"slate"}><AiOutlineSync /></CustomButton>}
          </div>
        </ActionArea>

        <NoteForm
          type={type}
          details={details}
          onDetailChange={handleDetailChange}
          items={items}
          onItemChange={handleItemChange}
          onAddRow={handleAddRow}
          onRemoveRow={handleRemoveRow}
          onSubmit={handleSave}
          companyData={companyData}
          parties={partyList}
          invoices={invoices}
          gstData={gstData}
          hsnData={hsnData}
          onAddParty={partyAdd.open}
          onAddHsn={hsnAdd.open}
          notice={sourceInvoiceNo && !isEdit ? (
            <Notice tone="info" icon={<AiOutlineInfoCircle />}>
              Creating a {config.title.toLowerCase()} against invoice <strong>{sourceInvoiceNo}</strong>. Its party and items were copied — keep only the lines and amounts being {type === "credit" ? "credited" : "debited"}.
            </Notice>
          ) : null}
        />
      </div>

      <PartyQuickAddModal {...partyAdd.modalProps} />
      <HsnQuickAddModal {...hsnAdd.modalProps} />
    </>
  );
};

export default NoteEditor;
