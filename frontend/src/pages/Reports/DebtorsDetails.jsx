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
    AiOutlineDownload,
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
    const party_id = searchParams.get("id");
    const navigate = useNavigate();

    const { debtorDetails, getDebtorsDetails, debtorDetailsLoading } = useReportStore();
    const { companyData, getAllCompany } = useCompanyStore();

    const [{ ledger, totals, party }, setDebtors] = useState({
        ledger: [],
        party: {},
        totals: {
            total_dr: 0,
            total_cr: 0,
            balance: 0
        }
    });

    const getDebtorsData = async () => {
        let result = await getDebtorsDetails({ token: token, id: party_id });
        if (result.body) {
            setDebtors(result.body);
        };
    };

    useEffect(() => {
        getDebtorsData(token);
        // getAllCompany(token)
    }, []);

    if (debtorDetailsLoading) return <CustomLoader />;
    return (
        <>
            <PageTitle>Customer Ledger </PageTitle>
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
                        <CustomButton title={"Export"} color={"blue"} ><AiOutlineDownload /></CustomButton>
                    </div>
                </ActionArea>
                <MainArea>
                    <table className="table-fixed w-full overflow-auto">
                        <thead>
                            <tr className="border-b border-slate-300 p-1 text-slate-600 dark:text-white text-sm font-semibold text-center">
                                <th className="p-1 text-start truncate" colSpan="3">
                                    Customer ledger of "{(party?.company_name)?.toUpperCase()}"
                                </th>
                                <th className="p-1 text-start truncate text-red-600">Total Due: {totals?.balance?.toLocaleString("en-IN", {
                                    style: "currency",
                                    currency: "INR",
                                })}</th>
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
                                    <td className="p-1 text-start truncate capitalize">{item?.date}</td>
                                    <td className="p-1 text-start truncate capitalize">
                                        <Link to={`/view-invoice/details?id=${(item?.description).split("#")[1]}&back=true`}>
                                            {item?.description}
                                        </Link>
                                    </td>
                                    <td className="p-1 text-start truncate capitalize">{item?.dr ? item?.dr.toLocaleString("en-IN", {
                                        style: "currency",
                                        currency: "INR",
                                    }) : "0.00"}</td>
                                    <td className="p-1 text-start truncate capitalize">{item?.cr ? item?.cr.toLocaleString("en-IN", {
                                        style: "currency",
                                        currency: "INR",
                                    }) : "0.00"}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-slate-50 dark:bg-slate-700 font-semibold">
                            <tr className="border-t">
                                <td className="p-1 text-start truncate capitalize" colSpan="2">Total</td>
                                <td className="p-1 text-start truncate capitalize">{totals.total_dr.toLocaleString("en-IN", {
                                    style: "currency",
                                    currency: "INR",
                                })}</td>
                                <td className="p-1 text-start truncate capitalize">{totals.total_cr.toLocaleString("en-IN", {
                                    style: "currency",
                                    currency: "INR",
                                })}</td>
                            </tr>
                            <tr className="border-t">
                                <td className="p-1 text-start truncate capitalize text-red-600" colSpan="4">
                                    In Words: {inrToWords(totals?.balance)}.
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