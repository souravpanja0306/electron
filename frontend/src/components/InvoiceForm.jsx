import React from 'react';
import { Link } from "react-router-dom";

// Components...
import PageTitle from './PageTitle';
import MainArea from './MainArea';
import SearchableSelect from './SearchableSelect';
import { Badge } from './ListKit';
import {
  inputCls, cellCls, noSpinCls, readOnlyCls, itemHeadCls, Field, AddButton, AddRowButton,
  RemoveRowButton, SummaryRow, AmountInWords,
} from './FormKit';

// Utils / services...
import { inrToWords } from '../utils/InWordConverter';
import { formatINR, formatNumber } from '../utils/format';
import { isSameState, lineAmounts, computeInvoiceTotals } from '../utils/invoiceTotals';
import { handleEnter } from '../service/MainService';

// The current value is always offered, so an older invoice whose rate/code is no
// longer in the master still shows what it was saved with.
const gstOptions = (gstData, current) => {
  const options = [{ value: 0, label: "0%" }, ...(gstData || []).map(g => ({ value: Number(g.total_rate), label: g.title }))];
  const cur = Number(current) || 0;
  if (!options.some(o => o.value === cur)) options.push({ value: cur, label: `${cur}%` });
  return options;
};

const hsnOptions = (hsnData, current) => {
  const options = (hsnData || []).map(h => ({ value: String(h.code), label: h.description ? `${h.code} – ${h.description}` : String(h.code) }));
  if (current && !options.some(o => o.value === String(current))) options.push({ value: String(current), label: String(current) });
  return options;
};

/**
 * Shared invoice form (Create and Edit). Purely presentational: the page owns the state.
 *
 * `details` keys: company_id, billTo, shipTo, invoiceNo, date, placeOfSupply,
 *                 ewayBill, transporter, lorry_no, lr_no
 * `onItemChange(id, patch)` merges `patch` into the row with that id.
 */
const InvoiceForm = ({
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
  notice,
}) => {
  const partyList = parties || [];
  const partyOptions = partyList.map(item => ({ id: item.id, label: item.company_name }));
  const company = companyData?.find(c => String(c.id) === String(details.company_id));
  const party = partyList.find(p => String(p.id) === String(details.billTo));
  const sameState = isSameState(company, party);
  const totals = computeInvoiceTotals(items, sameState);
  const hasHsnMaster = (hsnData || []).length > 0;

  const handleHsnChange = (item, code) => {
    const patch = { hsn: code };
    // Use the HSN's default GST rate when the row doesn't have one yet.
    const master = (hsnData || []).find(h => String(h.code) === String(code));
    if (master && !(Number(item.gst) > 0) && Number(master.gst_rate) > 0) patch.gst = Number(master.gst_rate);
    onItemChange(item.id, patch);
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-1" autoComplete="off">
      {notice}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
        {/* Parties */}
        <div className="flex flex-col gap-1">
          <PageTitle>Party Information</PageTitle>
          <MainArea>
            <div className="flex flex-col w-full gap-3 p-2">
              <Field label="From Company" required>
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
              <Field label="Bill To" required>
                <SearchableSelect
                  className="flex-1 min-w-0"
                  name="billTo"
                  value={details.billTo}
                  onChange={onDetailChange}
                  options={partyOptions}
                  placeholder="Select Party"
                  required
                />
                {onAddParty && <AddButton onClick={() => onAddParty("billTo")} title="Add new party" />}
              </Field>
              <Field
                label="Ship To"
                hint={
                  <label className="inline-flex items-center gap-1 cursor-pointer select-none">
                    <input type="checkbox" checked={sameShip} onChange={(e) => onSameShipChange(e.target.checked)} />
                    Same as Bill To
                  </label>
                }
              >
                {sameShip ? (
                  <input
                    className={`${inputCls} ${readOnlyCls}`}
                    value={party?.company_name || ""}
                    placeholder="Same as Bill To"
                    readOnly
                    aria-label="Ship To"
                  />
                ) : (
                  <>
                    <SearchableSelect
                      className="flex-1 min-w-0"
                      name="shipTo"
                      value={details.shipTo}
                      onChange={onDetailChange}
                      options={partyOptions}
                      placeholder="Select Party"
                    />
                    {onAddParty && <AddButton onClick={() => onAddParty("shipTo")} title="Add new party" />}
                  </>
                )}
              </Field>
            </div>
          </MainArea>
        </div>

        {/* Invoice info */}
        <div className="flex flex-col gap-1">
          <PageTitle>Invoice Info</PageTitle>
          <MainArea>
            <div className="flex flex-col w-full gap-3 p-2">
              <Field label="Invoice No" required>
                <input
                  className={`${inputCls} ${readOnlyCls} font-medium`}
                  type="text"
                  name="invoiceNo"
                  value={details.invoiceNo}
                  readOnly
                  placeholder={details.company_id ? "Generating…" : "Select a company first"}
                />
              </Field>
              <Field label="Date" required>
                <input
                  className={inputCls}
                  type="date"
                  name="date"
                  value={details.date}
                  onChange={onDetailChange}
                  onKeyDown={(e) => handleEnter({ event: e, name: "placeOfSupply" })}
                  required
                />
              </Field>
              <Field label="Place of Supply">
                <input
                  className={`${inputCls} capitalize`}
                  type="text"
                  name="placeOfSupply"
                  value={details.placeOfSupply}
                  onChange={onDetailChange}
                  onKeyDown={(e) => handleEnter({ event: e, name: "description", index: 0 })}
                  placeholder="e.g. Kolkata"
                />
              </Field>
              <Field label="Tax Type">
                {sameState
                  ? <Badge tone="blue">Intra-state · CGST + SGST</Badge>
                  : <Badge tone="amber">Inter-state · IGST</Badge>}
              </Field>
            </div>
          </MainArea>
        </div>
      </div>

      {/* Items */}
      <PageTitle>Invoice Items</PageTitle>
      <MainArea>
        <div className="flex flex-col w-full min-w-0 p-1 gap-2">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[940px] select-none border-separate border-spacing-y-1">
              <thead>
                <tr className={`${itemHeadCls} text-center`}>
                  <th className="w-10 pb-1">Sl.</th>
                  <th className="pb-1 text-left px-1">Description</th>
                  <th className="w-40 pb-1">HSN / SAC</th>
                  <th className="w-20 pb-1">Qty</th>
                  <th className="w-24 pb-1">Rate (₹)</th>
                  <th className="w-28 pb-1">Taxable (₹)</th>
                  <th className="w-28 pb-1">GST</th>
                  <th className="w-24 pb-1">Tax (₹)</th>
                  <th className="w-28 pb-1">Total (₹)</th>
                  <th className="w-10 pb-1"><span className="sr-only">Remove</span></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const line = lineAmounts(item);
                  return (
                    <tr key={item.id}>
                      <td className="px-0.5 text-center text-sm text-slate-500 dark:text-slate-300">{index + 1}</td>
                      <td className="px-0.5">
                        <input
                          className={`${cellCls} capitalize`}
                          value={item.description}
                          type="text"
                          name="description"
                          onChange={(e) => onItemChange(item.id, { description: e.target.value })}
                          onKeyDown={(e) => handleEnter({ event: e, name: "hsn", index })}
                          aria-label={`Description, row ${index + 1}`}
                        />
                      </td>
                      <td className="px-0.5">
                        {hasHsnMaster ? (
                          <select
                            name="hsn"
                            className={cellCls}
                            value={item.hsn || ""}
                            onChange={(e) => handleHsnChange(item, e.target.value)}
                            onKeyDown={(e) => handleEnter({ event: e, name: "quantity", index })}
                            aria-label={`HSN, row ${index + 1}`}
                          >
                            <option value="">Select</option>
                            {hsnOptions(hsnData, item.hsn).map(o => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            name="hsn"
                            className={cellCls}
                            value={item.hsn || ""}
                            onChange={(e) => onItemChange(item.id, { hsn: e.target.value })}
                            onKeyDown={(e) => handleEnter({ event: e, name: "quantity", index })}
                            placeholder="HSN"
                            aria-label={`HSN, row ${index + 1}`}
                          />
                        )}
                      </td>
                      <td className="px-0.5">
                        <input
                          className={`${cellCls} ${noSpinCls} text-right`}
                          value={item.quantity}
                          name="quantity"
                          type="number"
                          min="0"
                          step="any"
                          onChange={(e) => onItemChange(item.id, { quantity: e.target.value })}
                          onKeyDown={(e) => handleEnter({ event: e, name: "rate", index })}
                          onFocus={(e) => e.target.select()}
                          aria-label={`Quantity, row ${index + 1}`}
                        />
                      </td>
                      <td className="px-0.5">
                        <input
                          className={`${cellCls} ${noSpinCls} text-right`}
                          value={item.rate}
                          name="rate"
                          type="number"
                          min="0"
                          step="any"
                          onChange={(e) => onItemChange(item.id, { rate: e.target.value })}
                          onKeyDown={(e) => handleEnter({ event: e, name: "gst", index })}
                          onFocus={(e) => e.target.select()}
                          aria-label={`Rate, row ${index + 1}`}
                        />
                      </td>
                      <td className="px-2 text-right text-sm tabular-nums text-slate-700 dark:text-slate-200">{formatNumber(line.taxable)}</td>
                      <td className="px-0.5">
                        <select
                          name="gst"
                          className={cellCls}
                          value={Number(item.gst) || 0}
                          onChange={(e) => onItemChange(item.id, { gst: Number(e.target.value) })}
                          onKeyDown={(e) => handleEnter({ event: e, name: "description", index: index + 1 })}
                          aria-label={`GST rate, row ${index + 1}`}
                        >
                          {gstOptions(gstData, item.gst).map((o, i) => (
                            <option key={`${o.value}-${i}`} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 text-right text-sm tabular-nums text-slate-700 dark:text-slate-200">{formatNumber(line.tax)}</td>
                      <td className="px-2 text-right text-sm tabular-nums font-semibold text-slate-800 dark:text-slate-100">{formatNumber(line.total)}</td>
                      <td className="px-0.5 text-center">
                        <RemoveRowButton index={index} disabled={items.length <= 1} onClick={() => onRemoveRow(item.id)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="text-sm font-semibold text-slate-700 dark:text-slate-100">
                  <td></td>
                  <td colSpan={2} className="px-2 text-right border-t border-slate-300 dark:border-slate-600 pt-1 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">Total</td>
                  <td className="px-2 text-right border-t border-slate-300 dark:border-slate-600 pt-1 tabular-nums">{formatNumber(totals.quantity)}</td>
                  <td className="border-t border-slate-300 dark:border-slate-600"></td>
                  <td className="px-2 text-right border-t border-slate-300 dark:border-slate-600 pt-1 tabular-nums">{formatNumber(totals.taxable)}</td>
                  <td className="border-t border-slate-300 dark:border-slate-600"></td>
                  <td className="px-2 text-right border-t border-slate-300 dark:border-slate-600 pt-1 tabular-nums">{formatNumber(totals.cgst + totals.sgst + totals.igst)}</td>
                  <td className="px-2 text-right border-t border-slate-300 dark:border-slate-600 pt-1 tabular-nums text-blue-600 dark:text-blue-400">{formatNumber(totals.grand)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <AddRowButton onClick={onAddRow} />
            {!hasHsnMaster && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                No HSN/SAC codes yet — <Link to="/create-hsn-sac?back=true" className="text-blue-600 dark:text-blue-400 hover:underline">add them</Link> to pick from a list.
              </span>
            )}
            {!(gstData || []).length && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                No GST rates yet — <Link to="/create-gst?back=true" className="text-blue-600 dark:text-blue-400 hover:underline">add them</Link>.
              </span>
            )}
          </div>
        </div>
      </MainArea>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-1">
        {/* Transport */}
        <div className="flex flex-col gap-1 lg:col-span-2">
          <PageTitle>Additional Info</PageTitle>
          <MainArea>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full p-2">
              <Field label="E-Way Bill">
                <input
                  className={inputCls}
                  type="text"
                  name="ewayBill"
                  value={details.ewayBill}
                  onChange={onDetailChange}
                  onKeyDown={(e) => handleEnter({ event: e, name: "transporter" })}
                  placeholder="E-Way Bill No"
                />
              </Field>
              <Field label="Transporter">
                <input
                  className={`${inputCls} capitalize`}
                  type="text"
                  name="transporter"
                  value={details.transporter}
                  onChange={onDetailChange}
                  onKeyDown={(e) => handleEnter({ event: e, name: "lorry_no" })}
                  placeholder="Transporter"
                />
              </Field>
              <Field label="Lorry No">
                <input
                  className={`${inputCls} uppercase`}
                  type="text"
                  name="lorry_no"
                  value={details.lorry_no}
                  onChange={onDetailChange}
                  onKeyDown={(e) => handleEnter({ event: e, name: "lr_no" })}
                  placeholder="Lorry No"
                />
              </Field>
              <Field label="LR No">
                <input
                  className={inputCls}
                  type="text"
                  name="lr_no"
                  value={details.lr_no}
                  onChange={onDetailChange}
                  placeholder="LR No"
                />
              </Field>
            </div>
          </MainArea>
        </div>

        {/* Summary */}
        <div className="flex flex-col gap-1">
          <PageTitle>Summary</PageTitle>
          <MainArea>
            <div className="flex flex-col w-full p-2 divide-y divide-slate-300 dark:divide-slate-600">
              <SummaryRow label="Total Quantity" value={formatNumber(totals.quantity)} />
              <SummaryRow label="Taxable Value" value={formatINR(totals.taxable)} />
              {sameState ? (
                <>
                  <SummaryRow label="CGST" value={formatINR(totals.cgst)} />
                  <SummaryRow label="SGST" value={formatINR(totals.sgst)} />
                </>
              ) : (
                <SummaryRow label="IGST" value={formatINR(totals.igst)} />
              )}
              <SummaryRow label="Grand Total" value={formatINR(totals.grand)} strong accent />
              <div className="pt-2">
                <AmountInWords>{totals.grand ? inrToWords(totals.grand) : ""}</AmountInWords>
              </div>
            </div>
          </MainArea>
        </div>
      </div>
    </form>
  );
};

export default InvoiceForm;
