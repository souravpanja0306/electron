import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';

// Icon...
import {
  AiOutlineFileAdd,
  AiOutlineSync,
  AiOutlinePrinter,
  AiOutlineDownload,
  AiOutlineFilter,
  AiOutlineDelete
} from "react-icons/ai";

// Components...
import PageTitle from '../../components/PageTitle';
import ActionArea from '../../components/ActionArea';
import MainArea from '../../components/MainArea';
import CustomButton from '../../components/CustomButton';
import CustomLoader from "../../components/CustomLoader";

// Stores...
import useInvoiceStore from '../../store/InvoiceStore';
import useMoneyReceiptStore from "../../store/MoneyReceiptStore";
import useCompanyStore from "../../store/CompnayStore";
import usePartyStore from "../../store/PartyStore";
import useReportStore from "../../store/ReportStore";


const Debtors = () => {
  let token = localStorage.getItem("token");
  const { reportData, getDebtors, reportLoading } = useReportStore();

  const [{ rows, totals }, setDebtors] = useState({
    rows: [],
    totals: {
      total_dr: 0,
      total_cr: 0,
      balance: 0
    }
  });

  const getDebtorsData = async () => {
    let result = await getDebtors({ token: token, id: "1" });
    if (result.body) {
      setDebtors(result.body);
    };
  };

  useEffect(() => {
    getDebtorsData();
  }, []);

  if (reportLoading) return <CustomLoader />;
  return (
    <div className="p-6 bg-white dark:bg-slate-800 min-h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
          Debtor Ledger
        </h2>
        <div className="text-sm text-slate-600 dark:text-slate-300">
          Balance:
          <span className="ml-2 font-semibold text-red-600">
            ₹ {totals.balance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-right">Dr (₹)</th>
              <th className="p-3 text-right">Cr (₹)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item, index) => (
              <tr key={index} className="border-t dark:border-slate-600">
                <td className="p-3">{item.date}</td>
                <td className="p-3">{item.description}</td>
                <td className="p-3 text-right text-blue-600">
                  {item.dr ? item.dr.toLocaleString() : "-"}
                </td>
                <td className="p-3 text-right text-green-600">
                  {item.cr ? item.cr.toLocaleString() : "-"}
                </td>
              </tr>
            ))}
          </tbody>

          {/* Totals Row */}
          <tfoot className="bg-slate-50 dark:bg-slate-700 font-semibold">
            <tr className="border-t">
              <td className="p-3" colSpan="2">Total</td>
              <td className="p-3 text-right text-blue-700">
                ₹ {totals.total_dr.toLocaleString()}
              </td>
              <td className="p-3 text-right text-green-700">
                ₹ {totals.total_cr.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

export default Debtors