import React, { useEffect, useState } from 'react';
import { AiOutlineReload } from 'react-icons/ai';
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

const Creditors = () => {
  const { token } = useAuthStore();
  const { companyData, getAllCompany } = useCompanyStore();
  const { getCreditors, reportLoading } = useReportStore();
  const [ledger, setLedger] = useState([]);
  const [totals, setTotals] = useState({ total_bill: 0, total_payment: 0, total_due: 0 });
  const [companyId, setCompanyId] = useState('');

  const loadCreditors = async (selectedCompanyId = companyId) => {
    try {
      const result = await getCreditors({ token, company_id: selectedCompanyId });
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
    loadCreditors();
  }, [companyId]);

  if (reportLoading) return <CustomLoader />;

  const summary = [
    { label: 'Supplier Bills', value: totals.total_bill, color: 'text-blue-600' },
    { label: 'Paid', value: totals.total_payment, color: 'text-green-600' },
    { label: 'Outstanding', value: totals.total_due, color: 'text-red-600' },
  ];

  return (
    <div className="flex flex-col gap-1">
      <PageTitle>Creditors</PageTitle>
      <ActionArea>
        <div onClick={loadCreditors}><CustomButton title="Refresh" color="blue"><AiOutlineReload /></CustomButton></div>
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
            <thead><tr className="border-b border-slate-300 text-left text-xs font-semibold text-slate-500 dark:border-slate-600"><th className="p-2">Supplier</th><th className="p-2 text-right">Bills</th><th className="p-2 text-right">Paid</th><th className="p-2 text-right">Outstanding</th></tr></thead>
            <tbody>{ledger.length ? ledger.map((item) => <tr key={item.party_id} className="border-b border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200"><td className="p-2 font-medium">{item.company_name || '--'}</td><td className="p-2 text-right">{currency(item.total_bill)}</td><td className="p-2 text-right text-green-600">{currency(item.total_payment)}</td><td className="p-2 text-right font-semibold text-red-600">{currency(item.total_due)}</td></tr>) : <tr><td className="p-8 text-center text-slate-500" colSpan={4}>No creditor transactions found.</td></tr>}</tbody>
          </table>
        </div>
      </MainArea>
    </div>
  );
};

export default Creditors;
