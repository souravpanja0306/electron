import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import PageTitle from '../../components/PageTitle';
import ActionArea from '../../components/ActionArea';
import MainArea from '../../components/MainArea';
import CustomButton from '../../components/CustomButton';
import CustomLoader from '../../components/CustomLoader';
import { inrToWords } from '../../utils/InWordConverter';

// Icon...
import {
  AiOutlinePlusSquare,
  AiOutlineFileAdd,
  AiOutlineMinusSquare,
  AiOutlinePrinter,
  AiOutlineTable,
  AiOutlineRollback,
} from "react-icons/ai";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Link, NavLink } from "react-router-dom";


// Stores...
import useInvoiceStore from '../../store/InvoiceStore';
import useMoneyReceiptStore from "../../store/MoneyReceiptStore";
import useCompanyStore from "../../store/CompnayStore";
import usePartyStore from "../../store/PartyStore"
import useReportStore from "../../store/ReportStore";


const Debtors = () => {
  let token = localStorage.getItem("token");
  const [searchParams] = useSearchParams();
  const back = searchParams.get("back");
  const navigate = useNavigate();

  const { reportData, getDebtors, reportLoading } = useReportStore();
  const { companyData, getAllCompany } = useCompanyStore();

  const [{ ledger, totals }, setDebtors] = useState({
    ledger: [],
    totals: {
      total_dr: 0,
      total_cr: 0,
      balance: 0
    }
  });

  const getDebtorsData = async () => {
    let result = await getDebtors({ token: token, id: "4" });
    if (result.body) {
      setDebtors(result.body);
    };
  };

  useEffect(() => {
    getDebtorsData(token);
    getAllCompany(token)
  }, []);

  if (reportLoading) return <CustomLoader />;
  return (
    <>
      <PageTitle>Debtors</PageTitle>
      <div className="flex flex-col gap-1">
        <ActionArea>
          {
            back ?
              <div onClick={() => navigate(-1)}>
                <CustomButton title={"Back"} color={"slate"}><AiOutlineRollback /></CustomButton>
              </div>
              : ""
          }
          <div>
            <CustomButton title={"Export"} color={"blue"} ><AiOutlinePrinter /></CustomButton>
          </div>
        </ActionArea>
        <MainArea>
          <table className="table-fixed w-full overflow-auto">
            <thead>
              <tr className="border-b border-slate-300 p-1 text-slate-600 dark:text-white text-sm font-semibold text-center">
                <th className="p-1 text-start truncate" colSpan="3">
                  <div className='flex gap-1 items-center h-8 min-w-16'>
                    Select Company
                    <select className="h-8 p-1 rounded text-slate-900 border border-slate-300 dark:border-slate-600">
                      {companyData?.map((item, index) => (
                        <option key={item.id} value={item.id} selected={index == 1} className='capitalize'>
                          {item.company_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </th>
                <th className="p-1 text-start truncate text-red-600">Balance: ₹{totals?.balance?.toLocaleString()}</th>
              </tr>
            </thead>
            <thead>
              <tr className="border-b border-slate-300 p-1 text-slate-600 dark:text-white text-sm font-semibold text-center">
                <th className="p-1 text-start truncate">Date</th>
                <th className="p-1 text-start truncate">Description</th>
                <th className="p-1 text-start truncate">Dr (₹)</th>
                <th className="p-1 text-start truncate">Cr (₹)</th>
              </tr>
            </thead>
            <tbody>
              {ledger?.map((item, index) => (
                <tr key={index} className="border-b border-slate-300 p-1 hover:bg-blue-200 dark:hover:bg-slate-600 duration-200 cursor-pointer">
                  <td className="p-1 text-start truncate capitalize">{item.date}</td>
                  <td className="p-1 text-start truncate capitalize">{item.description}</td>
                  <td className="p-1 text-start truncate capitalize">{item.dr ? item.dr.toLocaleString() : "-"}</td>
                  <td className="p-1 text-start truncate capitalize">{item.cr ? item.cr.toLocaleString() : "-"}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 dark:bg-slate-700 font-semibold">
              <tr className="border-t">
                <td className="p-1 text-start truncate capitalize" colSpan="2">Total</td>
                <td className="p-1 text-start truncate capitalize">₹{totals.total_dr.toLocaleString()}</td>
                <td className="p-1 text-start truncate capitalize">₹{totals.total_cr.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </MainArea>
      </div>
    </>
  )
}

export default Debtors