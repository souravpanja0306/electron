import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import PageTitle from '../../components/PageTitle';
import ActionArea from '../../components/ActionArea';
import MainArea from '../../components/MainArea';
import CustomButton from '../../components/CustomButton';
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

const CreateInvoice = () => {
  let token = localStorage.getItem("token");
  const { moneyReceipts, moneyReceiptNo, createMoneyReceipts, generateMoneyReceiptNo, loading } = useMoneyReceiptStore();
  const { invoiceData, createInvoice, generateInvoiceNo, invoiceNo, printInvoice, invoiceLoading } = useInvoiceStore();
  const { companyData, getAllCompany } = useCompanyStore();
  const { parties, getAllParty, partyLoading } = usePartyStore();

  const [searchParams] = useSearchParams();
  const back = searchParams.get("back");

  const navigate = useNavigate();
  let randomNumber = Math.floor(Math.random() * 10000000000);

  const [grandTotal, setGrandTotal] = useState({
    total_quantity: 0,
    total_value: 0,
    tax_amount: 0,
  });
  const [alart, setAlart] = useState({ show: false });
  const [party, setParty] = useState([]);
  const [invoiceDetails, setInvoiceDetails] = useState({
    type: "tax",
    invoiceNo: "",
    date: "",
    transporter: "",
    ewayBill: "",
    billFrom: "",
    billTo: "",
    shipTo: "",
    placeOfSupply: "",
  });
  const [invoiceFields, setInvoiceFields] = useState([
    { id: Math.floor(Math.random() * 10000000000), sl_no: "", description: "", hsn: "", quantity: 0, rate: 0, total: 0 },
  ]);

  const getPartys = async () => {
    let result = await getAllParty(token);
    if (result.body.length) setParty(result.body);
  };

  const generateInvoiceNumber = async () => {
    let result = await generateInvoiceNo(token);
    if (result.status === 200) {
      setInvoiceDetails(prev => ({
        ...prev,
        invoiceNo: result.body
      }));
    };
  };

  useEffect(() => {
    getPartys();
    generateInvoiceNumber()
    getAllCompany(token);
  }, []);

  const handleAddFields = (e) => {
    setInvoiceFields([...invoiceFields, {
      id: randomNumber,
      sl_no: "",
      description: "",
      hsn: "",
      quantity: 0,
      rate: 0,
      percentage: 0,
      discount: 0,
      total: 0,
    }]);
  };

  const handleRemoveFields = (id) => {
    let invoiceData = invoiceFields.find(item => item.id == id);
    if (invoiceData) {
      if (invoiceData.description != "" || invoiceData.quantity != "") {
        toast("You can't delete this field because it contains data.", { theme: "dark" });
        return;
      };
    };
    setInvoiceFields(invoiceFields.filter(item => item.id !== id));
  };

  const handleChange = ({
    id = "",
    key = "",
    value = ""
  }) => {
    setInvoiceFields(prev => {
      let updatedData = prev.map(item =>
        item.id === id ? { ...item, [key]: value } : item
      );
      let finalQuantity = 0;
      let finalValue = 0;
      updatedData.map(item => {
        finalQuantity += parseFloat(item.quantity);
        finalValue += (parseFloat(item.quantity) * parseFloat(item.rate));
      });
      setGrandTotal({ total_quantity: finalQuantity, total_value: finalValue, inWord: inrToWords(finalValue) });
      return updatedData;
    });
  };

  const handleSubmitForm = async ({
    invoiceDetails,
    invoiceFields
  }) => {
    try {
      let finalData = { ...invoiceDetails, data: invoiceFields };
      let result = await createInvoice(finalData, token);
      if (result.status === 200) {
        setInvoiceFields([
          { id: Math.floor(Math.random() * 10000000000), sl_no: "", description: "", hsn: "", quantity: 0, rate: 0, total: 0 },
        ]);
        setInvoiceDetails({
          type: "tax", invoiceNo: invoiceNo, date: "", transporter: "", ewayBill: "", billTo: "", shipTo: "", placeOfSupply: "",
        });
      };
      toast(result.message, { theme: "dark" });
      await generateInvoiceNumber();
    } catch (error) {
      console.log(error);
    };
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSubmitForm({
          invoiceDetails: invoiceDetails,
          invoiceFields: invoiceFields
        });
      };

      if (e.ctrlKey && e.key === 'i') {
        e.preventDefault();
        navigate("/view-invoice");
      };
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [invoiceFields, invoiceDetails]);

  return (
    <>
      <PageTitle>Create Tax Invoice</PageTitle>

      <div className="flex flex-col gap-1">
        <ActionArea>
          {
            back ?
              <div onClick={() => navigate(-1)}>
                <CustomButton title={"Back"} color={"slate"}><AiOutlineRollback /></CustomButton>
              </div>
              : ""
          }
          <div onClick={(e) => handleSubmitForm({
            invoiceDetails: invoiceDetails,
            invoiceFields: invoiceFields
          })}>
            <CustomButton title={"Save (Ctrl+S)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
          </div>
          <Link to="/view-invoice">
            <CustomButton title={"View (Ctrl+I)"} color={"blue"}><AiOutlineTable /></CustomButton>
          </Link>
          <div onClick={() => printInvoice()}>
            <CustomButton title={"Print (Ctrl+P)"} color={"blue"} ><AiOutlinePrinter /></CustomButton>
          </div>
        </ActionArea>

        <form className='flex flex-col text-sm'>
          <div className=''>
            <PageTitle>Party Information</PageTitle>
            <MainArea>
              <div className='grid sm:md:lg:xl:flex gap-1 w-full'>
                <div className='flex flex-col w-full gap-1'>
                  {/* <div className='flex flex-col w-full gap-1'>
                    <CustomToggle
                      activeColor="green"
                      inactiveColor="blue"
                      option={["Tax", "Proforma"]}
                      value={true}
                      onChange={setIsProforma}
                    />
                  </div> */}
                  <div className='flex flex-col w-full gap-1'>
                    <label className='text-xs '>Bill From</label>
                    <div className='flex items-center gap-1'>
                      <select
                        className="h-8 p-1 rounded w-full text-slate-900 border border-slate-300 dark:border-slate-600"
                        value={invoiceDetails.billFrom}
                        onChange={(e) =>
                          setInvoiceDetails({ ...invoiceDetails, billFrom: e.target.value })
                        }
                        required
                      >
                        <option value="" disabled>Select Company</option>
                        {companyData?.body?.map((item, index) => (
                          <option key={item.id} value={item.id} selected={index == 1}>
                            {item.company_name}
                          </option>
                        ))}
                      </select>
                      <Link
                        to="/add-company?back=true"
                        className="h-8 px-3 flex items-center justify-center rounded-md bg-blue-600 text-white hover:bg-blue-700 transition whitespace-nowrap"
                      >
                        + Add New
                      </Link>
                    </div>
                  </div>
                </div>
                <div className='flex flex-col w-full gap-1'>
                  <div className='flex flex-col w-full gap-1'>
                    <label className='text-xs '>Bill To</label>
                    <div className='flex items-center gap-1'>
                      <select
                        className="h-8 p-1 rounded w-full text-slate-900 border border-slate-300 dark:border-slate-600"
                        value={invoiceDetails.billTo}
                        onChange={(e) =>
                          setInvoiceDetails({ ...invoiceDetails, billTo: e.target.value })
                        }
                        required
                      >
                        <option value="" disabled>Select Party</option>
                        {party?.map(item => (
                          <option key={item.id} value={item.id}>
                            {item.company_name}
                          </option>
                        ))}
                      </select>
                      <Link
                        to="/add-party?back=true"
                        className="h-8 px-3 flex items-center justify-center rounded-md bg-blue-600 text-white hover:bg-blue-700 transition whitespace-nowrap"
                      >
                        + Add New
                      </Link>
                    </div>
                  </div>
                  <div className='flex flex-col w-full gap-1'>
                    <div className='flex gap-1 items-center'>
                      <label className='text-xs '>Ship To</label>
                      <div className='flex gap-1 items-center rounded bg-slate-200 dark:bg-slate-900 p-1'>
                        <input type='checkbox' />
                        <label className='text-xs'>Same as bill to</label>
                      </div>
                    </div>
                    <textarea
                      className="p-1 rounded w-full text-slate-900 border border-slate-300 dark:border-slate-600"
                      type="text"
                    />
                  </div>
                </div>
                <div className='flex flex-col w-full gap-1'>
                  <div className='flex flex-col w-full gap-1'>
                    <label className='text-xs '>Date</label>
                    <input
                      className="h-8 p-1 rounded w-full text-slate-900 border border-slate-300 dark:border-slate-600"
                      placeholder="Date"
                      type="date"
                      value={invoiceDetails.date}
                      onChange={(e) =>
                        setInvoiceDetails({ ...invoiceDetails, date: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className='flex flex-col w-full gap-1'>
                    <label className='text-xs '>Invoice</label>
                    <input
                      className="h-8 p-1 rounded w-full text-slate-900 border border-slate-300 dark:border-slate-600"
                      placeholder="Invoice"
                      type="text"
                      value={invoiceNo}
                      onChange={(e) =>
                        setInvoiceDetails({ ...invoiceDetails, invoiceNo: invoiceNo })
                      }
                      readOnly
                      required
                    />
                  </div>
                  <div className='flex flex-col w-full gap-1'>
                    <label className='text-xs '>Place of Supply</label>
                    <input
                      className="h-8 p-1 rounded w-full text-slate-900 border border-slate-300 dark:border-slate-600"
                      // placeholder="Place"
                      value={invoiceDetails.placeOfSupply ? invoiceDetails.placeOfSupply : "Kolkata"}
                      onChange={(e) =>
                        setInvoiceDetails({ ...invoiceDetails, placeOfSupply: e.target.value })
                      }
                      type="text"
                    />
                  </div>
                </div>
              </div>
            </MainArea>
          </div>

          <div className=''>
            <PageTitle>Invoice Details</PageTitle>
            <MainArea>
              <table className='w-full select-none'>
                <thead>
                  <tr className='text-slate-600 dark:text-white text-sm font-semibold text-center'>
                    <th className='w-12'>Sl. No.</th>
                    <th className=''>Description</th>
                    <th className=''>HSN</th>
                    <th className='w-12'>Quantity</th>
                    <th className='w-24'>Rate</th>
                    <th className='w-24'>Subtotal</th>
                    <th className='w-12'>Tax</th>
                    <th className='w-24'>Grand Total</th>
                    <th className='w-12'>#</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    invoiceFields && invoiceFields.map((item, index) => {
                      const isLast = index === invoiceFields.length - 1;
                      return (
                        <tr key={item.id} className='items-center text-black'>
                          <td className=''>
                            <input
                              className="w-full h-8 p-1 rounded border border-slate-300 dark:border-slate-600 text-center"
                              value={index + 1}
                              disabled
                            />
                          </td>
                          <td className=''>
                            <input
                              className="w-full h-8 p-1 rounded border border-slate-300 dark:border-slate-600 capitalize"
                              value={item.description}
                              onChange={(e) => handleChange({ value: e.target.value, id: item.id, key: "description" })}
                              type="text"
                            />
                          </td>
                          <td className=''>
                            <div className='flex flex-col w-full gap-1'>
                              <select
                                className="w-full h-8 p-1 rounded border border-slate-300 dark:border-slate-600 "
                                defaultValue=""
                                onChange={(e) => handleChange({ value: e.target.value, id: item.id, key: "hsn" })}
                              >
                                <option selected disabled>HSN</option>
                                {
                                  party && party.map((item, index) => (
                                    <option key={item.id}>{150250 + index}</option>
                                  ))
                                }
                              </select>
                            </div>
                          </td>
                          <td className=''>
                            <input
                              className="w-full h-8 p-1 rounded border border-slate-300 dark:border-slate-600 text-right appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                              value={item.quantity}
                              onChange={(e) => handleChange({ value: e.target.value, id: item.id, key: "quantity" })}
                              type='number'
                              onFocus={(e) => e.target.select()}
                            />
                          </td>
                          <td className=''>
                            <input
                              className="w-full h-8 p-1 rounded border border-slate-300 dark:border-slate-600 text-right appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                              value={item.rate}
                              onChange={(e) => handleChange({ value: e.target.value, id: item.id, key: "rate" })}
                              type='number'
                              onFocus={(e) => e.target.select()}
                            />
                          </td>
                          <td className=''>
                            <input
                              className="w-full h-8 p-1 rounded border border-slate-300 dark:border-slate-600 text-right appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none font-bold"
                              value={(parseFloat(item.quantity) * parseFloat(item.rate)).toFixed(2)}
                              type='number'
                              readOnly
                            />
                          </td>
                          <td className=''>
                            <input
                              className="w-full h-8 p-1 rounded border border-slate-300 dark:border-slate-600 text-right appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none font-bold"
                              value={(parseFloat(item.quantity) * parseFloat(item.rate)).toFixed(2)}
                              type='number'
                              readOnly
                            />
                          </td>
                          <td className=''>
                            <input
                              className="w-full h-8 p-1 rounded border border-slate-300 dark:border-slate-600 text-right appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none font-bold"
                              value={(parseFloat(item.quantity) * parseFloat(item.rate)).toFixed(2)}
                              type='number'
                              readOnly
                            />
                          </td>
                          <td className=''>
                            <div
                              className="w-full flex justify-center text-2xl cursor-pointer transition"
                              onClick={(e) => isLast ? handleAddFields(e) : handleRemoveFields(item.id)}
                            >
                              {isLast ? (
                                <AiOutlinePlusSquare className="text-slate-600 hover:text-green-600" />
                              ) : (
                                <AiOutlineMinusSquare className="text-slate-600 hover:text-red-600" />
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  }
                </tbody>
              </table>
            </MainArea>

            <div className='flex gap-1'>
              <div className='w-3/4'>
                <PageTitle>Additonal Info</PageTitle>
                <MainArea>
                  <div className='flex flex-col w-1/2 gap-1 justify-between'>
                    <div className='flex flex-col w-full gap-1'>
                      <label className='text-xs '>E-Way Bill</label>
                      <input
                        className="h-8 p-1 rounded w-full text-slate-900 border border-slate-300 dark:border-slate-600"
                        // placeholder="E-Way Bill"
                        type="text"
                        value={invoiceDetails.ewayBill}
                        onChange={(e) =>
                          setInvoiceDetails({ ...invoiceDetails, ewayBill: e.target.value })
                        }
                      />
                    </div>
                    <div className='flex flex-col w-full gap-1'>
                      <label className='text-xs '>Transporter</label>
                      <input
                        className="h-8 p-1 rounded w-full text-slate-900 border border-slate-300 dark:border-slate-600"
                        // placeholder="Transporter"
                        type="text"
                        value={invoiceDetails.transporter}
                        onChange={(e) =>
                          setInvoiceDetails({ ...invoiceDetails, transporter: e.target.value })
                        }
                      />
                    </div>
                    <div className='flex flex-col w-full gap-1'>
                      <label className='text-xs '>Lorry No</label>
                      <input
                        className="h-8 p-1 rounded w-full text-slate-900 border border-slate-300 dark:border-slate-600"
                        // placeholder="Transporter"
                        type="text"
                        value={invoiceDetails.lorry_no}
                        onChange={(e) =>
                          setInvoiceDetails({ ...invoiceDetails, lorry_no: e.target.value })
                        }
                      />
                    </div>
                    <div className='flex flex-col w-full gap-1'>
                      <label className='text-xs '>LR No</label>
                      <input
                        className="h-8 p-1 rounded w-full text-slate-900 border border-slate-300 dark:border-slate-600"
                        // placeholder="Transporter"
                        type="text"
                        value={invoiceDetails.lr_no}
                        onChange={(e) =>
                          setInvoiceDetails({ ...invoiceDetails, lr_no: e.target.value })
                        }
                      />
                    </div>

                  </div>
                </MainArea>
              </div>
              <div className='w-1/4'>
                <PageTitle>Summary</PageTitle>
                <MainArea>
                  <div className='flex flex-col justify-end gap-1 w-full'>
                    <div className='flex justify-between w-full gap-1 font-bold'>
                      <span className=''>Total Quantity</span>
                      <span className=''>{parseFloat(grandTotal.total_quantity).toFixed()}</span>
                    </div>
                    <hr />
                    <div className='flex justify-between w-full gap-1 font-bold'>
                      <span className=''>Subtotal</span>
                      <span className=''>{grandTotal.total_value.toLocaleString("en-IN")}</span>
                    </div>
                    <hr />
                    <div className='flex justify-between w-full gap-1'>
                      <span className=''>SGST</span>
                      <span className=''>0</span>
                    </div>
                    <hr />
                    <div className='flex justify-between w-full gap-1'>
                      <span className=''>CGST</span>
                      <span className=''>0</span>
                    </div>
                    <hr />
                    <div className='flex justify-between w-full gap-1'>
                      <span className=''>IGST</span>
                      <span className=''>0</span>
                    </div>
                    <hr />
                    <div className='flex justify-between w-full gap-1'>
                      <span className=''>Round-Off</span>
                      <span className=''>0</span>
                    </div>
                    <hr />
                    <div className='text-lg flex justify-between w-full gap-1 font-bold'>
                      <span className=''>Grand Value</span>
                      <span className=''>{grandTotal.total_value.toLocaleString("en-IN")}</span>
                    </div>
                    <div className='bg-white flex flex-col justify-between w-full gap-1 text-black p-1 rounded'>
                      <span className=' font-bold'>In Rupess :</span>
                      <span className=''>{grandTotal.inWord}</span>
                    </div>
                  </div>
                </MainArea>
              </div>
            </div>
          </div>
        </form>
      </div>
      <ToastContainer />
    </>
  )
}

export default CreateInvoice