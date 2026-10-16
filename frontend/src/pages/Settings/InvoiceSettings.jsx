import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

// Icons...
import { AiOutlineDownload, AiOutlineDelete, AiOutlineFileAdd } from 'react-icons/ai';

// Components...
import PageTitle from '../../components/PageTitle';
import ActionArea from '../../components/ActionArea';
import MainArea from '../../components/MainArea';
import CustomToggle from '../../components/CustomToggle';
import CustomButton from '../../components/CustomButton';

// Stores...
import useAuthStore from '../../store/AuthStore';
import useCompanyStore from '../../store/CompanyStore';
import SearchableSelect from '../../components/SearchableSelect';
import api from '../../utils/axiosInterceptor';

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

    const handleSubmit = async () => {
        if (!data.company_id) {
            toast.error("Please select a company.");
            return;
        }
        setLoading(true);
        try {
            const response = await api.post("/setting/invoice-setting", {
                ...data,
                invoice_start_number: Number(data.invoice_start_number),
            });
            toast.success(response.data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to save invoice settings.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-1">
            <ActionArea>
                <CustomButton title="Save (Ctrl+S)" color="blue" onClick={handleSubmit} disabled={loading}><AiOutlineFileAdd /></CustomButton>
            </ActionArea>

            <PageTitle>Invoice Setup</PageTitle>
            <MainArea>
                <div className="flex w-full max-w-xl flex-col gap-1">
                    <div className="flex items-center gap-1">
                        <label className="w-[20%] text-xs">Company</label>
                        <SearchableSelect
                            className="w-[80%]"
                            name="company_id"
                            value={data.company_id}
                            onChange={handleChange}
                            options={companyData.map((company) => ({ id: company.id, label: company.company_name }))}
                            placeholder="Select Company"
                            required
                        />
                    </div>

                    <div className="rounded border border-slate-300 bg-white p-3 dark:border-slate-600 dark:bg-slate-900">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Invoice Number Format</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">The next invoice number is generated after you choose this company.</p>
                        <div className="mt-3 grid grid-cols-1 gap-1 sm:grid-cols-3">
                            <input name="invoice_prefix" value={data.invoice_prefix} onChange={handleChange} placeholder="Prefix" className="h-8 rounded border border-slate-400 bg-slate-50 px-2 text-xs text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
                            <input name="invoice_start_number" value={data.invoice_start_number} onChange={handleChange} type="number" min="1" placeholder="Starting number" className="h-8 rounded border border-slate-400 bg-slate-50 px-2 text-xs text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
                            <input name="invoice_suffix" value={data.invoice_suffix} onChange={handleChange} placeholder="Suffix" className="h-8 rounded border border-slate-400 bg-slate-50 px-2 text-xs text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
                        </div>
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Preview: {data.invoice_prefix || "INV-"}{String(Number(data.invoice_start_number) || 1).padStart(6, "0")}{data.invoice_suffix}</p>
                    </div>

                    <div className="flex flex-col gap-1 rounded border border-slate-300 bg-white p-3 dark:border-slate-600 dark:bg-slate-900">
                        <div><p className="text-sm font-medium text-slate-800 dark:text-slate-100">Terms &amp; Conditions</p><p className="text-xs text-slate-500 dark:text-slate-400">Default text available for your invoice documents.</p></div>
                        <textarea name="terms_and_conditions" value={data.terms_and_conditions} onChange={handleChange} rows={4} placeholder="e.g. Goods once sold will not be taken back..." className="resize-none rounded border border-slate-400 bg-slate-50 p-2 text-xs text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
                    </div>
                    <div className="rounded border border-dashed border-slate-300 dark:border-slate-600 p-4 text-center text-xs text-slate-400">
                        More settings coming soon…
                    </div>
                </div>
            </MainArea>
        </div>
    );
};

export default InvoiceSettings