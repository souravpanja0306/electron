// Package...
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from "react-router-dom";
import { Link, NavLink } from "react-router-dom";
import { toast } from 'sonner';
import moment from 'moment';
import api from "../../utils/axiosInterceptor";

// Utils...
import { inrToWords } from '../../utils/InWordConverter';

// Icons...
import { AiOutlineDownload, AiOutlineDelete, AiOutlineFileAdd, AiOutlineTable } from 'react-icons/ai';

// Components...
import CustomButton from '../../components/CustomButton';
import PageTitle from '../../components/PageTitle';
import ActionArea from '../../components/ActionArea';
import MainArea from '../../components/MainArea';
import CustomToggle from '../../components/CustomToggle';
import SearchableSelect from '../../components/SearchableSelect';

// Stores...
import useAuthStore from '../../store/AuthStore';
import useCompanyStore from "../../store/CompanyStore";
import usePartyStore from "../../store/PartyStore"
import useChallanStore from "../../store/ChallanStore";

const ChallanSettings = () => {
    const { token } = useAuthStore();
    const { companyData, getAllCompany } = useCompanyStore();

    useEffect(() => {
        getAllCompany(token);
    }, []);

    const [data, setData] = useState({
        company_id: "",
        prefix: "",
        starting: "",
        suffix: "",
        terms: "",
        remarks: "",
    });

    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });

        if (e.target.name === "company_id") {
            getChallanSetting({ company_id: e.target.value });
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
                let NewData = (response.data.body).length ? response.data.body[0] : "";
                setData({
                    company_id: NewData.company_id || "",
                    prefix: NewData.prefix || "",
                    suffix: NewData.suffix || "",
                    starting: NewData.starting || "",
                    terms: NewData.terms || "",
                    remarks: NewData.remarks || "",
                });
            };
        } catch (error) {
            console.log(error);
        };
    };

    const handleSubmitForm = async (e) => {
        try {
            e.preventDefault();
            let finalData = {
                company_id: data.company_id,
                prefix: data.prefix,
                suffix: data.suffix,
                starting: data.starting,
                terms: data.terms,
                remarks: data.remarks
            };
            const response = await api({
                method: "post",
                url: "/setting/add-challan-setting",
                data: finalData,
            });
            if (response.data.status === 200) {
                toast.success(response.data.message);
                setData({ prefix: "", starting: "", suffix: "", terms: "", remarks: "" });
            } else {
                toast.error(response.data.message);
            };
        } catch (error) {
            console.log(error);
        };
    };

    return (
        <div className='flex flex-col gap-1'>

            <ActionArea>
                <div onClick={(e) => handleSubmitForm(e)}>
                    <CustomButton title={"Save (Ctrl+S)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
                </div>
            </ActionArea>

            <PageTitle>Challan Setup</PageTitle>
            <MainArea>
                <div className="w-full max-w-xl space-y-1">

                    <div className='flex justify-between items-center w-full gap-1'>
                        <label className='text-xs w-[20%]'>From Company</label>
                        <div className='flex items-center gap-1 w-[80%]'>
                            <SearchableSelect
                                className="w-full"
                                name="company_id"
                                value={data.company_id}
                                onChange={(e) => handleChange(e)}
                                options={companyData?.map(item => ({ id: item.id, label: item.company_name }))}
                                placeholder="Select Company"
                                required
                            />
                        </div>
                    </div>

                    {/* Prefix and Suffix */}
                    <div className="flex items-center justify-between rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-4">
                        <div>
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Invoice Prefix & Suffix</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Customize your invoice number format</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="Prefix"
                                value={data.prefix}
                                name="prefix"
                                onChange={(e) => handleChange(e)}
                                className="w-24 text-sm px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <input
                                type="text"
                                placeholder="Starting"
                                value={data.starting}
                                name="starting"
                                onChange={(e) => handleChange(e)}
                                className="w-24 text-sm px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <input
                                type="text"
                                placeholder="Suffix"
                                value={data.suffix}
                                name="suffix"
                                onChange={(e) => handleChange(e)}
                                className="w-24 text-sm px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Default Due Days */}
                    {/* <div className="flex items-center justify-between rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-4">
                        <div>
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Default Due Days</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Payment due after how many days</p>
                        </div>
                        <input
                            type="number"
                            // value={dueDays}
                            // onChange={(e) => setDueDays(e.target.value)}
                            min={0}
                            className="w-20 text-sm px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div> */}

                    {/* Default GST Type */}
                    {/* <div className="flex items-center justify-between rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-4">
                        <div>
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Default GST Type</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Applied when creating new invoice</p>
                        </div>
                        <CustomToggle
                            activeColor="green"
                            inactiveColor="blue"
                            option={["CGST/SGST", "IGST"]}
                        // value={gstType}
                        // onChange={setGstType}
                        />
                    </div> */}

                    {/* Show Signature */}
                    {/* <div className="flex items-center justify-between rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-4">
                        <div>
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Show Signature</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Display signature on invoice</p>
                        </div>
                        <CustomToggle
                            activeColor="green"
                            inactiveColor="blue"
                            option={["Yes", "No"]}
                        // value={showSignature}
                        // onChange={setShowSignature}
                        />
                    </div> */}

                    {/* Terms & Conditions */}
                    <div className="flex flex-col gap-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-4">
                        <div>
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Terms & Conditions</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Default text shown on every invoice</p>
                        </div>
                        <textarea
                            value={data.terms}
                            onChange={(e) => handleChange(e)}
                            rows={3}
                            name="terms"
                            placeholder="e.g. Goods once sold will not be taken back..."
                            className="text-sm px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                        />
                    </div>
                    <div className="rounded border border-dashed border-slate-300 dark:border-slate-600 p-4 text-center text-xs text-slate-400">
                        More settings coming soon…
                    </div>
                </div>
            </MainArea>
        </div >
    )
}

export default ChallanSettings