import React, { useEffect, useState } from 'react';
import { AiOutlineReload, AiOutlineRollback } from 'react-icons/ai';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import ActionArea from '../../components/ActionArea';
import CustomButton from '../../components/CustomButton';
import CustomLoader from '../../components/CustomLoader';
import MainArea from '../../components/MainArea';
import PageTitle from '../../components/PageTitle';
import SearchableSelect from '../../components/SearchableSelect';
import useAuthStore from '../../store/AuthStore';
import useCompanyStore from '../../store/CompanyStore';
import useReportStore from '../../store/ReportStore';

const currency = (value) => Number(value || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });

const Debtors = () => {
  const { token } = useAuthStore();
  const { companyData, getAllCompany } = useCompanyStore();
  const { getDebtors, reportLoading } = useReportStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [ledger, setLedger] = useState([]);
  const [totals, setTotals] = useState({ total_invoice: 0, total_payment: 0, total_due: 0 });
  const [companyId, setCompanyId] = useState('');

  const loadDebtors = async (selectedCompanyId = companyId) => {
    try {
      const result = await getDebtors({ token, company_id: selectedCompanyId });
      if (result.status === 200) {
        setLedger(result.body.ledger || []);
        setTotals(result.body.totals || {});
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllCompany(token);
  }, []);

  useEffect(() => {
    loadDebtors();
  }, [companyId]);

  if (reportLoading) return <CustomLoader />;

  const summary = [
    { label: 'Invoiced', value: totals.total_invoice, color: 'text-blue-600' },
    { label: 'Received', value: totals.total_payment, color: 'text-green-600' },
    { label: 'Outstanding', value: totals.total_due, color: 'text-red-600' },
  ];

  return (
    <div className="flex flex-col gap-1">
      <PageTitle>Debtors</PageTitle>
      <ActionArea>
        {searchParams.get('back') && <div onClick={() => navigate(-1)}><CustomButton title="Back" color="slate"><AiOutlineRollback /></CustomButton></div>}
        <div onClick={loadDebtors}><CustomButton title="Refresh" color="blue"><AiOutlineReload /></CustomButton></div>
        <div className="w-52">
          <SearchableSelect
            name="company_id"
            value={companyId}
            onChange={(event) => setCompanyId(event.target.value)}
            options={companyData?.map((company) => ({ id: company.id, label: company.company_name }))}
            placeholder="All Companies"
          />
        </div>
      </ActionArea>

      <div className="grid grid-cols-1 gap-1 md:grid-cols-3">
        {summary.map((item) => <MainArea key={item.label}><div className="p-3"><p className="text-xs font-medium text-slate-500">{item.label}</p><p className={`mt-1 text-xl font-bold ${item.color}`}>{currency(item.value)}</p></div></MainArea>)}
      </div>

      <MainArea>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead><tr className="border-b border-slate-300 text-left text-xs font-semibold text-slate-500 dark:border-slate-600"><th className="p-2">Party</th><th className="p-2 text-right">Invoiced</th><th className="p-2 text-right">Received</th><th className="p-2 text-right">Outstanding</th></tr></thead>
            <tbody>
              {ledger.length ? ledger.map((item) => <tr key={item.party_id} className="border-b border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><td className="p-2 font-medium"><Link className="hover:text-blue-600 hover:underline" to={`/debtors/details-debtors?id=${item.party_id}&back=true${companyId ? `&company_id=${companyId}` : ''}`}>{item.company_name || '--'}</Link></td><td className="p-2 text-right">{currency(item.total_invoice)}</td><td className="p-2 text-right text-green-600">{currency(item.total_payment)}</td><td className="p-2 text-right font-semibold text-red-600">{currency(item.total_due)}</td></tr>) : <tr><td className="p-8 text-center text-slate-500" colSpan={4}>No debtor transactions found.</td></tr>}
            </tbody>
            {ledger.length > 0 && <tfoot className="border-t border-slate-300 bg-slate-50 font-semibold dark:border-slate-600 dark:bg-slate-800"><tr><td className="p-2">Total</td><td className="p-2 text-right">{currency(totals.total_invoice)}</td><td className="p-2 text-right text-green-600">{currency(totals.total_payment)}</td><td className="p-2 text-right text-red-600">{currency(totals.total_due)}</td></tr></tfoot>}
          </table>
        </div>
      </MainArea>
    </div>
  );
};

export default Debtors;
