import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

// Icons...
import { AiOutlineDownload, AiOutlineDelete } from 'react-icons/ai';

// Components...
import PageTitle from '../../components/PageTitle';
import ActionArea from '../../components/ActionArea';
import MainArea from '../../components/MainArea';
import CustomToggle from '../../components/CustomToggle';
import CustomButton from '../../components/CustomButton';

// Stores...
import useAuthStore from '../../store/AuthStore';
import useSettingStore from '../../store/SettingStore';

const DatabaseSettings = () => {
    const { token } = useAuthStore();
    const { dumpDatabase, resetAllTables } = useSettingStore();

    const handleDumpDB = async () => {
        try {
            let result = await dumpDatabase();
            toast.success("Database backup started.");
        } catch (error) {
            toast.error("Failed to dump database.");
        };
    };

    const handleResetDB = async () => {
        if (window.confirm("Are you sure you want to reset ALL tables? This cannot be undone.")) {
            try {
                const tablesToReset = "parties,invoices,challans,money_receipts,gst,hsn_sac";
                const res = await resetAllTables({ token, tablesToReset });
                if (res.status === 200) {
                    toast.success(res.message);
                } else {
                    toast.error(res.message);
                };
            } catch (error) {
                toast.error("Failed to reset database.");
            };
        };
    };

    return (
        <div className='flex flex-col gap-1'>
            <PageTitle>Database Setup</PageTitle>
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
        </div>
    )
}

export default DatabaseSettings