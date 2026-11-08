import React, { useEffect } from 'react';
import { AiOutlineSave, AiOutlineUndo, AiOutlineShop } from "react-icons/ai";

import { inputCls, labelCls, errorCls, FieldError } from './FormKit';
import SearchableSelect from './SearchableSelect';

/*
 * Building blocks shared by every Settings page, so they read as one product:
 * section rows (explanation left, controls right), a sticky save bar, a company picker
 * and the document-number editor used by Invoice and Challan settings.
 */

/** Page body: a single white card holding the section rows. */
export const SettingsPanel = ({ children }) => (
    <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm divide-y divide-slate-200 dark:divide-slate-700">
        {children}
    </div>
);

/** One settings row: title + description on the left, controls on the right (stacked on narrow windows). */
export const SettingsSection = ({ title, description, badge, children }) => (
    <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] gap-x-8 gap-y-3 px-5 py-5">
        <div>
            <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
                {badge}
            </div>
            {description && <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>}
        </div>
        <div className="min-w-0 max-w-2xl">{children}</div>
    </section>
);

/** Sticky bar that appears while there are unsaved changes. */
export const SaveBar = ({ dirty, saving, onSave, onDiscard }) => (
    <div
        aria-live="polite"
        className={`sticky bottom-0 z-10 transition-all duration-200 ${dirty ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0 pointer-events-none"}`}
    >
        <div className="mt-2 flex items-center justify-between gap-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur px-4 py-2 shadow-lg shadow-slate-900/10 dark:shadow-black/40">
            <span className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
                You have unsaved changes
            </span>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={onDiscard}
                    disabled={saving}
                    className="h-8 px-3 inline-flex items-center gap-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors"
                >
                    <AiOutlineUndo /> Discard
                </button>
                <button
                    type="button"
                    onClick={onSave}
                    disabled={saving}
                    className="h-8 px-3 inline-flex items-center gap-1.5 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
                >
                    <AiOutlineSave /> {saving ? "Saving..." : "Save changes"}
                </button>
            </div>
        </div>
    </div>
);

/**
 * Company selector at the top of per-company settings. Picks the only company automatically,
 * and shows the selected company's logo, name and GSTIN.
 */
export const CompanyPicker = ({ companies = [], value, onChange, loading }) => {
    useEffect(() => {
        if (!value && companies.length === 1) onChange(String(companies[0].id));
    }, [companies, value]);

    const selected = companies.find((c) => String(c.id) === String(value));

    return (
        <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm px-5 py-4 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="h-11 w-11 shrink-0 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-center overflow-hidden">
                    {selected?.logo
                        ? <img src={selected.logo} alt="" className="h-full w-full object-contain bg-white" />
                        : <AiOutlineShop className="text-xl text-slate-400 dark:text-slate-500" />}
                </div>
                <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Settings for</p>
                    <p className="text-sm font-semibold truncate text-slate-900 dark:text-white">
                        {selected ? selected.company_name : companies.length ? "Choose a company" : loading ? "Loading companies..." : "No companies yet"}
                    </p>
                    {selected?.gst && <p className="text-[11px] tabular-nums text-slate-500 dark:text-slate-400">GSTIN {selected.gst}</p>}
                </div>
            </div>
            {companies.length > 1 && (
                <div className="md:w-72">
                    <SearchableSelect
                        id="f-company_id"
                        name="company_id"
                        value={value}
                        onChange={(e) => onChange(String(e.target.value))}
                        options={companies.map((c) => ({ id: String(c.id), label: c.company_name }))}
                        placeholder="Select company"
                    />
                </div>
            )}
        </div>
    );
};

/** Current Indian financial year as a suffix, e.g. "/26-27". */
export const financialYearSuffix = (date = new Date()) => {
    const start = date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1;
    return `/${String(start).slice(2)}-${String(start + 1).slice(2)}`;
};

const CODE_CHARS = /[^A-Za-z0-9/_\-.]/g;
export const cleanCode = (value) => String(value || "").replace(CODE_CHARS, "").slice(0, 12);

/**
 * Prefix / starting number / suffix with a live preview.
 * `preview` is the example number to show (each page mirrors its own backend rule).
 */
export const NumberFormatEditor = ({ values, names, onChange, errors = {}, preview, previewNote }) => {
    const fy = financialYearSuffix();
    const set = (name, value) => onChange({ target: { name, value } });
    const field = (key) => names[key];

    return (
        <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                    <label htmlFor={`f-${field("prefix")}`} className={labelCls}>Prefix</label>
                    <input
                        id={`f-${field("prefix")}`}
                        value={values.prefix}
                        onChange={(e) => set(field("prefix"), cleanCode(e.target.value))}
                        placeholder="e.g. INV-"
                        className={`${inputCls} font-mono ${errors.prefix ? errorCls : ""}`}
                    />
                    <FieldError>{errors.prefix}</FieldError>
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor={`f-${field("start")}`} className={labelCls}>Starting number</label>
                    <input
                        id={`f-${field("start")}`}
                        value={values.start}
                        onChange={(e) => set(field("start"), e.target.value.replace(/\D/g, "").slice(0, 9))}
                        inputMode="numeric"
                        placeholder="1"
                        className={`${inputCls} text-right tabular-nums ${errors.start ? errorCls : ""}`}
                    />
                    <FieldError>{errors.start}</FieldError>
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor={`f-${field("suffix")}`} className={labelCls}>Suffix</label>
                    <input
                        id={`f-${field("suffix")}`}
                        value={values.suffix}
                        onChange={(e) => set(field("suffix"), cleanCode(e.target.value))}
                        placeholder={`e.g. ${fy}`}
                        className={`${inputCls} font-mono ${errors.suffix ? errorCls : ""}`}
                    />
                    <FieldError>{errors.suffix}</FieldError>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Quick fill:</span>
                <button
                    type="button"
                    onClick={() => set(field("suffix"), fy)}
                    className="h-6 px-2 rounded-full border border-slate-300 dark:border-slate-600 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                    Financial year suffix {fy}
                </button>
                {(values.prefix || values.suffix) && (
                    <button
                        type="button"
                        onClick={() => { set(field("prefix"), ""); set(field("suffix"), ""); }}
                        className="h-6 px-2 rounded-full border border-slate-300 dark:border-slate-600 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        Clear prefix &amp; suffix
                    </button>
                )}
            </div>

            <div className="flex items-center justify-between gap-3 rounded-md border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 px-4 py-3">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">Preview</p>
                    {previewNote && <p className="text-[11px] text-blue-700/80 dark:text-blue-300/80">{previewNote}</p>}
                </div>
                <span className="font-mono text-base font-semibold tracking-wide text-slate-900 dark:text-white">{preview}</span>
            </div>
        </div>
    );
};

/** Multi-line text with a character counter. */
export const TextAreaWithCount = ({ id, value, onChange, max = 1000, rows = 5, placeholder }) => (
    <div className="flex flex-col gap-1">
        <textarea
            id={id}
            value={value}
            onChange={onChange}
            rows={rows}
            maxLength={max}
            placeholder={placeholder}
            className={`${inputCls} h-auto py-2 leading-relaxed resize-y`}
        />
        <p className="self-end text-[11px] tabular-nums text-slate-400 dark:text-slate-500">{(value || "").length} / {max}</p>
    </div>
);
