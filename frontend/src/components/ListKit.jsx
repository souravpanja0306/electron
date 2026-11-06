import React from 'react';
import { AiOutlineSearch, AiOutlineSync } from "react-icons/ai";

import MainArea from './MainArea';
import CustomButton from './CustomButton';
import { inputCls } from './FormKit';
import { formatINR } from '../utils/format';

/*
 * Shared pieces for the list pages (View Challans / Invoices / Money Receipts):
 * filter bar, row styling, status badge and pagination.
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

/** Search box + From/To dates + Refresh. */
export const ListFilters = ({ filters, onChange, onRefresh, searchPlaceholder = "Search..." }) => (
    <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
            <AiOutlineSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
                type="text"
                name="search"
                aria-label="Search"
                placeholder={searchPlaceholder}
                value={filters.search}
                onChange={onChange}
                className={`${inputCls} pl-7 w-52 md:w-64`}
            />
        </div>
        <div className="flex items-center gap-1">
            <label htmlFor="filter-startDate" className="text-xs font-semibold">From</label>
            <input
                id="filter-startDate"
                type="date"
                name="startDate"
                value={filters.startDate}
                max={filters.endDate || undefined}
                onChange={onChange}
                className={`${inputCls} w-36`}
            />
        </div>
        <div className="flex items-center gap-1">
            <label htmlFor="filter-endDate" className="text-xs font-semibold">To</label>
            <input
                id="filter-endDate"
                type="date"
                name="endDate"
                value={filters.endDate}
                min={filters.startDate || undefined}
                onChange={onChange}
                className={`${inputCls} w-36`}
            />
        </div>
        <div onClick={onRefresh}>
            <CustomButton title={"Refresh"} color={"blue"}><AiOutlineSync /></CustomButton>
        </div>
    </div>
);

export const thCls = "p-2 whitespace-nowrap";

export const rowCls = (selected) =>
    `border-b border-slate-200 dark:border-slate-700 cursor-pointer duration-150 text-slate-700 dark:text-slate-200 ${selected ? "bg-blue-100 dark:bg-slate-600" : "hover:bg-blue-50 dark:hover:bg-slate-700"}`;

const BADGE_TONES = {
    green: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    amber: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    slate: "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
};

export const Badge = ({ tone = "slate", children }) => (
    <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${BADGE_TONES[tone] || BADGE_TONES.slate}`}>
        {children}
    </span>
);

/** Table wrapper: horizontal scroll on narrow windows, header + body + empty/loading state. */
export const ListTable = ({ minWidth = "min-w-[900px]", head, colSpan, loading, isEmpty, emptyText = "No records found.", children }) => (
    <MainArea>
        <div className="w-full overflow-x-auto">
            <table className={`w-full ${minWidth} text-sm`}>
                <thead>
                    <tr className="border-b border-slate-300 dark:border-slate-600 text-xs uppercase tracking-wide text-slate-600 dark:text-slate-200">
                        {head}
                    </tr>
                </thead>
                <tbody>
                    {isEmpty ? (
                        <tr>
                            <td className="p-6 text-center text-slate-500 dark:text-slate-300" colSpan={colSpan}>
                                {loading ? "Loading..." : emptyText}
                            </td>
                        </tr>
                    ) : children}
                </tbody>
            </table>
        </div>
    </MainArea>
);

/** "Showing x to y of z · Total ₹" + windowed page buttons. */
export const Pagination = ({ paging, onPage, totalAmount }) => {
    const { total, totalPages, currentPage, start, end } = paging;
    const btn = "min-w-8 h-8 px-2 rounded border text-sm transition";
    const idle = "border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-blue-200 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed";

    return (
        <MainArea>
            <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-sm p-1">
                <div className="text-slate-600 dark:text-slate-300">
                    Showing {start} to {end} of {total}
                    {total > 0 && totalAmount !== undefined && (
                        <span className="ml-2 font-semibold">· Total {formatINR(totalAmount)}</span>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-1">
                    <button disabled={currentPage === 1 || total === 0} onClick={() => onPage(currentPage - 1)} className={`${btn} ${idle}`}>
                        Prev
                    </button>
                    {pageWindow(currentPage, totalPages).map((p, i) => (
                        p === null ? (
                            <span key={`gap-${i}`} className="px-1 text-slate-400">…</span>
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
