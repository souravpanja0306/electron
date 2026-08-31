import React, { useEffect } from 'react';
import { AiOutlineDiff, AiOutlineFileText, AiOutlineWallet } from 'react-icons/ai';
import PageTitle from '../../components/PageTitle';
import MainArea from '../../components/MainArea';
import useAuthStore from '../../store/AuthStore';
import useReportStore from '../../store/ReportStore';

const Dashboard = () => {
  const { token } = useAuthStore();
  const { dashboardStats, dashboardStatsLoading, getDashboardStats } = useReportStore();

  useEffect(() => {
    getDashboardStats({ token });
  }, []);

  const counts = dashboardStats?.documentCounts || {};
  const stats = [
    { label: 'Challans', value: counts.challans || 0, icon: AiOutlineFileText, color: 'text-blue-600' },
    { label: 'Invoices', value: counts.invoices || 0, icon: AiOutlineDiff, color: 'text-green-600' },
    { label: 'Money Receipts', value: counts.moneyReceipts || 0, icon: AiOutlineWallet, color: 'text-yellow-600' },
  ];

  return (
    <div className="flex flex-col gap-1">
      <PageTitle>Dashboard</PageTitle>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <MainArea key={label}>
            <div className="flex items-center justify-between gap-3 p-3">
              <div>
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-white">
                  {dashboardStatsLoading ? '...' : value}
                </p>
              </div>
              <Icon className={`text-3xl ${color}`} />
            </div>
          </MainArea>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
