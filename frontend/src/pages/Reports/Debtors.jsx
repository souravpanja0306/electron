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
      total_invoice: 0,
      total_payment: 0,
      total_due: 0
    }
  });

  const getDebtorsData = async () => {
    let result = await getDebtors({ token: token });
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
                  <div className='flex gap-1 items-center'>
                    Select Company
                    <select className="min-w-36 h-8 p-1 rounded text-slate-900 border border-slate-300 dark:border-slate-600">
                      {companyData?.map((item, index) => (
                        <option key={item.id} value={item.id} selected={index == 1} className='capitalize'>
                          {item.company_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </th>
              </tr>
            </thead>
            <thead>
              <tr className="border-b border-slate-300 p-1 text-slate-600 dark:text-white text-sm font-semibold text-center">
                <th className="p-1 text-start truncate">Party Id</th>
                <th className="p-1 text-start truncate">Party Name</th>
                <th className="p-1 text-start truncate">Total Invoice (₹)</th>
                <th className="p-1 text-start truncate">Total Payment (₹)</th>
                <th className="p-1 text-start truncate">Total Due (₹)</th>
              </tr>
            </thead>
            <tbody>
              {ledger?.map((item, index) => (
                <tr key={index} className="border-b border-slate-300 p-1 hover:bg-blue-200 dark:hover:bg-slate-600 duration-200 cursor-pointer">
                  <td className="p-1 text-start truncate capitalize">{item.party_id}</td>
                  <td className="p-1 text-start truncate capitalize hover:underline text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                    <Link to={`/debtors/details-debtors?id=${item.party_id}&back=true`}>
                      {item.company_name ? item.company_name : "--"}
                    </Link>
                  </td>
                  <td className="p-1 text-start truncate capitalize">{item.total_invoice ? item.total_invoice.toLocaleString("en-IN", {
                    style: "currency",
                    currency: "INR",
                  }) : "0.00"}</td>
                  <td className="p-1 text-start truncate capitalize">{item.total_payment ? item.total_payment.toLocaleString("en-IN", {
                    style: "currency",
                    currency: "INR",
                  }) : "0.00"}</td>
                  <td className="p-1 text-start truncate capitalize">{item.total_due ? item.total_due.toLocaleString("en-IN", {
                    style: "currency",
                    currency: "INR",
                  }) : "0.00"}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 dark:bg-slate-700 font-semibold">
              <tr className="border-t">
                <td className="p-1 text-start truncate capitalize" colSpan="2">Total</td>
                <td className="p-1 text-start truncate capitalize">{totals?.total_invoice.toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                })}</td>
                <td className="p-1 text-start truncate capitalize">{totals?.total_payment.toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                })}</td>
                <td className="p-1 text-start truncate capitalize">{totals?.total_due.toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                })}</td>
              </tr>
              <tr className="border-t">
                <td className="p-1 text-start truncate capitalize text-red-600" colSpan="5">
                  In Words : {inrToWords(totals?.total_due)}.
                </td>
              </tr>
            </tfoot>
          </table>
        </MainArea>
      </div>
    </>
  )
}

export default Debtors