import React from 'react';
import { AiOutlineIdcard } from "react-icons/ai";

import { FormSection, StackedField, inputProps, errorCls, inputCls } from './FormKit';
import * as v from '../utils/validators';

/* Shared fields for creating and editing a CHA (Custom House Agent). */

export const EMPTY_CHA = { name: "", mobile: "", address: "" };

export const toChaData = (record = {}) => ({
    name: record?.name ?? "",
    mobile: record?.mobile ?? "",
    address: record?.address ?? "",
});

/** `duplicateOf(name)` returns true when another CHA already has this name. */
export const chaValidator = ({ duplicateOf } = {}) => (data) =>
    v.validate(data, {
        name: [
            (x) => v.required(x, "CHA name"),
            (x) => (x && duplicateOf?.(x.trim().toLowerCase()) ? "A CHA with this name already exists." : ""),
        ],
        mobile: [v.mobile],
    });

const ChaForm = ({ form, autoFocus }) => {
    const { data, set, errors, touch } = form;
    const field = (name, normalise) =>
        inputProps({
            name,
            value: data[name],
            error: errors[name],
            onChange: (e) => set({ [name]: normalise ? normalise(e.target.value) : e.target.value }),
            onBlur: () => touch(name),
        });

    return (
        <div className="max-w-3xl">
            <FormSection title="CHA details" description="Custom House Agent used on challans." icon={<AiOutlineIdcard />}>
                <StackedField label="CHA name" required htmlFor="f-name" error={errors.name}>
                    <input {...field("name")} placeholder="Agency or person name" autoFocus={autoFocus} maxLength={150} />
                </StackedField>
                <StackedField label="Mobile" htmlFor="f-mobile" error={errors.mobile}>
                    <input {...field("mobile", (x) => v.onlyDigits(x, 10))} type="tel" inputMode="numeric" placeholder="10-digit mobile" />
                </StackedField>
                <StackedField label="Address" htmlFor="f-address" error={errors.address} className="md:col-span-2">
                    <textarea
                        id="f-address"
                        name="address"
                        rows={3}
                        maxLength={300}
                        value={data.address}
                        onChange={(e) => set({ address: e.target.value })}
                        onBlur={() => touch("address")}
                        placeholder="Office address (optional)"
                        className={`${inputCls} h-auto py-1.5 resize-y ${errors.address ? errorCls : ""}`}
                    />
                </StackedField>
            </FormSection>
        </div>
    );
};

export default ChaForm;
