import React from 'react';
import { Link } from "react-router-dom";
import { AiOutlineShopping, AiOutlineCalculator } from "react-icons/ai";

// Components...
import { Badge } from './ListKit';
import {
  cellCls, noSpinCls, Card, AddRowButton, RemoveRowButton, SummaryRow, AmountInWords,
  itemTableCls, itemHeadRowCls, itemThCls, itemRowCls, itemTdCls, itemFootRowCls, itemFootTdCls, itemCalcCls,
} from './FormKit';

// Utils...
import { inrToWords } from '../utils/InWordConverter';
import { formatINR, formatNumber } from '../utils/format';
import { lineAmounts } from '../utils/invoiceTotals';

/*
 * The GST line-item table and the tax summary, shared by the tax invoice and the
 * credit / debit note forms so all three look and calculate the same.
 */

// The current value is always offered, so an older document whose rate/code is no
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

const linkCls = "text-blue-600 dark:text-blue-400 hover:underline";

/** Items card. `totals` comes from computeInvoiceTotals(); `onItemChange(id, patch)` merges into a row. */
export const InvoiceItemsCard = ({
  items,
  totals,
  onItemChange,
  onAddRow,
  onRemoveRow,
  gstData,
  hsnData,
  onAddHsn,
  description = "Goods or services billed, with HSN/SAC and GST for each line.",
}) => {
  const hasHsnMaster = (hsnData || []).length > 0;
  const hasGstMaster = (gstData || []).length > 0;
  const filledRows = items.filter(item => item.description || Number(item.quantity) || Number(item.rate)).length;

  const handleHsnChange = (item, code) => {
    const patch = { hsn: code };
    // Use the HSN's default GST rate when the row doesn't have one yet.
    const master = (hsnData || []).find(h => String(h.code) === String(code));
    if (master && !(Number(item.gst) > 0) && Number(master.gst_rate) > 0) patch.gst = Number(master.gst_rate);
    onItemChange(item.id, patch);
  };

  return (
    <Card
      title="Items"
      description={description}
      icon={<AiOutlineShopping />}
      aside={<Badge tone="slate">{filledRows} {filledRows === 1 ? "line" : "lines"}</Badge>}
      bodyClassName="p-0"
      footer={
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <AddRowButton onClick={onAddRow} />
          {onAddHsn && <AddRowButton onClick={onAddHsn} label="Add HSN/SAC" />}
          {!hasHsnMaster && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {onAddHsn
                ? "No HSN/SAC codes in the master yet — use Add HSN/SAC to add one."
                : <>No HSN/SAC codes yet — <Link to="/create-hsn-sac?back=true" className={linkCls}>add them</Link> to pick from a list.</>}
            </span>
          )}
          {!hasGstMaster && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              No GST rates yet — <Link to="/create-gst?back=true" className={linkCls}>add them</Link>.
            </span>
          )}
        </div>
      }
    >
      <div className="w-full overflow-x-auto">
        <table className={`${itemTableCls} min-w-[980px]`}>
          <thead>
            <tr className={itemHeadRowCls}>
              <th className={`${itemThCls} w-10 text-center`}>Sl.</th>
              <th className={`${itemThCls} text-left`}>Description</th>
              <th className={`${itemThCls} w-40 text-left`}>HSN / SAC</th>
              <th className={`${itemThCls} w-20 text-right`}>Qty</th>
              <th className={`${itemThCls} w-28 text-right`}>Rate (₹)</th>
              <th className={`${itemThCls} w-28 text-right`}>Taxable (₹)</th>
              <th className={`${itemThCls} w-28 text-left`}>GST</th>
              <th className={`${itemThCls} w-24 text-right`}>Tax (₹)</th>
              <th className={`${itemThCls} w-28 text-right`}>Total (₹)</th>
              <th className={`${itemThCls} w-12`}><span className="sr-only">Remove</span></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const line = lineAmounts(item);
              return (
                <tr key={item.id} className={itemRowCls}>
                  <td className={`${itemTdCls} text-center text-xs tabular-nums text-slate-400 dark:text-slate-500`}>{index + 1}</td>
                  <td className={itemTdCls}>
                    <input
                      className={`${cellCls} capitalize`}
                      value={item.description}
                      type="text"
                      name="description"
                      onChange={(e) => onItemChange(item.id, { description: e.target.value })}
                      placeholder="Item or service"
                      aria-label={`Description, row ${index + 1}`}
                    />
                  </td>
                  <td className={itemTdCls}>
                    <select
                      name="hsn"
                      className={cellCls}
                      value={item.hsn || ""}
                      onChange={(e) => handleHsnChange(item, e.target.value)}
                      aria-label={`HSN/SAC, row ${index + 1}`}
                    >
                      <option value="">{hasHsnMaster ? "Select" : "No codes"}</option>
                      {hsnOptions(hsnData, item.hsn).map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className={itemTdCls}>
                    <input
                      className={`${cellCls} ${noSpinCls} text-right tabular-nums`}
                      value={item.quantity}
                      name="quantity"
                      type="number"
                      min="0"
                      step="any"
                      onChange={(e) => onItemChange(item.id, { quantity: e.target.value })}
                      onFocus={(e) => e.target.select()}
                      aria-label={`Quantity, row ${index + 1}`}
                    />
                  </td>
                  <td className={itemTdCls}>
                    <input
                      className={`${cellCls} ${noSpinCls} text-right tabular-nums`}
                      value={item.rate}
                      name="rate"
                      type="number"
                      min="0"
                      step="any"
                      onChange={(e) => onItemChange(item.id, { rate: e.target.value })}
                      onFocus={(e) => e.target.select()}
                      aria-label={`Rate, row ${index + 1}`}
                    />
                  </td>
                  <td className={`${itemTdCls} ${itemCalcCls}`}>{formatNumber(line.taxable)}</td>
                  <td className={itemTdCls}>
                    <select
                      name="gst"
                      className={cellCls}
                      value={Number(item.gst) || 0}
                      onChange={(e) => onItemChange(item.id, { gst: Number(e.target.value) })}
                      aria-label={`GST rate, row ${index + 1}`}
                    >
                      {gstOptions(gstData, item.gst).map((o, i) => (
                        <option key={`${o.value}-${i}`} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className={`${itemTdCls} ${itemCalcCls}`}>{formatNumber(line.tax)}</td>
                  <td className={`${itemTdCls} ${itemCalcCls} font-semibold !text-slate-900 dark:!text-slate-100`}>{formatNumber(line.total)}</td>
                  <td className={`${itemTdCls} text-center`}>
                    <RemoveRowButton index={index} disabled={items.length <= 1} onClick={() => onRemoveRow(item.id)} />
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className={itemFootRowCls}>
              <td className={itemFootTdCls}></td>
              <td colSpan={2} className={`${itemFootTdCls} text-right text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400`}>Total</td>
              <td className={`${itemFootTdCls} text-right`}>{formatNumber(totals.quantity)}</td>
              <td className={itemFootTdCls}></td>
              <td className={`${itemFootTdCls} text-right`}>{formatNumber(totals.taxable)}</td>
              <td className={itemFootTdCls}></td>
              <td className={`${itemFootTdCls} text-right`}>{formatNumber(totals.cgst + totals.sgst + totals.igst)}</td>
              <td className={`${itemFootTdCls} text-right text-blue-600 dark:text-blue-400`}>{formatNumber(totals.grand)}</td>
              <td className={itemFootTdCls}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );
};

/** Taxable value, CGST+SGST or IGST, grand total and amount in words. */
export const TaxSummaryCard = ({ totals, sameState, grandLabel = "Grand total", className = "xl:sticky xl:top-2" }) => (
  <Card title="Summary" icon={<AiOutlineCalculator />} className={className}>
    <div className="flex flex-col divide-y divide-slate-200 dark:divide-slate-700">
      <SummaryRow label="Total quantity" value={formatNumber(totals.quantity)} />
      <SummaryRow label="Taxable value" value={formatINR(totals.taxable)} />
      {sameState ? (
        <>
          <SummaryRow label="CGST" value={formatINR(totals.cgst)} />
          <SummaryRow label="SGST" value={formatINR(totals.sgst)} />
        </>
      ) : (
        <SummaryRow label="IGST" value={formatINR(totals.igst)} />
      )}
      <SummaryRow label={grandLabel} value={formatINR(totals.grand)} strong accent />
    </div>
    <div className="pt-3">
      <AmountInWords>{totals.grand ? inrToWords(totals.grand) : ""}</AmountInWords>
    </div>
  </Card>
);
