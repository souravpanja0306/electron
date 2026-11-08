import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { AiOutlineArrowUp, AiOutlineArrowDown, AiOutlineTable, AiOutlineBarChart } from 'react-icons/ai';

import { compactINR, formatINR0 } from '../utils/format';
import { monthLabel } from '../utils/periods';

/*
 * Dashboard / report building blocks. Colours come from the chart tokens in index.css
 * (validated for colour-blind separation and contrast in light and dark). Text never
 * wears a series colour — swatches carry identity, labels stay in text tokens.
 */

/* --------------------------------- Cards --------------------------------- */

export const ChartCard = ({ title, description, actions, children, className = "" }) => (
    <section className={`rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm flex flex-col min-w-0 ${className}`}>
        <header className="flex items-start justify-between gap-3 px-4 pt-3 pb-2">
            <div className="min-w-0">
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
                {description && <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>}
            </div>
            {actions}
        </header>
        <div className="px-4 pb-4 flex-1 min-h-0">{children}</div>
    </section>
);

/** Toggle between the chart and its table (the accessible view of the same data). */
export const ViewToggle = ({ table, onChange }) => (
    <div className="inline-flex rounded-md border border-slate-200 dark:border-slate-700 p-0.5" role="group" aria-label="View">
        {[["chart", <AiOutlineBarChart key="c" />, "Chart"], ["table", <AiOutlineTable key="t" />, "Table"]].map(([id, icon, label]) => {
            const active = (id === "table") === table;
            return (
                <button
                    key={id}
                    type="button"
                    aria-pressed={active}
                    title={`${label} view`}
                    onClick={() => onChange(id === "table")}
                    className={`h-6 px-2 inline-flex items-center gap-1 rounded text-[11px] font-medium transition-colors ${active
                        ? "bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white"
                        : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"}`}
                >
                    {icon}{label}
                </button>
            );
        })}
    </div>
);

/* ------------------------------- KPI tiles ------------------------------- */

/** "+12.5% vs previous period" with an arrow; omitted when there is nothing to compare. */
export const Delta = ({ current, previous, goodWhenUp = true }) => {
    if (!previous) return <span className="text-[11px] text-slate-400 dark:text-slate-500">No data for previous period</span>;
    const change = ((current - previous) / Math.abs(previous)) * 100;
    if (!Number.isFinite(change)) return null;
    const up = change >= 0;
    const good = up === goodWhenUp;
    const Icon = up ? AiOutlineArrowUp : AiOutlineArrowDown;
    return (
        <span className="inline-flex items-center gap-1 text-[11px]">
            <span className="inline-flex items-center gap-0.5 font-semibold" style={{ color: good ? "var(--delta-up)" : "var(--delta-down)" }}>
                <Icon aria-hidden="true" />
                {Math.abs(change) >= 1000 ? ">999" : Math.abs(change).toFixed(1)}%
                <span className="sr-only">{up ? "up" : "down"}</span>
            </span>
            <span className="text-slate-500 dark:text-slate-400">vs previous period</span>
        </span>
    );
};

export const KpiTile = ({ label, value, sub, footer, icon, loading, href, linkLabel }) => (
    <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm px-4 py-3 flex flex-col gap-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">{label}</p>
            {icon && <span className="text-lg text-slate-300 dark:text-slate-600" aria-hidden="true">{icon}</span>}
        </div>
        {loading
            ? <div className="h-7 w-32 rounded bg-slate-100 dark:bg-slate-700 animate-pulse" />
            : <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white truncate" title={String(value)}>{value}</p>}
        {sub && <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{sub}</p>}
        <div className="flex items-center justify-between gap-2 min-h-[16px]">
            {!loading && footer}
            {href && <a href={`#${href}`} className="text-[11px] font-medium text-blue-700 dark:text-blue-400 hover:underline shrink-0">{linkLabel}</a>}
        </div>
    </div>
);

/* ------------------------------ Trend chart ------------------------------ */

const SERIES = [
    { key: "sales", label: "Sales (invoiced)", color: "var(--series-1)" },
    { key: "collections", label: "Collections (received)", color: "var(--series-2)" },
];

const Swatch = ({ color }) => <span className="inline-block h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: color }} aria-hidden="true" />;

const TrendTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 shadow-lg shadow-slate-900/10 dark:shadow-black/40 text-xs">
            <p className="mb-1 font-semibold text-slate-800 dark:text-slate-100">{label}</p>
            {SERIES.map((s) => {
                const item = payload.find((p) => p.dataKey === s.key);
                return (
                    <p key={s.key} className="flex items-center justify-between gap-4 text-slate-600 dark:text-slate-300">
                        <span className="flex items-center gap-1.5"><Swatch color={s.color} />{s.label}</span>
                        <span className="font-semibold tabular-nums text-slate-900 dark:text-white">{formatINR0(item?.value)}</span>
                    </p>
                );
            })}
        </div>
    );
};

/** Sales vs collections by month: one currency axis, two series, legend + table view. */
export const TrendChart = ({ monthly = [], loading }) => {
    const [table, setTable] = useState(false);
    const data = monthly.map((m) => ({ ...m, label: monthLabel(m.month) }));
    const empty = !loading && data.every((d) => !d.sales && !d.collections);

    return (
        <ChartCard
            title="Sales vs collections"
            description="Last 12 months, including GST."
            actions={<ViewToggle table={table} onChange={setTable} />}
        >
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2" aria-label="Legend">
                {SERIES.map((s) => (
                    <span key={s.key} className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <Swatch color={s.color} />{s.label}
                    </span>
                ))}
            </div>

            {table ? (
                <div className="max-h-64 overflow-auto rounded border border-slate-200 dark:border-slate-700">
                    <table className="w-full text-xs">
                        <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            <tr><th className="px-3 py-1.5 text-left">Month</th><th className="px-3 py-1.5 text-right">Sales</th><th className="px-3 py-1.5 text-right">Collections</th></tr>
                        </thead>
                        <tbody>
                            {data.map((d) => (
                                <tr key={d.month} className="border-t border-slate-100 dark:border-slate-700/70 text-slate-700 dark:text-slate-200">
                                    <td className="px-3 py-1.5">{d.label}</td>
                                    <td className="px-3 py-1.5 text-right tabular-nums">{formatINR0(d.sales)}</td>
                                    <td className="px-3 py-1.5 text-right tabular-nums">{formatINR0(d.collections)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="relative h-64" role="img" aria-label="Bar chart of monthly sales and collections. Switch to table view for exact values.">
                    {loading && <div className="absolute inset-0 rounded bg-slate-50 dark:bg-slate-900/40 animate-pulse" />}
                    {!loading && (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} barGap={2} barCategoryGap="24%" margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                                <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
                                <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: "var(--chart-axis)" }} tick={{ fill: "var(--chart-tick)", fontSize: 11 }} interval="preserveStartEnd" minTickGap={8} />
                                <YAxis tickFormatter={compactINR} tickLine={false} axisLine={false} tick={{ fill: "var(--chart-tick)", fontSize: 11 }} width={58} allowDecimals={false} />
                                <Tooltip cursor={{ fill: "var(--chart-cursor)" }} content={<TrendTooltip />} />
                                {SERIES.map((s) => (
                                    <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false} />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                    {empty && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <p className="rounded-md bg-white/90 dark:bg-slate-800/90 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400">No sales or collections in these months yet.</p>
                        </div>
                    )}
                </div>
            )}
        </ChartCard>
    );
};

/* ------------------------------ Aging figure ----------------------------- */

const AGE_COLORS = ["var(--age-1)", "var(--age-2)", "var(--age-3)", "var(--age-4)"];

/** One whole (outstanding receivables) split by age — a tall segmented bar plus its table. */
export const AgingBar = ({ buckets = [], loading }) => {
    const [hover, setHover] = useState(null);
    const total = buckets.reduce((sum, b) => sum + (b.amount || 0), 0);
    const parts = buckets.map((b, i) => ({ ...b, color: AGE_COLORS[i], share: total ? (b.amount / total) * 100 : 0 }));

    return (
        <ChartCard title="Receivables by age" description="Unpaid invoice amounts. Payments are applied to the oldest invoices first.">
            {loading ? (
                <div className="h-7 rounded bg-slate-100 dark:bg-slate-700 animate-pulse" />
            ) : total <= 0 ? (
                <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">Nothing outstanding. Every invoice is paid.</p>
            ) : (
                <div className="relative">
                    <div className="flex h-7 w-full gap-[2px]" role="list" aria-label="Outstanding by age">
                        {parts.filter((p) => p.amount > 0).map((p) => (
                            <div
                                key={p.key}
                                role="listitem"
                                tabIndex={0}
                                aria-label={`${p.label}: ${formatINR0(p.amount)}, ${p.share.toFixed(0)}%`}
                                onMouseEnter={() => setHover(p.key)}
                                onMouseLeave={() => setHover(null)}
                                onFocus={() => setHover(p.key)}
                                onBlur={() => setHover(null)}
                                className="h-full rounded min-w-[6px] outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-500 transition-opacity"
                                style={{ width: `${p.share}%`, background: p.color, opacity: hover && hover !== p.key ? 0.55 : 1 }}
                            />
                        ))}
                    </div>
                    {hover && (() => {
                        const p = parts.find((x) => x.key === hover);
                        return (
                            <div className="absolute left-0 right-0 top-9 z-10 flex justify-center pointer-events-none">
                                <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs shadow-lg shadow-slate-900/10 dark:shadow-black/40">
                                    <span className="font-semibold text-slate-800 dark:text-slate-100">{p.label}</span>
                                    <span className="mx-2 tabular-nums text-slate-900 dark:text-white">{formatINR0(p.amount)}</span>
                                    <span className="text-slate-500 dark:text-slate-400">{p.share.toFixed(0)}% · {p.invoices} invoice{p.invoices === 1 ? "" : "s"}</span>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            )}

            <table className="mt-3 w-full text-xs">
                <thead className="sr-only"><tr><th>Age</th><th>Invoices</th><th>Amount</th><th>Share</th></tr></thead>
                <tbody>
                    {parts.map((p) => (
                        <tr key={p.key} className="border-t border-slate-100 dark:border-slate-700/70 text-slate-600 dark:text-slate-300">
                            <td className="py-1.5"><span className="inline-flex items-center gap-1.5"><Swatch color={p.color} />{p.label}</span></td>
                            <td className="py-1.5 text-right tabular-nums text-slate-400 dark:text-slate-500">{loading ? "" : `${p.invoices} inv`}</td>
                            <td className="py-1.5 text-right tabular-nums font-medium text-slate-900 dark:text-white">{loading ? "–" : formatINR0(p.amount)}</td>
                            <td className="py-1.5 pl-2 w-12 text-right tabular-nums text-slate-500 dark:text-slate-400">{loading || !total ? "" : `${p.share.toFixed(0)}%`}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </ChartCard>
    );
};

/* ------------------------------ Ranked bars ------------------------------ */

/** Single-series horizontal ranking (no legend needed): name, thin bar, value, share. */
export const RankedBars = ({ items = [], total, emptyText = "No data for this period." }) => {
    const max = Math.max(...items.map((i) => i.value || 0), 0);
    if (!items.length) return <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">{emptyText}</p>;
    return (
        <ol className="flex flex-col gap-3">
            {items.map((item, index) => (
                <li key={item.key} className="min-w-0">
                    <div className="flex items-baseline justify-between gap-3 text-xs">
                        <span className="min-w-0 truncate text-slate-700 dark:text-slate-200" title={item.label}>
                            <span className="mr-1.5 tabular-nums text-slate-400 dark:text-slate-500">{index + 1}.</span>{item.label}
                        </span>
                        <span className="shrink-0 tabular-nums">
                            <span className="font-semibold text-slate-900 dark:text-white">{formatINR0(item.value)}</span>
                            {total > 0 && <span className="ml-1.5 text-slate-400 dark:text-slate-500">{((item.value / total) * 100).toFixed(0)}%</span>}
                        </span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-slate-100 dark:bg-slate-700/60 overflow-hidden" aria-hidden="true">
                        <div className="h-full rounded-full" style={{ width: `${max ? Math.max(2, (item.value / max) * 100) : 0}%`, background: "var(--series-1)" }} />
                    </div>
                    {item.sub && <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{item.sub}</p>}
                </li>
            ))}
        </ol>
    );
};
