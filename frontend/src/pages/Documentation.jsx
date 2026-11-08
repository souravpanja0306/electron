import React, { useState } from "react";
import { Link } from "react-router-dom";
import PageTitle from "../components/PageTitle";
import MainArea from "../components/MainArea";
import CustomButton from "../components/CustomButton";
import {
  AiOutlineCheckCircle,
  AiOutlineFileText,
  AiOutlinePlus,
  AiOutlineRight,
  AiOutlineSearch,
  AiOutlineWallet,
} from "react-icons/ai";

const services = [
  {
    id: "invoice",
    title: "Tax Invoice",
    shortTitle: "Create Invoice",
    description: "Create GST-ready invoices for completed sales or services.",
    icon: AiOutlineFileText,
    route: "/create-invoice",
    before: ["A customer or party record", "Products or services with GST / HSN details", "Invoice settings configured"],
    steps: ["Open Work → Tax Invoices → Create Invoice.", "Choose the company and select the customer or party.", "Add products or services, then enter quantity, rate, and tax.", "Review totals, payment terms, and notes before saving."],
    tip: "Create your party, product, GST, and HSN/SAC records first to make invoice creation faster.",
  },
  {
    id: "challan",
    title: "Delivery Challan",
    shortTitle: "Create Challan",
    description: "Prepare a delivery challan to record goods sent to a customer.",
    icon: AiOutlineWallet,
    route: "/create-challan",
    before: ["A customer or party record", "Goods and quantities being delivered", "Vehicle or transport details, if applicable"],
    steps: ["Open Work → Challans → Create Challan.", "Select the company and customer receiving the goods.", "Add the delivered items and their quantities.", "Enter delivery or transport information and save the challan."],
    tip: "Use a challan when goods move before the final invoice is issued.",
  },
  {
    id: "receipt",
    title: "Money Receipt",
    shortTitle: "Create Money Receipt",
    description: "Record payments received from customers against invoices or balances.",
    icon: AiOutlineWallet,
    route: "/create-money-receipts",
    before: ["The customer or party name", "Payment amount and date", "Payment mode and reference number"],
    steps: ["Open Work → Money Receipts → Create Money Receipts.", "Select the company and the party making the payment.", "Enter the received amount, payment mode, and reference.", "Verify the details and save the receipt."],
    tip: "Keep the bank, UTR, cheque, or cash reference for easy reconciliation later.",
  },
];

const Documentation = () => {
  const [activeService, setActiveService] = useState(services[0]);
  const Icon = activeService.icon;

  return (
    <>
      <PageTitle>Documentation</PageTitle>

      <div className="grid grid-cols-1 gap-1 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div className="flex flex-col gap-1">
          <PageTitle>Services</PageTitle>
          <MainArea>
            <nav className="flex w-full flex-col gap-1">
              {services.map((service) => {
                const ServiceIcon = service.icon;
                const isActive = activeService.id === service.id;
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setActiveService(service)}
                    className={`flex w-full items-center gap-2 rounded p-2 text-left text-xs transition ${isActive ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"}`}
                  >
                    <ServiceIcon className="text-base" />
                    <span className="flex-1 font-medium">{service.title}</span>
                    <AiOutlineRight />
                  </button>
                );
              })}
            </nav>
          </MainArea>
        </div>

        <div className="flex flex-col gap-1">
          <PageTitle>{activeService.title}</PageTitle>
          <MainArea>
            <div className="flex w-full flex-col gap-4 p-1 text-slate-600 dark:text-slate-100">
              <div className="flex flex-col justify-between gap-3 border-b border-slate-300 pb-3 dark:border-slate-600 sm:flex-row sm:items-center">
                <div className="flex items-start gap-2">
                  <Icon className="mt-0.5 text-xl text-blue-600" />
                  <div><p className="text-sm font-semibold">{activeService.shortTitle}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-300">{activeService.description}</p></div>
                </div>
                <Link to={activeService.route}><CustomButton title={activeService.shortTitle} color="blue"><AiOutlinePlus /></CustomButton></Link>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_230px]">
                <div>
                  <p className="mb-2 text-sm font-semibold">How to create</p>
                  <ol className="space-y-2">
                    {activeService.steps.map((step, index) => <li key={step} className="flex gap-2 text-xs leading-5"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-blue-600 text-[10px] font-bold text-white">{index + 1}</span><span>{step}</span></li>)}
                  </ol>
                </div>
                <div className="rounded border border-slate-300 bg-white p-3 dark:border-slate-600 dark:bg-slate-700">
                  <p className="mb-2 flex items-center gap-1 text-xs font-semibold"><AiOutlineCheckCircle className="text-green-600" /> Before you start</p>
                  <ul className="space-y-2">{activeService.before.map((item) => <li key={item} className="flex gap-2 text-xs"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-blue-600" />{item}</li>)}</ul>
                </div>
              </div>

              <div className="flex gap-2 border-l-4 border-blue-600 bg-blue-50 p-2 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-100"><AiOutlineSearch className="mt-0.5 shrink-0 text-blue-600" /><p><span className="font-semibold">Helpful tip: </span>{activeService.tip}</p></div>
            </div>
          </MainArea>
        </div>
      </div>
    </>
  );
};
export default Documentation;