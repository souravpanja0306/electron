import React from 'react';
import { Link } from "react-router-dom";
import {
  AiOutlineTeam,
  AiOutlineFileText,
  AiOutlineShopping,
  AiOutlineCar,
  AiOutlineCalculator,
} from "react-icons/ai";

// Components...
import SearchableSelect from './SearchableSelect';
import { Badge } from './ListKit';
import {
  inputCls, cellCls, noSpinCls, readOnlyCls, StackedField, FormSection, Card, PickerRow, partyHint,
  AddButton, AddRowButton, RemoveRowButton, SummaryRow, AmountInWords, focusNextOnEnter,
  itemTableCls, itemHeadRowCls, itemThCls, itemRowCls, itemTdCls, itemFootRowCls, itemFootTdCls, itemCalcCls,
} from './FormKit';

// Utils...
import { inrToWords } from '../utils/InWordConverter';
import { formatINR, formatNumber } from '../utils/format';
import { isSameState, lineAmounts, computeInvoiceTotals } from '../utils/invoiceTotals';

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

const linkCls = "text-blue-600 dark:text-blue-400 hover:underline";

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

      <Card
        title="Items"
        description="Goods or services billed, with HSN/SAC and GST for each line."
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

        <Card title="Summary" icon={<AiOutlineCalculator />} className="xl:sticky xl:top-2">
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
            <SummaryRow label="Grand total" value={formatINR(totals.grand)} strong accent />
          </div>
          <div className="pt-3">
            <AmountInWords>{totals.grand ? inrToWords(totals.grand) : ""}</AmountInWords>
          </div>
        </Card>
      </div>
    </form>
  );
};

export default InvoiceForm;
