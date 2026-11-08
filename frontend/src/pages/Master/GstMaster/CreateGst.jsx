import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { toast } from 'sonner';
import { AiOutlineSave, AiOutlineTable, AiOutlineRollback, AiOutlinePercentage } from "react-icons/ai";

import PageTitle from '../../../components/PageTitle';
import ActionArea from '../../../components/ActionArea';
import CustomButton from '../../../components/CustomButton';
import CustomLoader from '../../../components/CustomLoader';
import MainArea from '../../../components/MainArea';
import { FormSection, StackedField, inputProps, noSpinCls, focusNextOnEnter } from '../../../components/FormKit';
import useGstStore from '../../../store/GstStore';
import useAuthStore from '../../../store/AuthStore';
import useShortcuts from "../../../hooks/useShortcuts";
import useForm from "../../../hooks/useForm";
import * as v from '../../../utils/validators';

const EMPTY_GST = { title: "", type: "percentage", cgst: "", sgst: "" };
const SLABS = [0, 5, 12, 18, 28];

const num = (x) => (x === "" || x == null ? 0 : Number(x));
const fmt = (n) => (Number.isFinite(n) ? Number(n.toFixed(3)).toString() : "0");

const CreateGst = () => {
  const { token } = useAuthStore();
  const { createGst, updateGst, getAllGst, gstData } = useGstStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const back = searchParams.get("back");
  const editId = searchParams.get("id");
  const [status, setStatus] = useState(editId ? "loading" : "ready");

  const validator = (data) => v.validate(data, {
    title: [
      (x) => v.required(x, "Title"),
      (x) => (gstData || []).some((g) => String(g.id) !== String(editId) && (g.title || "").trim().toLowerCase() === x.trim().toLowerCase())
        ? "A GST rate with this title already exists." : "",
    ],
    cgst: [(x, d) => (d.type === "percentage" ? v.percent(x, 50) : x !== "" && num(x) < 0 ? "Must be 0 or more." : "")],
    sgst: [(x, d) => (d.type === "percentage" ? v.percent(x, 50) : x !== "" && num(x) < 0 ? "Must be 0 or more." : "")],
  });
  const form = useForm(EMPTY_GST, validator);
  const { data, set, errors, touch } = form;

  useEffect(() => {
    let alive = true;
    // Load the list (for the duplicate-title check) and, when editing, the record from it.
    getAllGst(token).then((result) => {
      if (!alive || !editId) return;
      const record = (result?.body || []).find((item) => String(item.id) === String(editId));
      if (record) {
        form.load({ title: record.title || "", type: record.type || "percentage", cgst: String(record.cgst ?? ""), sgst: String(record.sgst ?? "") });
        setStatus("ready");
      } else {
        setStatus("missing");
        toast.error("GST record not found.");
      }
    });
    return () => { alive = false; };
  }, [editId]);

  const total = num(data.cgst) + num(data.sgst);
  const unit = data.type === "percentage" ? "%" : "";

  // SGST follows CGST while they are equal (the normal case for GST).
  const onCgst = (e) => {
    const cgst = e.target.value;
    set((prev) => ({ cgst, ...(prev.sgst === prev.cgst ? { sgst: cgst } : {}) }));
  };

  const applySlab = (rate) => {
    const half = fmt(rate / 2);
    set((prev) => ({
      type: "percentage",
      cgst: half,
      sgst: half,
      title: prev.title || `GST ${rate}%`,
    }));
  };

  const save = form.submit(async (d) => {
    const cgst = num(d.cgst);
    const sgst = num(d.sgst);
    const payload = { title: d.title.trim(), type: d.type, cgst, sgst, total_rate: cgst + sgst, igst: cgst + sgst };
    try {
      const result = editId
        ? await updateGst({ data: { ...payload, id: editId }, token })
        : await createGst({ data: payload, token });
      if (result?.status === 200) {
        toast.success(result.message || "Saved.");
        form.markSaved();
        navigate("/view-gst");
      } else {
        toast.error(result?.message || "Could not save the GST rate.");
      }
    } catch (error) {
      toast.error("An error occurred while saving.");
    }
  });

  useShortcuts({
    s: (e) => status === "ready" && save(e),
    i: () => navigate("/view-gst"),
  });

  if (status === "loading") return <CustomLoader />;

  const rateField = (name, onChange) => inputProps({
    name,
    value: data[name],
    error: errors[name],
    className: `${noSpinCls} text-right tabular-nums`,
    onChange: onChange || ((e) => set({ [name]: e.target.value })),
    onBlur: () => touch(name),
    type: "number",
    min: 0,
    step: "any",
    inputMode: "decimal",
    placeholder: "0",
  });

  const activeSlab = data.type === "percentage" && data.cgst === data.sgst ? SLABS.find((s) => Math.abs(s - total) < 1e-9 && data.cgst !== "") : undefined;

  return (
    <>
      <PageTitle>{editId ? "Edit GST Rate" : "Add GST Rate"}</PageTitle>
      <div className="flex flex-col gap-1">
        <ActionArea>
          {(back || editId) && (
            <div onClick={() => navigate(-1)}>
              <CustomButton title={"Back"} color={"slate"}><AiOutlineRollback /></CustomButton>
            </div>
          )}
          {status === "ready" && (
            <CustomButton type="submit" form="gst-form" title={form.saving ? "Saving..." : "Save (Ctrl+S)"} color={"blue"} disabled={form.saving || (editId && !form.dirty)}>
              <AiOutlineSave />
            </CustomButton>
          )}
          <Link to="/view-gst">
            <CustomButton title={"View (Ctrl+I)"} color={"slate"}><AiOutlineTable /></CustomButton>
          </Link>
        </ActionArea>

        {status === "missing" ? (
          <MainArea>
            <div className="w-full p-8 text-center text-sm text-slate-500 dark:text-slate-400">This GST rate could not be found.</div>
          </MainArea>
        ) : (
          <form id="gst-form" onSubmit={save} onKeyDown={focusNextOnEnter} noValidate autoComplete="off" className="max-w-3xl">
            <FormSection title="GST rate" description="CGST + SGST apply within the state; IGST applies across states." icon={<AiOutlinePercentage />}>
              <div className="md:col-span-2 flex flex-col gap-1">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Quick slab</span>
                <div className="flex flex-wrap gap-1.5">
                  {SLABS.map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => applySlab(rate)}
                      aria-pressed={activeSlab === rate}
                      className={`h-7 px-3 rounded-full border text-xs font-medium transition-colors ${activeSlab === rate
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"}`}
                    >
                      {rate}%
                    </button>
                  ))}
                </div>
              </div>

              <StackedField label="Title" required htmlFor="f-title" error={errors.title}>
                <input {...inputProps({ name: "title", value: data.title, error: errors.title, onChange: (e) => set({ title: e.target.value }), onBlur: () => touch("title") })} placeholder="e.g. GST 18%" maxLength={60} autoFocus={!editId} />
              </StackedField>
              <StackedField label="Type" htmlFor="f-type">
                <select {...inputProps({ name: "type", value: data.type, onChange: (e) => set({ type: e.target.value }) })}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed amount (₹)</option>
                </select>
              </StackedField>
              <StackedField label={`CGST ${unit}`} htmlFor="f-cgst" error={errors.cgst}>
                <input {...rateField("cgst", onCgst)} />
              </StackedField>
              <StackedField label={`SGST ${unit}`} htmlFor="f-sgst" error={errors.sgst} hint="Normally equal to CGST.">
                <input {...rateField("sgst")} />
              </StackedField>

              <div className="md:col-span-2 grid grid-cols-2 gap-2">
                <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 px-3 py-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Total (CGST + SGST)</div>
                  <div className="text-lg font-bold tabular-nums text-slate-900 dark:text-white">{fmt(total)}{unit}</div>
                </div>
                <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 px-3 py-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">IGST (inter-state)</div>
                  <div className="text-lg font-bold tabular-nums text-blue-700 dark:text-blue-300">{fmt(total)}{unit}</div>
                </div>
              </div>
            </FormSection>
          </form>
        )}
      </div>
    </>
  )
}

export default CreateGst;
