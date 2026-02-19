import React from 'react'
import PageTitle from '../../components/PageTitle'

const Dashboard = () => {
    return (
        <div className="flex flex-col w-full gap-4">

            <PageTitle>Dashboard</PageTitle>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                {/* Total Debtors */}
                <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl p-4">
                    <p className="text-xs text-slate-400 uppercase">Total Debtors</p>
                    <h2 className="text-2xl font-semibold text-blue-400 mt-1">
                        ₹1,25,000
                    </h2>
                </div>

                {/* Overdue Debtors */}
                <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl p-4">
                    <p className="text-xs text-slate-400 uppercase">Overdue Debtors</p>
                    <h2 className="text-2xl font-semibold text-red-400 mt-1">
                        ₹35,000
                    </h2>
                </div>

                {/* Total Creditors */}
                <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl p-4">
                    <p className="text-xs text-slate-400 uppercase">Total Creditors</p>
                    <h2 className="text-2xl font-semibold text-green-400 mt-1">
                        ₹80,000
                    </h2>
                </div>

                {/* Overdue Creditors */}
                <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl p-4">
                    <p className="text-xs text-slate-400 uppercase">Overdue Creditors</p>
                    <h2 className="text-2xl font-semibold text-yellow-400 mt-1">
                        ₹20,000
                    </h2>
                </div>

            </div>

            {/* Summary Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Aging Summary */}
                <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl p-4">
                    <h3 className="text-slate-300 font-medium mb-3">Debtor Aging</h3>
                    <ul className="text-sm text-slate-400 space-y-1">
                        <li>0–30 Days: ₹40,000</li>
                        <li>31–60 Days: ₹30,000</li>
                        <li>61–90 Days: ₹20,000</li>
                        <li>90+ Days: ₹35,000</li>
                    </ul>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl p-4">
                    <h3 className="text-slate-300 font-medium mb-3">Creditor Aging</h3>
                    <ul className="text-sm text-slate-400 space-y-1">
                        <li>0–30 Days: ₹25,000</li>
                        <li>31–60 Days: ₹20,000</li>
                        <li>61–90 Days: ₹15,000</li>
                        <li>90+ Days: ₹20,000</li>
                    </ul>
                </div>

            </div>

        </div>
    )
}

export default Dashboard