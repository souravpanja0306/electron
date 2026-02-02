import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useSearchParams, useNavigate } from "react-router-dom";


// Icon...
import {
  AiOutlineFileAdd,
  AiOutlineSync,
  AiOutlineDownload,
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

// Service...
import { handleGetParty, handleGetAllInvoice, printInvoice } from "./InvoiceService"


const ViewInvoiceDetails = () => {
  const [searchParams] = useSearchParams();
  const back = searchParams.get("back");
  const invoiceId = searchParams.get("id");

  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);

  const getAllInvoice = async () => {
    let result = await handleGetAllInvoice({ id: invoiceId });
    setInvoices(result);
  };

  useEffect(() => {
    getAllInvoice();
  }, []);

  const handleDelete = async () => {
    try {
      // if (!checkedIds.length) {
      //     setAlart({
      //         show: true,
      //         title: "Error",
      //         type: "error",
      //         message: "Please select data."
      //     });
      // } else {
      //     await window.api.deleteParty({ ids: checkedIds }).then((res) => {
      //         if (res.status === 200) {
      //             setCheckedIds([])
      //         };
      //     });
      //     await window.api.getParty({}).then((data) => {
      //         setParty(data.body);
      //     });

      // };
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
                <CustomButton title={"New (Ctrl+N)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
              </Link>
              <div onClick={(e) => handleDelete(e)}>
                <CustomButton title={"Delete (Ctrl+D)"} color={"red"}><AiOutlineFileAdd /></CustomButton>
              </div>
              <div onClick={(e) => handleDelete(e)}>
                <CustomButton title={"Print (Ctrl+P)"} color={"blue"}><AiOutlinePrinter /></CustomButton>
              </div>
              <div onClick={(e) => handleDelete(e)}>
                <CustomButton title={"Edit (Ctrl+E)"} color={"blue"}><AiOutlineEdit /></CustomButton>
              </div>
            </div>
            <div className="flex gap-1">
              <div onClick={() => getAllInvoice()}>
                <CustomButton title={"Refrash"} color={"blue"}><AiOutlineSync /></CustomButton>
              </div>
            </div>
          </div>
        </ActionArea>
        <MainArea>
          {invoices && invoices.length ?
            <div className="flex flex-col w-full gap-1">

              <MainArea className="w-full border-solid rounded p-1">
                ddd
              </MainArea>

              <div className="flex justify-between w-full gap-1">
                <MainArea >
                  <div className="flex flex-col w-full">
                    <PageTitle>Bill To : </PageTitle>
                    <div className="w-full flex flex-col">
                      <span className="text-xl">{invoices.length && invoices[0].party_id ? invoices[0].party_id.company_name : ""}</span>
                      <span className="text-xs">{invoices.length && invoices[0].party_id ? invoices[0].party_id.address_1 : ""}</span>
                      <span className="text-xs">{invoices.length && invoices[0].party_id ? invoices[0].party_id.address_2 : ""}</span>
                    </div>
                    <br />
                    <table className="w-full  text-sm rounded">
                      <tbody>
                        <tr className="flex justify-between border-b border-slate-500">
                          <td className="p-2 font-medium w-1/3">GST : </td>
                          <td className="p-2">{invoices.length && invoices[0].party_id ? invoices[0].party_id.gst : ""}</td>
                        </tr>
                        <tr className="flex justify-between border-b border-slate-500">
                          <td className="p-2 font-medium">PAN : </td>
                          <td className="p-2">{invoices.length && invoices[0].party_id ? invoices[0].party_id.pan : ""}</td>
                        </tr>
                        <tr className="flex justify-between border-b border-slate-500">
                          <td className="p-2 font-medium">STATE : </td>
                          <td className="p-2">{invoices.length && invoices[0].party_id ? invoices[0].party_id.state : ""}</td>
                        </tr>
                        <tr className="flex justify-between">
                          <td className="p-2 font-medium">STATE CODE : </td>
                          <td className="p-2">{invoices.length && invoices[0].party_id ? invoices[0].party_id.state : ""}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </MainArea>
                <MainArea >
                  <div className="flex flex-col w-full">
                    <PageTitle>Ship To : </PageTitle>
                    <div className="w-full flex flex-col">
                      <span className="text-xl">{invoices.length && invoices[0].party_id ? invoices[0].party_id.company_name : ""}</span>
                      <span className="text-xs">{invoices.length && invoices[0].party_id ? invoices[0].party_id.address_1 : ""}</span>
                      <span className="text-xs">{invoices.length && invoices[0].party_id ? invoices[0].party_id.address_2 : ""}</span>
                    </div>
                    <br />
                    <table className="w-full  text-sm rounded">
                      <tbody>
                        <tr className="flex justify-between border-b border-slate-500">
                          <td className="p-2 font-medium w-1/3">GST : </td>
                          <td className="p-2">{invoices.length && invoices[0].party_id ? invoices[0].party_id.gst : ""}</td>
                        </tr>
                        <tr className="flex justify-between border-b border-slate-500">
                          <td className="p-2 font-medium">PAN : </td>
                          <td className="p-2">{invoices.length && invoices[0].party_id ? invoices[0].party_id.pan : ""}</td>
                        </tr>
                        <tr className="flex justify-between border-b border-slate-500">
                          <td className="p-2 font-medium">STATE : </td>
                          <td className="p-2">{invoices.length && invoices[0].party_id ? invoices[0].party_id.state : ""}</td>
                        </tr>
                        <tr className="flex justify-between">
                          <td className="p-2 font-medium">STATE CODE : </td>
                          <td className="p-2">{invoices.length && invoices[0].party_id ? invoices[0].party_id.state : ""}</td>
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
                          <td className="p-2">{invoices.length ? invoices[0].invoice_no : "--"}</td>
                        </tr>
                        <tr className="flex justify-between border-b border-slate-500">
                          <td className="p-2 font-medium">Date : </td>
                          <td className="p-2">{invoices.length ? invoices[0].invoice_date : "--"}</td>
                        </tr>
                        <tr className="flex justify-between border-b border-slate-500">
                          <td className="p-2 font-medium">Transporter : </td>
                          <td className="p-2">{invoices.length ? invoices[0].transporter : "--"}</td>
                        </tr>
                        <tr className="flex justify-between border-b border-slate-500">
                          <td className="p-2 font-medium">Vehicle : </td>
                          <td className="p-2">{invoices.length ? invoices[0].total_amount : "--"}</td>
                        </tr>
                        <tr className="flex justify-between border-b border-slate-500">
                          <td className="p-2 font-medium">LR No : </td>
                          <td className="p-2">{invoices.length ? invoices[0].total_amount : "--"}</td>
                        </tr>
                        <tr className="flex justify-between border-b border-slate-500">
                          <td className="p-2 font-medium">E-Way Bill : </td>
                          <td className="p-2">{invoices.length ? invoices[0].eway_bill : "--"}</td>
                        </tr>
                        <tr className="flex justify-between">
                          <td className="p-2 font-medium">Destination : </td>
                          <td className="p-2">{invoices.length ? invoices[0].placeOfSupply : "--"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </MainArea>

              </div>

              <MainArea background={"bg-slate-700 text-slate-100"}>
                <div className="flex flex-col w-full">
                  <table className="w-full text-sm rounded-md overflow-hidden">
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
                      {invoices.length > 0 &&
                        invoices[0].data.map((item, index) => (
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
    </>
  )
}

export default ViewInvoiceDetails