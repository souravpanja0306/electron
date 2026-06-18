import React, { useEffect, useState } from 'react'
import PageTitle from '../components/PageTitle';
import ActionArea from '../components/ActionArea';
import MainArea from '../components/MainArea';
import CustomToggle from '../components/CustomToggle';
import { toast } from 'sonner';
import { dumpDatabase, resetAllTables } from '../services/adminService';
import useAuthStore from '../store/AuthStore';
import CustomButton from '../components/CustomButton';
import { AiOutlineDownload, AiOutlineDelete } from 'react-icons/ai';

const Setting = () => {
    const { token } = useAuthStore();
    const [prefix, setPrefix] = useState("");
    const [suffix, setSuffix] = useState("");
    const [active, setActive] = useState(0);
    const [light, setLight] = useState(true);
    const [theme, setTheme] = useState("light");

    const getThemeData = async () => {
        const getTheme = await window.api?.getItem("theme");
        if (getTheme) {
            setTheme(getTheme);
            setLight(getTheme === "light");
        }
    };

    useEffect(() => {
        getThemeData();
    }, []);

    useEffect(() => {
        if (theme === "dark") {
            setLight(false);
            document.documentElement.classList.add("dark");
        } else {
            setLight(true);
            document.documentElement.classList.remove("dark");
        };
    }, [theme]);

    const changeTheme = async (e) => {
        const newTheme = e ? "light" : "dark";
        setTheme(newTheme);
        setLight(e);
        window.api?.setItem("theme", newTheme);
    };

    const handleDumpDB = async () => {
        try {
            await dumpDatabase();
            toast.success("Database backup started.");
        } catch (error) {
            toast.error("Failed to dump database.");
        }
    };

    const handleResetDB = async () => {
        if (window.confirm("Are you sure you want to reset ALL tables? This cannot be undone.")) {
            try {
                // Assuming we want to reset common tables, or maybe the backend handles "all" if we pass something specific
                // For now, let's assume we need to list them or the backend needs a specific trigger.
                // The current backend reset-all-table takes tableNames and drops them.
                // If the user wants to "Dump" meaning clear, maybe they want to clear everything.
                const tablesToReset = "parties,invoices,challans,money_receipts,gst,hsn_sac";
                const res = await resetAllTables(token, tablesToReset);
                if (res.status === 200) {
                    toast.success(res.message);
                } else {
                    toast.error(res.message);
                }
            } catch (error) {
                toast.error("Failed to reset database.");
            }
        }
    };

    return (
        <div className='flex flex-col gap-1'>
            <PageTitle>Settings</PageTitle>
            <div className="flex border-slate-700 overflow-x-auto">
                <span
                    onClick={() => setActive(0)}
                    className={`cursor-pointer px-4 py-2 text-sm font-medium transition whitespace-nowrap ${active === 0 ? "bg-slate-200 dark:bg-slate-900 border-b-2 border-blue-600 text-blue-600 dark:text-white" : "text-slate-800 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-200"}`}
                >Appearance/Theme</span>
                <span
                    onClick={() => setActive(1)}
                    className={`cursor-pointer px-4 py-2 text-sm font-medium transition whitespace-nowrap ${active === 1 ? "bg-slate-200 dark:bg-slate-900 border-b-2 border-blue-600 text-blue-600 dark:text-white" : "text-slate-800 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-200"}`}
                >Invoice Setup
                </span>
                <span
                    onClick={() => setActive(2)}
                    className={`cursor-pointer px-4 py-2 text-sm font-medium transition whitespace-nowrap ${active === 2 ? "bg-slate-200 dark:bg-slate-900 border-b-2 border-blue-600 text-blue-600 dark:text-white" : "text-slate-800 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-200"}`}
                >Challan Setup
                </span>
                <span
                    onClick={() => setActive(3)}
                    className={`cursor-pointer px-4 py-2 text-sm font-medium transition whitespace-nowrap ${active === 3 ? "bg-slate-200 dark:bg-slate-900 border-b-2 border-blue-600 text-blue-600 dark:text-white" : "text-slate-800 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-200"}`}
                >Print Setup</span>
                <span
                    onClick={() => setActive(4)}
                    className={`cursor-pointer px-4 py-2 text-sm font-medium transition whitespace-nowrap ${active === 4 ? "bg-slate-200 dark:bg-slate-900 border-b-2 border-blue-600 text-blue-600 dark:text-white" : "text-slate-800 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-200"}`}
                >Database</span>
            </div>

            {active === 0 &&
                <MainArea>
                    <div className="w-full max-w-xl space-y-1">
                        <div className="flex items-center justify-between rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-4">
                            <div>
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Theme</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Switch between light and dark mode</p>
                            </div>
                            <CustomToggle
                                activeColor="green"
                                inactiveColor="blue"
                                option={["Dark", "Light"]}
                                value={light}
                                onChange={changeTheme}
                            />
                        </div>
                        <div className="rounded border border-dashed border-slate-300 dark:border-slate-600 p-4 text-center text-xs text-slate-400">
                            More settings coming soon…
                        </div>
                    </div>
                </MainArea>
            }
            {active === 1 &&
                <MainArea>
                    <div className="w-full max-w-xl space-y-1">
                        <div className="flex items-center justify-between rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-4">
                            <div>
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">GST</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Switch between GST and NON-GST invoice</p>
                            </div>
                            <CustomToggle
                                activeColor="green"
                                inactiveColor="blue"
                                option={["GST", "NON-GST"]}
                                value={light}
                                onChange={changeTheme}
                            />
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
                                    value={prefix}
                                    onChange={(e) => setPrefix(e.target.value)}
                                    className="w-24 text-sm px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <span className="text-slate-400 text-sm">00001</span>
                                <input
                                    type="text"
                                    placeholder="Suffix"
                                    value={suffix}
                                    onChange={(e) => setSuffix(e.target.value)}
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
            }
            {active === 2 &&
                <MainArea>
                    <div className="w-full max-w-xl space-y-1">
                        <div className="flex items-center justify-between rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-4">
                            <div>
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">GST</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Switch between GST and NON-GST invoice</p>
                            </div>
                            <CustomToggle
                                activeColor="green"
                                inactiveColor="blue"
                                option={["GST", "NON-GST"]}
                                value={light}
                                onChange={changeTheme}
                            />
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
                                    value={prefix}
                                    onChange={(e) => setPrefix(e.target.value)}
                                    className="w-24 text-sm px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <span className="text-slate-400 text-sm">00001</span>
                                <input
                                    type="text"
                                    placeholder="Suffix"
                                    value={suffix}
                                    onChange={(e) => setSuffix(e.target.value)}
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
            }
            {active === 3 &&
                <MainArea>
                    <div className="w-full max-w-xl space-y-1">
                        <div className="flex items-center justify-between rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-4">
                            <div>
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Theme</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Switch between light and dark mode</p>
                            </div>
                            <CustomToggle
                                activeColor="green"
                                inactiveColor="blue"
                                option={["Dark", "Light"]}
                                value={light}
                                onChange={changeTheme}
                            />
                        </div>
                        <div className="rounded border border-dashed border-slate-300 dark:border-slate-600 p-4 text-center text-xs text-slate-400">
                            More settings coming soon…
                        </div>
                    </div>
                </MainArea>
            }
            {active === 4 &&
                <MainArea>
                    <div className="w-full max-w-xl space-y-1">
                        <div className="flex items-center justify-between rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-4">
                            <div>
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Backup Database</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Download the current database file for backup</p>
                            </div>
                            <div onClick={handleDumpDB}>
                                <CustomButton title="Export DB" color="blue">
                                    <AiOutlineDownload />
                                </CustomButton>
                            </div>
                        </div>

                        <div className="flex items-center justify-between rounded border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-900/10 p-4">
                            <div>
                                <p className="text-sm font-medium text-red-800 dark:text-red-400">Reset All Data</p>
                                <p className="text-xs text-red-500 dark:text-red-500/70">Danger: This will delete all your records permanently.</p>
                            </div>
                            <div onClick={handleResetDB}>
                                <CustomButton title="Reset DB" color="red">
                                    <AiOutlineDelete />
                                </CustomButton>
                            </div>
                        </div>

                        <div className="rounded border border-dashed border-slate-300 dark:border-slate-600 p-4 text-center text-xs text-slate-400">
                            Manage your database records and schema here.
                        </div>
                    </div>
                </MainArea>
            }
        </div>
    )
}

export default Setting