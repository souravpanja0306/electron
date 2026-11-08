import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AiOutlineSave } from 'react-icons/ai';

// Components...
import CustomButton from '../../components/CustomButton';
import PageTitle from '../../components/PageTitle';
import ActionArea from '../../components/ActionArea';
import ChaVisibilitySetting from '../../components/ChaVisibilitySetting';
import {
    SettingsPanel, SettingsSection, SaveBar, CompanyPicker, NumberFormatEditor, TextAreaWithCount,
} from '../../components/SettingsKit';

// Stores / hooks...
import api from "../../utils/axiosInterceptor";
import useAuthStore from '../../store/AuthStore';
import useCompanyStore from "../../store/CompanyStore";
import useShortcuts from "../../hooks/useShortcuts";
import useForm from "../../hooks/useForm";
import { errorMessage } from '../../utils/format';

// `remarks` has no editor yet but is kept so saving never wipes a stored value.
const DEFAULTS = { prefix: "", starting: "", suffix: "", terms: "", remarks: "" };

const ChallanSettings = () => {
    const { token } = useAuthStore();
    const { companyData, getAllCompany, companyLoading } = useCompanyStore();
    const [companyId, setCompanyId] = useState("");
    const [loading, setLoading] = useState(false);
    const form = useForm(DEFAULTS);
    const { data, set } = form;

    useEffect(() => { getAllCompany(token); }, []);

    useEffect(() => {
        if (!companyId) return;
        let alive = true;
        setLoading(true);
        api.get(`/setting/get-challan-setting?company_id=${companyId}`)
            .then((response) => {
                if (!alive) return;
                const saved = response.data.status === 200 && response.data.body?.length ? response.data.body[0] : {};
                form.load({
                    prefix: saved.prefix || "",
                    suffix: saved.suffix || "",
                    starting: saved.starting != null && saved.starting !== "" ? String(saved.starting) : "",
                    terms: saved.terms || "",
                    remarks: saved.remarks || "",
                });
            })
            .catch((error) => alive && toast.error(errorMessage(error, "Could not load the saved settings for this company.")))
            .finally(() => alive && setLoading(false));
        return () => { alive = false; };
    }, [companyId]);

    const changeCompany = (id) => {
        if (id === companyId) return;
        if (form.dirty && !window.confirm("Discard unsaved changes for this company?")) return;
        setCompanyId(id);
    };

    const save = form.submit(async (d) => {
        if (!companyId) return toast.error("Please select a company first.");
        try {
            const response = await api({
                method: "post",
                url: "/setting/add-challan-setting",
                data: { company_id: companyId, ...d },
            });
            if (response.data.status === 200) {
                toast.success(response.data.message || "Challan settings saved.");
                form.markSaved();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(errorMessage(error, "Something went wrong!"));
        }
    });

    useShortcuts({ s: (e) => companyId && save(e) });

    const onChange = (e) => set({ [e.target.name]: e.target.value });
    // Mirrors the backend: prefix + (count + 1 + starting) padded to 6 + suffix.
    const preview = `${data.prefix || ""}${String((parseInt(data.starting) || 0) + 1).padStart(6, "0")}${data.suffix || ""}`;
    const disabled = !companyId || loading;

    return (
        <div className='flex flex-col gap-1'>
            <PageTitle>Challan Settings</PageTitle>

            <ActionArea>
                <CustomButton title={form.saving ? "Saving..." : "Save (Ctrl+S)"} color={"blue"} onClick={save} disabled={disabled || form.saving || !form.dirty}>
                    <AiOutlineSave />
                </CustomButton>
            </ActionArea>

            <CompanyPicker companies={companyData || []} value={companyId} onChange={changeCompany} loading={companyLoading} />

            <form onSubmit={save} autoComplete="off" className={`transition-opacity ${disabled ? "opacity-60 pointer-events-none" : ""}`} aria-busy={loading}>
                <SettingsPanel>
                    <SettingsSection
                        title="C/N numbering"
                        description="Format of the consignment note number. The starting number is an offset: the next C/N is starting + existing challans + 1."
                    >
                        <NumberFormatEditor
                            names={{ prefix: "prefix", start: "starting", suffix: "suffix" }}
                            values={{ prefix: data.prefix, start: data.starting, suffix: data.suffix }}
                            onChange={onChange}
                            preview={preview}
                            previewNote="Example for your first challan"
                        />
                    </SettingsSection>

                    <SettingsSection
                        title="Terms & conditions"
                        description="Default text printed on every challan for this company."
                    >
                        <TextAreaWithCount
                            id="f-terms"
                            value={data.terms}
                            onChange={(e) => set({ terms: e.target.value })}
                            placeholder={"1. Goods carried at owner's risk.\n2. Subject to local jurisdiction."}
                        />
                    </SettingsSection>
                </SettingsPanel>
            </form>

            <SettingsPanel>
                <SettingsSection
                    title="Form fields"
                    description="Applies to every company, and to both Create Challan and Create Invoice. Saved instantly."
                >
                    <ChaVisibilitySetting />
                </SettingsSection>
            </SettingsPanel>

            <SaveBar dirty={form.dirty && !disabled} saving={form.saving} onSave={save} onDiscard={form.reset} />
        </div>
    )
}

export default ChallanSettings
