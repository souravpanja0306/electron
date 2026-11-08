import React from 'react';
import {
  AiOutlinePlusSquare,
  AiOutlineMinusSquare,
  AiOutlineFileAdd,
} from "react-icons/ai";

import CustomButton from './CustomButton';
import CustomToggle from './CustomToggle';
import Modal from './CustomModal';
import { handleEnter } from '../service/MainService';

/*
 * Shared building blocks for the data-entry pages (Challan, Invoice, Money Receipt)
 * so every form uses the same inputs, spacing, buttons and quick-add dialogs.
 */

// One input style for every form, light + dark.
export const inputCls =
  "h-8 px-2 rounded w-full min-w-0 text-sm text-slate-900 bg-white dark:bg-slate-800 dark:text-slate-100 " +
  "border border-slate-400 dark:border-slate-600 placeholder:text-slate-400 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60";

// For system-generated values (document numbers, computed amounts).
export const readOnlyCls = "!bg-slate-100 dark:!bg-slate-900 cursor-default";

// Same, tightened for table cells.
export const cellCls = `${inputCls} px-1`;

// Hides the number spinners, which crowd narrow table cells.
export const noSpinCls = "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

export const labelCls = "text-xs font-medium text-slate-600 dark:text-slate-300";

export const Required = () => <span className="text-red-500 ml-0.5">*</span>;

// Label on top on narrow screens, label beside the control from `sm` up.
export const Field = ({ label, required, top, hint, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-1 w-full">
    <div className={`sm:w-32 sm:shrink-0 ${top ? "sm:self-start sm:pt-2" : ""}`}>
      <label className={labelCls}>{label}{required && <Required />}</label>
      {hint && <div className="text-[11px] text-slate-500 dark:text-slate-400">{hint}</div>}
    </div>
    <div className="flex items-center gap-1 w-full min-w-0">{children}</div>
  </div>
);

// Label always above the control (for compact grids).
export const StackedField = ({ label, required, children }) => (
  <div className="flex flex-col gap-1 w-full min-w-0">
    <label className={labelCls}>{label}{required && <Required />}</label>
    {children}
  </div>
);

/**
 * On/off setting card: heading + what it does on the left, toggle on the right
 * (left side = off, right side = on). Same look on every settings page.
 */
export const ToggleSetting = ({ title, description, value, onChange, disabled, offLabel = "Hide", onLabel = "Show" }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-4">
    <div>
      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{title}</p>
      {description && <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>}
    </div>
    <div className={disabled ? "opacity-50 pointer-events-none" : ""} aria-disabled={disabled || undefined}>
      <CustomToggle
        value={Boolean(value)}
        onChange={onChange}
        option={[offLabel, onLabel]}
        activeColor="blue"
        inactiveColor="slate"
      />
    </div>
  </div>
);

export const AddButton = ({ onClick, title }) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    onClick={onClick}
    className="h-8 w-9 shrink-0 flex items-center justify-center rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
  >
    <AiOutlinePlusSquare />
  </button>
);

export const AddRowButton = ({ onClick, label = "Add Row" }) => (
  <button
    type="button"
    onClick={onClick}
    className="h-8 px-3 flex items-center justify-center gap-1 self-start rounded-md border border-dashed border-green-600 text-green-700 dark:text-green-400 text-xs font-medium hover:bg-green-600/10 transition"
  >
    <AiOutlinePlusSquare className="text-base" /> {label}
  </button>
);

export const RemoveRowButton = ({ onClick, disabled, index }) => (
  <button
    type="button"
    title={disabled ? "At least one row is required" : "Remove row"}
    aria-label={`Remove row ${index + 1}`}
    disabled={disabled}
    onClick={onClick}
    className="text-2xl align-middle text-red-600 hover:text-red-700 transition disabled:opacity-30 disabled:cursor-not-allowed"
  >
    <AiOutlineMinusSquare />
  </button>
);

// Header row style for line-item tables.
export const itemHeadCls = "text-slate-600 dark:text-slate-200 text-xs font-semibold uppercase tracking-wide";

// A label/value line in a totals summary.
export const SummaryRow = ({ label, value, strong, accent }) => (
  <div className={`flex justify-between gap-2 w-full py-1 ${strong ? "text-base font-bold" : "text-sm"}`}>
    <span className={strong ? "" : "text-slate-600 dark:text-slate-300"}>{label}</span>
    <span className={`tabular-nums ${accent ? "text-blue-600 dark:text-blue-400" : "text-slate-800 dark:text-slate-100"}`}>{value}</span>
  </div>
);

export const AmountInWords = ({ children }) => (
  <div className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-2">
    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">In Words</div>
    <div className="text-xs italic text-slate-700 dark:text-slate-200">{children || "--"}</div>
  </div>
);

const ModalActions = ({ onCancel, submitName, loading }) => (
  <div className="w-full flex justify-end gap-2">
    <CustomButton type="button" title="Cancel" color="slate" onClick={onCancel} />
    <CustomButton type="submit" name={submitName} title="Save" color="blue" disabled={loading}>
      <AiOutlineFileAdd />
    </CustomButton>
  </div>
);

/** Quick-add dialog for a CHA. `onSubmit` receives the form submit event. */
export const ChaQuickAddModal = ({ isOpen, onClose, onSubmit, loading, error }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Create New CHA">
    <form onSubmit={onSubmit} autoComplete="off">
      <div className="grid gap-3 w-full p-1">
        {error && <div className="text-red-500 text-xs">{error}</div>}
        <Field label="CHA Name" required>
          <input className={inputCls} type="text" name="cha_name" required autoFocus
            onKeyDown={(e) => handleEnter({ event: e, name: "cha_mobile" })} placeholder="CHA Name" />
        </Field>
        <Field label="CHA Mobile">
          <input className={inputCls} type="text" name="cha_mobile"
            onKeyDown={(e) => handleEnter({ event: e, name: "cha_address" })} placeholder="CHA Mobile" />
        </Field>
        <Field label="Address">
          <input className={inputCls} type="text" name="cha_address"
            onKeyDown={(e) => handleEnter({ event: e, name: "cha_submit" })} placeholder="Address (optional)" />
        </Field>
        <ModalActions onCancel={onClose} submitName="cha_submit" loading={loading} />
      </div>
    </form>
  </Modal>
);

/** Quick-add dialog for an HSN/SAC code (saved to the HSN/SAC master). */
export const HsnQuickAddModal = ({ isOpen, onClose, onSubmit, loading, error }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Add HSN / SAC">
    <form onSubmit={onSubmit} autoComplete="off">
      <div className="grid gap-3 w-full p-1">
        {error && <div className="text-red-500 text-xs">{error}</div>}
        <Field label="Type" required>
          <select className={inputCls} name="hsn_type" defaultValue="HSN"
            onKeyDown={(e) => handleEnter({ event: e, name: "hsn_code" })}>
            <option value="HSN">HSN (Goods)</option>
            <option value="SAC">SAC (Services)</option>
          </select>
        </Field>
        <Field label="Code" required>
          <input className={inputCls} type="text" name="hsn_code" required autoFocus
            onKeyDown={(e) => handleEnter({ event: e, name: "hsn_gst_rate" })} placeholder="e.g. 8421" />
        </Field>
        <Field label="GST Rate (%)">
          <input className={inputCls} type="number" name="hsn_gst_rate" min="0" step="any"
            onKeyDown={(e) => handleEnter({ event: e, name: "hsn_description" })} placeholder="e.g. 18" />
        </Field>
        <Field label="Description">
          <input className={inputCls} type="text" name="hsn_description"
            onKeyDown={(e) => handleEnter({ event: e, name: "hsn_submit" })} placeholder="Description (optional)" />
        </Field>
        <ModalActions onCancel={onClose} submitName="hsn_submit" loading={loading} />
      </div>
    </form>
  </Modal>
);

/** Quick-add dialog for a party. `onSubmit` receives the form submit event. */
export const PartyQuickAddModal = ({ isOpen, onClose, onSubmit, loading, error }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Create New Party">
    <form onSubmit={onSubmit} autoComplete="off">
      <div className="grid gap-3 w-full p-1">
        {error && <div className="text-red-500 text-xs">{error}</div>}
        <Field label="Company Name" required>
          <input className={inputCls} type="text" name="company_name" required autoFocus
            onKeyDown={(e) => handleEnter({ event: e, name: "owner" })} placeholder="Company Name" />
        </Field>
        <Field label="Owner Name">
          <input className={inputCls} type="text" name="owner"
            onKeyDown={(e) => handleEnter({ event: e, name: "mobile" })} placeholder="Owner Name" />
        </Field>
        <Field label="Mobile Number">
          <input className={inputCls} type="text" name="mobile"
            onKeyDown={(e) => handleEnter({ event: e, name: "email" })} placeholder="Mobile Number" />
        </Field>
        <Field label="Email Address">
          <input className={inputCls} type="email" name="email"
            onKeyDown={(e) => handleEnter({ event: e, name: "submit_btn" })} placeholder="Email Address" />
        </Field>
        <Field label="Country">
          <input className={inputCls} type="text" name="country" defaultValue="INDIA" readOnly />
        </Field>
        <ModalActions onCancel={onClose} submitName="submit_btn" loading={loading} />
      </div>
    </form>
  </Modal>
);
