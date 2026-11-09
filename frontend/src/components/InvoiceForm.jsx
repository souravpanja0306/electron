import React from 'react';
import {
  AiOutlineTeam,
  AiOutlineFileText,
  AiOutlineCar,
} from "react-icons/ai";

// Components...
import SearchableSelect from './SearchableSelect';
import { Badge } from './ListKit';
import { inputCls, readOnlyCls, StackedField, FormSection, PickerRow, partyHint, AddButton, focusNextOnEnter } from './FormKit';
import { InvoiceItemsCard, TaxSummaryCard } from './InvoiceItems';

// Utils...
import { isSameState, computeInvoiceTotals } from '../utils/invoiceTotals';

/**
 * Shared invoice form (Create and Edit). Purely presentational: the page owns the state.
 *
 * `details` keys: company_id, billTo, shipTo, invoiceNo, date, placeOfSupply,
 *                 ewayBill, transporter, lorry_no (truck no), lr_no, container, cha
 * `onItemChange(id, patch)` merges `patch` into the row with that id.
 * Enter moves to the next field in reading order (focusNextOnEnter).
 */
const InvoiceForm = ({
  id = "invoice-form",
  details,
  onDetailChange,
  sameShip,
  onSameShipChange,
  items,
  onItemChange,
  onAddRow,
  onRemoveRow,
  onSubmit,
  companyData,
  parties,
  gstData,
  hsnData,
  onAddParty,
  onAddHsn,
  chaData,
  onAddCha,
  showCha = true,
  notice,
}) => {
  const partyList = parties || [];
  const partyOptions = partyList.map(item => ({ id: item.id, label: item.company_name }));
  const findParty = (pid) => partyList.find(p => String(p.id) === String(pid));
  const company = companyData?.find(c => String(c.id) === String(details.company_id));
  const party = findParty(details.billTo);
  const sameState = isSameState(company, party);
  const totals = computeInvoiceTotals(items, sameState);

  const taxBadge = sameState
    ? <Badge tone="blue">Intra-state · CGST + SGST</Badge>
    : <Badge tone="amber">Inter-state · IGST</Badge>;

  return (
    <form id={id} onSubmit={onSubmit} onKeyDown={focusNextOnEnter} className="flex flex-col gap-2" autoComplete="off" noValidate>
      {notice}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 items-stretch">
        <FormSection title="Parties" description="Who is billing and who is being billed." icon={<AiOutlineTeam />} cols={1}>
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
          <StackedField label="Bill to" required htmlFor="f-billTo" hint={partyHint(party)}>
            <PickerRow>
              <SearchableSelect
                id="f-billTo"
                className="flex-1 min-w-0"
                name="billTo"
                value={details.billTo}
                onChange={onDetailChange}
                options={partyOptions}
                placeholder="Select party"
                required
              />
              {onAddParty && <AddButton onClick={() => onAddParty("billTo")} title="Add new party" />}
            </PickerRow>
          </StackedField>
          <div className="flex flex-col gap-1 w-full min-w-0">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor={sameShip ? "f-shipTo-same" : "f-shipTo"} className="text-xs font-medium text-slate-600 dark:text-slate-300">Ship to</label>
              <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                <input type="checkbox" checked={sameShip} onChange={(e) => onSameShipChange(e.target.checked)} />
                Same as bill to
              </label>
            </div>
            {sameShip ? (
              <input
                id="f-shipTo-same"
                className={`${inputCls} ${readOnlyCls}`}
                value={party?.company_name || ""}
                placeholder="Same as bill to"
                readOnly
                tabIndex={-1}
              />
            ) : (
              <PickerRow>
                <SearchableSelect
                  id="f-shipTo"
                  className="flex-1 min-w-0"
                  name="shipTo"
                  value={details.shipTo}
                  onChange={onDetailChange}
                  options={partyOptions}
                  placeholder="Select party"
                />
                {onAddParty && <AddButton onClick={() => onAddParty("shipTo")} title="Add new party" />}
              </PickerRow>
            )}
            {!sameShip && partyHint(findParty(details.shipTo)) && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{partyHint(findParty(details.shipTo))}</p>
            )}
          </div>
        </FormSection>

        <FormSection title="Invoice" description="Number, date and where the supply is made." icon={<AiOutlineFileText />} aside={taxBadge}>
          <StackedField label="Invoice No" required htmlFor="f-invoiceNo" hint="Generated from the company's series.">
            <input
              id="f-invoiceNo"
              className={`${inputCls} ${readOnlyCls} font-semibold tracking-wide`}
              type="text"
              name="invoiceNo"
              value={details.invoiceNo}
              readOnly
              tabIndex={-1}
              placeholder={details.company_id ? "Generating…" : "Select a company first"}
            />
          </StackedField>
          <StackedField label="Date" required htmlFor="f-date">
            <input id="f-date" className={inputCls} type="date" name="date" value={details.date} onChange={onDetailChange} required />
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
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-2 items-start">
        <FormSection className="xl:col-span-2" title="Transport" description="Printed on the invoice for the consignment." icon={<AiOutlineCar />}>
          <StackedField label="E-Way Bill" htmlFor="f-ewayBill">
            <input id="f-ewayBill" className={inputCls} type="text" name="ewayBill" value={details.ewayBill} onChange={onDetailChange} placeholder="E-Way Bill No" />
          </StackedField>
          <StackedField label="Transporter" htmlFor="f-transporter">
            <input id="f-transporter" className={`${inputCls} capitalize`} type="text" name="transporter" value={details.transporter} onChange={onDetailChange} placeholder="Transporter" />
          </StackedField>
          <StackedField label="Truck No" htmlFor="f-lorry_no">
            <input id="f-lorry_no" className={`${inputCls} uppercase tracking-wide`} type="text" name="lorry_no" value={details.lorry_no} onChange={onDetailChange} placeholder="e.g. WB 11 A 1234" />
          </StackedField>
          <StackedField label="LR No" htmlFor="f-lr_no">
            <input id="f-lr_no" className={inputCls} type="text" name="lr_no" value={details.lr_no} onChange={onDetailChange} placeholder="LR / C/N No" />
          </StackedField>
          <StackedField label="Container" htmlFor="f-container" className={showCha ? "" : "md:col-span-2"}>
            <input id="f-container" className={`${inputCls} uppercase`} type="text" name="container" value={details.container || ""} onChange={onDetailChange} placeholder="Container No" />
          </StackedField>
          {showCha && (
            <StackedField label="CHA" htmlFor="f-cha">
              <PickerRow>
                <SearchableSelect
                  id="f-cha"
                  className="flex-1 min-w-0"
                  name="cha"
                  value={details.cha || ""}
                  onChange={onDetailChange}
                  options={(chaData || []).map(item => ({ id: item.id, label: item.name }))}
                  placeholder="Select CHA"
                />
                {onAddCha && <AddButton onClick={onAddCha} title="Add new CHA" />}
              </PickerRow>
            </StackedField>
          )}
        </FormSection>

        <TaxSummaryCard totals={totals} sameState={sameState} />
      </div>
    </form>
  );
};

export default InvoiceForm;
