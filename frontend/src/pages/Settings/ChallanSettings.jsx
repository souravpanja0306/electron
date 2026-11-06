// Package...
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from "../../utils/axiosInterceptor";

// Icons...
import { AiOutlineFileAdd } from 'react-icons/ai';

// Components...
import CustomButton from '../../components/CustomButton';
import PageTitle from '../../components/PageTitle';
import ActionArea from '../../components/ActionArea';
import MainArea from '../../components/MainArea';
import SearchableSelect from '../../components/SearchableSelect';
import { inputCls } from '../../components/FormKit';

// Stores...
import useAuthStore from '../../store/AuthStore';
import useCompanyStore from "../../store/CompanyStore";
import useShortcuts from "../../hooks/useShortcuts";

const emptySettings = { prefix: "", starting: "", suffix: "", terms: "", remarks: "" };

const SettingCard = ({ title, description, children }) => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-4">
        <div className="sm:max-w-[45%]">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        {children}
    </div>
);

const ChallanSettings = () => {
    const { token } = useAuthStore();
    const { companyData, getAllCompany } = useCompanyStore();
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        getAllCompany(token);
    }, []);

    const [data, setData] = useState({ company_id: "", ...emptySettings });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));

        if (name === "company_id") {
            getChallanSetting({ company_id: value });
        };
    };

    const getChallanSetting = async ({
        company_id = ""
    }) => {
        try {
            const response = await api({
                method: "get",
                url: `/setting/get-challan-setting?company_id=${company_id}`,
            });
            if (response.data.status === 200) {
                const saved = response.data.body.length ? response.data.body[0] : {};
                setData({
                    company_id: company_id,
                    prefix: saved.prefix || "",
                    suffix: saved.suffix || "",
                    starting: saved.starting || "",
                    terms: saved.terms || "",
                    remarks: saved.remarks || "",
                });
            };
        } catch (error) {
            console.log(error);
            toast.error("Could not load the saved settings for this company.");
        };
    };

    const handleSubmitForm = async (e) => {
        if (e) e.preventDefault();
        if (saving) return;
        if (!data.company_id) return toast.error("Please select a company first.");
        try {
            setSaving(true);
            const response = await api({
                method: "post",
                url: "/setting/add-challan-setting",
                data: {
                    company_id: data.company_id,
                    prefix: data.prefix,
                    suffix: data.suffix,
                    starting: data.starting,
                    terms: data.terms,
                    remarks: data.remarks
                },
            });
            if (response.data.status === 200) {
                // Keep the company and the values on screen so the user can see what was saved.
                toast.success(response.data.message);
            } else {
                toast.error(response.data.message);
            };
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Something went wrong!");
        } finally {
            setSaving(false);
        };
    };

    useShortcuts({
        s: (e) => handleSubmitForm(e),
    });

    // Mirrors how the backend builds the next number: prefix + (count + 1 + starting) padded to 6 + suffix.
    const startingNo = parseInt(data.starting) || 0;
    const preview = `${data.prefix || ""}${String(startingNo + 1).padStart(6, "0")}${data.suffix || ""}`;

    return (
        <div className='flex flex-col gap-1'>
            <PageTitle>Challan Setup</PageTitle>

            <ActionArea>
                <div onClick={handleSubmitForm}>
                    <CustomButton title={"Save (Ctrl+S)"} color={"blue"} disabled={saving}><AiOutlineFileAdd /></CustomButton>
                </div>
            </ActionArea>

            <MainArea>
                <form onSubmit={handleSubmitForm} className="w-full max-w-2xl flex flex-col gap-3 p-2" autoComplete="off">

                    <div className='flex flex-col sm:flex-row sm:items-center w-full gap-1'>
                        <label className='text-xs font-medium text-slate-600 dark:text-slate-300 sm:w-32 sm:shrink-0'>
                            From Company<span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <SearchableSelect
                            className="w-full"
                            name="company_id"
                            value={data.company_id}
                            onChange={handleChange}
                            options={companyData?.map(item => ({ id: item.id, label: item.company_name })) || []}
                            placeholder="Select Company"
                            required
                        />
                    </div>

                    {/* Prefix, starting number and suffix */}
                    <SettingCard title="Challan Prefix & Suffix" description="Customize your C/N number format">
                        <div className="flex flex-wrap items-center gap-2">
                            <input
                                type="text"
                                placeholder="Prefix"
                                aria-label="Prefix"
                                value={data.prefix}
                                name="prefix"
                                onChange={handleChange}
                                className={`${inputCls} w-24`}
                            />
                            <input
                                type="number"
                                min="0"
                                placeholder="Starting"
                                aria-label="Starting number"
                                value={data.starting}
                                name="starting"
                                onChange={handleChange}
                                className={`${inputCls} w-24`}
                            />
                            <input
                                type="text"
                                placeholder="Suffix"
                                aria-label="Suffix"
                                value={data.suffix}
                                name="suffix"
                                onChange={handleChange}
                                className={`${inputCls} w-24`}
                            />
                        </div>
                    </SettingCard>

                    <div className="rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-xs text-slate-600 dark:text-slate-300">
                        Example C/N number (the real one continues from your existing challans):<span className="font-mono font-semibold text-slate-800 dark:text-slate-100">{preview}</span>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="flex flex-col gap-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-4">
                        <div>
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Terms & Conditions</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Default text shown on every challan</p>
                        </div>
                        <textarea
                            value={data.terms}
                            onChange={handleChange}
                            rows={4}
                            name="terms"
                            placeholder="e.g. Goods once sold will not be taken back..."
                            className={`${inputCls} h-auto py-1 resize-y`}
                        />
                    </div>

                    <div className="rounded border border-dashed border-slate-300 dark:border-slate-600 p-4 text-center text-xs text-slate-400">
                        More settings coming soon…
                    </div>
                </form>
            </MainArea>
        </div >
    )
}

export default ChallanSettings
