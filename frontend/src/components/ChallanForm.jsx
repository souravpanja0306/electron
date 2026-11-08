import React from 'react';
import {
  AiOutlineTeam,
  AiOutlineFileText,
  AiOutlineInbox,
  AiOutlineCar,
  AiOutlineCalculator,
} from "react-icons/ai";

// Components...
import SearchableSelect from './SearchableSelect';
import { Badge } from './ListKit';
import {
  inputCls, cellCls, noSpinCls, StackedField, FormSection, Card, PickerRow, partyHint,
  AddButton, AddRowButton, RemoveRowButton, SummaryRow, AmountInWords, focusNextOnEnter,
  itemTableCls, itemHeadRowCls, itemThCls, itemRowCls, itemTdCls, itemFootRowCls, itemFootTdCls,
  ChaQuickAddModal, PartyQuickAddModal,
} from './FormKit';

// Utils...
import { inrToWords } from '../utils/InWordConverter';
import { formatINR, formatNumber } from '../utils/format';

// Kept for older imports; new code should import from FormKit.
export { inputCls };

/**
 * Shared challan form (used by Create and Edit) so both stay visually identical.
 * It is purely presentational: all state lives in the page.
 * Enter moves to the next field in reading order (focusNextOnEnter).
 */
const ChallanForm = ({
  id = "challan-form",
  form,
  data,
  onChange,
  onChangeData,
  onAddRow,
  onRemoveRow,
  onSubmit,
  companyData,
  parties,
  chaData,
  onAddParty,
  onAddCha,
  showCha = true,
}) => {
  const partyList = parties?.body || [];
  const partyOptions = partyList.map(item => ({ id: item.id, label: item.company_name }));
  const findParty = (pid) => partyList.find(p => String(p.id) === String(pid));
  const sameParty = form.consignor_id && String(form.consignor_id) === String(form.consignee_id);

  const totalPackages = data.reduce((sum, row) => sum + (Number(row.packages) || 0), 0);
  const totalWeight = data.reduce((sum, row) => sum + (Number(row.weight) || 0), 0);
  const filledRows = data.filter(row => row.description || Number(row.packages) || Number(row.amount)).length;

  return (
    <form id={id} onSubmit={onSubmit} onKeyDown={focusNextOnEnter} className="flex flex-col gap-2" autoComplete="off" noValidate>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 items-stretch">
        <FormSection title="Parties" description="Who is sending the goods and who receives them." icon={<AiOutlineTeam />} cols={1}>
          <StackedField label="From company" required htmlFor="f-company_id">
            <SearchableSelect
              id="f-company_id"
              name="company_id"
              value={form.company_id}
              onChange={onChange}
              options={companyData?.map(item => ({ id: item.id, label: item.company_name })) || []}
              placeholder="Select company"
              required
            />
          </StackedField>
          <StackedField label="Consignor" required htmlFor="f-consignor_id" hint={partyHint(findParty(form.consignor_id))}>
            <PickerRow>
              <SearchableSelect
                id="f-consignor_id"
                className="flex-1 min-w-0"
                name="consignor_id"
                value={form.consignor_id}
                onChange={onChange}
                options={partyOptions}
                placeholder="Select consignor"
                required
              />
              {onAddParty && <AddButton onClick={onAddParty} title="Add new party" />}
            </PickerRow>
          </StackedField>
          <StackedField
            label="Consignee"
            required
            htmlFor="f-consignee_id"
            hint={sameParty
              ? <span className="text-amber-700 dark:text-amber-300">Same party as the consignor.</span>
              : partyHint(findParty(form.consignee_id))}
          >
            <PickerRow>
              <SearchableSelect
                id="f-consignee_id"
                className="flex-1 min-w-0"
                name="consignee_id"
                value={form.consignee_id}
                onChange={onChange}
                options={partyOptions}
                placeholder="Select consignee"
                required
              />
              {onAddParty && <AddButton onClick={onAddParty} title="Add new party" />}
            </PickerRow>
          </StackedField>
        </FormSection>

        <FormSection title="Consignment" description="Note number, date and route." icon={<AiOutlineFileText />}>
          <StackedField label="C/N No" required htmlFor="f-cn_no" hint={!form.company_id ? "Pick a company to get the next number." : ""}>
            <input
              id="f-cn_no"
              className={`${inputCls} font-medium`}
              type="text"
              name="cn_no"
              value={form.cn_no}
              onChange={onChange}
              placeholder="C/N No"
              required
            />
          </StackedField>
          <StackedField label="Date" htmlFor="f-date">
            <input id="f-date" className={inputCls} type="date" name="date" value={form.date} onChange={onChange} />
          </StackedField>
          <StackedField label="From" htmlFor="f-from_loc">
            <input id="f-from_loc" className={`${inputCls} capitalize`} type="text" name="from_loc" value={form.from_loc} onChange={onChange} placeholder="Origin" />
          </StackedField>
          <StackedField label="To" htmlFor="f-to_loc">
            <input id="f-to_loc" className={`${inputCls} capitalize`} type="text" name="to_loc" value={form.to_loc} onChange={onChange} placeholder="Destination" />
          </StackedField>
        </FormSection>
      </div>

      <Card
        title="Goods"
        description="Packages, contents, weight and freight for each line."
        icon={<AiOutlineInbox />}
        aside={<Badge tone="slate">{filledRows} {filledRows === 1 ? "line" : "lines"}</Badge>}
        bodyClassName="p-0"
        footer={<AddRowButton onClick={onAddRow} />}
      >
        <div className="w-full overflow-x-auto">
          <table className={`${itemTableCls} min-w-[640px]`}>
            <thead>
              <tr className={itemHeadRowCls}>
                <th className={`${itemThCls} w-12 text-center`}>Sl.</th>
                <th className={`${itemThCls} w-28 text-right`}>Packages</th>
                <th className={`${itemThCls} text-left`}>Particulars of goods</th>
                <th className={`${itemThCls} w-32 text-right`}>Weight (kg)</th>
                <th className={`${itemThCls} w-36 text-right`}>Amount (₹)</th>
                <th className={`${itemThCls} w-12`}><span className="sr-only">Remove</span></th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={item.id} className={itemRowCls}>
                  <td className={`${itemTdCls} text-center text-xs tabular-nums text-slate-400 dark:text-slate-500`}>{index + 1}</td>
                  <td className={itemTdCls}>
                    <input
                      className={`${cellCls} ${noSpinCls} text-right tabular-nums`}
                      value={item.packages}
                      id={item.id}
                      name="packages"
                      onChange={onChangeData}
                      onFocus={(e) => e.target.select()}
                      type="number"
                      min="0"
                      aria-label={`Packages, row ${index + 1}`}
                    />
                  </td>
                  <td className={itemTdCls}>
                    <input
                      className={`${cellCls} capitalize`}
                      value={item.description}
                      id={item.id}
                      name="description"
                      onChange={onChangeData}
                      type="text"
                      placeholder="e.g. Cartons of machine parts"
                      aria-label={`Description, row ${index + 1}`}
                    />
                  </td>
                  <td className={itemTdCls}>
                    <input
                      className={`${cellCls} ${noSpinCls} text-right tabular-nums`}
                      value={item.weight}
                      id={item.id}
                      name="weight"
                      onChange={onChangeData}
                      onFocus={(e) => e.target.select()}
                      type="number"
                      min="0"
                      step="any"
                      aria-label={`Weight, row ${index + 1}`}
                    />
                  </td>
                  <td className={itemTdCls}>
                    <input
                      className={`${cellCls} ${noSpinCls} text-right tabular-nums`}
                      value={item.amount}
                      id={item.id}
                      name="amount"
                      onChange={onChangeData}
                      onFocus={(e) => e.target.select()}
                      type="number"
                      min="0"
                      step="any"
                      aria-label={`Amount, row ${index + 1}`}
                    />
                  </td>
                  <td className={`${itemTdCls} text-center`}>
                    <RemoveRowButton index={index} disabled={data.length <= 1} onClick={() => onRemoveRow(item.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className={itemFootRowCls}>
                <td className={itemFootTdCls}></td>
                <td className={`${itemFootTdCls} text-right`}>{formatNumber(totalPackages)}</td>
                <td className={`${itemFootTdCls} text-right text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400`}>Total</td>
                <td className={`${itemFootTdCls} text-right`}>{formatNumber(totalWeight)}</td>
                <td className={`${itemFootTdCls} text-right text-blue-600 dark:text-blue-400`}>{formatNumber(form.total_amount)}</td>
                <td className={itemFootTdCls}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-2 items-start">
        <FormSection className="xl:col-span-2" title="Transport & documents" description="Vehicle, paperwork and anything to print on the challan." icon={<AiOutlineCar />}>
          <StackedField label="Truck No" htmlFor="f-truck_no">
            <input id="f-truck_no" className={`${inputCls} uppercase tracking-wide`} type="text" name="truck_no" value={form.truck_no} onChange={onChange} placeholder="e.g. WB 11 A 1234" />
          </StackedField>
          <StackedField label="Invoice No" htmlFor="f-invoice_no">
            <input id="f-invoice_no" className={inputCls} type="text" name="invoice_no" value={form.invoice_no} onChange={onChange} placeholder="Consignor's invoice" />
          </StackedField>
          <StackedField label="Way Bill No" htmlFor="f-way_bill_no">
            <input id="f-way_bill_no" className={`${inputCls} ${noSpinCls}`} type="number" name="way_bill_no" value={form.way_bill_no} onChange={onChange} placeholder="E-way bill number" />
          </StackedField>
          <StackedField label="Way Bill Date" htmlFor="f-way_bill_date">
            <input id="f-way_bill_date" className={inputCls} type="date" name="way_bill_date" value={form.way_bill_date} onChange={onChange} />
          </StackedField>
          <StackedField label="Container" htmlFor="f-container">
            <input id="f-container" className={`${inputCls} uppercase`} type="text" name="container" value={form.container} onChange={onChange} placeholder="Container No" />
          </StackedField>
          <StackedField label="Booking Number" htmlFor="f-booking_number">
            <input id="f-booking_number" className={inputCls} type="text" name="booking_number" value={form.booking_number} onChange={onChange} placeholder="Booking Number" />
          </StackedField>
          {showCha && (
            <StackedField label="CHA" htmlFor="f-cha" className="md:col-span-2">
              <PickerRow>
                <SearchableSelect
                  id="f-cha"
                  className="flex-1 min-w-0"
                  name="cha"
                  value={form.cha}
                  onChange={onChange}
                  options={chaData?.map(item => ({ id: item.id, label: item.name })) || []}
                  placeholder="Select CHA"
                />
                {onAddCha && <AddButton onClick={onAddCha} title="Add new CHA" />}
              </PickerRow>
            </StackedField>
          )}
          <StackedField label="Additional info" htmlFor="f-note" className="md:col-span-2">
            <textarea
              id="f-note"
              className={`${inputCls} h-auto py-1.5 resize-y`}
              name="note"
              rows="3"
              value={form.note}
              onChange={onChange}
              placeholder="Printed on the challan (optional)"
            />
          </StackedField>
        </FormSection>

        <Card title="Summary" icon={<AiOutlineCalculator />} className="xl:sticky xl:top-2">
          <div className="flex flex-col divide-y divide-slate-200 dark:divide-slate-700">
            <SummaryRow label="Packages" value={formatNumber(totalPackages)} />
            <SummaryRow label="Weight (kg)" value={formatNumber(totalWeight)} />
            <SummaryRow label="Total Freight" value={formatINR(form.total_amount)} strong accent />
          </div>
          <div className="pt-3">
            <AmountInWords>{form.total_amount ? inrToWords(form.total_amount) : ""}</AmountInWords>
          </div>
        </Card>
      </div>
    </form>
  );
};

/** "Create CHA" and "Create Party" quick-add dialogs shared by Create and Edit. */
export const QuickAddModals = ({
  chaOpen, onCloseCha, onSubmitCha, chaLoading, chaError,
  partyOpen, onCloseParty, onSubmitParty, partyLoading, partyError,
}) => (
  <>
    <ChaQuickAddModal isOpen={chaOpen} onClose={onCloseCha} onSubmit={onSubmitCha} loading={chaLoading} error={chaError} />
    <PartyQuickAddModal isOpen={partyOpen} onClose={onCloseParty} onSubmit={onSubmitParty} loading={partyLoading} error={partyError} />
  </>
);

export default ChallanForm;
