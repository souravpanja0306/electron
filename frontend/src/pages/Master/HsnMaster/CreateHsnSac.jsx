import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { AiOutlineSave, AiOutlineTable, AiOutlineRollback, AiOutlineBarcode } from "react-icons/ai";

import ActionArea from '../../../components/ActionArea';
import PageTitle from '../../../components/PageTitle';
import CustomButton from '../../../components/CustomButton';
import CustomLoader from '../../../components/CustomLoader';
import MainArea from '../../../components/MainArea';
import { FormSection, StackedField, inputProps, inputCls, errorCls, noSpinCls, focusNextOnEnter } from '../../../components/FormKit';
import useAuthStore from '../../../store/AuthStore';
import useHsnSacStore from "../../../store/HsnSacStore";
import useShortcuts from "../../../hooks/useShortcuts";
import useForm from "../../../hooks/useForm";
import * as v from '../../../utils/validators';

const EMPTY_HSN = { type: "HSN", code: "", gst_rate: "", description: "" };
const GST_SLABS = ["0", "0.25", "3", "5", "12", "18", "28"];

// HSN: 2, 4, 6 or 8 digits (goods). SAC: 4 or 6 digits starting with 99 (services).
const codeRule = (code, d) => {
    if (!code) return "";
    if (d.type === "SAC") return /^99(\d{2}|\d{4})$/.test(code) ? "" : "SAC codes start with 99 and are 4 or 6 digits.";
    return /^(\d{2}|\d{4}|\d{6}|\d{8})$/.test(code) ? "" : "HSN codes are 2, 4, 6 or 8 digits.";
};

const TYPE_OPTIONS = [
    { value: "HSN", label: "HSN", hint: "Goods" },
    { value: "SAC", label: "SAC", hint: "Services" },
];

const CreateHsnSac = () => {
    const { token } = useAuthStore();
    const { createHsnSac, updateHsnSac, hsnData, getAllHsnSac } = useHsnSacStore();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isBack = searchParams.get("back") === "true";
    const editId = searchParams.get("id");
    const [status, setStatus] = useState(editId ? "loading" : "ready");

    const validator = (data) => v.validate(data, {
        code: [
            (x) => v.required(x, "Code"),
            codeRule,
            (x, d) => (hsnData || []).some((h) => String(h.id) !== String(editId) && h.code === x && String(h.type).toUpperCase() === d.type)
                ? `This ${d.type} code already exists.` : "",
        ],
        gst_rate: [(x) => v.percent(x, 100)],
    });
    const form = useForm(EMPTY_HSN, validator);
    const { data, set, errors, touch } = form;

    useEffect(() => {
        let alive = true;
        getAllHsnSac(token).then((result) => {
            if (!alive || !editId) return;
            const record = (result?.body || []).find((item) => String(item.id) === String(editId));
            if (record) {
                form.load({
                    type: String(record.type || "HSN").toUpperCase(),
                    code: record.code || "",
                    gst_rate: record.gst_rate === null || record.gst_rate === undefined ? "" : String(record.gst_rate),
                    description: record.description || "",
                });
                setStatus("ready");
            } else {
                setStatus("missing");
                toast.error("HSN/SAC record not found.");
            }
        });
        return () => { alive = false; };
    }, [editId]);

    const save = form.submit(async (d) => {
        const payload = { type: d.type, code: d.code, description: d.description.trim(), gst_rate: parseFloat(d.gst_rate) || 0 };
        try {
            const res = editId
                ? await updateHsnSac({ ...payload, id: editId }, token)
                : await createHsnSac(payload, token);
            if (res?.status === 200) {
                toast.success(res.message || "Saved.");
                form.markSaved();
                navigate("/view-hsn-sac");
            } else {
                toast.error(res?.message || "Could not save the code.");
            }
        } catch (error) {
            toast.error("Failed to save data");
        }
    });

    useShortcuts({
        s: (e) => status === "ready" && save(e),
        i: () => navigate("/view-hsn-sac"),
    });

    if (status === "loading") return <CustomLoader />;

    return (
        <>
            <PageTitle>{editId ? "Edit HSN / SAC" : "Add HSN / SAC"}</PageTitle>
            <div className="flex flex-col gap-1">
                <ActionArea>
                    {(isBack || editId) && (
                        <div onClick={() => navigate(-1)}>
                            <CustomButton title={"Back"} color={"slate"}><AiOutlineRollback /></CustomButton>
                        </div>
                    )}
                    {status === "ready" && (
                        <CustomButton type="submit" form="hsn-form" title={form.saving ? "Saving..." : "Save (Ctrl+S)"} color={"blue"} disabled={form.saving || (editId && !form.dirty)}>
                            <AiOutlineSave />
                        </CustomButton>
                    )}
                    <Link to="/view-hsn-sac">
                        <CustomButton title={"View (Ctrl+I)"} color={"slate"}><AiOutlineTable /></CustomButton>
                    </Link>
                </ActionArea>

                {status === "missing" ? (
                    <MainArea>
                        <div className="w-full p-8 text-center text-sm text-slate-500 dark:text-slate-400">This HSN/SAC code could not be found.</div>
                    </MainArea>
                ) : (
                    <form id="hsn-form" onSubmit={save} onKeyDown={focusNextOnEnter} noValidate autoComplete="off" className="max-w-3xl">
                        <FormSection title="HSN / SAC code" description="Printed against each line item on invoices." icon={<AiOutlineBarcode />}>
                            <div className="md:col-span-2 flex flex-col gap-1">
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Type</span>
                                <div role="radiogroup" aria-label="Type" className="grid grid-cols-2 gap-2 max-w-sm">
                                    {TYPE_OPTIONS.map((opt) => {
                                        const active = data.type === opt.value;
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                role="radio"
                                                aria-checked={active}
                                                onClick={() => set({ type: opt.value })}
                                                className={`rounded-md border px-3 py-2 text-left transition-colors ${active
                                                    ? "border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-500/15"
                                                    : "border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700"}`}
                                            >
                                                <div className={`text-sm font-semibold ${active ? "text-blue-700 dark:text-blue-300" : "text-slate-800 dark:text-slate-100"}`}>{opt.label}</div>
                                                <div className="text-[11px] text-slate-500 dark:text-slate-400">{opt.hint}</div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <StackedField
                                label="Code"
                                required
                                htmlFor="f-code"
                                error={errors.code}
                                hint={data.type === "SAC" ? "4 or 6 digits, starts with 99." : "2, 4, 6 or 8 digits."}
                            >
                                <input
                                    {...inputProps({
                                        name: "code",
                                        value: data.code,
                                        error: errors.code,
                                        className: "tabular-nums tracking-wide",
                                        onChange: (e) => set({ code: v.onlyDigits(e.target.value, 8) }),
                                        onBlur: () => touch("code"),
                                    })}
                                    inputMode="numeric"
                                    placeholder={data.type === "SAC" ? "e.g. 996511" : "e.g. 8421"}
                                    autoFocus={!editId}
                                />
                            </StackedField>

                            <StackedField label="GST rate (%)" htmlFor="f-gst_rate" error={errors.gst_rate} hint="Default rate suggested on invoices.">
                                <input
                                    {...inputProps({
                                        name: "gst_rate",
                                        value: data.gst_rate,
                                        error: errors.gst_rate,
                                        className: `${noSpinCls} text-right tabular-nums`,
                                        onChange: (e) => set({ gst_rate: e.target.value }),
                                        onBlur: () => touch("gst_rate"),
                                    })}
                                    type="number"
                                    min={0}
                                    max={100}
                                    step="any"
                                    inputMode="decimal"
                                    list="gst-slabs"
                                    placeholder="e.g. 18"
                                />
                                <datalist id="gst-slabs">
                                    {GST_SLABS.map((s) => <option key={s} value={s} />)}
                                </datalist>
                            </StackedField>

                            <StackedField label="Description" htmlFor="f-description" className="md:col-span-2">
                                <textarea
                                    id="f-description"
                                    name="description"
                                    rows={3}
                                    maxLength={500}
                                    value={data.description}
                                    onChange={(e) => set({ description: e.target.value })}
                                    placeholder="What this code covers (optional)"
                                    className={`${inputCls} h-auto py-1.5 resize-y ${errors.description ? errorCls : ""}`}
                                />
                            </StackedField>
                        </FormSection>
                    </form>
                )}
            </div>
        </>
    );
};

export default CreateHsnSac;
