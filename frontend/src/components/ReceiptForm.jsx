import React from 'react';

// Components...
import PageTitle from './PageTitle';
import MainArea from './MainArea';
import SearchableSelect from './SearchableSelect';
import {
  inputCls, cellCls, noSpinCls, readOnlyCls, itemHeadCls, Field, AddButton, AddRowButton,
  RemoveRowButton, SummaryRow, AmountInWords,
} from './FormKit';

// Utils / services...
import { inrToWords } from '../utils/InWordConverter';
import { formatINR, formatNumber } from '../utils/format';
import { handleEnter } from '../service/MainService';

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

/**
 * Shared money receipt form (Create and Edit). Purely presentational: the page owns the state.
 * `details` keys: company_id, party_id, receipt_no, receipt_date, payment_mode, reference, remarks
 * `onItemChange(id, patch)` merges `patch` into the row with that id.
 */
const ReceiptForm = ({
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

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-1" autoComplete="off">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
        {/* Who */}
        <div className="flex flex-col gap-1">
          <PageTitle>Received From</PageTitle>
          <MainArea>
            <div className="flex flex-col w-full gap-3 p-2">
              <Field label="Company" required>
                <SearchableSelect
                  className="flex-1 min-w-0"
                  name="company_id"
                  value={details.company_id}
                  onChange={onDetailChange}
                  options={companyData?.map(item => ({ id: item.id, label: item.company_name })) || []}
                  placeholder="Select Company"
                  required
                />
              </Field>
              <Field label="Party" required>
                <SearchableSelect
                  className="flex-1 min-w-0"
                  name="party_id"
                  value={details.party_id}
                  onChange={onDetailChange}
                  options={(parties || []).map(item => ({ id: item.id, label: item.company_name }))}
                  placeholder="Select Party"
                  required
                />
                {onAddParty && <AddButton onClick={onAddParty} title="Add new party" />}
              </Field>
            </div>
          </MainArea>
        </div>

        {/* Receipt info */}
        <div className="flex flex-col gap-1">
          <PageTitle>Receipt Info</PageTitle>
          <MainArea>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full p-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Receipt No<span className="text-red-500 ml-0.5">*</span></label>
                <input
                  className={`${inputCls} ${readOnlyCls} font-medium`}
                  type="text"
                  name="receipt_no"
                  value={details.receipt_no}
                  readOnly
                  placeholder="Generating…"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Date<span className="text-red-500 ml-0.5">*</span></label>
                <input
                  className={inputCls}
                  type="date"
                  name="receipt_date"
                  value={details.receipt_date}
                  onChange={onDetailChange}
                  onKeyDown={(e) => handleEnter({ event: e, name: "payment_mode" })}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Payment Mode</label>
                <select
                  className={inputCls}
                  name="payment_mode"
                  value={details.payment_mode}
                  onChange={onDetailChange}
                  onKeyDown={(e) => handleEnter({ event: e, name: "reference" })}
                >
                  {PAYMENT_MODES.map(mode => <option key={mode} value={mode}>{mode}</option>)}
                  {details.payment_mode && !PAYMENT_MODES.includes(details.payment_mode) && (
                    <option value={details.payment_mode}>{details.payment_mode}</option>
                  )}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">{referenceLabel}</label>
                <input
                  className={inputCls}
                  type="text"
                  name="reference"
                  value={details.reference}
                  onChange={onDetailChange}
                  onKeyDown={(e) => handleEnter({ event: e, name: "description", index: 0 })}
                  placeholder={details.payment_mode === "Cash" ? "Optional" : referenceLabel}
                />
              </div>
            </div>
          </MainArea>
        </div>
      </div>

      {/* Lines */}
      <PageTitle>Payment Details</PageTitle>
      <MainArea>
        <div className="flex flex-col w-full min-w-0 p-1 gap-2">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[520px] select-none border-separate border-spacing-y-1">
              <thead>
                <tr className={`${itemHeadCls} text-center`}>
                  <th className="w-10 pb-1">Sl.</th>
                  <th className="pb-1 text-left px-1">Particulars</th>
                  <th className="w-40 pb-1">Amount (₹)</th>
                  <th className="w-10 pb-1"><span className="sr-only">Remove</span></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="px-0.5 text-center text-sm text-slate-500 dark:text-slate-300">{index + 1}</td>
                    <td className="px-0.5">
                      <input
                        className={`${cellCls} capitalize`}
                        value={item.description}
                        name="description"
                        type="text"
                        onChange={(e) => onItemChange(item.id, { description: e.target.value })}
                        onKeyDown={(e) => handleEnter({ event: e, name: "amount", index })}
                        placeholder="e.g. Against invoice INV-000012"
                        aria-label={`Particulars, row ${index + 1}`}
                      />
                    </td>
                    <td className="px-0.5">
                      <input
                        className={`${cellCls} ${noSpinCls} text-right`}
                        value={item.amount}
                        name="amount"
                        type="number"
                        min="0"
                        step="any"
                        onChange={(e) => onItemChange(item.id, { amount: e.target.value })}
                        onKeyDown={(e) => handleEnter({ event: e, name: "description", index: index + 1 })}
                        onFocus={(e) => e.target.select()}
                        aria-label={`Amount, row ${index + 1}`}
                      />
                    </td>
                    <td className="px-0.5 text-center">
                      <RemoveRowButton index={index} disabled={items.length <= 1} onClick={() => onRemoveRow(item.id)} />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="text-sm font-semibold text-slate-700 dark:text-slate-100">
                  <td></td>
                  <td className="px-2 text-right border-t border-slate-300 dark:border-slate-600 pt-1 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">Total</td>
                  <td className="px-2 text-right border-t border-slate-300 dark:border-slate-600 pt-1 tabular-nums text-blue-600 dark:text-blue-400">{formatNumber(total)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          <AddRowButton onClick={onAddRow} />
        </div>
      </MainArea>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-1">
        <div className="flex flex-col gap-1 lg:col-span-2">
          <PageTitle>Remarks</PageTitle>
          <MainArea>
            <div className="w-full p-2">
              <textarea
                className={`${inputCls} h-auto py-1 resize-y`}
                name="remarks"
                rows="3"
                value={details.remarks}
                onChange={onDetailChange}
                placeholder="Anything to note on this receipt"
                aria-label="Remarks"
              />
            </div>
          </MainArea>
        </div>
        <div className="flex flex-col gap-1">
          <PageTitle>Summary</PageTitle>
          <MainArea>
            <div className="flex flex-col w-full p-2 divide-y divide-slate-300 dark:divide-slate-600">
              <SummaryRow label="Payment Mode" value={details.payment_mode || "--"} />
              <SummaryRow label="Total Received" value={formatINR(total)} strong accent />
              <div className="pt-2">
                <AmountInWords>{total ? inrToWords(total) : ""}</AmountInWords>
              </div>
            </div>
          </MainArea>
        </div>
      </div>
    </form>
  );
};

export default ReceiptForm;
