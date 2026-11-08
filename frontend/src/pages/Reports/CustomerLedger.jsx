import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from 'sonner';
import { AiOutlineDownload, AiOutlinePrinter, AiOutlineRollback, AiOutlineDiff, AiOutlineWallet } from "react-icons/ai";

import PageTitle from '../../components/PageTitle';
import ActionArea from '../../components/ActionArea';
import CustomButton from '../../components/CustomButton';
import CustomLoader from '../../components/CustomLoader';
import { KpiTile } from '../../components/ReportKit';
import { ListTable, thCls } from '../../components/ListKit';
import { inrToWords } from '../../utils/InWordConverter';
import { formatINR, openPrintWindow } from '../../utils/format';
import { formatDate } from '../../utils/periods';
import { downloadCsv } from '../../utils/csv';
import useReportStore from "../../store/ReportStore";

const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// "1,000.00 Dr" / "250.00 Cr" — the accounting way to show which side a balance is on.
const balanceText = (n) => `${formatINR(Math.abs(n))} ${n >= 0 ? "Dr" : "Cr"}`;

const CustomerLedger = () => {
    const [searchParams] = useSearchParams();
    const back = searchParams.get("back");
    const party_id = searchParams.get("id");
    const company_id = searchParams.get("company_id");
    const navigate = useNavigate();
    const getDebtorsDetails = useReportStore((s) => s.getDebtorsDetails);
    const [state, setState] = useState({ status: "loading", ledger: [], party: {}, totals: { total_dr: 0, total_cr: 0, balance: 0 } });

    useEffect(() => {
        let alive = true;
        getDebtorsDetails({ id: party_id, company_id })
            .then((result) => {
                if (!alive) return;
                if (result?.body) setState({ status: "ready", ...result.body });
                else setState((s) => ({ ...s, status: "error" }));
            })
            .catch(() => alive && setState((s) => ({ ...s, status: "error" })));
        return () => { alive = false; };
    }, [party_id, company_id]);

    const { ledger, party, totals } = state;

    // Running balance after each entry (debit raises what the customer owes).
    const rows = useMemo(() => {
        let running = 0;
        return (ledger || []).map((entry) => {
            running += (Number(entry.dr) || 0) - (Number(entry.cr) || 0);
            return { ...entry, balance: Math.round(running * 100) / 100 };
        });
    }, [ledger]);

    const linkFor = (entry) =>
        entry.entry_type === "receipt"
            ? `/view-money-receipt/details?id=${entry.id}&back=true`
            : `/view-invoice/details?id=${entry.id}&back=true`;

    const exportCsv = () => {
        downloadCsv(`ledger_${(party?.company_name || "customer").replace(/[^\w-]+/g, "_")}.csv`, [
            { label: "Date", value: (r) => r.date },
            { label: "Particulars", value: (r) => r.description },
            { label: "Debit", value: (r) => (Number(r.dr) || 0).toFixed(2) },
            { label: "Credit", value: (r) => (Number(r.cr) || 0).toFixed(2) },
            { label: "Balance", value: (r) => r.balance.toFixed(2) },
        ], rows);
        toast.success("CSV downloaded.");
    };

    const print = () => {
        const body = rows.map((r, i) => `
            <tr><td>${i + 1}</td><td>${escapeHtml(formatDate(r.date))}</td><td>${escapeHtml(r.description)}</td>
            <td class="n">${r.dr ? escapeHtml(formatINR(r.dr)) : ""}</td><td class="n">${r.cr ? escapeHtml(formatINR(r.cr)) : ""}</td>
            <td class="n">${escapeHtml(balanceText(r.balance))}</td></tr>`).join("");
        const html = `<!doctype html><html><head><meta charset="utf-8"><title>Ledger - ${escapeHtml(party?.company_name)}</title>
            <style>body{font:12px system-ui,Segoe UI,sans-serif;color:#0f172a;margin:24px}h1{font-size:16px;margin:0}
            p{margin:2px 0;color:#475569}table{width:100%;border-collapse:collapse;margin-top:12px}
            th,td{border:1px solid #cbd5e1;padding:5px 6px;text-align:left}th{background:#f1f5f9}.n{text-align:right;white-space:nowrap}
            tfoot td{font-weight:600;background:#f8fafc}</style></head><body>
            <h1>Customer ledger: ${escapeHtml(party?.company_name)}</h1>
            <p>${escapeHtml([party?.address_1, party?.city, party?.state].filter(Boolean).join(", "))}${party?.gst ? ` · GSTIN ${escapeHtml(party.gst)}` : ""}</p>
            <p>Printed ${escapeHtml(new Date().toLocaleString("en-IN"))}</p>
            <table><thead><tr><th>#</th><th>Date</th><th>Particulars</th><th class="n">Debit</th><th class="n">Credit</th><th class="n">Balance</th></tr></thead>
            <tbody>${body}</tbody>
            <tfoot><tr><td colspan="3">Total</td><td class="n">${escapeHtml(formatINR(totals.total_dr))}</td><td class="n">${escapeHtml(formatINR(totals.total_cr))}</td>
            <td class="n">${escapeHtml(balanceText(totals.balance))}</td></tr></tfoot></table>
            <p style="margin-top:8px">Balance in words: ${escapeHtml(inrToWords(Math.abs(totals.balance)))}</p>
            <script>window.onload = () => window.print();</script></body></html>`;
        if (!openPrintWindow(html)) toast.error("Pop-up blocked. Allow pop-ups to print.");
    };

    if (state.status === "loading") return <CustomLoader />;

    const balance = totals?.balance || 0;

    return (
        <>
            <PageTitle>Customer Ledger</PageTitle>
            <div className="flex flex-col gap-2">
                <ActionArea>
                    {back && (
                        <div onClick={() => navigate(-1)}>
                            <CustomButton title={"Back"} color={"slate"}><AiOutlineRollback /></CustomButton>
                        </div>
                    )}
                    <CustomButton title={"Export CSV"} color={"slate"} onClick={exportCsv} disabled={!rows.length}><AiOutlineDownload /></CustomButton>
                    <CustomButton title={"Print"} color={"slate"} onClick={print} disabled={!rows.length}><AiOutlinePrinter /></CustomButton>
                </ActionArea>

                <section className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm px-4 py-3">
                    <h2 className="text-base font-semibold capitalize text-slate-900 dark:text-white">{party?.company_name || "Unknown party"}</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {[party?.address_1, party?.city, party?.state].filter(Boolean).join(", ") || "No address"}
                        {party?.gst && <> · GSTIN <span className="font-mono">{party.gst}</span></>}
                        {party?.mobile && <> · {party.mobile}</>}
                    </p>
                </section>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <KpiTile label="Invoiced (debit)" icon={<AiOutlineDiff />} value={formatINR(totals.total_dr)} sub={`${rows.filter((r) => r.entry_type !== "receipt").length} invoices incl. GST`} />
                    <KpiTile label="Received (credit)" icon={<AiOutlineWallet />} value={formatINR(totals.total_cr)} sub={`${rows.filter((r) => r.entry_type === "receipt").length} receipts`} />
                    <KpiTile
                        label={balance > 0 ? "Balance due" : balance < 0 ? "Advance held" : "Balance"}
                        value={balanceText(balance)}
                        sub={balance ? inrToWords(Math.abs(balance)) : "Fully settled"}
                    />
                </div>

                <ListTable
                    minWidth="min-w-[760px]"
                    colSpan={6}
                    isEmpty={!rows.length}
                    emptyText={state.status === "error" ? "Could not load this ledger." : "No invoices or receipts for this party yet."}
                    head={<>
                        <th className={`${thCls} text-left w-12`}>#</th>
                        <th className={`${thCls} text-left`}>Date</th>
                        <th className={`${thCls} text-left`}>Particulars</th>
                        <th className={`${thCls} text-right`}>Debit</th>
                        <th className={`${thCls} text-right`}>Credit</th>
                        <th className={`${thCls} text-right`}>Balance</th>
                    </>}
                >
                    {rows.map((r, i) => (
                        <tr key={`${r.entry_type}-${r.id}`} className="border-b border-slate-100 dark:border-slate-700/70 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                            <td className="p-2 tabular-nums text-slate-400 dark:text-slate-500">{i + 1}</td>
                            <td className="p-2 whitespace-nowrap">{formatDate(r.date)}</td>
                            <td className="p-2">
                                <Link to={linkFor(r)} className="text-blue-700 dark:text-blue-400 hover:underline">{r.description}</Link>
                            </td>
                            <td className="p-2 text-right tabular-nums whitespace-nowrap">{r.dr ? formatINR(r.dr) : ""}</td>
                            <td className="p-2 text-right tabular-nums whitespace-nowrap">{r.cr ? formatINR(r.cr) : ""}</td>
                            <td className="p-2 text-right tabular-nums whitespace-nowrap font-medium text-slate-900 dark:text-white">{balanceText(r.balance)}</td>
                        </tr>
                    ))}
                    {rows.length > 0 && (
                        <tr className="border-t-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/40 font-semibold text-slate-900 dark:text-white">
                            <td className="p-2" colSpan={3}>Total</td>
                            <td className="p-2 text-right tabular-nums whitespace-nowrap">{formatINR(totals.total_dr)}</td>
                            <td className="p-2 text-right tabular-nums whitespace-nowrap">{formatINR(totals.total_cr)}</td>
                            <td className="p-2 text-right tabular-nums whitespace-nowrap">{balanceText(balance)}</td>
                        </tr>
                    )}
                </ListTable>
            </div>
        </>
    )
}

export default CustomerLedger
