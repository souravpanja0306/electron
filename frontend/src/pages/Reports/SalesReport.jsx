import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { AiOutlineReload, AiOutlineDownload } from 'react-icons/ai';

import PageTitle from '../../components/PageTitle';
import ActionArea from '../../components/ActionArea';
import CustomButton from '../../components/CustomButton';
import { inputCls } from '../../components/FormKit';
import { KpiTile } from '../../components/ReportKit';
import {
  FilterSidebar, FilterToggleButton, FilterSection, useFilterPanel, ListTable, Pagination,
  paginate, thCls, matchText,
} from '../../components/ListKit';
import useAuthStore from '../../store/AuthStore';
import useCompanyStore from '../../store/CompanyStore';
import usePartyStore from '../../store/PartyStore';
import useReportStore from '../../store/ReportStore';
import useClientFilters from '../../hooks/useClientFilters';
import useShortcuts from '../../hooks/useShortcuts';
import { formatINR, formatINR0 } from '../../utils/format';
import { periodRange, formatRange, formatDate, monthLabel, ymd } from '../../utils/periods';
import { downloadCsv } from '../../utils/csv';

const TABS = [
  { id: "invoices", label: "Invoices" },
  { id: "party", label: "By customer" },
  { id: "month", label: "By month" },
];

const PAGE_SIZE = 25;
const sumOf = (rows, key) => rows.reduce((s, r) => s + (Number(r[key]) || 0), 0);
const money = (n) => (Math.round((Number(n) || 0) * 100) / 100).toFixed(2);

// Groups invoice rows into summary rows keyed by `keyOf`.
const groupRows = (rows, keyOf, describe) => {
  const map = new Map();
  for (const r of rows) {
    const key = keyOf(r);
    if (!map.has(key)) map.set(key, { key, ...describe(r), invoices: 0, taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0 });
    const g = map.get(key);
    g.invoices += 1;
    for (const f of ["taxable", "cgst", "sgst", "igst", "total"]) g[f] += Number(r[f]) || 0;
  }
  return [...map.values()];
};

const Num = ({ children, strong }) => (
  <td className={`p-2 text-right whitespace-nowrap tabular-nums ${strong ? "font-semibold text-slate-900 dark:text-white" : ""}`}>{children}</td>
);

const SalesReport = () => {
  const { token } = useAuthStore();
  const { companyData, getAllCompany } = useCompanyStore();
  const { getAllParty, parties } = usePartyStore();
  const getSalesRegister = useReportStore((s) => s.getSalesRegister);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("invoices");
  const panel = useFilterPanel();

  const [fyFrom, fyTo] = periodRange("fy");
  const { filters, onFilterChange, filtered, page, setPage } = useClientFilters(
    rows,
    { search: "", company_id: "", party_id: "", startDate: fyFrom, endDate: fyTo },
    (r, f) => matchText(f.search, r.invoice_no, r.party, r.party_gst, r.company)
  );
  const clear = (name) => () => onFilterChange({ target: { name, value: "" } });

  useEffect(() => {
    getAllCompany(token);
    getAllParty();
  }, []);

  const load = async () => {
    // No dates = everything on record.
    const from = filters.startDate || "2000-01-01";
    const to = filters.endDate || ymd(new Date());
    if (from > to) return;
    setLoading(true);
    const result = await getSalesRegister({ company_id: filters.company_id, party_id: filters.party_id, from, to });
    setLoading(false);
    if (result?.status === 200) setRows(result.body.rows || []);
    else toast.error(result?.message || "Could not load the sales register.");
  };

  useEffect(() => { load(); }, [filters.company_id, filters.party_id, filters.startDate, filters.endDate]);

  const byParty = useMemo(
    () => groupRows(filtered, (r) => r.party_id, (r) => ({ party: r.party || "Unknown party", party_gst: r.party_gst })).sort((a, b) => b.total - a.total),
    [filtered]
  );
  const byMonth = useMemo(
    () => groupRows(filtered, (r) => (r.invoice_date || "").slice(0, 7), (r) => ({ month: (r.invoice_date || "").slice(0, 7) })).sort((a, b) => a.key.localeCompare(b.key)),
    [filtered]
  );

  const totals = {
    count: filtered.length,
    taxable: sumOf(filtered, "taxable"),
    cgst: sumOf(filtered, "cgst"),
    sgst: sumOf(filtered, "sgst"),
    igst: sumOf(filtered, "igst"),
    total: sumOf(filtered, "total"),
  };
  const gst = totals.cgst + totals.sgst + totals.igst;

  const exportCsv = () => {
    const range = `${filters.startDate || "start"}_to_${filters.endDate || ymd(new Date())}`;
    const amountCols = [
      { label: "Taxable", value: (r) => money(r.taxable) },
      { label: "CGST", value: (r) => money(r.cgst) },
      { label: "SGST", value: (r) => money(r.sgst) },
      { label: "IGST", value: (r) => money(r.igst) },
      { label: "Total", value: (r) => money(r.total) },
    ];
    if (tab === "invoices") {
      downloadCsv(`sales-register_${range}.csv`, [
        { label: "Date", value: (r) => r.invoice_date },
        { label: "Invoice No", value: (r) => r.invoice_no },
        { label: "Company", value: (r) => r.company },
        { label: "Customer", value: (r) => r.party },
        { label: "Customer GSTIN", value: (r) => r.party_gst },
        { label: "Place of supply", value: (r) => r.party_state },
        ...amountCols,
      ], filtered);
    } else if (tab === "party") {
      downloadCsv(`sales-by-customer_${range}.csv`, [
        { label: "Customer", value: (r) => r.party },
        { label: "GSTIN", value: (r) => r.party_gst },
        { label: "Invoices", value: (r) => r.invoices },
        ...amountCols,
      ], byParty);
    } else {
      downloadCsv(`sales-by-month_${range}.csv`, [
        { label: "Month", value: (r) => r.month },
        { label: "Invoices", value: (r) => r.invoices },
        ...amountCols,
      ], byMonth);
    }
    toast.success("CSV downloaded.");
  };

  useShortcuts({ f: () => panel.openAndFocus() });

  const invoicePaging = paginate(filtered, page, PAGE_SIZE);
  const footRow = (lead, colSpan) => (
    <tr className="border-t-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/40 font-semibold text-slate-900 dark:text-white">
      <td className="p-2" colSpan={colSpan}>{lead}</td>
      <Num>{formatINR(totals.taxable)}</Num>
      <Num>{formatINR(totals.cgst)}</Num>
      <Num>{formatINR(totals.sgst)}</Num>
      <Num>{formatINR(totals.igst)}</Num>
      <Num strong>{formatINR(totals.total)}</Num>
    </tr>
  );
  const rowCls = "border-b border-slate-100 dark:border-slate-700/70 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors";

  return (
    <>
      <PageTitle>Sales Register</PageTitle>
      <div className="flex items-start gap-2">
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <ActionArea>
            <div className="flex flex-wrap items-center justify-between w-full gap-2">
              <div className="flex flex-wrap items-center gap-1" role="tablist" aria-label="Report view">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={tab === t.id}
                    onClick={() => { setTab(t.id); setPage(1); }}
                    className={`h-8 px-3 rounded text-xs font-medium transition-colors ${tab === t.id
                      ? "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/30 dark:bg-blue-500/15 dark:text-blue-300"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"}`}
                  >
                    {t.label}
                  </button>
                ))}
                <span className="ml-2 text-[11px] text-slate-500 dark:text-slate-400">
                  {filters.startDate || filters.endDate ? formatRange(filters.startDate || "2000-01-01", filters.endDate || ymd(new Date())) : "All dates"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <CustomButton title="Export CSV" color="slate" onClick={exportCsv} disabled={!filtered.length}><AiOutlineDownload /></CustomButton>
                <CustomButton title="Refresh" color="slate" onClick={load}><AiOutlineReload className={loading ? "animate-spin" : ""} /></CustomButton>
                {/* The default (this FY) range isn't a user filter, so it doesn't count in the badge. */}
                <FilterToggleButton
                  panel={panel}
                  filters={filters.startDate === fyFrom && filters.endDate === fyTo ? { ...filters, startDate: "", endDate: "" } : filters}
                />
              </div>
            </div>
          </ActionArea>

          <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
            <KpiTile label="Invoices" value={totals.count.toLocaleString("en-IN")} sub={`${byParty.length} customer${byParty.length === 1 ? "" : "s"}`} loading={loading && !rows.length} />
            <KpiTile label="Taxable value" value={formatINR0(totals.taxable)} sub="Before GST" loading={loading && !rows.length} />
            <KpiTile label="GST" value={formatINR0(gst)} sub={`CGST+SGST ${formatINR0(totals.cgst + totals.sgst)} · IGST ${formatINR0(totals.igst)}`} loading={loading && !rows.length} />
            <KpiTile label="Total sales" value={formatINR0(totals.total)} sub={totals.count ? `Avg ${formatINR0(totals.total / totals.count)} per invoice` : "—"} loading={loading && !rows.length} />
          </div>

          {tab === "invoices" && (
            <>
              <ListTable
                minWidth="min-w-[1100px]"
                colSpan={9}
                loading={loading}
                isEmpty={!filtered.length}
                emptyText={rows.length ? "No invoices match the search." : "No invoices in this period."}
                head={<>
                  <th className={`${thCls} text-left`}>Date</th>
                  <th className={`${thCls} text-left`}>Invoice No</th>
                  <th className={`${thCls} text-left`}>Customer</th>
                  <th className={`${thCls} text-left`}>GSTIN</th>
                  <th className={`${thCls} text-right`}>Taxable</th>
                  <th className={`${thCls} text-right`}>CGST</th>
                  <th className={`${thCls} text-right`}>SGST</th>
                  <th className={`${thCls} text-right`}>IGST</th>
                  <th className={`${thCls} text-right`}>Total</th>
                </>}
              >
                {invoicePaging.pageRows.map((r) => (
                  <tr key={r.id} className={rowCls}>
                    <td className="p-2 whitespace-nowrap">{formatDate(r.invoice_date)}</td>
                    <td className="p-2 whitespace-nowrap font-medium">
                      <Link to={`/view-invoice/details?id=${r.id}&back=true`} className="text-blue-700 dark:text-blue-400 hover:underline">{r.invoice_no || "--"}</Link>
                    </td>
                    <td className="p-2 max-w-56 truncate capitalize" title={r.party}>{r.party || "--"}</td>
                    <td className="p-2 whitespace-nowrap font-mono text-xs">{r.party_gst || <span className="font-sans text-slate-400">Unregistered</span>}</td>
                    <Num>{formatINR(r.taxable)}</Num>
                    <Num>{formatINR(r.cgst)}</Num>
                    <Num>{formatINR(r.sgst)}</Num>
                    <Num>{formatINR(r.igst)}</Num>
                    <Num strong>{formatINR(r.total)}</Num>
                  </tr>
                ))}
                {filtered.length > 0 && footRow(`Total · ${totals.count} invoices`, 4)}
              </ListTable>
              {filtered.length > PAGE_SIZE && <Pagination paging={invoicePaging} onPage={setPage} />}
            </>
          )}

          {tab === "party" && (
            <ListTable
              minWidth="min-w-[900px]"
              colSpan={9}
              loading={loading}
              isEmpty={!byParty.length}
              emptyText="No sales in this period."
              head={<>
                <th className={`${thCls} text-left`}>Customer</th>
                <th className={`${thCls} text-left`}>GSTIN</th>
                <th className={`${thCls} text-right`}>Invoices</th>
                <th className={`${thCls} text-right`}>Share</th>
                <th className={`${thCls} text-right`}>Taxable</th>
                <th className={`${thCls} text-right`}>CGST</th>
                <th className={`${thCls} text-right`}>SGST</th>
                <th className={`${thCls} text-right`}>IGST</th>
                <th className={`${thCls} text-right`}>Total</th>
              </>}
            >
              {byParty.map((g) => (
                <tr key={g.key} className={rowCls}>
                  <td className="p-2 max-w-64 truncate capitalize font-medium" title={g.party}>{g.party}</td>
                  <td className="p-2 whitespace-nowrap font-mono text-xs">{g.party_gst || <span className="font-sans text-slate-400">Unregistered</span>}</td>
                  <Num>{g.invoices}</Num>
                  <Num>{totals.total ? `${((g.total / totals.total) * 100).toFixed(1)}%` : "—"}</Num>
                  <Num>{formatINR(g.taxable)}</Num>
                  <Num>{formatINR(g.cgst)}</Num>
                  <Num>{formatINR(g.sgst)}</Num>
                  <Num>{formatINR(g.igst)}</Num>
                  <Num strong>{formatINR(g.total)}</Num>
                </tr>
              ))}
              {byParty.length > 0 && footRow(`Total · ${byParty.length} customers · ${totals.count} invoices`, 4)}
            </ListTable>
          )}

          {tab === "month" && (
            <ListTable
              minWidth="min-w-[800px]"
              colSpan={7}
              loading={loading}
              isEmpty={!byMonth.length}
              emptyText="No sales in this period."
              head={<>
                <th className={`${thCls} text-left`}>Month</th>
                <th className={`${thCls} text-right`}>Invoices</th>
                <th className={`${thCls} text-right`}>Taxable</th>
                <th className={`${thCls} text-right`}>CGST</th>
                <th className={`${thCls} text-right`}>SGST</th>
                <th className={`${thCls} text-right`}>IGST</th>
                <th className={`${thCls} text-right`}>Total</th>
              </>}
            >
              {byMonth.map((g) => (
                <tr key={g.key} className={rowCls}>
                  <td className="p-2 whitespace-nowrap font-medium">{g.month ? monthLabel(g.month) : "--"}</td>
                  <Num>{g.invoices}</Num>
                  <Num>{formatINR(g.taxable)}</Num>
                  <Num>{formatINR(g.cgst)}</Num>
                  <Num>{formatINR(g.sgst)}</Num>
                  <Num>{formatINR(g.igst)}</Num>
                  <Num strong>{formatINR(g.total)}</Num>
                </tr>
              ))}
              {byMonth.length > 0 && footRow(`Total · ${totals.count} invoices`, 2)}
            </ListTable>
          )}
        </div>

        <FilterSidebar
          panel={panel}
          filters={filters}
          onChange={onFilterChange}
          searchPlaceholder="Invoice no, customer, GSTIN..."
          resultCount={filtered.length}
        >
          <FilterSection title="Company" onClear={filters.company_id ? clear("company_id") : undefined}>
            <select name="company_id" aria-label="Company" value={filters.company_id} onChange={onFilterChange} className={inputCls}>
              <option value="">All companies</option>
              {(companyData || []).map((c) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
            </select>
          </FilterSection>
          <FilterSection title="Customer" onClear={filters.party_id ? clear("party_id") : undefined}>
            <select name="party_id" aria-label="Customer" value={filters.party_id} onChange={onFilterChange} className={inputCls}>
              <option value="">All customers</option>
              {(parties?.body || []).map((p) => <option key={p.id} value={p.id}>{p.company_name}</option>)}
            </select>
          </FilterSection>
        </FilterSidebar>
      </div>
    </>
  );
};

export default SalesReport;
