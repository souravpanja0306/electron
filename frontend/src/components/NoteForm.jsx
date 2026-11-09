import React from 'react';
import { AiOutlineTeam, AiOutlineFileText } from "react-icons/ai";

// Components...
import SearchableSelect from './SearchableSelect';
import { Badge } from './ListKit';
import { inputCls, readOnlyCls, StackedField, FormSection, PickerRow, partyHint, AddButton, focusNextOnEnter } from './FormKit';
import { InvoiceItemsCard, TaxSummaryCard } from './InvoiceItems';

// Utils...
import { isSameState, computeInvoiceTotals, invoiceGrandTotal } from '../utils/invoiceTotals';
import { formatDate, formatINR } from '../utils/format';
import { noteConfig } from '../utils/noteTypes';

/**
 * Shared credit / debit note form (Create and Edit). Purely presentational: the page owns the state.
 *
 * `details` keys: company_id, party_id, invoice_id, note_no, note_date, placeOfSupply, reason
 * `invoices`: the selected party's invoices (for "Against invoice").
 */
const NoteForm = ({
  id = "note-form",
  type,
  details,
  onDetailChange,
  items,
  onItemChange,
  onAddRow,
  onRemoveRow,
  onSubmit,
  companyData,
  parties,
  invoices,
  gstData,
  hsnData,
  onAddParty,
  onAddHsn,
  notice,
}) => {
  const config = noteConfig(type);
  const partyList = parties || [];
  const company = companyData?.find(c => String(c.id) === String(details.company_id));
  const party = partyList.find(p => String(p.id) === String(details.party_id));
  const sameState = isSameState(company, party);
  const totals = computeInvoiceTotals(items, sameState);

  // Only the selected party's invoices from the selected company can be referenced.
  const invoiceOptions = (invoices || [])
    .filter(inv => String(inv.party_id?.id) === String(details.party_id) && String(inv.company_id?.id) === String(details.company_id))
    .map(inv => ({ id: inv.id, label: `${inv.invoice_no} · ${formatDate(inv.invoice_date)} · ${formatINR(invoiceGrandTotal(inv))}` }));
  const linkedInvoice = (invoices || []).find(inv => String(inv.id) === String(details.invoice_id));

  const taxBadge = sameState
    ? <Badge tone="blue">Intra-state · CGST + SGST</Badge>
    : <Badge tone="amber">Inter-state · IGST</Badge>;

  return (
    <form id={id} onSubmit={onSubmit} onKeyDown={focusNextOnEnter} className="flex flex-col gap-2" autoComplete="off" noValidate>
      {notice}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 items-stretch">
        <FormSection title="Party" description={config.effect} icon={<AiOutlineTeam />} cols={1}>
          <StackedField label="From company" required htmlFor="f-company_id" hint={company?.state ? `Registered in ${company.state}.` : ""}>
            <SearchableSelect
              id="f-company_id"
              name="company_id"
              value={details.company_id}
              onChange={onDetailChange}
              options={companyData?.map(item => ({ id: item.id, label: item.company_name })) || []}
              placeholder="Select company"
              required
            />
          </StackedField>
          <StackedField label="Party" required htmlFor="f-party_id" hint={partyHint(party)}>
            <PickerRow>
              <SearchableSelect
                id="f-party_id"
                className="flex-1 min-w-0"
                name="party_id"
                value={details.party_id}
                onChange={onDetailChange}
                options={partyList.map(item => ({ id: item.id, label: item.company_name }))}
                placeholder="Select party"
                required
              />
              {onAddParty && <AddButton onClick={() => onAddParty("party_id")} title="Add new party" />}
            </PickerRow>
          </StackedField>
          <StackedField
            label="Against invoice"
            htmlFor="f-invoice_id"
            hint={!details.party_id
              ? "Select a party to see its invoices."
              : invoiceOptions.length ? "Optional. The invoice this note corrects." : "This party has no invoices from this company."}
          >
            <SearchableSelect
              id="f-invoice_id"
              name="invoice_id"
              value={details.invoice_id}
              onChange={onDetailChange}
              options={invoiceOptions.length || !linkedInvoice ? invoiceOptions : [{ id: linkedInvoice.id, label: linkedInvoice.invoice_no }]}
              placeholder={details.party_id ? "Select invoice (optional)" : "Select a party first"}
            />
          </StackedField>
        </FormSection>

        <FormSection title={config.title} description="Number, date and why it is being issued." icon={<AiOutlineFileText />} aside={taxBadge}>
          <StackedField label={`${config.title} No`} required htmlFor="f-note_no" hint="Generated from the company's series.">
            <input
              id="f-note_no"
              className={`${inputCls} ${readOnlyCls} font-semibold tracking-wide`}
              type="text"
              name="note_no"
              value={details.note_no}
              readOnly
              tabIndex={-1}
              placeholder={details.company_id ? "Generating…" : "Select a company first"}
            />
          </StackedField>
          <StackedField label="Date" required htmlFor="f-note_date">
            <input id="f-note_date" className={inputCls} type="date" name="note_date" value={details.note_date} onChange={onDetailChange} required />
          </StackedField>
          <StackedField label="Place of supply" htmlFor="f-placeOfSupply" className="md:col-span-2">
            <input
              id="f-placeOfSupply"
              className={`${inputCls} capitalize`}
              type="text"
              name="placeOfSupply"
              value={details.placeOfSupply}
              onChange={onDetailChange}
              placeholder="e.g. Kolkata"
            />
          </StackedField>
          <StackedField label="Reason" htmlFor="f-reason" className="md:col-span-2">
            <textarea
              id="f-reason"
              className={`${inputCls} h-auto py-1.5 resize-y`}
              name="reason"
              rows={2}
              value={details.reason}
              onChange={onDetailChange}
              placeholder={type === "credit" ? "e.g. Goods returned, rate difference, discount" : "e.g. Extra freight, rate difference"}
            />
          </StackedField>
        </FormSection>
      </div>

      <InvoiceItemsCard
        items={items}
        totals={totals}
        onItemChange={onItemChange}
        onAddRow={onAddRow}
        onRemoveRow={onRemoveRow}
        gstData={gstData}
        hsnData={hsnData}
        onAddHsn={onAddHsn}
        description={`Goods or services being ${type === "credit" ? "credited" : "debited"}, with HSN/SAC and GST for each line.`}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-2 items-start">
        <div className="hidden xl:block xl:col-span-2" />
        <TaxSummaryCard totals={totals} sameState={sameState} grandLabel={config.grandLabel} />
      </div>
    </form>
  );
};

export default NoteForm;
