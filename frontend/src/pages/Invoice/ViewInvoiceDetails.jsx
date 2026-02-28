import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';

// Icon...
import {
  AiOutlineFileAdd,
  AiOutlineSync,
  AiOutlineDownload,
  AiOutlineDelete,
  AiOutlineEdit,
  AiOutlineRollback,
  AiOutlinePrinter
} from "react-icons/ai";

// Components...
import PageTitle from '../../components/PageTitle';
import ActionArea from '../../components/ActionArea';
import MainArea from '../../components/MainArea';
import CustomButton from '../../components/CustomButton';
import Alert from '../../components/Alert';

// Stores...
import useInvoiceStore from '../../store/InvoiceStore';
import useMoneyReceiptStore from "../../store/MoneyReceiptStore";
import useCompanyStore from "../../store/CompnayStore";
import usePartyStore from "../../store/PartyStore"

const ViewInvoiceDetails = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { invoiceData, getAllInvoice, deleteInvoice, printInvoice, invoiceLoading } = useInvoiceStore();

  const [searchParams] = useSearchParams();
  const back = searchParams.get("back");
  const invoiceId = searchParams.get("id");

  useEffect(() => {
    getAllInvoice({ id: invoiceId, token: token });
  }, []);

  const handleDelete = async () => {
    try {
      if (!invoiceId) toast("Please select which one you want to delete.", { theme: "dark" });
      let result = await deleteInvoice({ id: invoiceId, token: token });
      if (result) {
        toast(result.message, { theme: "dark" });
        setTimeout(() => {
          navigate("/create-invoice")
        }, 1500);
      } else {
        toast(result.message, { theme: "dark" });
      };
    } catch (error) {
      console.log(error);
    };
  };

  return (
    <>
      <PageTitle>View Invoice Details</PageTitle>
      <div className='flex flex-col gap-1'>
        <ActionArea>
          <div className="flex justify-between w-full">
            <div className="flex gap-1">
              {back ?
                <div onClick={() => navigate(-1)}>
                  <CustomButton title={"Back"} color={"slate"}><AiOutlineRollback /></CustomButton>
                </div>
                : ""
              }
              <Link to="/create-invoice">
                <CustomButton title={"New (Ctrl+N)"} color={"green"}><AiOutlineFileAdd /></CustomButton>
              </Link>
              <div onClick={(e) => handleDelete(e)}>
                <CustomButton title={"Delete (Ctrl+D)"} color={"red"}><AiOutlineDelete /></CustomButton>
              </div>
              <div>
                <CustomButton title={"Print (Ctrl+P)"} color={"blue"}><AiOutlinePrinter /></CustomButton>
              </div>
              <div>
                <CustomButton title={"Edit (Ctrl+E)"} color={"blue"}><AiOutlineEdit /></CustomButton>
              </div>
            </div>
            <div className="flex gap-1">
              <div onClick={() => getAllInvoice({ id: invoiceId, token: token })}>
                <CustomButton title={"Refrash"} color={"blue"}><AiOutlineSync /></CustomButton>
              </div>
            </div>
          </div>
        </ActionArea>
        <MainArea>
          {invoiceData.body && invoiceData.body.length ?
            <div className="flex flex-col w-full gap-1">

              <MainArea className="w-full border-solid rounded p-1">
                ddd
              </MainArea>

              <div className="flex justify-between w-full gap-1">
                <MainArea >
                  <div className="flex flex-col w-full">
                    <PageTitle>Bill To : </PageTitle>
                    <div className="w-full flex flex-col">
                      <span className="text-xl">{invoiceData.body.length && invoiceData.body[0].party_id ? invoiceData.body[0].party_id.company_name : ""}</span>
                      <span className="text-xs">{invoiceData.body.length && invoiceData.body[0].party_id ? invoiceData.body[0].party_id.address_1 : ""}</span>
                      <span className="text-xs">{invoiceData.body.length && invoiceData.body[0].party_id ? invoiceData.body[0].party_id.address_2 : ""}</span>
                    </div>
                    <br />
                    <table className="w-full  text-sm rounded">
                      <tbody>
                        <tr className="flex justify-between border-b border-slate-500">
                          <td className="p-2 font-medium w-1/3">GST : </td>
                          <td className="p-2">{invoiceData.body.length && invoiceData.body[0].party_id ? invoiceData.body[0].party_id.gst : ""}</td>
                        </tr>
                        <tr className="flex justify-between border-b border-slate-500">
                          <td className="p-2 font-medium">PAN : </td>
                          <td className="p-2">{invoiceData.body.length && invoiceData.body[0].party_id ? invoiceData.body[0].party_id.pan : ""}</td>
                        </tr>
                        <tr className="flex justify-between border-b border-slate-500">
                          <td className="p-2 font-medium">STATE : </td>
                          <td className="p-2">{invoiceData.body.length && invoiceData.body[0].party_id ? invoiceData.body[0].party_id.state : ""}</td>
                        </tr>
                        <tr className="flex justify-between">
                          <td className="p-2 font-medium">STATE CODE : </td>
                          <td className="p-2">{invoiceData.body.length && invoiceData.body[0].party_id ? invoiceData.body[0].party_id.state : ""}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </MainArea>
                <MainArea >
                  <div className="flex flex-col w-full">
                    <PageTitle>Ship To : </PageTitle>
                    <div className="w-full flex flex-col">
                      <span className="text-xl">{invoiceData.body.length && invoiceData.body[0].party_id ? invoiceData.body[0].party_id.company_name : ""}</span>
                      <span className="text-xs">{invoiceData.body.length && invoiceData.body[0].party_id ? invoiceData.body[0].party_id.address_1 : ""}</span>
                      <span className="text-xs">{invoiceData.body.length && invoiceData.body[0].party_id ? invoiceData.body[0].party_id.address_2 : ""}</span>
                    </div>
                    <br />
                    <table className="w-full  text-sm rounded">
                      <tbody>
                        <tr className="flex justify-between border-b border-slate-500">
                          <td className="p-2 font-medium w-1/3">GST : </td>
                          <td className="p-2">{invoiceData.body.length && invoiceData.body[0].party_id ? invoiceData.body[0].party_id.gst : ""}</td>
                        </tr>
                        <tr className="flex justify-between border-b border-slate-500">
                          <td className="p-2 font-medium">PAN : </td>
                          <td className="p-2">{invoiceData.body.length && invoiceData.body[0].party_id ? invoiceData.body[0].party_id.pan : ""}</td>
                        </tr>
                        <tr className="flex justify-between border-b border-slate-500">
                          <td className="p-2 font-medium">STATE : </td>
                          <td className="p-2">{invoiceData.body.length && invoiceData.body[0].party_id ? invoiceData.body[0].party_id.state : ""}</td>
                        </tr>
                        <tr className="flex justify-between">
                          <td className="p-2 font-medium">STATE CODE : </td>
                          <td className="p-2">{invoiceData.body.length && invoiceData.body[0].party_id ? invoiceData.body[0].party_id.state : ""}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </MainArea>
                <MainArea >
                  <div className="flex flex-col w-full">
                    <table className="w-full  text-sm rounded">
                      <tbody>
                        <tr className="flex justify-between border-b border-slate-500">
                          <td className="p-2 font-medium w-1/3">Invoice : </td>
                          <td className="p-2">{invoiceData.body.length ? invoiceData.body[0].invoice_no : "--"}</td>
                        </tr>
                        <tr className="flex justify-between border-b border-slate-500">
                          <td className="p-2 font-medium">Date : </td>
                          <td className="p-2">{invoiceData.body.length ? invoiceData.body[0].invoice_date : "--"}</td>
                        </tr>
                        <tr className="flex justify-between border-b border-slate-500">
                          <td className="p-2 font-medium">Transporter : </td>
                          <td className="p-2">{invoiceData.body.length ? invoiceData.body[0].transporter : "--"}</td>
                        </tr>
                        <tr className="flex justify-between border-b border-slate-500">
                          <td className="p-2 font-medium">Vehicle : </td>
                          <td className="p-2">{invoiceData.body.length ? invoiceData.body[0].total_amount : "--"}</td>
                        </tr>
                        <tr className="flex justify-between border-b border-slate-500">
                          <td className="p-2 font-medium">LR No : </td>
                          <td className="p-2">{invoiceData.body.length ? invoiceData.body[0].total_amount : "--"}</td>
                        </tr>
                        <tr className="flex justify-between border-b border-slate-500">
                          <td className="p-2 font-medium">E-Way Bill : </td>
                          <td className="p-2">{invoiceData.body.length ? invoiceData.body[0].eway_bill : "--"}</td>
                        </tr>
                        <tr className="flex justify-between">
                          <td className="p-2 font-medium">Destination : </td>
                          <td className="p-2">{invoiceData.body.length ? invoiceData.body[0].placeOfSupply : "--"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </MainArea>
              </div>

              <MainArea>
                <div className="flex flex-col w-full">
                  <table className="w-full text-sm rounded overflow-hidden">
                    <thead className="">
                      <tr className="border-b border-slate-500">
                        <th className="p-2 text-left w-10">Sl</th>
                        <th className="p-2 text-left">Description</th>
                        <th className="p-2 text-left w-24">HSN/SAC</th>
                        <th className="p-2 text-right w-16">Qty</th>
                        <th className="p-2 text-right w-20">Rate</th>
                        <th className="p-2 text-right w-24">Total</th>
                      </tr>
                    </thead>

                    <tbody>
                      {invoiceData?.body?.length > 0 &&
                        invoiceData?.body[0].data.map((item, index) => (
                          <tr key={index} className="border-b border-slate-500 last:border-b-0">
                            <td className="p-2">{index + 1}</td>
                            <td className="p-2">{item.description}</td>
                            <td className="p-2">{item.hsn}</td>
                            <td className="p-2 text-right">{item.quantity}</td>
                            <td className="p-2 text-right">{item.rate}</td>
                            <td className="p-2 text-right font-medium">
                              {(parseFloat(item.quantity) * parseFloat(item.rate)).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </MainArea>
            </div>
            :
            <>
              <span>No Data Found.</span>
            </>
          }
        </MainArea>
      </div>
      <ToastContainer />
    </>
  )
}

export default ViewInvoiceDetails