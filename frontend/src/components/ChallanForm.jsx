import React from 'react';

// Components...
import PageTitle from './PageTitle';
import MainArea from './MainArea';
import SearchableSelect from './SearchableSelect';
import {
  inputCls, cellCls, noSpinCls, itemHeadCls, Field, AddButton, AddRowButton, RemoveRowButton,
  ChaQuickAddModal, PartyQuickAddModal,
} from './FormKit';

// Utils / services...
import { inrToWords } from '../utils/InWordConverter';
import { formatNumber } from '../utils/format';
import { handleEnter } from '../service/MainService';

// Kept for older imports; new code should import from FormKit.
export { inputCls };

/**
 * Shared challan form (used by Create and Edit) so both stay visually identical.
 * It is purely presentational: all state lives in the page.
 */
const ChallanForm = ({
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
}) => {
  const partyOptions = parties?.body?.map(item => ({ id: item.id, label: item.company_name })) || [];
  const totalPackages = data.reduce((sum, row) => sum + (Number(row.packages) || 0), 0);
  const totalWeight = data.reduce((sum, row) => sum + (Number(row.weight) || 0), 0);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-1" autoComplete="off">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
        {/* Parties */}
        <div className="flex flex-col gap-1">
          <PageTitle>Consignor & Consignee</PageTitle>
          <MainArea>
            <div className="flex flex-col w-full gap-3 p-2">
              <Field label="From Company" required>
                <SearchableSelect
                  className="flex-1 min-w-0"
                  name="company_id"
                  value={form.company_id}
                  onChange={onChange}
                  options={companyData?.map(item => ({ id: item.id, label: item.company_name })) || []}
                  placeholder="Select Company"
                  required
                />
              </Field>
              <Field label="Consignor" required>
                <SearchableSelect
                  className="flex-1 min-w-0"
                  name="consignor_id"
                  value={form.consignor_id}
                  onChange={onChange}
                  options={partyOptions}
                  placeholder="Select Consignor"
                  required
                />
                {onAddParty && <AddButton onClick={onAddParty} title="Add new party" />}
              </Field>
              <Field label="Consignee" required>
                <SearchableSelect
                  className="flex-1 min-w-0"
                  name="consignee_id"
                  value={form.consignee_id}
                  onChange={onChange}
                  options={partyOptions}
                  placeholder="Select Consignee"
                  required
                />
                {onAddParty && <AddButton onClick={onAddParty} title="Add new party" />}
              </Field>
            </div>
          </MainArea>
        </div>

        {/* Transport */}
        <div className="flex flex-col gap-1">
          <PageTitle>Transport Details</PageTitle>
          <MainArea>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full p-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">C/N No<span className="text-red-500 ml-0.5">*</span></label>
                <input
                  className={inputCls}
                  type="text"
                  name="cn_no"
                  value={form.cn_no}
                  onChange={onChange}
                  onKeyDown={(e) => handleEnter({ event: e, name: "date" })}
                  placeholder="C/N No"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Date</label>
                <input
                  className={inputCls}
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={onChange}
                  onKeyDown={(e) => handleEnter({ event: e, name: "from_loc" })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">From</label>
                <input
                  className={`${inputCls} capitalize`}
                  type="text"
                  name="from_loc"
                  value={form.from_loc}
                  onChange={onChange}
                  onKeyDown={(e) => handleEnter({ event: e, name: "to_loc" })}
                  placeholder="From"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">To</label>
                <input
                  className={`${inputCls} capitalize`}
                  type="text"
                  name="to_loc"
                  value={form.to_loc}
                  onChange={onChange}
                  onKeyDown={(e) => handleEnter({ event: e, name: "packages", index: 0 })}
                  placeholder="To"
                />
              </div>
            </div>
          </MainArea>
        </div>
      </div>

      {/* Items */}
      <PageTitle>Item Details</PageTitle>
      <MainArea>
        <div className="flex flex-col w-full min-w-0 p-1 gap-2">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[640px] select-none border-separate border-spacing-y-1">
              <thead>
                <tr className={`${itemHeadCls} text-center`}>
                  <th className="w-12 pb-1">Sl.</th>
                  <th className="w-32 pb-1">Packages</th>
                  <th className="pb-1 text-left px-1">Particulars of Goods</th>
                  <th className="w-32 pb-1">Weight (KG)</th>
                  <th className="w-32 pb-1">Amount (₹)</th>
                  <th className="w-10 pb-1"><span className="sr-only">Remove</span></th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={item.id}>
                    <td className="px-0.5 text-center text-sm text-slate-500 dark:text-slate-300">{index + 1}</td>
                    <td className="px-0.5">
                      <input
                        className={`${cellCls} ${noSpinCls} text-right`}
                        value={item.packages}
                        id={item.id}
                        name="packages"
                        onChange={onChangeData}
                        onKeyDown={(e) => handleEnter({ event: e, name: "description", index })}
                        type="number"
                        min="0"
                        aria-label={`Packages, row ${index + 1}`}
                      />
                    </td>
                    <td className="px-0.5">
                      <input
                        className={`${cellCls} capitalize`}
                        value={item.description}
                        id={item.id}
                        name="description"
                        onChange={onChangeData}
                        onKeyDown={(e) => handleEnter({ event: e, name: "weight", index })}
                        type="text"
                        aria-label={`Description, row ${index + 1}`}
                      />
                    </td>
                    <td className="px-0.5">
                      <input
                        className={`${cellCls} ${noSpinCls} text-right`}
                        value={item.weight}
                        id={item.id}
                        name="weight"
                        onChange={onChangeData}
                        onKeyDown={(e) => handleEnter({ event: e, name: "amount", index })}
                        type="number"
                        min="0"
                        step="any"
                        aria-label={`Weight, row ${index + 1}`}
                      />
                    </td>
                    <td className="px-0.5">
                      <input
                        className={`${cellCls} ${noSpinCls} text-right`}
                        value={item.amount}
                        id={item.id}
                        name="amount"
                        onChange={onChangeData}
                        onKeyDown={(e) => handleEnter({ event: e, name: "packages", index })}
                        type="number"
                        min="0"
                        step="any"
                        aria-label={`Amount, row ${index + 1}`}
                      />
                    </td>
                    <td className="px-0.5 text-center">
                      <RemoveRowButton index={index} disabled={data.length <= 1} onClick={() => onRemoveRow(item.id)} />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="text-sm font-semibold text-slate-700 dark:text-slate-100">
                  <td></td>
                  <td className="px-2 text-right border-t border-slate-300 dark:border-slate-600 pt-1">{formatNumber(totalPackages)}</td>
                  <td className="px-2 text-right border-t border-slate-300 dark:border-slate-600 pt-1 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">Total</td>
                  <td className="px-2 text-right border-t border-slate-300 dark:border-slate-600 pt-1">{formatNumber(totalWeight)}</td>
                  <td className="px-2 text-right border-t border-slate-300 dark:border-slate-600 pt-1 text-blue-600 dark:text-blue-400">₹ {formatNumber(form.total_amount)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:items-start sm:justify-between gap-2">
            <AddRowButton onClick={onAddRow} />
            <div className="flex flex-col sm:items-end gap-0.5">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold">Total Amount:</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">₹ {formatNumber(form.total_amount)}</span>
              </div>
              <div className="text-xs italic text-slate-500 dark:text-slate-300 sm:text-right">
                {inrToWords(form.total_amount)}
              </div>
            </div>
          </div>
        </div>
      </MainArea>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
        {/* Documents */}
        <div className="flex flex-col gap-1">
          <PageTitle>Document & Vehicle Info</PageTitle>
          <MainArea>
            <div className="flex flex-col gap-3 w-full p-2">
              <Field label="Invoice No">
                <input
                  className={inputCls}
                  type="text"
                  name="invoice_no"
                  value={form.invoice_no}
                  onChange={onChange}
                  onKeyDown={(e) => handleEnter({ event: e, name: "way_bill_no" })}
                  placeholder="Invoice No"
                />
              </Field>
              <Field label="Way Bill No">
                <input
                  className={inputCls}
                  type="number"
                  name="way_bill_no"
                  value={form.way_bill_no}
                  onChange={onChange}
                  onKeyDown={(e) => handleEnter({ event: e, name: "way_bill_date" })}
                  placeholder="Way Bill No"
                />
              </Field>
              <Field label="Way Bill Date">
                <input
                  className={inputCls}
                  type="date"
                  name="way_bill_date"
                  value={form.way_bill_date}
                  onChange={onChange}
                  onKeyDown={(e) => handleEnter({ event: e, name: "truck_no" })}
                />
              </Field>
              <Field label="Truck No">
                <input
                  className={`${inputCls} uppercase`}
                  type="text"
                  name="truck_no"
                  value={form.truck_no}
                  onChange={onChange}
                  onKeyDown={(e) => handleEnter({ event: e, name: "container" })}
                  placeholder="Truck No"
                />
              </Field>
            </div>
          </MainArea>
        </div>

        {/* Remarks */}
        <div className="flex flex-col gap-1">
          <PageTitle>Additional Remarks</PageTitle>
          <MainArea>
            <div className="flex flex-col gap-3 w-full p-2">
              <Field label="Container">
                <input
                  className={inputCls}
                  type="text"
                  name="container"
                  value={form.container}
                  onChange={onChange}
                  onKeyDown={(e) => handleEnter({ event: e, name: "cha" })}
                  placeholder="Container"
                />
              </Field>
              <Field label="CHA">
                <SearchableSelect
                  className="flex-1 min-w-0"
                  name="cha"
                  value={form.cha}
                  onChange={onChange}
                  options={chaData?.map(item => ({ id: item.id, label: item.name })) || []}
                  placeholder="Select CHA"
                />
                {onAddCha && <AddButton onClick={onAddCha} title="Add new CHA" />}
              </Field>
              <Field label="Booking Number">
                <input
                  className={inputCls}
                  type="text"
                  name="booking_number"
                  value={form.booking_number}
                  onChange={onChange}
                  onKeyDown={(e) => handleEnter({ event: e, name: "note" })}
                  placeholder="Booking Number"
                />
              </Field>
              <Field label="Additional Info" top>
                <textarea
                  className={`${inputCls} h-auto py-1 resize-y`}
                  name="note"
                  rows="3"
                  value={form.note}
                  onChange={onChange}
                  placeholder="Info"
                />
              </Field>
            </div>
          </MainArea>
        </div>
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
