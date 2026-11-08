import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AiOutlineSearch, AiOutlineFilter, AiOutlineClose, AiOutlineCalendar, AiOutlineArrowUp, AiOutlineArrowDown } from "react-icons/ai";

import MainArea from './MainArea';
import { inputCls, labelCls } from './FormKit';
import { formatINR } from '../utils/format';

/*
 * Shared pieces for the list pages (View Challans / Invoices / Money Receipts):
 * filter sidebar, row styling, status badge and pagination.
 */

export const PAGE_LIMIT = 10;

// Slices the rows for the current page and clamps the page into range.
export const paginate = (rows = [], page = 1, limit = PAGE_LIMIT) => {
    const total = rows.length;
    const totalPages = Math.ceil(total / limit);
    const currentPage = Math.min(Math.max(page, 1), Math.max(totalPages, 1));
    return {
        total,
        totalPages,
        currentPage,
        start: total === 0 ? 0 : (currentPage - 1) * limit + 1,
        end: Math.min(currentPage * limit, total),
        pageRows: rows.slice((currentPage - 1) * limit, currentPage * limit),
    };
};

// Page numbers to show: first, last and a window around the current page; gaps are null.
const pageWindow = (current, totalPages) => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || Math.abs(i - current) <= 1) pages.push(i);
        else if (pages[pages.length - 1] !== null) pages.push(null);
    }
    return pages;
};

/* ----------------------------- Filter sidebar ----------------------------- */

const WIDE_QUERY = "(min-width: 1024px)"; // Tailwind `lg`
const PANEL_STORE_KEY = "listFilterPanel";
const isWide = () => typeof window !== "undefined" && Boolean(window.matchMedia?.(WIDE_QUERY).matches);

// Local date as YYYY-MM-DD (what <input type="date"> expects).
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const DATE_PRESETS = [
    { id: "today", label: "Today", range: (t) => [ymd(t), ymd(t)] },
    { id: "7d", label: "Last 7 days", range: (t) => [ymd(new Date(t.getFullYear(), t.getMonth(), t.getDate() - 6)), ymd(t)] },
    { id: "month", label: "This month", range: (t) => [ymd(new Date(t.getFullYear(), t.getMonth(), 1)), ymd(t)] },
    { id: "lastMonth", label: "Last month", range: (t) => [ymd(new Date(t.getFullYear(), t.getMonth() - 1, 1)), ymd(new Date(t.getFullYear(), t.getMonth(), 0))] },
    {
        // Indian financial year: 1 April – 31 March.
        id: "fy", label: "This FY", range: (t) => {
            const year = t.getMonth() >= 3 ? t.getFullYear() : t.getFullYear() - 1;
            return [ymd(new Date(year, 3, 1)), ymd(t)];
        },
    },
];

/**
 * How many filters are currently narrowing the list. Every key with a non-empty value counts
 * once; startDate/endDate together count as one "date range" filter. "" always means "All".
 */
export const activeFilterCount = (filters = {}) => {
    let count = 0;
    let dates = false;
    for (const [key, value] of Object.entries(filters)) {
        if (key === "startDate" || key === "endDate") {
            if (value) dates = true;
        } else if (typeof value === "string" ? value.trim() : value) {
            count++;
        }
    }
    return count + (dates ? 1 : 0);
};

/** Case-insensitive "does any of these values contain the search term". Empty term matches all. */
export const matchText = (term, ...values) => {
    const needle = String(term || "").trim().toLowerCase();
    if (!needle) return true;
    return values.some((v) => v != null && String(v).toLowerCase().includes(needle));
};

const chipCls = (active) =>
    `h-7 px-2 rounded-full border text-xs font-medium transition-colors ${active
        ? "border-blue-600 bg-blue-600 text-white"
        : "border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-600 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-700 dark:hover:text-white"}`;

/**
 * Open/closed state for the filter sidebar.
 * Wide windows: docked beside the table, remembered between sessions.
 * Narrow windows: a slide-over drawer that starts closed and closes on Escape.
 */
export const useFilterPanel = () => {
    const [open, setOpenState] = useState(isWide);
    const searchRef = useRef(null);
    const preferOpen = useRef(true); // the user's docked preference on wide windows

    const setOpen = useCallback((next) => {
        setOpenState(next);
        if (isWide()) {
            preferOpen.current = next;
            window.api?.setItem(PANEL_STORE_KEY, next ? "open" : "closed");
        }
    }, []);

    // Restore the saved docked preference.
    useEffect(() => {
        let alive = true;
        Promise.resolve(window.api?.getItem(PANEL_STORE_KEY)).then((saved) => {
            if (!alive || (saved !== "open" && saved !== "closed")) return;
            preferOpen.current = saved === "open";
            if (isWide()) setOpenState(preferOpen.current);
        }).catch(() => { });
        return () => { alive = false; };
    }, []);

    // Crossing the breakpoint: dock with the saved preference, or tuck the drawer away.
    useEffect(() => {
        const mq = window.matchMedia?.(WIDE_QUERY);
        if (!mq) return;
        const onChange = (e) => setOpenState(e.matches ? preferOpen.current : false);
        mq.addEventListener?.("change", onChange);
        return () => mq.removeEventListener?.("change", onChange);
    }, []);

    // Escape closes the drawer (narrow windows only; docked panel stays put).
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => { if (e.key === "Escape" && !isWide()) setOpenState(false); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    const toggle = useCallback(() => setOpen(!open), [open, setOpen]);
    const close = useCallback(() => setOpen(false), [setOpen]);
    const openAndFocus = useCallback(() => {
        setOpen(true);
        setTimeout(() => searchRef.current?.focus(), 50);
    }, [setOpen]);

    return { open, setOpen, toggle, close, openAndFocus, searchRef };
};

/** Toolbar button that shows/hides the filter sidebar, with an active-filter count. */
export const FilterToggleButton = ({ panel, filters }) => {
    const count = activeFilterCount(filters);
    return (
        <button
            type="button"
            onClick={panel.toggle}
            aria-expanded={panel.open}
            aria-controls="list-filter-panel"
            title={panel.open ? "Hide filters (Ctrl+F)" : "Show filters (Ctrl+F)"}
            className={`h-8 px-3 rounded text-xs font-medium flex items-center gap-2 border shadow-sm transition-colors ${panel.open
                ? "border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500/60 dark:bg-blue-500/15 dark:text-blue-300"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"}`}
        >
            <AiOutlineFilter className="text-base" />
            <span className="uppercase tracking-wide">Filters</span>
            {count > 0 && (
                <span className="min-w-5 h-5 px-1 rounded-full bg-blue-600 text-white text-[10px] font-semibold flex items-center justify-center">
                    {count}
                </span>
            )}
        </button>
    );
};

const SectionTitle = ({ children }) => (
    <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{children}</h3>
);

/** A titled block inside the filter sidebar, with an optional "Clear" link. */
export const FilterSection = ({ title, onClear, children }) => (
    <section className="space-y-2">
        <div className="flex items-center justify-between">
            <SectionTitle>{title}</SectionTitle>
            {onClear && (
                <button type="button" onClick={onClear} className="text-[11px] font-medium text-blue-700 dark:text-blue-400 hover:underline">
                    Clear
                </button>
            )}
        </div>
        {children}
    </section>
);

/**
 * Single-choice chips with a leading "All" chip (value "").
 * `options`: [{ value, label }]. Calls `onChange` with an input-like event, so it plugs
 * into the same handler as the search box.
 */
export const ChipGroup = ({ name, value = "", onChange, options = [], allLabel = "All", label }) => (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label={label || name}>
        {[{ value: "", label: allLabel }, ...options].map((opt) => (
            <button
                key={opt.value || "__all"}
                type="button"
                aria-pressed={value === opt.value}
                onClick={() => onChange({ target: { name, value: opt.value } })}
                className={chipCls(value === opt.value)}
            >
                {opt.label}
            </button>
        ))}
    </div>
);

/**
 * Right-hand filter panel: search, page-specific sections (`children`), quick date ranges and
 * a custom From/To range. Place it as the last child of a `flex items-start` row next to the
 * table column. Pass `showDates={false}` for lists without a date (master data).
 */
export const FilterSidebar = ({ panel, filters, onChange, searchPlaceholder = "Search...", resultCount, showDates = true, children }) => {
    const { open, close, searchRef } = panel;
    const set = (name, value) => onChange({ target: { name, value } });
    const count = activeFilterCount(filters);

    const today = new Date();
    const activePreset = DATE_PRESETS.find(({ range }) => {
        const [from, to] = range(today);
        return filters.startDate === from && filters.endDate === to;
    })?.id;

    const applyRange = ([from, to]) => {
        set("startDate", from);
        set("endDate", to);
    };
    const clearDates = () => applyRange(["", ""]);
    const clearAll = () => Object.keys(filters).forEach((key) => set(key, ""));

    return (
        <>
            {/* Drawer backdrop (narrow windows). */}
            <div
                aria-hidden="true"
                onClick={close}
                className={`lg:hidden fixed inset-x-0 bottom-0 top-10 z-30 bg-slate-950/40 transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            />

            <aside
                id="list-filter-panel"
                aria-label="Filters"
                className={`fixed right-0 top-10 bottom-0 z-40 w-72 max-w-[85vw] flex flex-col
                    bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 shadow-2xl shadow-slate-950/20
                    transition-[transform,visibility] duration-200 ${open ? "translate-x-0 visible" : "translate-x-full invisible"}
                    lg:sticky lg:top-0 lg:z-0 lg:w-64 lg:max-w-none lg:shrink-0 lg:self-start lg:max-h-[calc(100vh-4rem)]
                    lg:rounded-md lg:border lg:shadow-sm lg:transform-none lg:transition-none ${open ? "lg:flex" : "lg:hidden"}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                        <AiOutlineFilter className="text-base text-slate-500 dark:text-slate-400" />
                        Filters
                        {count > 0 && (
                            <span className="min-w-5 h-5 px-1 rounded-full bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-400/20 text-[10px] font-semibold flex items-center justify-center">
                                {count}
                            </span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={close}
                        title="Hide filters"
                        aria-label="Hide filters"
                        className="p-1.5 rounded text-slate-500 dark:text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-700 dark:hover:text-white transition-colors"
                    >
                        <AiOutlineClose />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-3 space-y-5">
                    <section className="space-y-2">
                        <label htmlFor="filter-search"><SectionTitle>Search</SectionTitle></label>
                        <div className="relative">
                            <AiOutlineSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
                            <input
                                ref={searchRef}
                                id="filter-search"
                                type="text"
                                name="search"
                                placeholder={searchPlaceholder}
                                value={filters.search || ""}
                                onChange={onChange}
                                className={`${inputCls} pl-7 pr-7`}
                            />
                            {filters.search && (
                                <button
                                    type="button"
                                    onClick={() => { set("search", ""); searchRef.current?.focus(); }}
                                    aria-label="Clear search"
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                >
                                    <AiOutlineClose size={12} />
                                </button>
                            )}
                        </div>
                    </section>

                    {children}

                    {showDates && <FilterSection
                        title="Date range"
                        onClear={filters.startDate || filters.endDate ? clearDates : undefined}
                    >
                        <div className="flex flex-wrap gap-1.5">
                            {DATE_PRESETS.map((preset) => (
                                <button
                                    key={preset.id}
                                    type="button"
                                    aria-pressed={activePreset === preset.id}
                                    onClick={() => applyRange(activePreset === preset.id ? ["", ""] : preset.range(new Date()))}
                                    className={chipCls(activePreset === preset.id)}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                        <div className="grid gap-2 pt-1">
                            <div className="flex flex-col gap-1">
                                <label htmlFor="filter-startDate" className={labelCls}>From</label>
                                <input
                                    id="filter-startDate"
                                    type="date"
                                    name="startDate"
                                    value={filters.startDate}
                                    max={filters.endDate || undefined}
                                    onChange={onChange}
                                    className={inputCls}
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="filter-endDate" className={labelCls}>To</label>
                                <input
                                    id="filter-endDate"
                                    type="date"
                                    name="endDate"
                                    value={filters.endDate}
                                    min={filters.startDate || undefined}
                                    onChange={onChange}
                                    className={inputCls}
                                />
                            </div>
                        </div>
                        {!filters.startDate && !filters.endDate && (
                            <p className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                                <AiOutlineCalendar /> Showing all dates
                            </p>
                        )}
                    </FilterSection>}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 lg:rounded-b-md">
                    <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                        {resultCount !== undefined ? `${resultCount} result${resultCount === 1 ? "" : "s"}` : ""}
                    </span>
                    <button
                        type="button"
                        onClick={clearAll}
                        disabled={count === 0}
                        className="h-7 px-3 rounded border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Clear all
                    </button>
                </div>
            </aside>
        </>
    );
};

/* -------------------------------------------------------------------------- */

export const thCls = "p-2 whitespace-nowrap";

export const rowCls = (selected) =>
    `border-b border-slate-100 dark:border-slate-700/70 cursor-pointer transition-colors duration-150 text-slate-700 dark:text-slate-200 ${selected ? "bg-blue-50 dark:bg-blue-500/15" : "hover:bg-slate-50 dark:hover:bg-slate-700/50"}`;

const BADGE_TONES = {
    green: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20",
    blue: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/20",
    amber: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20",
    red: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-400/20",
    slate: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20 dark:bg-slate-700/60 dark:text-slate-300 dark:ring-slate-400/20",
};

export const Badge = ({ tone = "slate", children }) => (
    <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${BADGE_TONES[tone] || BADGE_TONES.slate}`}>
        {children}
    </span>
);

/* ------------------------------ Document lists ----------------------------- */

/** Row of figures above a list (count, totals). `items`: [{ label, value, hint, tone }]. */
const STAT_ACCENT = {
    blue: "text-blue-700 dark:text-blue-300",
    green: "text-emerald-700 dark:text-emerald-300",
    amber: "text-amber-700 dark:text-amber-300",
};

export const StatStrip = ({ items = [] }) => (
    <div className={`grid grid-cols-2 gap-2 ${items.length >= 4 ? "xl:grid-cols-4" : items.length === 3 ? "xl:grid-cols-3" : ""}`}>
        {items.map((item) => (
            <div key={item.label} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm px-3 py-2 min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 truncate">{item.label}</p>
                <p className={`text-lg font-semibold tabular-nums truncate ${STAT_ACCENT[item.tone] || "text-slate-900 dark:text-white"}`}>{item.value}</p>
                {item.hint && <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate" title={typeof item.hint === "string" ? item.hint : undefined}>{item.hint}</p>}
            </div>
        ))}
    </div>
);

/**
 * Client-side sorting. `accessors` maps a column key to (row) => comparable value.
 * Clicking the active column flips the direction; a new column starts with `firstDir`.
 */
export const useSort = (rows, accessors, initial = { key: null, dir: "desc" }) => {
    const [sort, setSort] = useState(initial);
    const onSort = (key) => setSort((prev) => (prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "party" || key === "route" ? "asc" : "desc" }));

    const get = sort.key ? accessors[sort.key] : null;
    const sorted = get
        ? [...rows].sort((a, b) => {
            const x = get(a), y = get(b);
            const cmp = typeof x === "number" && typeof y === "number"
                ? x - y
                : String(x ?? "").localeCompare(String(y ?? ""), "en-IN", { numeric: true, sensitivity: "base" });
            return sort.dir === "asc" ? cmp : -cmp;
        })
        : rows;
    return { sorted, sort, onSort };
};

const ALIGN = { left: "text-left", right: "text-right", center: "text-center" };

/** Header cell that sorts its column. */
export const SortTh = ({ label, sortKey, sort, onSort, align = "left", className = "" }) => {
    const active = sort.key === sortKey;
    const Arrow = active ? (sort.dir === "asc" ? AiOutlineArrowUp : AiOutlineArrowDown) : null;
    return (
        <th className={`${thCls} ${ALIGN[align] || ALIGN.left} ${className}`} aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}>
            <button
                type="button"
                onClick={() => onSort(sortKey)}
                className={`inline-flex items-center gap-1 uppercase tracking-wide rounded hover:text-slate-900 dark:hover:text-white transition-colors ${align === "right" ? "flex-row-reverse" : ""} ${active ? "text-slate-900 dark:text-white" : ""}`}
            >
                {label}
                <span className="w-3 text-[10px]">{Arrow ? <Arrow /> : <span className="opacity-0 group-hover:opacity-50">↕</span>}</span>
            </button>
        </th>
    );
};

/** Left-edge accent for the first cell of a selected row (box-shadow on <tr> is unreliable). */
export const selCellCls = (selected) => (selected ? "shadow-[inset_3px_0_0_0_#2563eb]" : "");

/** Main text with a muted second line, for compact two-line cells. */
export const CellStack = ({ primary, secondary, title, className = "" }) => (
    <div className={`min-w-0 ${className}`} title={title}>
        <div className="truncate">{primary || "--"}</div>
        {secondary && <div className="truncate text-xs text-slate-500 dark:text-slate-400">{secondary}</div>}
    </div>
);

/** Small icon button for a row (edit, print...). Never selects the row. */
export const RowAction = ({ icon, label, onClick, tone = "blue", disabled }) => (
    <button
        type="button"
        title={label}
        aria-label={label}
        disabled={disabled}
        onClick={(e) => { e.stopPropagation(); onClick?.(e); }}
        onDoubleClick={(e) => e.stopPropagation()}
        className={`p-1.5 rounded text-base text-slate-400 dark:text-slate-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${tone === "amber"
            ? "hover:text-amber-700 hover:bg-amber-500/10 dark:hover:text-amber-300"
            : "hover:text-blue-600 hover:bg-blue-500/10 dark:hover:text-blue-400"}`}
    >
        {icon}
    </button>
);

/** Friendly empty list: what happened and what to do next. */
export const EmptyState = ({ icon, title, hint, action }) => (
    <div className="flex flex-col items-center gap-2 py-10 px-4 text-center">
        {icon && <div className="h-11 w-11 rounded-full bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center text-xl text-slate-400 dark:text-slate-400">{icon}</div>}
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</p>
        {hint && <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">{hint}</p>}
        {action && <div className="pt-1">{action}</div>}
    </div>
);

const SkeletonRows = ({ colSpan, rows = 6 }) => Array.from({ length: rows }, (_, i) => (
    <tr key={i} className="border-b border-slate-100 dark:border-slate-700/70">
        <td colSpan={colSpan} className="px-3 py-3">
            <div className="h-3 rounded bg-slate-100 dark:bg-slate-700/70 animate-pulse" style={{ width: `${90 - (i % 3) * 15}%` }} />
        </td>
    </tr>
));

/**
 * Arrow keys move the selection through `rows`, Enter opens the selected one.
 * Ignored while typing in a field or when a dialog is open.
 */
export const useRowKeys = ({ rows, selectedId, onSelect, onOpen }) => {
    const ref = useRef({});
    ref.current = { rows, selectedId, onSelect, onOpen };

    useEffect(() => {
        const onKey = (e) => {
            if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
            if (!["ArrowDown", "ArrowUp", "Enter"].includes(e.key)) return;
            const t = e.target;
            if (t?.closest?.("input, textarea, select, button, a, [role='combobox'], [contenteditable='true'], .fixed.inset-0")) return;
            const { rows: list, selectedId: sel, onSelect: select, onOpen: open } = ref.current;
            if (!list?.length) return;
            const index = list.findIndex((r) => r.id === sel);
            if (e.key === "Enter") {
                if (index >= 0 && open) { e.preventDefault(); open(sel); }
                return;
            }
            e.preventDefault();
            const next = e.key === "ArrowDown"
                ? Math.min(index + 1, list.length - 1)
                : index <= 0 ? 0 : index - 1;
            select(list[next].id);
            document.getElementById(`row-${list[next].id}`)?.scrollIntoView({ block: "nearest" });
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);
};

const PAGE_SIZES = [10, 25, 50, 100];
const PAGE_SIZE_KEY = "listPageSize";

/** Rows per page, remembered between sessions. */
export const usePageSize = (initial = PAGE_LIMIT) => {
    const [size, setSizeState] = useState(initial);
    useEffect(() => {
        let alive = true;
        Promise.resolve(window.api?.getItem(PAGE_SIZE_KEY)).then((saved) => {
            const n = Number(saved);
            if (alive && PAGE_SIZES.includes(n)) setSizeState(n);
        }).catch(() => { });
        return () => { alive = false; };
    }, []);
    const setSize = useCallback((n) => {
        setSizeState(n);
        window.api?.setItem(PAGE_SIZE_KEY, String(n));
    }, []);
    return [size, setSize];
};

/** Table wrapper: horizontal scroll on narrow windows, header + body + empty/loading state. */
export const ListTable = ({ minWidth = "min-w-[900px]", head, colSpan, loading, isEmpty, emptyText = "No records found.", emptyState, foot, children }) => (
    <MainArea>
        <div className="w-full overflow-x-auto">
            <table className={`w-full ${minWidth} text-sm`}>
                <thead>
                    <tr className="group border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {head}
                    </tr>
                </thead>
                <tbody>
                    {isEmpty ? (
                        loading && emptyState ? <SkeletonRows colSpan={colSpan} /> : (
                            <tr>
                                <td className="p-6 text-center text-slate-500 dark:text-slate-400" colSpan={colSpan}>
                                    {loading ? "Loading..." : (emptyState || emptyText)}
                                </td>
                            </tr>
                        )
                    ) : children}
                </tbody>
                {!isEmpty && foot && <tfoot>{foot}</tfoot>}
            </table>
        </div>
    </MainArea>
);

/** "Showing x to y of z · Total ₹" + windowed page buttons (+ rows-per-page when `onPageSize` is given). */
export const Pagination = ({ paging, onPage, totalAmount, pageSize, onPageSize }) => {
    const { total, totalPages, currentPage, start, end } = paging;
    const btn = "min-w-8 h-8 px-2 rounded border text-sm transition";
    const idle = "border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-700 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent";

    return (
        <MainArea>
            <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-sm p-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-600 dark:text-slate-300">
                    <span className="tabular-nums">
                        Showing {start} to {end} of {total}
                        {total > 0 && totalAmount !== undefined && (
                            <span className="ml-2 font-semibold text-slate-900 dark:text-white">· Total {formatINR(totalAmount)}</span>
                        )}
                    </span>
                    {onPageSize && (
                        <label className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            Rows
                            <select
                                value={pageSize}
                                onChange={(e) => { onPageSize(Number(e.target.value)); onPage(1); }}
                                className="h-7 px-1 rounded border border-slate-300 dark:border-slate-600 text-xs"
                            >
                                {PAGE_SIZES.map((n) => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </label>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-1">
                    <button disabled={currentPage === 1 || total === 0} onClick={() => onPage(currentPage - 1)} className={`${btn} ${idle}`}>
                        Prev
                    </button>
                    {pageWindow(currentPage, totalPages).map((p, i) => (
                        p === null ? (
                            <span key={`gap-${i}`} className="px-1 text-slate-400 dark:text-slate-500">…</span>
                        ) : (
                            <button
                                key={p}
                                onClick={() => onPage(p)}
                                aria-current={currentPage === p ? "page" : undefined}
                                className={`${btn} ${currentPage === p ? "bg-blue-600 text-white border-blue-600" : idle}`}>
                                {p}
                            </button>
                        )
                    ))}
                    <button disabled={currentPage >= totalPages || total === 0} onClick={() => onPage(currentPage + 1)} className={`${btn} ${idle}`}>
                        Next
                    </button>
                </div>
            </div>
        </MainArea>
    );
};
