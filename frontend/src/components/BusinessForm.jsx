import React from 'react';
import { AiOutlineIdcard, AiOutlineEnvironment, AiOutlineSafetyCertificate, AiOutlineBank, AiOutlinePicture, AiOutlineDelete } from "react-icons/ai";

import { FormSection, StackedField, inputProps, inputCls, readOnlyCls } from './FormKit';
import SearchableSelect from './SearchableSelect';
import StateList, { stateFromGstCode } from '../utils/StateList';
import * as v from '../utils/validators';

/*
 * One form for every "business" record — Parties and Companies share the same fields.
 * Pages own the data (via useForm) and the API calls; this component renders the fields,
 * normalises input (digits only, upper-case codes) and fills State/PAN from a GSTIN.
 */

export const EMPTY_BUSINESS = {
    company_name: "",
    owner: "",
    mobile: "",
    email: "",
    address_1: "",
    address_2: "",
    city: "",
    district: "",
    state: "",
    pincode: "",
    country: "INDIA",
    gst: "",
    pan: "",
    trade_licence: "",
    bank: "",
    branch: "",
    ifse: "", // IFSC — the column is named `ifse` in the database.
    account_no: "",
};

/** A DB record -> form data (nulls become "", unknown keys dropped). */
export const toBusinessData = (record = {}) =>
    Object.fromEntries(Object.keys(EMPTY_BUSINESS).map((key) => [key, record?.[key] ?? EMPTY_BUSINESS[key]]));

const STATE_OPTIONS = StateList.map((s) => ({ id: s.value, label: s.value }));

/**
 * Field rules. `duplicateOf(data)` (optional) returns the name of another record that
 * already uses this GSTIN, so the user doesn't create the same party twice.
 */
export const businessValidator = ({ nameLabel = "Name", duplicateOf } = {}) => (data) =>
    v.validate(data, {
        company_name: [(x) => v.required(x, nameLabel)],
        mobile: [v.mobile],
        email: [v.email],
        pincode: [v.pincode],
        state: [(state, d) => {
            const fromGst = d.gst?.length >= 2 ? stateFromGstCode(d.gst.slice(0, 2)) : "";
            return fromGst && state && !v.gstin(d.gst) && fromGst !== state
                ? `GSTIN belongs to ${fromGst}. Tax on invoices depends on this.`
                : "";
        }],
        gst: [
            v.gstin,
            (gst) => {
                const other = gst && duplicateOf ? duplicateOf(data) : "";
                return other ? `This GSTIN is already used by "${other}".` : "";
            },
        ],
        pan: [
            v.pan,
            (pan, d) => {
                const fromGst = v.panFromGstin(d.gst);
                return pan && fromGst && !v.gstin(d.gst) && pan !== fromGst ? `PAN doesn't match the GSTIN (${fromGst}).` : "";
            },
        ],
        ifse: [v.ifsc],
        account_no: [v.accountNo],
    });

const LogoPicker = ({ logo }) => {
    const { preview, fileName, onFile, onRemove } = logo;
    return (
        <FormSection title="Logo" description="Printed on invoices, challans and receipts." icon={<AiOutlinePicture />} cols={1}>
            <div className="flex items-center gap-4">
                <div className="w-28 h-28 shrink-0 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-center overflow-hidden">
                    {preview
                        ? <img src={preview} alt="Logo preview" className="w-full h-full object-contain bg-white" />
                        : <span className="text-[11px] text-center text-slate-400 dark:text-slate-500 px-2">No logo<br />512 × 512 recommended</span>}
                </div>
                <div className="flex flex-col gap-2 min-w-0">
                    <label className="inline-flex items-center justify-center h-8 px-3 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-600 cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-blue-500/40">
                        {preview ? "Change image" : "Upload image"}
                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="sr-only"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                e.target.value = "";
                                if (file) onFile(file);
                            }}
                        />
                    </label>
                    {preview && onRemove && (
                        <button type="button" onClick={onRemove} className="inline-flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400 hover:underline">
                            <AiOutlineDelete /> Remove
                        </button>
                    )}
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{fileName || "PNG, JPG or WebP, up to 2 MB."}</p>
                </div>
            </div>
        </FormSection>
    );
};

/**
 * Props:
 *  - form: the object from useForm (data, set, errors, touch)
 *  - nameLabel: "Party name" / "Company name"
 *  - logo: optional { preview, fileName, onFile(file), onRemove() } — shows the logo card
 *  - autoFocus: focus the name field on mount
 *  - hideOwner: omit the owner/contact field (e.g. the user's own profile)
 *  - basicTitle / basicDescription: override the first card's heading
 */
const BusinessForm = ({ form, nameLabel = "Name", logo, autoFocus, hideOwner, basicTitle = "Basic details", basicDescription = "Who this is and how to reach them.", basicExtra }) => {
    const { data, set, errors, touch } = form;

    // Normalises each input as it is typed.
    const field = (name, normalise, className = "") =>
        inputProps({
            name,
            value: data[name],
            error: errors[name],
            className,
            onChange: (e) => set({ [name]: normalise ? normalise(e.target.value) : e.target.value }),
            onBlur: () => touch(name),
        });

    const onGstChange = (e) => {
        const gst = v.upperAlnum(e.target.value, 15);
        set((prev) => {
            const patch = { gst };
            // A complete, valid GSTIN tells us the PAN and the State — fill them if empty.
            if (!v.gstin(gst) && gst.length === 15) {
                if (!prev.pan) patch.pan = v.panFromGstin(gst);
                if (!prev.state) patch.state = stateFromGstCode(gst.slice(0, 2));
            }
            return patch;
        });
    };

    const gstState = data.gst.length === 15 && !v.gstin(data.gst) ? stateFromGstCode(data.gst.slice(0, 2)) : "";

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 items-start">
            <FormSection title={basicTitle} description={basicDescription} icon={<AiOutlineIdcard />}>
                <StackedField label={nameLabel} required htmlFor="f-company_name" error={errors.company_name} className="md:col-span-2">
                    <input {...field("company_name")} placeholder={`${nameLabel}`} autoFocus={autoFocus} maxLength={150} />
                </StackedField>
                {basicExtra}
                {!hideOwner && (
                    <StackedField label="Owner / contact person" htmlFor="f-owner" error={errors.owner}>
                        <input {...field("owner")} placeholder="Full name" maxLength={100} />
                    </StackedField>
                )}
                <StackedField label="Mobile" htmlFor="f-mobile" error={errors.mobile} className={hideOwner && !basicExtra ? "md:col-span-2" : ""}>
                    <input {...field("mobile", (x) => v.onlyDigits(x, 10))} type="tel" inputMode="numeric" placeholder="10-digit mobile" />
                </StackedField>
                <StackedField label="Email" htmlFor="f-email" error={errors.email} className="md:col-span-2">
                    <input {...field("email", (x) => x.trim())} type="email" placeholder="name@example.com" maxLength={120} />
                </StackedField>
            </FormSection>

            {logo ? <LogoPicker logo={logo} /> : (
                <FormSection title="Tax & registration" description="Used on invoices and for GST returns." icon={<AiOutlineSafetyCertificate />}>
                    <GstFields field={field} errors={errors} onGstChange={onGstChange} data={data} gstState={gstState} />
                </FormSection>
            )}

            <FormSection title="Address" description="Billing address printed on documents." icon={<AiOutlineEnvironment />}>
                <StackedField label="Address line 1" htmlFor="f-address_1" error={errors.address_1} className="md:col-span-2">
                    <input {...field("address_1")} placeholder="Building, street" maxLength={200} />
                </StackedField>
                <StackedField label="Address line 2" htmlFor="f-address_2" error={errors.address_2} className="md:col-span-2">
                    <input {...field("address_2")} placeholder="Area, landmark (optional)" maxLength={200} />
                </StackedField>
                <StackedField label="City" htmlFor="f-city" error={errors.city}>
                    <input {...field("city")} placeholder="City" maxLength={80} />
                </StackedField>
                <StackedField label="District" htmlFor="f-district" error={errors.district}>
                    <input {...field("district")} placeholder="District" maxLength={80} />
                </StackedField>
                <StackedField label="State" htmlFor="f-state" error={errors.state}>
                    <SearchableSelect
                        id="f-state"
                        name="state"
                        value={data.state}
                        invalid={Boolean(errors.state)}
                        onChange={(e) => set({ state: e.target.value })}
                        onBlur={() => touch("state")}
                        options={STATE_OPTIONS}
                        placeholder="Select state"
                    />
                </StackedField>
                <StackedField label="Pincode" htmlFor="f-pincode" error={errors.pincode}>
                    <input {...field("pincode", (x) => v.onlyDigits(x, 6))} inputMode="numeric" placeholder="6 digits" />
                </StackedField>
                <StackedField label="Country" htmlFor="f-country">
                    <input id="f-country" value={data.country || "INDIA"} readOnly tabIndex={-1} className={`${inputCls} ${readOnlyCls}`} />
                </StackedField>
            </FormSection>

            {logo && (
                <FormSection title="Tax & registration" description="Used on invoices and for GST returns." icon={<AiOutlineSafetyCertificate />}>
                    <GstFields field={field} errors={errors} onGstChange={onGstChange} data={data} gstState={gstState} />
                </FormSection>
            )}

            <FormSection title="Bank details" description="Shown on invoices for payment." icon={<AiOutlineBank />}>
                <StackedField label="Bank name" htmlFor="f-bank" error={errors.bank}>
                    <input {...field("bank")} placeholder="e.g. State Bank of India" maxLength={100} />
                </StackedField>
                <StackedField label="Branch" htmlFor="f-branch" error={errors.branch}>
                    <input {...field("branch")} placeholder="Branch" maxLength={100} />
                </StackedField>
                <StackedField label="IFSC" htmlFor="f-ifse" error={errors.ifse}>
                    <input {...field("ifse", (x) => v.upperAlnum(x, 11), "uppercase tracking-wide")} placeholder="ABCD0123456" />
                </StackedField>
                <StackedField label="Account number" htmlFor="f-account_no" error={errors.account_no}>
                    <input {...field("account_no", (x) => v.onlyDigits(x, 18))} inputMode="numeric" placeholder="9–18 digits" />
                </StackedField>
            </FormSection>
        </div>
    );
};

const GstFields = ({ field, errors, onGstChange, data, gstState }) => (
    <>
        <StackedField
            label="GSTIN"
            htmlFor="f-gst"
            error={errors.gst}
            hint={gstState ? `Registered in ${gstState}.` : "State and PAN fill in automatically from a valid GSTIN."}
            className="md:col-span-2"
        >
            <input {...field("gst", null, "uppercase tracking-wide")} onChange={onGstChange} placeholder="15-character GSTIN" />
        </StackedField>
        <StackedField label="PAN" htmlFor="f-pan" error={errors.pan}>
            <input {...field("pan", (x) => v.upperAlnum(x, 10), "uppercase tracking-wide")} placeholder="AAAAA9999A" />
        </StackedField>
        <StackedField label="Trade licence" htmlFor="f-trade_licence" error={errors.trade_licence}>
            <input {...field("trade_licence")} placeholder="Licence number" maxLength={50} />
        </StackedField>
    </>
);

export default BusinessForm;
