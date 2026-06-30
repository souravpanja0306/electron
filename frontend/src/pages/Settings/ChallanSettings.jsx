import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

// Icons...
import { AiOutlineDownload, AiOutlineDelete } from 'react-icons/ai';

// Components...
import CustomButton from '../../components/CustomButton';
import PageTitle from '../../components/PageTitle';
import ActionArea from '../../components/ActionArea';
import MainArea from '../../components/MainArea';
import CustomToggle from '../../components/CustomToggle';

// Stores...
import useAuthStore from '../../store/AuthStore';

const ChallanSettings = () => {
    const { token } = useAuthStore();
    const [data, setData] = useState({
        prefix: "",
        suffix: "",
        starting: "",
    });

    return (
        <div className='flex flex-col gap-1'>
            <PageTitle>Challan Setup</PageTitle>
            <MainArea>
                <div className="w-full max-w-xl space-y-1">
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
                                // onChange={(e) => setPrefix(e.target.value)}
                                className="w-24 text-sm px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <input
                                type="text"
                                placeholder="Starting"
                                value={data.starting}
                                // onChange={(e) => setSuffix(e.target.value)}
                                className="w-24 text-sm px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <input
                                type="text"
                                placeholder="Suffix"
                                value={data.suffix}
                                // onChange={(e) => setSuffix(e.target.value)}
                                className="w-24 text-sm px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Default Due Days */}
                    <div className="flex items-center justify-between rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-4">
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
                    </div>

                    {/* Default GST Type */}
                    <div className="flex items-center justify-between rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-4">
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
                    </div>

                    {/* Show Signature */}
                    <div className="flex items-center justify-between rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-4">
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
                    </div>

                    {/* Terms & Conditions */}
                    <div className="flex flex-col gap-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-4">
                        <div>
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Terms & Conditions</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Default text shown on every invoice</p>
                        </div>
                        <textarea
                            // value={terms}
                            // onChange={(e) => setTerms(e.target.value)}
                            rows={3}
                            placeholder="e.g. Goods once sold will not be taken back..."
                            className="text-sm px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                        />
                    </div>
                    <div className="rounded border border-dashed border-slate-300 dark:border-slate-600 p-4 text-center text-xs text-slate-400">
                        More settings coming soon…
                    </div>
                </div>
            </MainArea>
        </div>
    )
}

export default ChallanSettings