import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  AiOutlineEye, AiOutlineEyeInvisible, AiOutlineLock, AiOutlineCheckCircle,
  AiOutlineCloseCircle, AiOutlineRollback, AiOutlineSave, AiOutlineWarning,
} from "react-icons/ai";

import PageTitle from "../../components/PageTitle";
import ActionArea from "../../components/ActionArea";
import CustomButton from "../../components/CustomButton";
import { FormSection, StackedField, inputCls, errorCls, focusNextOnEnter } from "../../components/FormKit";
import useAuthStore from "../../store/AuthStore";
import useShortcuts from "../../hooks/useShortcuts";

const RULES = [
  ["At least 8 characters", (p) => p.length >= 8],
  ["An uppercase and a lowercase letter", (p) => /[A-Z]/.test(p) && /[a-z]/.test(p)],
  ["A number", (p) => /\d/.test(p)],
  ["A symbol (e.g. ! @ # $)", (p) => /[^A-Za-z0-9]/.test(p)],
];

const STRENGTH = [
  { label: "Too weak", bar: "bg-red-500", text: "text-red-600 dark:text-red-400" },
  { label: "Weak", bar: "bg-orange-500", text: "text-orange-600 dark:text-orange-400" },
  { label: "Fair", bar: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
  { label: "Good", bar: "bg-blue-600", text: "text-blue-700 dark:text-blue-400" },
  { label: "Strong", bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
];

const scoreOf = (password) => {
  if (!password) return -1;
  let score = RULES.filter(([, test]) => test(password)).length;
  if (password.length >= 12 && score >= 3) score = 4;
  if (password.length < 8) score = Math.min(score, 1);
  return Math.min(score, 4);
};

/** Password input with a show/hide toggle and a Caps Lock hint. */
const PasswordInput = ({ id, value, onChange, error, autoFocus, autoComplete, placeholder }) => {
  const [visible, setVisible] = useState(false);
  const [caps, setCaps] = useState(false);
  const checkCaps = (e) => setCaps(Boolean(e.getModifierState?.("CapsLock")));
  return (
    <div className="flex flex-col gap-1">
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          onKeyUp={checkCaps}
          onKeyDown={checkCaps}
          onBlur={() => setCaps(false)}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          placeholder={placeholder}
          spellCheck={false}
          aria-invalid={error ? true : undefined}
          className={`${inputCls} pr-9 ${error ? errorCls : ""}`}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          title={visible ? "Hide password" : "Show password"}
          className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        >
          {visible ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
        </button>
      </div>
      {caps && (
        <p className="flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
          <AiOutlineWarning /> Caps Lock is on
        </p>
      )}
    </div>
  );
};

const ChangePassword = () => {
  const navigate = useNavigate();
  const changePassword = useAuthStore((s) => s.changePassword);
  const [values, setValues] = useState({ current: "", next: "", confirm: "" });
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (name) => (e) => setValues((prev) => ({ ...prev, [name]: e.target.value }));
  const score = scoreOf(values.next);
  const strength = STRENGTH[Math.max(0, score)];
  const rulesMet = RULES.every(([, test]) => test(values.next));

  const errors = {
    current: !values.current ? "Enter your current password." : "",
    next: !values.next ? "Enter a new password."
      : !rulesMet ? "The new password doesn't meet all the requirements."
        : values.next === values.current ? "Use a password you haven't used here." : "",
    confirm: !values.confirm ? "Re-enter the new password."
      : values.confirm !== values.next ? "Passwords don't match." : "",
  };
  const shown = (key) => (submitted || (key === "confirm" && values.confirm)) ? errors[key] : "";

  const submit = async (e) => {
    e?.preventDefault?.();
    if (saving) return;
    setSubmitted(true);
    const first = ["current", "next", "confirm"].find((key) => errors[key]);
    if (first) {
      document.getElementById(`pw-${first}`)?.focus();
      return;
    }
    setSaving(true);
    const result = await changePassword({ current_password: values.current, new_password: values.next });
    setSaving(false);
    if (result?.status === 200) {
      toast.success("Password changed. Use the new password next time you sign in.");
      setValues({ current: "", next: "", confirm: "" });
      setSubmitted(false);
      navigate("/profile");
    } else {
      toast.error(result?.message || "Could not change the password.");
      if (/current/i.test(result?.message || "")) document.getElementById("pw-current")?.focus();
    }
  };

  useShortcuts({ s: (e) => submit(e) });

  return (
    <>
      <PageTitle>Change Password</PageTitle>
      <div className="flex flex-col gap-1">
        <ActionArea>
          <div onClick={() => navigate(-1)}>
            <CustomButton title={"Back"} color={"slate"}><AiOutlineRollback /></CustomButton>
          </div>
          <CustomButton type="submit" form="password-form" title={saving ? "Saving..." : "Update password"} color={"blue"} disabled={saving}>
            <AiOutlineSave />
          </CustomButton>
        </ActionArea>

        <form id="password-form" onSubmit={submit} onKeyDown={focusNextOnEnter} noValidate className="max-w-3xl">
          <FormSection
            title="Password"
            description="You'll use the new password the next time you sign in on this computer."
            icon={<AiOutlineLock />}
          >
            <StackedField label="Current password" required htmlFor="pw-current" error={shown("current")} className="md:col-span-2">
              <PasswordInput id="pw-current" value={values.current} onChange={set("current")} error={shown("current")} autoFocus autoComplete="current-password" placeholder="Current password" />
            </StackedField>

            <StackedField label="New password" required htmlFor="pw-next" error={shown("next")}>
              <PasswordInput id="pw-next" value={values.next} onChange={set("next")} error={shown("next")} autoComplete="new-password" placeholder="New password" />
            </StackedField>

            <StackedField label="Confirm new password" required htmlFor="pw-confirm" error={shown("confirm")}>
              <PasswordInput id="pw-confirm" value={values.confirm} onChange={set("confirm")} error={shown("confirm")} autoComplete="new-password" placeholder="Re-enter new password" />
            </StackedField>

            <div className="md:col-span-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600 dark:text-slate-300">Strength</span>
                <span className={`font-semibold ${values.next ? strength.text : "text-slate-400 dark:text-slate-500"}`}>
                  {values.next ? strength.label : "—"}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1" aria-hidden="true">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className={`h-1.5 rounded-full ${values.next && score > i ? strength.bar : "bg-slate-200 dark:bg-slate-700"}`} />
                ))}
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 pt-1">
                {RULES.map(([label, test]) => {
                  const ok = test(values.next);
                  return (
                    <li key={label} className={`flex items-center gap-1.5 text-xs ${ok ? "text-emerald-700 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`}>
                      {ok ? <AiOutlineCheckCircle className="shrink-0" /> : <AiOutlineCloseCircle className="shrink-0 opacity-60" />}
                      {label}
                    </li>
                  );
                })}
              </ul>
            </div>

            <p className="md:col-span-2 text-[11px] text-slate-500 dark:text-slate-400">
              Forgot your current password? <Link to="/contact-us" className="font-medium text-blue-700 dark:text-blue-400 hover:underline">Contact support</Link>.
            </p>
          </FormSection>
        </form>
      </div>
    </>
  );
};

export default ChangePassword;
