import React, { useEffect } from 'react';
import PageTitle from '../../components/PageTitle';
import { 
    AiOutlineTeam, 
    AiOutlineShop, 
    AiOutlineClockCircle, 
    AiOutlineCheckCircle,
    AiOutlineArrowUp,
    AiOutlineArrowDown
} from 'react-icons/ai';
import useReportStore from '../../store/ReportStore';
import CustomLoader from '../../components/CustomLoader';

const Dashboard = () => {
    const { 
        dashboardStats, 
        dashboardStatsLoading, 
        getDashboardStats 
    } = useReportStore();

    useEffect(() => {
        const token = localStorage.getItem("token");
        getDashboardStats({ token });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (dashboardStatsLoading || !dashboardStats) {
        return <CustomLoader />;
    }

    const { kpi, aging } = dashboardStats;

    const kpiData = [
        {
            title: "Total Debtors",
            value: `₹${kpi.totalDebtors.toLocaleString()}`,
            icon: <AiOutlineTeam size={24} />,
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-900/20",
            border: "border-blue-200 dark:border-blue-800",
            trend: "+0.0%",
            isUp: true
        },
        {
            title: "Overdue Debtors",
            value: `₹${kpi.overdueDebtors.toLocaleString()}`,
            icon: <AiOutlineClockCircle size={24} />,
            color: "text-red-500",
            bg: "bg-red-50 dark:bg-red-900/20",
            border: "border-red-200 dark:border-red-800",
            trend: "+0.0%",
            isUp: true
        },
        {
            title: "Total Creditors",
            value: `₹${kpi.totalCreditors.toLocaleString()}`,
            icon: <AiOutlineShop size={24} />,
            color: "text-green-500",
            bg: "bg-green-50 dark:bg-green-900/20",
            border: "border-green-200 dark:border-green-800",
            trend: "-0.0%",
            isUp: false
        },
        {
            title: "Overdue Creditors",
            value: `₹${kpi.overdueCreditors.toLocaleString()}`,
            icon: <AiOutlineCheckCircle size={24} />,
            color: "text-yellow-500",
            bg: "bg-yellow-50 dark:bg-yellow-900/20",
            border: "border-yellow-200 dark:border-yellow-800",
            trend: "-0.0%",
            isUp: false
        }
    ];

    const AgingSection = ({ title, data, icon, total, colorPrefix }) => (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-slate-400">{icon}</span>
                    <h3 className="text-[13px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</h3>
                </div>
                <button className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase hover:underline">View Details</button>
            </div>
            <div className="p-5 flex-1 space-y-5">
                {data.map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            <span>{item.label}</span>
                            <span className="font-bold text-slate-700 dark:text-slate-200">₹{(item.value || 0).toLocaleString()}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                                className={`h-full ${colorPrefix}-${idx === 3 ? '400' : 500 - (idx * 100)} rounded-full transition-all duration-1000`} 
                                style={{ width: `${total > 0 ? ((item.value || 0) / total) * 100 : 0}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col w-full gap-6 select-none animate-in fade-in duration-500">
            
            <div className="flex justify-between items-end border-b border-slate-100 dark:border-slate-800 pb-2">
                <PageTitle>Financial Overview</PageTitle>
                <div className="text-[10px] font-medium text-slate-400 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 mb-1">
                    Last Updated: {new Date().toLocaleDateString()}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiData.map((kpi, idx) => (
                    <div 
                        key={idx} 
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all group"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className={`p-2 rounded-lg ${kpi.bg} ${kpi.color} transition-colors group-hover:scale-110 duration-300`}>
                                {kpi.icon}
                            </div>
                            <div className={`flex items-center gap-0.5 text-[10px] font-bold ${kpi.isUp ? 'text-green-500' : 'text-red-500'} bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded-full`}>
                                {kpi.isUp ? <AiOutlineArrowUp /> : <AiOutlineArrowDown />}
                                {kpi.trend}
                            </div>
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{kpi.title}</p>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white mt-0.5 tabular-nums">
                                {kpi.value}
                            </h2>
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <AgingSection 
                    title="Debtor Aging Summary" 
                    data={aging.debtors} 
                    icon={<AiOutlineTeam size={18} />}
                    total={kpi.totalDebtors}
                    colorPrefix="bg-blue"
                />
                <AgingSection 
                    title="Creditor Aging Summary" 
                    data={aging.creditors} 
                    icon={<AiOutlineShop size={18} />}
                    total={kpi.totalCreditors}
                    colorPrefix="bg-green"
                />
            </div>

            {/* Recent Activity Mockup */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                    <h3 className="text-[13px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Quick Actions</h3>
                </div>
                <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {[
                        { label: "New Invoice", color: "blue" },
                        { label: "Add Party", color: "slate" },
                        { label: "New Receipt", color: "green" },
                        { label: "View Reports", color: "yellow" },
                        { label: "Expenses", color: "red" },
                        { label: "Settings", color: "slate" }
                    ].map((btn, i) => (
                        <div key={i} className={`p-2 rounded border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-center cursor-pointer transition-all group`}>
                            <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">{btn.label}</p>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default Dashboard;