// Reporting periods (Indian financial year: 1 April – 31 March). Dates are local YYYY-MM-DD.

export const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const fyStartYear = (d) => (d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1);

export const PERIODS = [
    { id: "month", label: "This month", range: (t) => [ymd(new Date(t.getFullYear(), t.getMonth(), 1)), ymd(t)] },
    { id: "lastMonth", label: "Last month", range: (t) => [ymd(new Date(t.getFullYear(), t.getMonth() - 1, 1)), ymd(new Date(t.getFullYear(), t.getMonth(), 0))] },
    {
        id: "quarter", label: "This quarter", range: (t) => {
            // FY quarters: Apr–Jun, Jul–Sep, Oct–Dec, Jan–Mar.
            const m = t.getMonth();
            const startMonth = m >= 3 ? 3 + Math.floor((m - 3) / 3) * 3 : 0;
            return [ymd(new Date(t.getFullYear(), startMonth, 1)), ymd(t)];
        },
    },
    { id: "fy", label: "This FY", range: (t) => [ymd(new Date(fyStartYear(t), 3, 1)), ymd(t)] },
    { id: "lastFy", label: "Last FY", range: (t) => [ymd(new Date(fyStartYear(t) - 1, 3, 1)), ymd(new Date(fyStartYear(t), 2, 31))] },
    { id: "12m", label: "Last 12 months", range: (t) => [ymd(new Date(t.getFullYear(), t.getMonth() - 11, 1)), ymd(t)] },
];

export const periodRange = (id, today = new Date()) => (PERIODS.find((p) => p.id === id) || PERIODS[3]).range(today);

/** "1 Apr 2026 – 8 Nov 2026" */
export const formatRange = (from, to) => {
    const f = (s) => new Date(`${s}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    return from && to ? `${f(from)} – ${f(to)}` : "";
};

/** "2026-07" -> "Jul 26" */
export const monthLabel = (ym) => {
    const [y, m] = ym.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
};

/** "08 Nov 2026" from YYYY-MM-DD */
export const formatDate = (s) =>
    s ? new Date(`${s}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "--";
