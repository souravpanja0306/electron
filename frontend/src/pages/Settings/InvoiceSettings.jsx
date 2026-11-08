import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

// Icons...
import { AiOutlineFileAdd } from 'react-icons/ai';

// Components...
import PageTitle from '../../components/PageTitle';
import ActionArea from '../../components/ActionArea';
import MainArea from '../../components/MainArea';
import CustomButton from '../../components/CustomButton';
import SearchableSelect from '../../components/SearchableSelect';
import { inputCls, labelCls, Required } from '../../components/FormKit';
import ChaVisibilitySetting from '../../components/ChaVisibilitySetting';

// Stores...
import useCompanyStore from '../../store/CompanyStore';
import api from '../../utils/axiosInterceptor';
import useShortcuts from "../../hooks/useShortcuts";

const SettingCard = ({ title, description, children }) => (
    <div className="flex flex-col gap-3 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-4">
        <div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        {children}
    </div>
);

const InvoiceSettings = () => {
    const { companyData, getAllCompany } = useCompanyStore();
    const [data, setData] = useState({
        company_id: "",
        invoice_prefix: "INV-",
        invoice_suffix: "",
        invoice_start_number: 1,
        terms_and_conditions: "",
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getAllCompany();
    }, []);

    useEffect(() => {
        const loadSettings = async () => {
            if (!data.company_id) return;
            setLoading(true);
            try {
                const response = await api.get(`/setting/invoice-setting?company_id=${data.company_id}`);
                const settings = response.data.body?.[0];
                setData((current) => ({
                    ...current,
                    invoice_prefix: settings?.invoice_prefix ?? "INV-",
                    invoice_suffix: settings?.invoice_suffix ?? "",
                    invoice_start_number: settings?.invoice_start_number ?? 1,
                    terms_and_conditions: settings?.terms_and_conditions ?? "",
                }));
            } catch (error) {
                toast.error(error.response?.data?.message || "Unable to load invoice settings.");
            } finally {
                setLoading(false);
            }
        };
        loadSettings();
    }, [data.company_id]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setData((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = async (e) => {
        if (e?.preventDefault) e.preventDefault();
        if (loading) return;
        if (!data.company_id) {
            toast.error("Please select a company.");
            return;
        }
        setLoading(true);
        try {
            const response = await api.post("/setting/invoice-setting", {
                ...data,
                invoice_start_number: Math.max(1, Number(data.invoice_start_number) || 1),
            });
            toast.success(response.data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to save invoice settings.");
        } finally {
            setLoading(false);
        }
    };

    useShortcuts({
        s: (e) => handleSubmit(e),
    });

    // Mirrors the backend: prefix + (start + existing invoices for the company) padded to 6 + suffix.
    const preview = `${data.invoice_prefix || ""}${String(Math.max(1, Number(data.invoice_start_number) || 1)).padStart(6, "0")}${data.invoice_suffix || ""}`;

    return (
        <div className="flex flex-col gap-1">
            <PageTitle>Invoice Setup</PageTitle>

            <ActionArea>
                <CustomButton title="Save (Ctrl+S)" color="blue" onClick={handleSubmit} disabled={loading}><AiOutlineFileAdd /></CustomButton>
            </ActionArea>

            <MainArea>
                <form onSubmit={handleSubmit} className="w-full max-w-2xl flex flex-col gap-3 p-2" autoComplete="off">
                    <div className="flex flex-col sm:flex-row sm:items-center w-full gap-1">
                        <label className={`${labelCls} sm:w-32 sm:shrink-0`}>Company<Required /></label>
                        <SearchableSelect
                            className="w-full"
                            name="company_id"
                            value={data.company_id}
                            onChange={handleChange}
                            options={(companyData || []).map((company) => ({ id: company.id, label: company.company_name }))}
                            placeholder="Select Company"
                            required
                        />
                    </div>

                    <SettingCard title="Invoice Number Format" description="Each company has its own invoice number series.">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="flex flex-col gap-1">
                                <label className={labelCls} htmlFor="invoice_prefix">Prefix</label>
                                <input id="invoice_prefix" name="invoice_prefix" value={data.invoice_prefix} onChange={handleChange} placeholder="e.g. INV-" className={inputCls} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className={labelCls} htmlFor="invoice_start_number">Starting Number</label>
                                <input id="invoice_start_number" name="invoice_start_number" value={data.invoice_start_number} onChange={handleChange} type="number" min="1" className={inputCls} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className={labelCls} htmlFor="invoice_suffix">Suffix</label>
                                <input id="invoice_suffix" name="invoice_suffix" value={data.invoice_suffix} onChange={handleChange} placeholder="e.g. /26-27" className={inputCls} />
                            </div>
                        </div>
                        <div className="rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-600 dark:text-slate-300">
                            First invoice number: <span className="font-mono font-semibold text-slate-800 dark:text-slate-100">{preview}</span>
                            <span className="ml-1 text-slate-500 dark:text-slate-400">(later ones continue from your existing invoices)</span>
                        </div>
                    </SettingCard>

                    <SettingCard title="Terms & Conditions" description="Printed on every new invoice for this company.">
                        <textarea
                            name="terms_and_conditions"
                            value={data.terms_and_conditions}
                            onChange={handleChange}
                            rows={4}
                            placeholder="e.g. Goods once sold will not be taken back..."
                            className={`${inputCls} h-auto py-1 resize-y`}
                        />
                    </SettingCard>

                    <ChaVisibilitySetting />

                    <div className="rounded border border-dashed border-slate-300 dark:border-slate-600 p-4 text-center text-xs text-slate-400">
                        More settings coming soon…
                    </div>
                </form>
            </MainArea>
        </div>
    );
};

export default InvoiceSettings
