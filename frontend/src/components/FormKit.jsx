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
  "h-8 px-2 rounded w-full min-w-0 text-sm text-slate-900 bg-white dark:bg-slate-900 dark:text-slate-100 " +
  "border border-slate-300 hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-500 " +
  "placeholder:text-slate-400 dark:placeholder:text-slate-500 " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 dark:focus:border-blue-500 disabled:opacity-60";

// For system-generated values (document numbers, computed amounts).
export const readOnlyCls = "!bg-slate-50 dark:!bg-slate-950/40 text-slate-600 dark:text-slate-300 cursor-default";

// Same, tightened for table cells.
export const cellCls = `${inputCls} px-1`;

// Hides the number spinners, which crowd narrow table cells.
export const noSpinCls = "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

export const labelCls = "text-xs font-medium text-slate-600 dark:text-slate-300";

export const Required = () => <span className="text-red-600 dark:text-red-400 ml-0.5">*</span>;

// Red border + ring for a control whose value failed validation.
export const errorCls = "!border-red-500 dark:!border-red-500 focus:!ring-red-500/25";

/** Validation message shown under a control. */
export const FieldError = ({ id, children }) =>
  children ? (
    <p id={id} role="alert" className="text-[11px] font-medium text-red-600 dark:text-red-400">{children}</p>
  ) : null;

// Label on top on narrow screens, label beside the control from `sm` up.
export const Field = ({ label, required, top, hint, error, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-1 w-full">
    <div className={`sm:w-32 sm:shrink-0 ${top || error ? "sm:self-start sm:pt-2" : ""}`}>
      <label className={labelCls}>{label}{required && <Required />}</label>
      {hint && <div className="text-[11px] text-slate-500 dark:text-slate-400">{hint}</div>}
    </div>
    <div className="flex flex-col gap-1 w-full min-w-0">
      <div className="flex items-center gap-1 w-full min-w-0">{children}</div>
      <FieldError>{error}</FieldError>
    </div>
  </div>
);

// Label always above the control (for compact grids). `htmlFor` ties the label to the control.
export const StackedField = ({ label, required, hint, error, htmlFor, className = "", children }) => (
  <div className={`flex flex-col gap-1 w-full min-w-0 ${className}`}>
    <label htmlFor={htmlFor} className={labelCls}>{label}{required && <Required />}</label>
    {children}
    {error
      ? <FieldError id={htmlFor ? `${htmlFor}-error` : undefined}>{error}</FieldError>
      : hint && <p className="text-[11px] text-slate-500 dark:text-slate-400">{hint}</p>}
  </div>
);

/** A titled card. The body is free-form; use FormSection for a grid of fields. */
export const Card = ({ title, description, icon, aside, className = "", bodyClassName = "p-4", footer, children }) => (
  <section className={`flex flex-col rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm min-w-0 ${className}`}>
    <header className="flex items-start justify-between gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-start gap-2 min-w-0">
        {icon && <span className="mt-0.5 text-base text-slate-400 dark:text-slate-500">{icon}</span>}
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
          {description && <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>}
        </div>
      </div>
      {aside}
    </header>
    <div className={`flex-1 min-w-0 ${bodyClassName}`}>{children}</div>
    {footer && (
      <footer className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/30 rounded-b-md">
        {footer}
      </footer>
    )}
  </section>
);

/** A titled card that groups related fields in a responsive grid. */
export const FormSection = ({ title, description, icon, cols = 2, aside, className = "", children }) => (
  <Card
    title={title}
    description={description}
    icon={icon}
    aside={aside}
    className={className}
    bodyClassName={`grid content-start gap-x-4 gap-y-3 p-4 grid-cols-1 ${cols >= 2 ? "md:grid-cols-2" : ""} ${cols >= 3 ? "xl:grid-cols-3" : ""}`}
  >
    {children}
  </Card>
);

const NOTICE_TONES = {
  info: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200",
  neutral: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
  warning: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200",
};

/** One-line banner above a form (e.g. "created from challan CN-12"). */
export const Notice = ({ tone = "info", icon, children }) => (
  <div role="status" className={`flex items-start gap-2 rounded-md border px-3 py-2 text-xs ${NOTICE_TONES[tone] || NOTICE_TONES.info}`}>
    {icon && <span className="mt-px text-sm shrink-0">{icon}</span>}
    <div className="min-w-0">{children}</div>
  </div>
);

/** Picker + quick-add button side by side. */
export const PickerRow = ({ children }) => (
  <div className="flex items-center gap-1 w-full min-w-0">{children}</div>
);

/** Muted line under a party picker so the user can confirm they picked the right one. */
export const partyHint = (party) => {
  if (!party) return "";
  const place = [party.city, party.state].filter(Boolean).join(", ");
  return [place, party.gst ? `GSTIN ${party.gst}` : ""].filter(Boolean).join(" · ");
};

// Line-item tables: full-bleed inside a Card (bodyClassName="p-0").
export const itemTableCls = "w-full text-sm border-collapse";
export const itemHeadRowCls =
  "bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-700 " +
  "text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400";
export const itemThCls = "py-2 px-1 font-semibold first:pl-4 last:pr-4";
export const itemRowCls = "border-b border-slate-100 dark:border-slate-700/60 hover:bg-slate-50/70 dark:hover:bg-slate-900/20 transition-colors";
export const itemTdCls = "py-1.5 px-1 first:pl-4 last:pr-4 align-middle";
export const itemFootRowCls = "bg-slate-50 dark:bg-slate-900/40 text-sm font-semibold text-slate-800 dark:text-slate-100";
export const itemFootTdCls = "py-2 px-2 first:pl-4 last:pr-4 tabular-nums";
/** Read-only computed amount shown in a line-item cell. */
export const itemCalcCls = "px-1 text-right text-sm tabular-nums text-slate-600 dark:text-slate-300";

/**
 * Form onKeyDown handler: Enter moves to the next field instead of submitting
 * (data-entry style). Textareas, buttons and Ctrl/Shift+Enter keep their default.
 */
export const focusNextOnEnter = (e) => {
  if (e.key !== "Enter" || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
  const el = e.target;
  const tag = el.tagName;
  if (e.defaultPrevented || tag === "TEXTAREA" || tag === "BUTTON" || el.type === "submit" || el.type === "checkbox") return;
  if (el.getAttribute("aria-haspopup")) return; // pickers open on Enter
  if (!e.currentTarget.contains(el)) return;
  e.preventDefault();
  const focusables = Array.from(
    e.currentTarget.querySelectorAll('input:not([type="hidden"]):not([disabled]):not([readonly]):not([tabindex="-1"]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]')
  ).filter((node) => node.offsetParent !== null);
  const next = focusables[focusables.indexOf(el) + 1];
  if (next) next.focus();
};

/** Props for a text input: id/name, value, aria wiring and error styling in one place. */
export const inputProps = ({ name, value, onChange, error, className = "", ...rest }) => ({
  id: `f-${name}`,
  name,
  value: value ?? "",
  onChange,
  "aria-invalid": error ? true : undefined,
  "aria-describedby": error ? `f-${name}-error` : undefined,
  className: `${inputCls} ${error ? errorCls : ""} ${className}`,
  ...rest,
});

/**
 * On/off setting card: heading + what it does on the left, toggle on the right
 * (left side = off, right side = on). Same look on every settings page.
 */
export const ToggleSetting = ({ title, description, value, onChange, disabled, offLabel = "Hide", onLabel = "Show" }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 p-4">
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
    className="h-8 px-3 flex items-center justify-center gap-1 self-start rounded-md border border-dashed border-emerald-500 text-emerald-700 dark:text-emerald-400 text-xs font-medium hover:bg-emerald-500/10 transition"
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
    className="text-2xl align-middle text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition disabled:opacity-30 disabled:cursor-not-allowed"
  >
    <AiOutlineMinusSquare />
  </button>
);

// Header row style for line-item tables.
export const itemHeadCls = "text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wide";

// A label/value line in a totals summary.
export const SummaryRow = ({ label, value, strong, accent }) => (
  <div className={`flex justify-between gap-2 w-full py-1 ${strong ? "text-base font-bold" : "text-sm"}`}>
    <span className={strong ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300"}>{label}</span>
    <span className={`tabular-nums ${accent ? "text-blue-600 dark:text-blue-400" : "text-slate-800 dark:text-slate-100"}`}>{value}</span>
  </div>
);

export const AmountInWords = ({ children }) => (
  <div className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-2">
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
        {error && <div className="rounded border border-red-200 bg-red-50 px-2 py-1 text-red-700 text-xs dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">{error}</div>}
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
        {error && <div className="rounded border border-red-200 bg-red-50 px-2 py-1 text-red-700 text-xs dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">{error}</div>}
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
        {error && <div className="rounded border border-red-200 bg-red-50 px-2 py-1 text-red-700 text-xs dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">{error}</div>}
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
