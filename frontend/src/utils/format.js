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

// Opens the server-rendered HTML in a new window for printing.
// Returns false when the window could not be opened (pop-up blocked).
export const openPrintWindow = (html) => {
    const win = window.open();
    if (!win) return false;
    win.document.write(html);
    win.document.close();
    return true;
};

// Pulls the most useful message out of an axios error.
export const errorMessage = (error, fallback = "Something went wrong!") =>
    error?.response?.data?.message || error?.message || fallback;
