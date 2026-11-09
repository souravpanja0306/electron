import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    AiOutlineLock,
    AiOutlineDisconnect,
    AiOutlinePauseCircle,
    AiOutlineClockCircle,
    AiOutlineReload,
    AiOutlineLogout,
    AiOutlineWarning,
    AiOutlineClose,
    AiOutlineLoading3Quarters,
} from "react-icons/ai";

import useAccessStore from "../store/AccessStore";
import { formatDate } from "../utils/format";

const POLL_MS = 5 * 60 * 1000;      // normal re-check
const LOCKED_POLL_MS = 60 * 1000;   // while locked, so an unlock shows up by itself

const LOCK_LOOK = {
    ACCOUNT_LOCKED: { icon: <AiOutlineLock size={26} />, tile: "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300" },
    ACCOUNT_NOT_FOUND: { icon: <AiOutlineLock size={26} />, tile: "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300" },
    SUBSCRIPTION_SUSPENDED: { icon: <AiOutlinePauseCircle size={26} />, tile: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300" },
    SUBSCRIPTION_EXPIRED: { icon: <AiOutlineClockCircle size={26} />, tile: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300" },
    NO_SUBSCRIPTION: { icon: <AiOutlineClockCircle size={26} />, tile: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300" },
    OFFLINE_TOO_LONG: { icon: <AiOutlineDisconnect size={26} />, tile: "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300" },
};

const ymd = (iso) => (iso ? String(iso).slice(0, 10) : "");
const checkedText = (iso) => {
    if (!iso) return "Never";
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? "--" : d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const Detail = ({ label, value }) => (
    <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</span>
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{value || "--"}</span>
    </div>
);

/**
 * Full-screen lock shown when the account is locked or the subscription has lapsed.
 * Keeps the title bar usable (minimise / close). Also owns the periodic status check.
 */
export const AccessGate = () => {
    const navigate = useNavigate();
    const { access, checking, fetchAccess, setAccess } = useAccessStore();
    const [message, setMessage] = useState("");
    const lastFetch = useRef(0);

    const isLocked = Boolean(access?.locked);

    const load = (opts) => {
        lastFetch.current = Date.now();
        return fetchAccess(opts);
    };

    useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const timer = setInterval(() => load({ refresh: isLocked }), isLocked ? LOCKED_POLL_MS : POLL_MS);
        // Coming back to the window after a while re-checks too.
        const onFocus = () => { if (Date.now() - lastFetch.current > 60 * 1000) load(); };
        window.addEventListener("focus", onFocus);
        return () => {
            clearInterval(timer);
            window.removeEventListener("focus", onFocus);
        };
    }, [isLocked]); // eslint-disable-line react-hooks/exhaustive-deps

    const checkAgain = async () => {
        setMessage("");
        const next = await load({ refresh: true });
        if (next && !next.locked) return;
        setMessage(next?.offline ? "Still can't reach the licence server. Check your internet connection." : "Still locked. Contact your MyERP provider.");
    };

    const signOut = () => {
        setAccess(null);
        window.api?.clearAll();
        navigate("/signin");
    };

    if (!isLocked) return null;

    const look = LOCK_LOOK[access.code] || LOCK_LOOK.ACCOUNT_LOCKED;

    return (
        <div className="fixed inset-x-0 bottom-0 top-10 z-[1200] flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4" role="alertdialog" aria-modal="true" aria-labelledby="access-title">
            <div className="w-full max-w-md rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-950/10 overflow-hidden">
                <div className="flex flex-col items-center text-center gap-2 px-6 pt-6 pb-4">
                    <span className={`w-14 h-14 rounded-full flex items-center justify-center ${look.tile}`}>{look.icon}</span>
                    <h1 id="access-title" className="text-lg font-bold text-slate-900 dark:text-white">{access.title}</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{access.message}</p>
                    {access.reason && (
                        <div className="w-full mt-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 px-3 py-2 text-left">
                            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Reason</span>
                            <span className="text-xs text-slate-700 dark:text-slate-200">{access.reason}</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-3 px-6 py-3 border-y border-slate-100 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/30">
                    <Detail label="Plan" value={access.plan} />
                    <Detail label="Valid till" value={access.expiry_date ? formatDate(ymd(access.expiry_date)) : ""} />
                    <Detail label="Last checked" value={checkedText(access.checked_at)} />
                </div>

                <div className="px-6 py-4 flex flex-col gap-3">
                    <p className="text-[11px] text-center text-slate-500 dark:text-slate-400">
                        Your data is safe on this computer. Contact your MyERP provider to renew or unlock, then press Check again.
                    </p>
                    {message && <p className="text-xs text-center font-medium text-red-600 dark:text-red-400">{message}</p>}
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={checkAgain}
                            disabled={checking}
                            className="flex-1 h-9 rounded-md flex items-center justify-center gap-2 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-600/30 disabled:opacity-60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        >
                            {checking ? <AiOutlineLoading3Quarters className="animate-spin" /> : <AiOutlineReload />}
                            Check again
                        </button>
                        <button
                            type="button"
                            onClick={signOut}
                            className="h-9 px-4 rounded-md flex items-center justify-center gap-2 text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        >
                            <AiOutlineLogout />
                            Sign out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/** Slim warning above the page: subscription ending, in grace days, or offline for too long. */
export const AccessBanner = () => {
    const access = useAccessStore((s) => s.access);
    const [dismissed, setDismissed] = useState("");
    if (!access || access.locked) return null;

    let tone = "";
    let text = "";
    if (access.state === "grace") {
        tone = "red";
        text = access.message;
    } else if (access.state === "expiring") {
        tone = "amber";
        text = access.message;
    } else if (access.offline && access.offline_days_left !== null && access.offline_days_left <= 2) {
        tone = "amber";
        text = `Can't reach the licence server. Connect to the internet within ${access.offline_days_left} day${access.offline_days_left === 1 ? "" : "s"} to keep using MyERP.`;
    }
    const key = `${access.state}|${text}`;
    if (!text || dismissed === key) return null;

    const tones = {
        red: "bg-red-50 text-red-800 border-red-200 dark:bg-red-500/10 dark:text-red-200 dark:border-red-500/30",
        amber: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/30",
    };

    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 border-b text-xs font-medium ${tones[tone]}`} role="status">
            <AiOutlineWarning size={14} className="shrink-0" />
            <span className="flex-1 min-w-0">{text}</span>
            <button type="button" onClick={() => setDismissed(key)} title="Hide" className="p-1 rounded opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10">
                <AiOutlineClose size={12} />
            </button>
        </div>
    );
};

export default AccessGate;
