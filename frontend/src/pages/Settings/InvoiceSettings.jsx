import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import { AiOutlineSave } from 'react-icons/ai';

// Components...
import PageTitle from '../../components/PageTitle';
import ActionArea from '../../components/ActionArea';
import CustomButton from '../../components/CustomButton';
import ChaVisibilitySetting from '../../components/ChaVisibilitySetting';
import {
    SettingsPanel, SettingsSection, SaveBar, CompanyPicker, NumberFormatEditor, TextAreaWithCount,
} from '../../components/SettingsKit';

// Stores / hooks...
import useCompanyStore from '../../store/CompanyStore';
import useAuthStore from '../../store/AuthStore';
import api from '../../utils/axiosInterceptor';
import useShortcuts from "../../hooks/useShortcuts";
import useForm from "../../hooks/useForm";
import { errorMessage } from '../../utils/format';

const DEFAULTS = { invoice_prefix: "INV-", invoice_suffix: "", invoice_start_number: "1", terms_and_conditions: "" };

const validator = (d) => {
    const errors = {};
    if (!(Number(d.invoice_start_number) >= 1)) errors.invoice_start_number = "Start from 1 or higher.";
    return errors;
};

const InvoiceSettings = () => {
    const { token } = useAuthStore();
    const { companyData, getAllCompany, companyLoading } = useCompanyStore();
    const [companyId, setCompanyId] = useState("");
    const [loading, setLoading] = useState(false);
    const form = useForm(DEFAULTS, validator);
    const { data, set, errors } = form;

    useEffect(() => { getAllCompany(token); }, []);

    // Load this company's saved settings (or defaults when none are saved yet).
    useEffect(() => {
        if (!companyId) return;
        let alive = true;
        setLoading(true);
        api.get(`/setting/invoice-setting?company_id=${companyId}`)
            .then((response) => {
                if (!alive) return;
                const saved = response.data.body?.[0];
                form.load({
                    invoice_prefix: saved?.invoice_prefix ?? DEFAULTS.invoice_prefix,
                    invoice_suffix: saved?.invoice_suffix ?? "",
                    invoice_start_number: String(saved?.invoice_start_number ?? 1),
                    terms_and_conditions: saved?.terms_and_conditions ?? "",
                });
            })
            .catch((error) => alive && toast.error(errorMessage(error, "Unable to load invoice settings.")))
            .finally(() => alive && setLoading(false));
        return () => { alive = false; };
    }, [companyId]);

    const changeCompany = (id) => {
        if (id === companyId) return;
        if (form.dirty && !window.confirm("Discard unsaved changes for this company?")) return;
        setCompanyId(id);
    };

    const save = form.submit(async (d) => {
        if (!companyId) return toast.error("Please select a company.");
        try {
            const response = await api.post("/setting/invoice-setting", {
                company_id: companyId,
                ...d,
                invoice_start_number: Math.max(1, Number(d.invoice_start_number) || 1),
            });
            if (response.data?.status === 200) {
                toast.success(response.data.message || "Invoice settings saved.");
                form.markSaved();
            } else {
                toast.error(response.data?.message || "Unable to save invoice settings.");
            }
        } catch (error) {
            toast.error(errorMessage(error, "Unable to save invoice settings."));
        }
    });

    useShortcuts({ s: (e) => companyId && save(e) });

    const onChange = (e) => set({ [e.target.name]: e.target.value });
    // Mirrors the backend: prefix + (start + existing invoices for the company) padded to 6 + suffix.
    const preview = `${data.invoice_prefix || ""}${String(Math.max(1, Number(data.invoice_start_number) || 1)).padStart(6, "0")}${data.invoice_suffix || ""}`;
    const disabled = !companyId || loading;

    return (
        <div className="flex flex-col gap-1">
            <PageTitle>Invoice Settings</PageTitle>

            <ActionArea>
                <CustomButton title={form.saving ? "Saving..." : "Save (Ctrl+S)"} color="blue" onClick={save} disabled={disabled || form.saving || !form.dirty}>
                    <AiOutlineSave />
                </CustomButton>
            </ActionArea>

            <CompanyPicker companies={companyData || []} value={companyId} onChange={changeCompany} loading={companyLoading} />

            <form onSubmit={save} autoComplete="off" className={`transition-opacity ${disabled ? "opacity-60 pointer-events-none" : ""}`} aria-busy={loading}>
                <SettingsPanel>
                    <SettingsSection
                        title="Invoice numbering"
                        description="Each company has its own series. Numbers are padded to 6 digits and continue from the invoices you already have."
                    >
                        <NumberFormatEditor
                            names={{ prefix: "invoice_prefix", start: "invoice_start_number", suffix: "invoice_suffix" }}
                            values={{ prefix: data.invoice_prefix, start: data.invoice_start_number, suffix: data.invoice_suffix }}
                            errors={{ start: errors.invoice_start_number }}
                            onChange={onChange}
                            preview={preview}
                            previewNote="First invoice number"
                        />
                    </SettingsSection>

                    <SettingsSection
                        title="Terms & conditions"
                        description="Printed at the bottom of every new invoice for this company. You can still edit it on each invoice."
                    >
                        <TextAreaWithCount
                            id="f-terms_and_conditions"
                            value={data.terms_and_conditions}
                            onChange={(e) => set({ terms_and_conditions: e.target.value })}
                            placeholder={"1. Payment due within 30 days.\n2. Subject to local jurisdiction."}
                        />
                    </SettingsSection>
                </SettingsPanel>
            </form>

            <SettingsPanel>
                <SettingsSection
                    title="Form fields"
                    description="Applies to every company, and to both Create Invoice and Create Challan. Saved instantly."
                >
                    <ChaVisibilitySetting />
                </SettingsSection>
            </SettingsPanel>

            <SaveBar dirty={form.dirty && !disabled} saving={form.saving} onSave={save} onDiscard={form.reset} />
        </div>
    );
};

export default InvoiceSettings
