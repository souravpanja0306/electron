import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner';
import {
    AiOutlineDownload, AiOutlineDelete, AiOutlineUpload, AiOutlineWarning,
    AiOutlineCheckCircle, AiOutlineClockCircle, AiOutlineReload,
} from 'react-icons/ai';

// Components...
import PageTitle from '../../components/PageTitle';
import CustomButton from '../../components/CustomButton';
import Modal from '../../components/CustomModal';
import { inputCls } from '../../components/FormKit';
import { SettingsPanel, SettingsSection } from '../../components/SettingsKit';

// Stores...
import useSettingStore from '../../store/SettingStore';

const COUNTS = [
    ["invoice", "Invoices"],
    ["challan", "Challans"],
    ["money_receipts", "Money receipts"],
    ["party", "Parties"],
    ["company", "Companies"],
    ["cha", "CHAs"],
    ["gst", "GST rates"],
    ["hsn_sac", "HSN / SAC codes"],
];

const SCOPES = [
    {
        id: "transactions",
        label: "Documents only",
        description: "Deletes invoices, challans and money receipts. Masters and numbering settings stay.",
        tables: ["invoice", "challan", "money_receipts"],
    },
    {
        id: "all",
        label: "Everything",
        description: "Deletes all documents, parties, companies, CHAs, GST/HSN codes and numbering settings.",
        tables: ["invoice", "challan", "money_receipts", "party", "company", "cha", "gst", "hsn_sac", "vendor", "invoice_setting", "challan_setting"],
    },
];

const STALE_DAYS = 7;

const timeAgo = (iso) => {
    if (!iso) return null;
    const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const units = [["day", 86400], ["hour", 3600], ["minute", 60]];
    for (const [unit, size] of units) {
        const n = Math.floor(seconds / size);
        if (n >= 1) return `${n} ${unit}${n === 1 ? "" : "s"} ago`;
    }
    return "just now";
};

const formatSize = (bytes) => (bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

const DatabaseSettings = () => {
    const { dumpDatabase, restoreDatabase, resetData, getDataSummary, lastBackupAt, loadLastBackup } = useSettingStore();
    const [summary, setSummary] = useState(null);
    const [backingUp, setBackingUp] = useState(false);
    const [restoreFile, setRestoreFile] = useState(null);
    const [restoring, setRestoring] = useState(false);
    const [restarting, setRestarting] = useState(false);
    const [scope, setScope] = useState("transactions");
    const [resetOpen, setResetOpen] = useState(false);
    const [confirmText, setConfirmText] = useState("");
    const [resetting, setResetting] = useState(false);
    const fileRef = useRef(null);

    const refreshSummary = async () => setSummary(await getDataSummary());

    useEffect(() => {
        loadLastBackup();
        refreshSummary();
    }, []);

    const backupAgeDays = lastBackupAt ? (Date.now() - new Date(lastBackupAt).getTime()) / 86400000 : Infinity;
    const backupHealthy = backupAgeDays <= STALE_DAYS;

    const handleBackup = async () => {
        if (backingUp) return;
        setBackingUp(true);
        const result = await dumpDatabase();
        setBackingUp(false);
        if (result.status === 200) toast.success(`Backup saved as ${result.fileName}.`);
        else toast.error(result.message);
    };

    const pickRestoreFile = (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        if (!/\.(db|sqlite3?|bak)$/i.test(file.name)) return toast.error("Choose a MyERP backup file (.db).");
        setRestoreFile(file);
    };

    const handleRestore = async () => {
        if (!restoreFile || restoring) return;
        setRestoring(true);
        const result = await restoreDatabase(restoreFile);
        setRestoring(false);
        if (result?.status === 200) {
            setRestoreFile(null);
            setRestarting(true);
            toast.success(result.message);
        } else {
            toast.error(result?.message || "Could not restore the backup.");
        }
    };

    const scopeInfo = SCOPES.find((s) => s.id === scope);
    const affected = summary ? scopeInfo.tables.reduce((sum, t) => sum + (summary[t] || 0), 0) : null;

    const closeReset = () => {
        if (resetting) return;
        setResetOpen(false);
        setConfirmText("");
    };

    const handleReset = async () => {
        if (confirmText !== "DELETE" || resetting) return;
        setResetting(true);
        const result = await resetData({ scope, confirm: confirmText });
        setResetting(false);
        if (result?.status === 200) {
            toast.success(result.message);
            setResetOpen(false);
            setConfirmText("");
            refreshSummary();
        } else {
            toast.error(result?.message || "Could not reset the data.");
        }
    };

    return (
        <div className='flex flex-col gap-1'>
            <PageTitle>Database</PageTitle>

            <SettingsPanel>
                <SettingsSection
                    title="Overview"
                    description="Records stored on this computer."
                    badge={
                        <button type="button" onClick={refreshSummary} title="Refresh counts" aria-label="Refresh counts"
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <AiOutlineReload size={12} />
                        </button>
                    }
                >
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {COUNTS.map(([key, label]) => (
                            <div key={key} className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 px-3 py-2">
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
                                <p className="text-lg font-bold tabular-nums text-slate-900 dark:text-white">{summary ? (summary[key] ?? 0).toLocaleString("en-IN") : "–"}</p>
                            </div>
                        ))}
                    </div>
                </SettingsSection>

                <SettingsSection
                    title="Backup"
                    description="Downloads a complete copy of your data as one .db file. Keep it on a pen drive or cloud storage."
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-md border border-slate-200 dark:border-slate-700 px-4 py-3">
                        <div className="flex items-start gap-3">
                            {backupHealthy
                                ? <AiOutlineCheckCircle className="mt-0.5 text-xl text-emerald-600 dark:text-emerald-400 shrink-0" />
                                : <AiOutlineClockCircle className="mt-0.5 text-xl text-amber-500 shrink-0" />}
                            <div>
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                                    {lastBackupAt ? `Last backup ${timeAgo(lastBackupAt)}` : "No backup taken from this computer yet"}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {backupHealthy ? "You're covered." : `We recommend a backup at least every ${STALE_DAYS} days.`}
                                </p>
                            </div>
                        </div>
                        <CustomButton title={backingUp ? "Preparing..." : "Back up now"} color="blue" onClick={handleBackup} disabled={backingUp}>
                            <AiOutlineDownload />
                        </CustomButton>
                    </div>
                </SettingsSection>

                <SettingsSection
                    title="Restore"
                    description="Replace the data on this computer with a backup file. The file is checked before anything changes, and a copy of your current data is kept."
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-md border border-dashed border-slate-300 dark:border-slate-600 px-4 py-3">
                        <p className="text-xs text-slate-500 dark:text-slate-400">MyERP restarts after a restore. You may need to sign in again.</p>
                        <CustomButton title="Choose backup..." color="slate" onClick={() => fileRef.current?.click()} disabled={restarting}>
                            <AiOutlineUpload />
                        </CustomButton>
                        <input ref={fileRef} type="file" accept=".db,.sqlite,.sqlite3,.bak" className="sr-only" onChange={pickRestoreFile} tabIndex={-1} />
                    </div>
                </SettingsSection>

                <SettingsSection
                    title="Danger zone"
                    description="Permanently delete data. Your login and preferences are always kept. Take a backup first."
                    badge={<span className="rounded-full bg-red-50 dark:bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-700 dark:text-red-300 ring-1 ring-inset ring-red-600/20">Irreversible</span>}
                >
                    <div className="flex flex-col gap-3 rounded-md border border-red-200 dark:border-red-500/30 bg-red-50/50 dark:bg-red-500/5 p-4">
                        <div role="radiogroup" aria-label="What to delete" className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {SCOPES.map((option) => {
                                const active = scope === option.id;
                                const count = summary ? option.tables.reduce((sum, t) => sum + (summary[t] || 0), 0) : null;
                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        role="radio"
                                        aria-checked={active}
                                        onClick={() => setScope(option.id)}
                                        className={`text-left rounded-md border px-3 py-2 transition-colors ${active
                                            ? "border-red-500 bg-white dark:bg-slate-800 ring-1 ring-red-500"
                                            : "border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-600"}`}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{option.label}</span>
                                            {count !== null && <span className="text-[11px] tabular-nums text-slate-500 dark:text-slate-400">{count.toLocaleString("en-IN")} records</span>}
                                        </div>
                                        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">{option.description}</p>
                                    </button>
                                );
                            })}
                        </div>
                        <div className="flex justify-end">
                            <CustomButton title="Delete data..." color="red" onClick={() => setResetOpen(true)}>
                                <AiOutlineDelete />
                            </CustomButton>
                        </div>
                    </div>
                </SettingsSection>
            </SettingsPanel>

            {/* Restore confirmation */}
            <Modal isOpen={Boolean(restoreFile)} onClose={() => !restoring && setRestoreFile(null)} title="Restore from backup?">
                <div className="flex flex-col gap-3 text-sm">
                    <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 px-3 py-2">
                        <p className="font-medium text-slate-800 dark:text-slate-100 truncate">{restoreFile?.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {restoreFile && `${formatSize(restoreFile.size)} · modified ${new Date(restoreFile.lastModified).toLocaleString("en-IN")}`}
                        </p>
                    </div>
                    <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                        <li>All current data on this computer is replaced by the backup.</li>
                        <li>A copy of the current data is kept next to the database file.</li>
                        <li>MyERP restarts to finish. Unsaved work in other screens is lost.</li>
                    </ul>
                    <div className="flex justify-end gap-2 pt-1">
                        <CustomButton title="Cancel" color="slate" onClick={() => setRestoreFile(null)} disabled={restoring} />
                        <CustomButton title={restoring ? "Checking backup..." : "Restore & restart"} color="blue" onClick={handleRestore} disabled={restoring}>
                            <AiOutlineUpload />
                        </CustomButton>
                    </div>
                </div>
            </Modal>

            {/* Reset confirmation */}
            <Modal isOpen={resetOpen} onClose={closeReset} title={`Delete ${scopeInfo.label.toLowerCase()}?`}>
                <div className="flex flex-col gap-3 text-sm">
                    <div className="flex items-start gap-2 rounded-md border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-3 py-2 text-xs text-red-700 dark:text-red-300">
                        <AiOutlineWarning className="mt-0.5 text-base shrink-0" />
                        <span>
                            {affected !== null ? <><strong>{affected.toLocaleString("en-IN")} records</strong> will be deleted. </> : null}
                            {scopeInfo.description} This cannot be undone.
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 rounded-md border border-slate-200 dark:border-slate-700 px-3 py-2">
                        <span className="text-xs text-slate-600 dark:text-slate-300">
                            {lastBackupAt ? `Last backup ${timeAgo(lastBackupAt)}.` : "You have no backup yet."}
                        </span>
                        <CustomButton title={backingUp ? "Preparing..." : "Back up first"} color="slate" onClick={handleBackup} disabled={backingUp}>
                            <AiOutlineDownload />
                        </CustomButton>
                    </div>
                    <label className="flex flex-col gap-1">
                        <span className="text-xs text-slate-600 dark:text-slate-300">Type <strong className="font-mono">DELETE</strong> to confirm</span>
                        <input
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                            onKeyDown={(e) => e.key === "Enter" && handleReset()}
                            className={`${inputCls} font-mono tracking-widest`}
                            autoFocus
                            aria-label="Type DELETE to confirm"
                        />
                    </label>
                    <div className="flex justify-end gap-2 pt-1">
                        <CustomButton title="Cancel" color="slate" onClick={closeReset} disabled={resetting} />
                        <CustomButton title={resetting ? "Deleting..." : "Delete permanently"} color="red" onClick={handleReset} disabled={confirmText !== "DELETE" || resetting}>
                            <AiOutlineDelete />
                        </CustomButton>
                    </div>
                </div>
            </Modal>

            {/* Restart overlay after a successful restore */}
            {restarting && (
                <div className="fixed inset-0 z-[1100] flex flex-col items-center justify-center gap-3 bg-slate-950/70 backdrop-blur-sm text-white">
                    <div className="h-8 w-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    <p className="text-sm font-medium">Restoring backup and restarting MyERP…</p>
                </div>
            )}
        </div>
    )
}

export default DatabaseSettings
