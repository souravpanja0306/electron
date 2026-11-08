import React, { useEffect } from 'react';
import { AiOutlineReload } from 'react-icons/ai';
import { toast } from 'sonner';
import ActionArea from '../../components/ActionArea';
import CustomButton from '../../components/CustomButton';
import MainArea from '../../components/MainArea';
import PageTitle from '../../components/PageTitle';
import { inputCls } from '../../components/FormKit';
import {
  FilterSidebar, FilterToggleButton, FilterSection, ChipGroup, useFilterPanel, matchText,
} from '../../components/ListKit';
import useAuthStore from '../../store/AuthStore';
import useCompanyStore from '../../store/CompanyStore';
import useReportStore from '../../store/ReportStore';
import useClientFilters from '../../hooks/useClientFilters';
import useShortcuts from '../../hooks/useShortcuts';

const currency = (value) => Number(value || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });

const BALANCE_OPTIONS = [
  { value: 'due', label: 'Outstanding' },
  { value: 'settled', label: 'Settled' },
];

const sum = (rows, key) => rows.reduce((total, row) => total + (Number(row[key]) || 0), 0);

const Creditors = () => {
  const { token } = useAuthStore();
  const { companyData, getAllCompany } = useCompanyStore();
  const { getCreditors, reportLoading } = useReportStore();
  const [ledger, setLedger] = React.useState([]);
  const [totals, setTotals] = React.useState({ total_bill: 0, total_payment: 0, total_due: 0 });

  const panel = useFilterPanel();
  const { filters, onFilterChange, filtered } = useClientFilters(
    ledger,
    { search: '', company_id: '', balance: '' },
    (item, f) =>
      matchText(f.search, item.company_name) &&
      (!f.balance || (f.balance === 'due' ? Number(item.total_due) > 0 : Number(item.total_due) <= 0))
  );
  const companyId = filters.company_id;
  const clear = (name) => () => onFilterChange({ target: { name, value: '' } });

  // Supplier search / balance filters run here; the company filter is applied by the server.
  const locallyFiltered = Boolean(filters.search.trim() || filters.balance);
  const shown = locallyFiltered
    ? { total_bill: sum(filtered, 'total_bill'), total_payment: sum(filtered, 'total_payment'), total_due: sum(filtered, 'total_due') }
    : totals;

  const loadCreditors = async () => {
    try {
      const result = await getCreditors({ token, company_id: companyId });
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

  const handleRefresh = async () => {
    await loadCreditors();
    toast.info('Data refreshed.');
  };

  useShortcuts({ f: () => panel.openAndFocus() });

  const summary = [
    { label: 'Supplier Bills', value: shown.total_bill, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Paid', value: shown.total_payment, color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Outstanding', value: shown.total_due, color: 'text-red-600 dark:text-red-400' },
  ];

  return (
    <div className="flex flex-col gap-1">
      <PageTitle>Creditors</PageTitle>
      <div role="note" className="rounded-md border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 px-4 py-2.5 text-xs text-blue-800 dark:text-blue-200">
        Supplier bills (purchases) aren't recorded in MyERP yet, so there is nothing to show here. Creditors will appear once purchase entry is available.
      </div>
      <div className="flex items-start gap-2">
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <ActionArea>
            <div className="flex flex-wrap items-center justify-end w-full gap-2">
              <div className="flex items-center gap-1">
                <div onClick={handleRefresh}><CustomButton title="Refresh" color="slate"><AiOutlineReload /></CustomButton></div>
                <FilterToggleButton panel={panel} filters={filters} />
              </div>
            </div>
          </ActionArea>

          <div className="grid grid-cols-1 gap-1 md:grid-cols-3">
            {summary.map((item) => (
              <MainArea key={item.label}>
                <div className="p-3">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{item.label}</p>
                  <p className={`mt-1 text-xl font-bold tabular-nums ${item.color}`}>{reportLoading ? '...' : currency(item.value)}</p>
                </div>
              </MainArea>
            ))}
          </div>

          <MainArea>
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    <th className="p-2">Supplier</th>
                    <th className="p-2 text-right">Bills</th>
                    <th className="p-2 text-right">Paid</th>
                    <th className="p-2 text-right">Outstanding</th>
                  </tr>
                </thead>
                <tbody>
                  {reportLoading ? (
                    <tr><td className="p-8 text-center text-slate-500 dark:text-slate-400" colSpan={4}>Loading...</td></tr>
                  ) : filtered.length ? filtered.map((item) => (
                    <tr key={item.party_id} className="border-b border-slate-100 dark:border-slate-700/70 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="p-2 font-medium">{item.company_name || '--'}</td>
                      <td className="p-2 text-right tabular-nums">{currency(item.total_bill)}</td>
                      <td className="p-2 text-right tabular-nums text-emerald-600 dark:text-emerald-400">{currency(item.total_payment)}</td>
                      <td className="p-2 text-right tabular-nums font-semibold text-red-600 dark:text-red-400">{currency(item.total_due)}</td>
                    </tr>
                  )) : (
                    <tr><td className="p-8 text-center text-slate-500 dark:text-slate-400" colSpan={4}>
                      {ledger.length ? 'No creditors match these filters.' : 'No creditor transactions found.'}
                    </td></tr>
                  )}
                </tbody>
                {!reportLoading && filtered.length > 0 && (
                  <tfoot className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 font-semibold text-slate-900 dark:text-slate-100">
                    <tr>
                      <td className="p-2">Total</td>
                      <td className="p-2 text-right tabular-nums">{currency(shown.total_bill)}</td>
                      <td className="p-2 text-right tabular-nums text-emerald-600 dark:text-emerald-400">{currency(shown.total_payment)}</td>
                      <td className="p-2 text-right tabular-nums text-red-600 dark:text-red-400">{currency(shown.total_due)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </MainArea>
        </div>

        <FilterSidebar
          panel={panel}
          filters={filters}
          onChange={onFilterChange}
          searchPlaceholder="Search supplier..."
          resultCount={filtered.length}
          showDates={false}
        >
          <FilterSection title="Company" onClear={companyId ? clear('company_id') : undefined}>
            <select name="company_id" aria-label="Company" value={companyId} onChange={onFilterChange} className={inputCls}>
              <option value="">All companies</option>
              {companyData?.map((company) => (
                <option key={company.id} value={company.id}>{company.company_name}</option>
              ))}
            </select>
          </FilterSection>
          <FilterSection title="Balance" onClear={filters.balance ? clear('balance') : undefined}>
            <ChipGroup name="balance" label="Balance" value={filters.balance} onChange={onFilterChange} options={BALANCE_OPTIONS} />
          </FilterSection>
        </FilterSidebar>
      </div>
    </div>
  );
};

export default Creditors;
