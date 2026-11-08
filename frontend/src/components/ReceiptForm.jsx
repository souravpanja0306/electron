import React from 'react';
import {
  AiOutlineTeam,
  AiOutlineWallet,
  AiOutlineUnorderedList,
  AiOutlineMessage,
  AiOutlineCalculator,
} from "react-icons/ai";

// Components...
import SearchableSelect from './SearchableSelect';
import {
  inputCls, cellCls, noSpinCls, readOnlyCls, StackedField, FormSection, Card, PickerRow, partyHint,
  AddButton, AddRowButton, RemoveRowButton, SummaryRow, AmountInWords, focusNextOnEnter,
  itemTableCls, itemHeadRowCls, itemThCls, itemRowCls, itemTdCls, itemFootRowCls, itemFootTdCls,
} from './FormKit';

// Utils...
import { inrToWords } from '../utils/InWordConverter';
import { formatINR, formatNumber } from '../utils/format';

export const PAYMENT_MODES = ["Cash", "UPI", "Bank Transfer", "Cheque"];

// What the reference field holds for each payment mode.
const REFERENCE_LABEL = {
  "Cash": "Reference",
  "UPI": "UPI Txn ID",
  "Bank Transfer": "UTR / Ref No",
  "Cheque": "Cheque No",
};

export const newReceiptRow = () => ({
  id: Math.floor(Math.random() * 10000000000),
  description: "",
  amount: "",
});

export const receiptTotal = (items) => items.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);

/** Segmented control for the payment mode: one click instead of a dropdown. */
const ModePicker = ({ value, onChange }) => {
  const modes = value && !PAYMENT_MODES.includes(value) ? [...PAYMENT_MODES, value] : PAYMENT_MODES;
  return (
    <div role="radiogroup" aria-label="Payment mode" className="grid grid-cols-2 sm:grid-cols-4 gap-1 rounded-md border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/60 p-0.5">
      {modes.map(mode => {
        const active = mode === value;
        return (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange({ target: { name: "payment_mode", value: mode } })}
            className={`h-7 rounded text-xs font-medium transition-colors ${active
              ? "bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600"
              : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"}`}
          >
            {mode}
          </button>
        );
      })}
    </div>
  );
};

/**
 * Shared money receipt form (Create and Edit). Purely presentational: the page owns the state.
 * `details` keys: company_id, party_id, receipt_no, receipt_date, payment_mode, reference, remarks
 * `onItemChange(id, patch)` merges `patch` into the row with that id.
 * Enter moves to the next field in reading order (focusNextOnEnter).
 */
const ReceiptForm = ({
  id = "receipt-form",
  details,
  onDetailChange,
  items,
  onItemChange,
  onAddRow,
  onRemoveRow,
  onSubmit,
  companyData,
  parties,
  onAddParty,
}) => {
  const total = receiptTotal(items);
  const referenceLabel = REFERENCE_LABEL[details.payment_mode] || "Reference";
  const party = (parties || []).find(p => String(p.id) === String(details.party_id));

  return (
    <form id={id} onSubmit={onSubmit} onKeyDown={focusNextOnEnter} className="flex flex-col gap-2" autoComplete="off" noValidate>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 items-stretch">
        <FormSection title="Received from" description="The company issuing the receipt and the party who paid." icon={<AiOutlineTeam />} cols={1}>
          <StackedField label="Company" required htmlFor="f-company_id">
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
                options={(parties || []).map(item => ({ id: item.id, label: item.company_name }))}
                placeholder="Select party"
                required
              />
              {onAddParty && <AddButton onClick={onAddParty} title="Add new party" />}
            </PickerRow>
          </StackedField>
        </FormSection>

        <FormSection title="Payment" description="Receipt number, date and how it was paid." icon={<AiOutlineWallet />}>
          <StackedField label="Receipt No" required htmlFor="f-receipt_no">
            <input
              id="f-receipt_no"
              className={`${inputCls} ${readOnlyCls} font-semibold tracking-wide`}
              type="text"
              name="receipt_no"
              value={details.receipt_no}
              readOnly
              tabIndex={-1}
              placeholder="Generating…"
            />
          </StackedField>
          <StackedField label="Date" required htmlFor="f-receipt_date">
            <input id="f-receipt_date" className={inputCls} type="date" name="receipt_date" value={details.receipt_date} onChange={onDetailChange} required />
          </StackedField>
          <StackedField label="Payment mode" className="md:col-span-2">
            <ModePicker value={details.payment_mode} onChange={onDetailChange} />
          </StackedField>
          <StackedField label={referenceLabel} htmlFor="f-reference" className="md:col-span-2">
            <input
              id="f-reference"
              className={inputCls}
              type="text"
              name="reference"
              value={details.reference}
              onChange={onDetailChange}
              placeholder={details.payment_mode === "Cash" ? "Optional" : referenceLabel}
            />
          </StackedField>
        </FormSection>
      </div>

      <Card
        title="Particulars"
        description="What the payment is against — one line per invoice or purpose."
        icon={<AiOutlineUnorderedList />}
        bodyClassName="p-0"
        footer={<AddRowButton onClick={onAddRow} />}
      >
        <div className="w-full overflow-x-auto">
          <table className={`${itemTableCls} min-w-[520px]`}>
            <thead>
              <tr className={itemHeadRowCls}>
                <th className={`${itemThCls} w-12 text-center`}>Sl.</th>
                <th className={`${itemThCls} text-left`}>Particulars</th>
                <th className={`${itemThCls} w-44 text-right`}>Amount (₹)</th>
                <th className={`${itemThCls} w-12`}><span className="sr-only">Remove</span></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className={itemRowCls}>
                  <td className={`${itemTdCls} text-center text-xs tabular-nums text-slate-400 dark:text-slate-500`}>{index + 1}</td>
                  <td className={itemTdCls}>
                    <input
                      className={`${cellCls} capitalize`}
                      value={item.description}
                      name="description"
                      type="text"
                      onChange={(e) => onItemChange(item.id, { description: e.target.value })}
                      placeholder="e.g. Against invoice INV-000012"
                      aria-label={`Particulars, row ${index + 1}`}
                    />
                  </td>
                  <td className={itemTdCls}>
                    <input
                      className={`${cellCls} ${noSpinCls} text-right tabular-nums`}
                      value={item.amount}
                      name="amount"
                      type="number"
                      min="0"
                      step="any"
                      onChange={(e) => onItemChange(item.id, { amount: e.target.value })}
                      onFocus={(e) => e.target.select()}
                      aria-label={`Amount, row ${index + 1}`}
                    />
                  </td>
                  <td className={`${itemTdCls} text-center`}>
                    <RemoveRowButton index={index} disabled={items.length <= 1} onClick={() => onRemoveRow(item.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className={itemFootRowCls}>
                <td className={itemFootTdCls}></td>
                <td className={`${itemFootTdCls} text-right text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400`}>Total</td>
                <td className={`${itemFootTdCls} text-right text-blue-600 dark:text-blue-400`}>{formatNumber(total)}</td>
                <td className={itemFootTdCls}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-2 items-start">
        <FormSection className="xl:col-span-2" title="Remarks" description="Printed on the receipt (optional)." icon={<AiOutlineMessage />} cols={1}>
          <textarea
            className={`${inputCls} h-auto py-1.5 resize-y`}
            name="remarks"
            rows="4"
            value={details.remarks}
            onChange={onDetailChange}
            placeholder="Anything to note on this receipt"
            aria-label="Remarks"
          />
        </FormSection>

        <Card title="Summary" icon={<AiOutlineCalculator />} className="xl:sticky xl:top-2">
          <div className="flex flex-col divide-y divide-slate-200 dark:divide-slate-700">
            <SummaryRow label="Payment mode" value={details.payment_mode || "--"} />
            {details.reference && <SummaryRow label={referenceLabel} value={details.reference} />}
            <SummaryRow label="Total received" value={formatINR(total)} strong accent />
          </div>
          <div className="pt-3">
            <AmountInWords>{total ? inrToWords(total) : ""}</AmountInWords>
          </div>
        </Card>
      </div>
    </form>
  );
};

export default ReceiptForm;
