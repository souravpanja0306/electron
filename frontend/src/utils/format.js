import usePrintStore from "../store/PrintStore";

// Number / currency formatting shared by the challan, invoice and receipt pages.

export const formatNumber = (value, maxDigits = 2) =>
    (Number(value) || 0).toLocaleString("en-IN", { maximumFractionDigits: maxDigits });

// "₹ 1,23,456.00"
export const formatINR = (value) =>
    `₹ ${(Number(value) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// "₹1,23,456" (whole rupees) for tiles and summaries.
export const formatINR0 = (value) =>
    `₹${Math.round(Number(value) || 0).toLocaleString("en-IN")}`;

// Indian short scale for axes: ₹950, ₹12K, ₹4.5L, ₹1.2Cr.
export const compactINR = (value) => {
    const n = Number(value) || 0;
    const abs = Math.abs(n);
    const fmt = (x) => (x >= 10 ? Math.round(x) : Math.round(x * 10) / 10).toString();
    if (abs >= 1e7) return `₹${fmt(n / 1e7)}Cr`;
    if (abs >= 1e5) return `₹${fmt(n / 1e5)}L`;
    if (abs >= 1e3) return `₹${fmt(n / 1e3)}K`;
    return `₹${Math.round(n)}`;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "2026-11-08" -> "08 Nov 2026". Anything else is returned as-is ("--" when empty).
export const formatDate = (value) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value || ""));
    if (!m) return value || "--";
    return `${m[3]} ${MONTHS[Number(m[2]) - 1] || m[2]} ${m[1]}`;
};

// Shows the HTML in the app-wide print preview, which then opens the printer dialog
// (components/PrintPreview.jsx). Returns false when there is nothing to show.
export const openPrintWindow = (html, title = "") => {
    if (!html) return false;
    usePrintStore.getState().openPreview(html, title);
    return true;
};

// Pulls the most useful message out of an axios error.
export const errorMessage = (error, fallback = "Something went wrong!") =>
    error?.response?.data?.message || error?.message || fallback;
