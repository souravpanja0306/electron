import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  AiOutlineEdit, AiOutlineLock, AiOutlineMail, AiOutlinePhone, AiOutlineEnvironment,
  AiOutlineSafetyCertificate, AiOutlineBank, AiOutlineCopy, AiOutlineCrown, AiOutlineCalendar,
} from "react-icons/ai";

// Components...
import PageTitle from "../../components/PageTitle";
import ActionArea from '../../components/ActionArea';
import CustomButton from '../../components/CustomButton';
import CustomLoader from "../../components/CustomLoader";
import useAuthStore from "../../store/AuthStore";

const initials = (name = "") =>
  name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("") || "U";

const fmtDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

// Fields that make documents complete (printed on invoices/challans).
const COMPLETENESS = [
  ["name", "Name"], ["mobile", "Mobile"], ["email", "Email"],
  ["address_1", "Address"], ["city", "City"], ["state", "State"], ["pincode", "Pincode"],
  ["gst", "GSTIN"], ["pan", "PAN"],
  ["bank", "Bank"], ["account_no", "Account number"], ["ifse", "IFSC"],
];

const copy = async (label, value) => {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied.`);
  } catch {
    toast.error("Could not copy.");
  }
};

const Card = ({ title, icon, action, children }) => (
  <section className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
    <header className="flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
        <span className="text-base text-slate-400 dark:text-slate-500">{icon}</span>{title}
      </h2>
      {action}
    </header>
    <div className="p-4">{children}</div>
  </section>
);

/** Label / value pair; empty values read "Not set". Optional copy button. */
const Item = ({ label, value, copyable, mono, span }) => (
  <div className={`min-w-0 ${span ? "sm:col-span-2" : ""}`}>
    <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</dt>
    <dd className="mt-0.5 flex items-center gap-1.5 min-w-0">
      {value
        ? <span className={`truncate text-sm text-slate-800 dark:text-slate-100 ${mono ? "font-mono tracking-wide" : ""}`} title={String(value)}>{value}</span>
        : <span className="text-sm text-slate-400 dark:text-slate-500">Not set</span>}
      {value && copyable && (
        <button type="button" onClick={() => copy(label, value)} title={`Copy ${label}`} aria-label={`Copy ${label}`}
          className="shrink-0 p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-700 transition-colors">
          <AiOutlineCopy size={12} />
        </button>
      )}
    </dd>
  </div>
);

const PLAN_TONES = {
  FREE: "bg-slate-100 text-slate-700 ring-slate-500/20 dark:bg-slate-700/60 dark:text-slate-200",
  PRO: "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/15 dark:text-blue-300",
  ENTERPRISE: "bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-500/15 dark:text-amber-300",
};

const LicenseCard = () => {
  const getLicense = useAuthStore((s) => s.getLicense);
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    let alive = true;
    getLicense().then((result) => {
      if (!alive) return;
      setState(result?.status === 200 ? { status: "ready", license: result.body } : { status: "error", message: result?.message });
    });
    return () => { alive = false; };
  }, []);

  if (state.status === "loading") {
    return <div className="space-y-2 animate-pulse"><div className="h-6 w-24 rounded bg-slate-100 dark:bg-slate-700" /><div className="h-2 rounded bg-slate-100 dark:bg-slate-700" /></div>;
  }
  if (state.status === "error") {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{state.message || "Licence details are unavailable."}</p>;
  }

  const { plan, is_active, start_date, expiry_date, days_left, license_key } = state.license;
  const total = Math.max(1, Math.round((new Date(expiry_date) - new Date(start_date)) / 86400000));
  const used = Math.min(100, Math.max(0, ((total - Math.max(0, days_left)) / total) * 100));
  const expired = !is_active || days_left <= 0;
  const soon = !expired && days_left <= 30;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${PLAN_TONES[plan] || PLAN_TONES.FREE}`}>
          <AiOutlineCrown /> {plan}
        </span>
        <span className={`text-xs font-semibold ${expired ? "text-red-600 dark:text-red-400" : soon ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
          {expired ? "Expired" : `${days_left} day${days_left === 1 ? "" : "s"} left`}
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden" role="progressbar" aria-valuenow={Math.round(used)} aria-valuemin={0} aria-valuemax={100} aria-label="Licence period used">
        <div className={`h-full rounded-full ${expired ? "bg-red-500" : soon ? "bg-amber-500" : "bg-blue-600"}`} style={{ width: `${used}%` }} />
      </div>
      <dl className="grid grid-cols-2 gap-3">
        <Item label="Valid from" value={fmtDate(start_date)} />
        <Item label="Valid until" value={fmtDate(expiry_date)} />
        <Item label="Licence key" value={license_key} mono span />
      </dl>
    </div>
  );
};

const Profile = () => {
  const { profileData, getProfileData } = useAuthStore();

  useEffect(() => {
    getProfileData();
  }, []);

  if (!profileData) return <CustomLoader />;

  const p = profileData;
  const missing = COMPLETENESS.filter(([key]) => !String(p[key] || "").trim());
  const percent = Math.round(((COMPLETENESS.length - missing.length) / COMPLETENESS.length) * 100);
  const address = [p.address_1, p.address_2].filter(Boolean).join(", ");
  const place = [p.city, p.district, p.state, p.pincode].filter(Boolean).join(", ");

  return (
    <>
      <PageTitle>Profile</PageTitle>
      <div className='flex flex-col gap-2'>
        <ActionArea>
          <Link to="/edit-profile">
            <CustomButton title={"Edit profile"} color={"blue"}><AiOutlineEdit /></CustomButton>
          </Link>
          <Link to="/change-password">
            <CustomButton title={"Change password"} color={"slate"}><AiOutlineLock /></CustomButton>
          </Link>
        </ActionArea>

        {/* Identity */}
        <section className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
          <div className="h-16 bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-700 dark:to-blue-600" />
          <div className="px-5 pb-5 -mt-8 flex flex-col md:flex-row md:items-end gap-4">
            <div className="h-20 w-20 shrink-0 rounded-full bg-white dark:bg-slate-800 p-1 shadow-md">
              <div className="h-full w-full rounded-full bg-blue-600 text-white text-2xl font-bold flex items-center justify-center">
                {initials(p.name)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold capitalize truncate text-slate-900 dark:text-white">{p.name || "Your name"}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">@{p.username}</p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                {p.email && <span className="inline-flex items-center gap-1"><AiOutlineMail className="text-slate-400" />{p.email}</span>}
                {p.mobile && <span className="inline-flex items-center gap-1"><AiOutlinePhone className="text-slate-400" />{p.mobile}</span>}
                {p.created_at && <span className="inline-flex items-center gap-1"><AiOutlineCalendar className="text-slate-400" />Member since {fmtDate(p.created_at)}</span>}
              </div>
            </div>

            <div className="md:w-64 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 px-3 py-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600 dark:text-slate-300">Profile completeness</span>
                <span className="font-semibold tabular-nums text-slate-900 dark:text-white">{percent}%</span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div className={`h-full rounded-full ${percent === 100 ? "bg-emerald-500" : "bg-blue-600"}`} style={{ width: `${percent}%` }} />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 truncate" title={missing.map(([, l]) => l).join(", ")}>
                {missing.length
                  ? <>Missing: {missing.slice(0, 3).map(([, l]) => l).join(", ")}{missing.length > 3 ? ` +${missing.length - 3}` : ""} · <Link to="/edit-profile" className="font-medium text-blue-700 dark:text-blue-400 hover:underline">Complete</Link></>
                  : "Everything needed for documents is filled in."}
              </p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 items-start">
          <Card title="Contact & address" icon={<AiOutlineEnvironment />}>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Item label="Email" value={p.email} copyable />
              <Item label="Mobile" value={p.mobile} copyable />
              <Item label="Address" value={address} span />
              <Item label="City / District / State" value={place} span />
              <Item label="Country" value={p.country || "INDIA"} />
            </dl>
          </Card>

          <Card title="Licence" icon={<AiOutlineCrown />}>
            <LicenseCard />
          </Card>

          <Card title="Tax & registration" icon={<AiOutlineSafetyCertificate />}>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Item label="GSTIN" value={p.gst} copyable mono span />
              <Item label="PAN" value={p.pan} copyable mono />
              <Item label="Trade licence" value={p.trade_licence} />
            </dl>
          </Card>

          <Card title="Bank details" icon={<AiOutlineBank />}>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Item label="Bank" value={p.bank} />
              <Item label="Branch" value={p.branch} />
              <Item label="Account number" value={p.account_no} copyable mono />
              <Item label="IFSC" value={p.ifse} copyable mono />
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Profile;
