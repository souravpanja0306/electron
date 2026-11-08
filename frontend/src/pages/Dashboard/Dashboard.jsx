import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AiOutlineDiff, AiOutlineFileText, AiOutlineWallet, AiOutlineRise, AiOutlineInbox,
  AiOutlineClockCircle, AiOutlineReload, AiOutlinePlus,
} from 'react-icons/ai';

import PageTitle from '../../components/PageTitle';
import { inputCls } from '../../components/FormKit';
import { ChartCard, KpiTile, Delta, TrendChart, AgingBar, RankedBars } from '../../components/ReportKit';
import useAuthStore from '../../store/AuthStore';
import useCompanyStore from '../../store/CompanyStore';
import useReportStore from '../../store/ReportStore';
import { formatINR0 } from '../../utils/format';
import { PERIODS, periodRange, formatRange, formatDate } from '../../utils/periods';

const RECENT_TYPES = {
  invoice: { label: "Invoice", icon: AiOutlineDiff, href: (id) => `/view-invoice/details?id=${id}&back=true` },
  receipt: { label: "Receipt", icon: AiOutlineWallet, href: (id) => `/view-money-receipt/details?id=${id}&back=true` },
  challan: { label: "Challan", icon: AiOutlineFileText, href: (id) => `/edit-challan/${id}?back=true` },
};

const Dashboard = () => {
  const { token } = useAuthStore();
  const { companyData, getAllCompany } = useCompanyStore();
  const { dashboardStats: stats, dashboardStatsLoading: loading, getDashboardStats } = useReportStore();
  const [periodId, setPeriodId] = useState("fy");
  const [companyId, setCompanyId] = useState("");

  const load = () => {
    const [from, to] = periodRange(periodId);
    return getDashboardStats({ company_id: companyId, from, to });
  };

  useEffect(() => { getAllCompany(token); }, []);
  useEffect(() => { load(); }, [periodId, companyId]);

  const kpi = stats?.kpi;
  const counts = stats?.documentCounts || {};
  const salesTotal = kpi?.sales.total || 0;
  const firstLoad = loading && !stats;

  return (
    <div className="flex flex-col gap-2">
      <PageTitle>Dashboard</PageTitle>

      {/* Filters + quick actions: one row above the charts */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm px-3 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1" role="group" aria-label="Period">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={periodId === p.id}
                onClick={() => setPeriodId(p.id)}
                className={`h-7 px-2.5 rounded-full border text-xs font-medium transition-colors ${periodId === p.id
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"}`}
              >
                {p.label}
              </button>
            ))}
          </div>
          {(companyData?.length || 0) > 1 && (
            <select value={companyId} onChange={(e) => setCompanyId(e.target.value)} aria-label="Company" className={`${inputCls} h-7 w-48 text-xs`}>
              <option value="">All companies</option>
              {companyData.map((c) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
            </select>
          )}
          <span className="text-[11px] text-slate-500 dark:text-slate-400">{stats?.period ? formatRange(stats.period.from, stats.period.to) : ""}</span>
          <button type="button" onClick={load} title="Refresh" aria-label="Refresh"
            className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-700 transition-colors">
            <AiOutlineReload className={loading ? "animate-spin" : ""} size={14} />
          </button>
        </div>
        <div className="flex flex-wrap gap-1">
          {[["Challan", "/create-challan"], ["Invoice", "/create-invoice"], ["Receipt", "/create-moeny-receipts"]].map(([label, to]) => (
            <Link key={to} to={to}
              className="h-7 px-2.5 inline-flex items-center gap-1 rounded border border-slate-300 dark:border-slate-600 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <AiOutlinePlus /> {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Headline numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
        <KpiTile
          label="Sales"
          icon={<AiOutlineRise />}
          loading={firstLoad}
          value={formatINR0(salesTotal)}
          sub={kpi ? `${kpi.sales.count} invoice${kpi.sales.count === 1 ? "" : "s"} · GST ${formatINR0(kpi.sales.tax)}` : ""}
          footer={kpi && <Delta current={kpi.sales.total} previous={kpi.sales.previous} />}
        />
        <KpiTile
          label="Collections"
          icon={<AiOutlineWallet />}
          loading={firstLoad}
          value={formatINR0(kpi?.collections.total)}
          sub={kpi ? `${kpi.collections.count} receipt${kpi.collections.count === 1 ? "" : "s"}${salesTotal ? ` · ${Math.round((kpi.collections.total / salesTotal) * 100)}% of sales` : ""}` : ""}
          footer={kpi && <Delta current={kpi.collections.total} previous={kpi.collections.previous} />}
        />
        <KpiTile
          label="Outstanding (today)"
          icon={<AiOutlineClockCircle />}
          loading={firstLoad}
          value={formatINR0(kpi?.outstanding.total)}
          sub={kpi ? `${kpi.outstanding.parties} part${kpi.outstanding.parties === 1 ? "y" : "ies"} with dues${kpi.outstanding.advances ? ` · ${formatINR0(kpi.outstanding.advances)} advance` : ""}` : ""}
          footer={kpi && (kpi.outstanding.overdue90 > 0
            ? <span className="text-[11px] font-medium" style={{ color: "var(--delta-down)" }}>{formatINR0(kpi.outstanding.overdue90)} over 90 days</span>
            : <span className="text-[11px] text-slate-500 dark:text-slate-400">Nothing over 90 days</span>)}
          href="/debtors"
          linkLabel="Debtors"
        />
        <KpiTile
          label="Unbilled challans"
          icon={<AiOutlineInbox />}
          loading={firstLoad}
          value={kpi ? `${kpi.unbilled.count}` : "0"}
          sub={kpi ? `Worth ${formatINR0(kpi.unbilled.total)} before GST` : ""}
          footer={<span className="text-[11px] text-slate-500 dark:text-slate-400">Challans without an invoice</span>}
          href="/view-challan"
          linkLabel="Review"
        />
      </div>

      {/* Trend + aging */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-2 items-stretch">
        <div className="xl:col-span-2 min-w-0"><TrendChart monthly={stats?.monthly} loading={firstLoad} /></div>
        <AgingBar buckets={stats?.aging} loading={firstLoad} />
      </div>

      {/* Customers + activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 items-start">
        <ChartCard title="Top customers" description="By invoiced value in the selected period.">
          <RankedBars
            total={salesTotal}
            emptyText="No invoices in this period."
            items={(stats?.topCustomers || []).map((c) => ({
              key: c.party_id,
              label: c.name,
              value: c.total,
              sub: `${c.invoices} invoice${c.invoices === 1 ? "" : "s"}`,
            }))}
          />
        </ChartCard>

        <ChartCard
          title="Recent activity"
          description={`${counts.challans || 0} challans · ${counts.invoices || 0} invoices · ${counts.moneyReceipts || 0} receipts in this period`}
        >
          {(stats?.recent || []).length ? (
            <ul className="divide-y divide-slate-100 dark:divide-slate-700/70">
              {stats.recent.map((r) => {
                const type = RECENT_TYPES[r.type];
                const Icon = type.icon;
                return (
                  <li key={`${r.type}-${r.id}`}>
                    <Link to={type.href(r.id)} className="flex items-center gap-3 py-2 -mx-2 px-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                      <span className="h-8 w-8 shrink-0 rounded-md bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300"><Icon /></span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-xs font-medium text-slate-800 dark:text-slate-100 truncate">
                          {type.label} {r.number || "--"}
                        </span>
                        <span className="block text-[11px] text-slate-500 dark:text-slate-400 truncate">{r.party || "--"} · {formatDate(r.date)}</span>
                      </span>
                      <span className="text-xs font-semibold tabular-nums text-slate-900 dark:text-white">{formatINR0(r.amount)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">{firstLoad ? "Loading..." : "No documents yet."}</p>
          )}
        </ChartCard>
      </div>
    </div>
  );
};

export default Dashboard;
