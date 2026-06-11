import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import PageTitle from '../../components/PageTitle';
import ActionArea from '../../components/ActionArea';
import MainArea from '../../components/MainArea';
import CustomButton from '../../components/CustomButton';
import SearchableSelect from '../../components/SearchableSelect';
import { inrToWords } from '../../utils/InWordConverter';
import moment from 'moment';

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
import useAuthStore from '../../store/AuthStore';
import useMoneyReceiptStore from "../../store/MoneyReceiptStore";
import useCompanyStore from "../../store/CompanyStore";
import usePartyStore from "../../store/PartyStore";
import useGstStore from "../../store/GstStore";

const CreateInvoice = () => {
  const { moneyReceipts, moneyReceiptNo, createMoneyReceipts, generateMoneyReceiptNo, loading } = useMoneyReceiptStore();
  const { invoiceData, createInvoice, generateInvoiceNo, invoiceNo, printInvoice, invoiceLoading } = useInvoiceStore();
  const { companyData, getAllCompany } = useCompanyStore();
  const { parties, getAllParty, partyLoading } = usePartyStore();
  const { gstData, getAllGst, gstLoading } = useGstStore();
  const { authToken, token } = useAuthStore();

  const [searchParams] = useSearchParams();
  const back = searchParams.get("back");

  const navigate = useNavigate();
  let randomNumber = Math.floor(Math.random() * 10000000000);

  const [grandTotal, setGrandTotal] = useState({
    total_quantity: 0,
    total_value: 0,
    total_cgst: 0,
    total_sgst: 0,
    total_igst: 0,
    grand_total: 0,
    inWord: ""
  });
  const [alart, setAlart] = useState({ show: false });
  const [isSameState, setIsSameState] = useState(true);
  const [party, setParty] = useState([]);
  const [invoiceDetails, setInvoiceDetails] = useState({
    type: "tax",
    invoiceNo: "",
    date: moment().format("YYYY-MM-DD"),
    transporter: "",
    ewayBill: "",
    billFrom: "",
    billTo: "",
    shipTo: "",
    placeOfSupply: "",
    lorry_no: "",
    lr_no: ""
  });
  const [invoiceFields, setInvoiceFields] = useState([
    { id: Math.floor(Math.random() * 10000000000), sl_no: "", description: "", hsn: "", quantity: 0, rate: 0, total: 0, gst: 0 },
  ]);

  const getPartys = async () => {
    let result = await getAllParty(token);
    if (result.body.length) setParty(result.body);
  };

  const generateInvoiceNumber = async () => {
    let result = await generateInvoiceNo({ token, types: "invoice" });
    if (result.status === 200) {
      setInvoiceDetails(prev => ({
        ...prev,
        invoiceNo: result.body
      }));
    };
  };

  useEffect(() => {
    authToken();
    getPartys();
    generateInvoiceNumber();
    getAllCompany(token);
    getAllGst(token)
  }, []);

  const handleAddFields = () => {
    setInvoiceFields([...invoiceFields, {
      id: Math.floor(Math.random() * 10000000000),
      sl_no: "",
      description: "",
      hsn: "",
      quantity: 0,
      rate: 0,
      gst: 0,
      total: 0,
    }]);
  };

  const handleRemoveFields = (id) => {
    if (invoiceFields.length > 1) {
      const updatedFields = invoiceFields.filter(item => item.id !== id);
      setInvoiceFields(updatedFields);
      calculateGrandTotal(updatedFields, invoiceDetails.billFrom, invoiceDetails.billTo);
    } else {
      toast.info("At least one row is required.");
    }
  };

  const calculateGrandTotal = (fields, billFromId, billToId) => {
    let finalQuantity = 0;
    let finalValue = 0;
    let finalCGST = 0;
    let finalSGST = 0;
    let finalIGST = 0;

    const company = companyData.find(c => String(c.id) === String(billFromId));
    const selectedParty = party.find(p => String(p.id) === String(billToId));

    if (!company || !selectedParty) {
      setIsSameState(true);
      return;
    }

    const companyState = (company?.state || "").toLowerCase().trim();
    const partyState = (selectedParty?.state || "").toLowerCase().trim();
    const sameState = companyState === partyState;
    setIsSameState(sameState);

    fields.forEach(item => {
      let qty = parseFloat(item.quantity || 0);
      let rate = parseFloat(item.rate || 0);
      let gstRate = parseFloat(item.gst || 0);
      let subtotal = qty * rate;

      finalQuantity += qty;
      finalValue += subtotal;

      let taxAmount = subtotal * (gstRate / 100);

      if (sameState) {
        finalCGST += taxAmount / 2;
        finalSGST += taxAmount / 2;
      } else {
        finalIGST += taxAmount;
      }
    });

    const grandTotalValue = finalValue + finalCGST + finalSGST + finalIGST;

    setGrandTotal({
      total_quantity: finalQuantity,
      total_value: finalValue,
      total_cgst: finalCGST,
      total_sgst: finalSGST,
      total_igst: finalIGST,
      grand_total: grandTotalValue,
      inWord: inrToWords(grandTotalValue)
    });
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
      calculateGrandTotal(updatedData, invoiceDetails.billFrom, invoiceDetails.billTo);
      return updatedData;
    });
  };

  useEffect(() => {
    calculateGrandTotal(invoiceFields, invoiceDetails.billFrom, invoiceDetails.billTo);
  }, [invoiceDetails.billFrom, invoiceDetails.billTo, companyData, party]);

  const handleSubmitForm = async ({
    invoiceDetails,
    invoiceFields
  }) => {
    try {
      let finalData = { ...invoiceDetails, data: invoiceFields };
      let result = await createInvoice(finalData, token);
      if (result.status === 200) {
        setInvoiceFields([
          { id: Math.floor(Math.random() * 10000000000), sl_no: "", description: "", hsn: "", quantity: 0, rate: 0, total: 0, gst: 0 },
        ]);
        setInvoiceDetails({
          type: "tax",
          invoiceNo: "",
          date: moment().format("YYYY-MM-DD"),
          transporter: "",
          ewayBill: "",
          billFrom: "",
          billTo: "",
          shipTo: "",
          placeOfSupply: "Kolkata",
          lorry_no: "",
          lr_no: ""
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
          {/* <div onClick={() => printInvoice()}>
            <CustomButton title={"Print (Ctrl+P)"} color={"blue"} ><AiOutlinePrinter /></CustomButton>
          </div> */}
        </ActionArea>

        <form className='flex flex-col text-sm'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-1'>
            <div className='flex flex-col gap-1'>
              <PageTitle>Party Information</PageTitle>
              <MainArea>
                <div className='flex flex-col w-full gap-2 p-1'>
                  <div className='flex justify-between items-center w-full gap-1'>
                    <label className='text-xs w-[25%]'>Bill From</label>
                    <div className='flex items-center gap-1 w-[75%]'>
                      <SearchableSelect
                        className="w-full"
                        name="billFrom"
                        value={invoiceDetails.billFrom}
                        onChange={(e) =>
                          setInvoiceDetails({ ...invoiceDetails, billFrom: e.target.value })
                        }
                        options={companyData?.map(item => ({ id: item.id, label: item.company_name }))}
                        placeholder="Select Company"
                        required
                      />
                      <Link
                        to="/add-company?back=true"
                        className="h-8 px-3 flex items-center justify-center rounded-md bg-blue-600 text-white hover:bg-blue-700 transition whitespace-nowrap text-xs"
                      >
                        + New
                      </Link>
                    </div>
                  </div>

                  <div className='flex justify-between items-center w-full gap-1'>
                    <label className='text-xs w-[25%]'>Bill To</label>
                    <div className='flex items-center gap-1 w-[75%]'>
                      <SearchableSelect
                        className="w-full"
                        name="billTo"
                        value={invoiceDetails.billTo}
                        onChange={(e) =>
                          setInvoiceDetails({ ...invoiceDetails, billTo: e.target.value })
                        }
                        options={party?.map(item => ({ id: item.id, label: item.company_name }))}
                        placeholder="Select Party"
                        required
                      />
                      <Link
                        to="/add-party?back=true"
                        className="h-8 px-3 flex items-center justify-center rounded-md bg-blue-600 text-white hover:bg-blue-700 transition whitespace-nowrap text-xs"
                      >
                        + New
                      </Link>
                    </div>
                  </div>

                  <div className='flex justify-between items-center w-full gap-1'>
                    <div className='flex gap-1 items-center w-[25%]'>
                      <label className='text-xs'>Ship To</label>
                      <div className='flex gap-1 items-center rounded bg-slate-200 dark:bg-slate-900 px-1 py-0.5'>
                        <input type='checkbox' className='w-3 h-3' />
                        <label className='text-[8px]'>Same</label>
                      </div>
                    </div>
                    <textarea
                      className="p-1 rounded w-[75%] text-slate-900 border border-slate-400 dark:border-slate-600"
                      rows="2"
                      placeholder="Shipping Address"
                    />
                  </div>
                </div>
              </MainArea>
            </div>

            <div className='flex flex-col gap-1'>
              <PageTitle>Invoice Info</PageTitle>
              <MainArea>
                <div className='flex flex-col w-full gap-2 p-1'>
                  <div className='flex justify-between items-center w-full gap-1'>
                    <label className='text-xs w-[25%]'>Date</label>
                    <input
                      className="h-8 p-1 rounded w-[75%] text-slate-900 border border-slate-400 dark:border-slate-600"
                      type="date"
                      value={invoiceDetails.date}
                      onChange={(e) =>
                        setInvoiceDetails({ ...invoiceDetails, date: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className='flex justify-between items-center w-full gap-1'>
                    <label className='text-xs w-[25%]'>Invoice No</label>
                    <input
                      className="h-8 p-1 rounded w-[75%] text-slate-900 border border-slate-400 dark:border-slate-600 bg-slate-50"
                      type="text"
                      value={invoiceDetails.invoiceNo}
                      readOnly
                      required
                    />
                  </div>
                  <div className='flex justify-between items-center w-full gap-1'>
                    <label className='text-xs w-[25%]'>Place of Supply</label>
                    <input
                      className="h-8 p-1 rounded w-[75%] text-slate-900 border border-slate-400 dark:border-slate-600"
                      value={invoiceDetails.placeOfSupply ? invoiceDetails.placeOfSupply : "Kolkata"}
                      onChange={(e) =>
                        setInvoiceDetails({ ...invoiceDetails, placeOfSupply: e.target.value })
                      }
                      type="text"
                    />
                  </div>
                </div>
              </MainArea>
            </div>
          </div>

          <PageTitle>Invoice Details</PageTitle>
          <MainArea>
            <table className='w-full select-none'>
              <thead>
                <tr className='text-slate-600 dark:text-white text-sm font-semibold text-center'>
                  <th className='w-12'>Sl. No.</th>
                  <th className=''>Description</th>
                  <th className='w-24'>HSN</th>
                  <th className='w-24'>Quantity</th>
                  <th className='w-24'>Rate</th>
                  <th className='w-24'>Subtotal</th>
                  <th className='w-24'>Tax (%)</th>
                  {isSameState ? (
                    <>
                      <th className='w-20'>CGST</th>
                      <th className='w-20'>SGST</th>
                    </>
                  ) : (
                    <th className='w-20'>IGST</th>
                  )}
                  <th className='w-24'>Grand Total</th>
                  <th className='w-12'>#</th>
                </tr>
              </thead>
              <tbody>
                {
                  invoiceFields && invoiceFields.map((item, index) => {
                    const isLast = index === invoiceFields.length - 1;
                    const subtotal = parseFloat(item.quantity || 0) * parseFloat(item.rate || 0);
                    const taxAmount = subtotal * (parseFloat(item.gst || 0) / 100);
                    const cgst = isSameState ? (taxAmount / 2).toFixed(2) : "0.00";
                    const sgst = isSameState ? (taxAmount / 2).toFixed(2) : "0.00";
                    const igst = !isSameState ? taxAmount.toFixed(2) : "0.00";
                    const grandTotal = subtotal + taxAmount;

                    return (
                      <tr key={item.id} className='items-center text-black'>
                        <td className=''>
                          <input
                            className="w-full h-8 p-1 rounded border border-slate-400 dark:border-slate-600 text-center"
                            value={index + 1}
                            disabled
                          />
                        </td>
                        <td className=''>
                          <input
                            className="w-full h-8 p-1 rounded border border-slate-400 dark:border-slate-600 capitalize"
                            value={item.description}
                            onChange={(e) => handleChange({ value: e.target.value, id: item.id, key: "description" })}
                            type="text"
                          />
                        </td>
                        <td className=''>
                          <div className='flex flex-col w-full gap-1'>
                            <select
                              className="w-full h-8 p-1 rounded border border-slate-400 dark:border-slate-600 "
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
                            className="w-full h-8 p-1 rounded border border-slate-400 dark:border-slate-600 text-right appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            value={item.quantity}
                            onChange={(e) => handleChange({ value: e.target.value, id: item.id, key: "quantity" })}
                            type='number'
                            onFocus={(e) => e.target.select()}
                          />
                        </td>
                        <td className=''>
                          <input
                            className="w-full h-8 p-1 rounded border border-slate-400 dark:border-slate-600 text-right appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            value={item.rate}
                            onChange={(e) => handleChange({ value: e.target.value, id: item.id, key: "rate" })}
                            type='number'
                            onFocus={(e) => e.target.select()}
                          />
                        </td>
                        <td className=''>
                          <input
                            className="w-full h-8 p-1 rounded border border-slate-400 dark:border-slate-600 text-right appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none font-bold"
                            value={subtotal.toFixed(2)}
                            type='number'
                            readOnly
                          />
                        </td>
                        <td className=''>
                          <div className='flex flex-col w-full gap-1'>
                            {
                              gstData && gstData.length ?
                                <select
                                  className="h-8 p-1 rounded w-full text-slate-900 border border-slate-400 dark:border-slate-600"
                                  value={item.gst}
                                  onChange={(e) => { handleChange({ value: e.target.value, id: item.id, key: "gst" }); }}
                                  required
                                >
                                  <option value="" disabled>Select GST</option>
                                  {gstData?.map((g, i) => (
                                    <option key={g.id} value={g.total_rate}>
                                      {g.title}
                                    </option>
                                  ))}
                                </select>
                                : <Link
                                  to="/create-gst?back=true"
                                  className="text-center h-8 p-1 rounded w-full text-slate-900 border hover:bg-blue-600 hover:text-white border-slate-400 dark:border-slate-600">
                                  + New
                                </Link>
                            }
                          </div>
                        </td>
                        {isSameState ? (
                          <>
                            <td className=''>
                              <input
                                className="w-full h-8 p-1 rounded border border-slate-400 dark:border-slate-600 text-right"
                                value={cgst}
                                readOnly
                              />
                            </td>
                            <td className=''>
                              <input
                                className="w-full h-8 p-1 rounded border border-slate-400 dark:border-slate-600 text-right"
                                value={sgst}
                                readOnly
                              />
                            </td>
                          </>
                        ) : (
                          <td className=''>
                            <input
                              className="w-full h-8 p-1 rounded border border-slate-400 dark:border-slate-600 text-right"
                              value={igst}
                              readOnly
                            />
                          </td>
                        )}
                        <td className=''>
                          <input
                            className="w-full h-8 p-1 rounded border border-slate-400 dark:border-slate-600 text-right appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none font-bold"
                            value={grandTotal.toFixed(2)}
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

          <div className='flex flex-col lg:flex-row gap-1'>
            <div className='w-full lg:w-3/4'>
              <PageTitle>Additonal Info</PageTitle>
              <MainArea>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-2 w-full p-1'>
                  <div className='flex justify-between items-center w-full gap-1'>
                    <label className='text-xs w-[25%]'>E-Way Bill</label>
                    <input
                      className="h-8 p-1 rounded w-[75%] text-slate-900 border border-slate-400 dark:border-slate-600"
                      type="text"
                      value={invoiceDetails.ewayBill}
                      onChange={(e) =>
                        setInvoiceDetails({ ...invoiceDetails, ewayBill: e.target.value })
                      }
                    />
                  </div>
                  <div className='flex justify-between items-center w-full gap-1'>
                    <label className='text-xs w-[25%]'>Transporter</label>
                    <input
                      className="h-8 p-1 rounded w-[75%] text-slate-900 border border-slate-400 dark:border-slate-600"
                      type="text"
                      value={invoiceDetails.transporter}
                      onChange={(e) =>
                        setInvoiceDetails({ ...invoiceDetails, transporter: e.target.value })
                      }
                    />
                  </div>
                  <div className='flex justify-between items-center w-full gap-1'>
                    <label className='text-xs w-[25%]'>Lorry No</label>
                    <input
                      className="h-8 p-1 rounded w-[75%] text-slate-900 border border-slate-400 dark:border-slate-600"
                      type="text"
                      value={invoiceDetails.lorry_no}
                      onChange={(e) =>
                        setInvoiceDetails({ ...invoiceDetails, lorry_no: e.target.value })
                      }
                    />
                  </div>
                  <div className='flex justify-between items-center w-full gap-1'>
                    <label className='text-xs w-[25%]'>LR No</label>
                    <input
                      className="h-8 p-1 rounded w-[75%] text-slate-900 border border-slate-400 dark:border-slate-600"
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
            <div className='w-full lg:w-1/4'>
              <PageTitle>Summary</PageTitle>
              <MainArea>
                <div className='flex flex-col justify-end gap-1 w-full p-1'>
                  <div className='flex justify-between w-full gap-1 font-bold'>
                    <span className=''>Total Quantity</span>
                    <span className=' text-blue-600'>{parseFloat(grandTotal.total_quantity).toFixed()}</span>
                  </div>
                  <hr />
                  <div className='flex justify-between w-full gap-1 font-bold'>
                    <span className=''>Subtotal</span>
                    <span className=' text-blue-600'>{grandTotal.total_value.toLocaleString("en-IN", {
                      style: "currency",
                      currency: "INR",
                    })}</span>
                  </div>
                  <hr />
                  {grandTotal.total_igst > 0 ? (
                    <div className='flex justify-between w-full gap-1'>
                      <span className=''>IGST</span>
                      <span className=''>{grandTotal.total_igst.toLocaleString("en-IN", {
                        style: "currency",
                        currency: "INR",
                      })}</span>
                    </div>
                  ) : (
                    <>
                      <div className='flex justify-between w-full gap-1'>
                        <span className=''>SGST</span>
                        <span className=''>{grandTotal.total_sgst.toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                        })}</span>
                      </div>
                      <hr />
                      <div className='flex justify-between w-full gap-1'>
                        <span className=''>CGST</span>
                        <span className=''>{grandTotal.total_cgst.toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                        })}</span>
                      </div>
                    </>
                  )}
                  <hr />
                  <div className='text-lg flex justify-between w-full gap-1 font-bold'>
                    <span className=' text-xl'>Grand Total</span>
                    <span className=' text-blue-600 text-xl'>{grandTotal.grand_total.toLocaleString("en-IN", {
                      style: "currency",
                      currency: "INR",
                    })}</span>
                  </div>
                  <div className='bg-white flex flex-col justify-between w-full gap-1 text-black p-1 rounded'>
                    <span className=' font-bold'>In Rupees :</span>
                    <span className=' text-xs italic'>{grandTotal.inWord}</span>
                  </div>
                </div>
              </MainArea>
            </div>
          </div>
        </form>
      </div>
    </>
  )
}

export default CreateInvoice