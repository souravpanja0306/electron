import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { inrToWords } from '../../utils/InWordConverter';
import moment from 'moment';
import { useNavigate, useSearchParams } from "react-router-dom";
import { Link, NavLink } from "react-router-dom";

// Components...
import PageTitle from '../../components/PageTitle';
import ActionArea from '../../components/ActionArea';
import MainArea from '../../components/MainArea';
import CustomButton from '../../components/CustomButton';
import SearchableSelect from '../../components/SearchableSelect';
import Modal from '../../components/CustomModal';

// Icon...
import {
  AiOutlinePlusSquare,
  AiOutlineFileAdd,
  AiOutlineMinusSquare,
  AiOutlinePrinter,
  AiOutlineTable,
  AiOutlineRollback,
} from "react-icons/ai";

// Stores...
import useCompanyStore from "../../store/CompanyStore";
import useAuthStore from '../../store/AuthStore';
import usePartyStore from "../../store/PartyStore"
import useChallanStore from "../../store/ChallanStore";
import useChaStore from "../../store/ChaStore";

// Service...
import { handleEnter } from "../../service/MainService";


const CreateChallan = () => {
  const [chaModal, isChaModal] = useState(false);
  const { token } = useAuthStore();
  const [searchParams] = useSearchParams();
  const back = searchParams.get("back");
  const navigate = useNavigate();

  const { parties, getAllParty } = usePartyStore();
  const { companyData, getAllCompany } = useCompanyStore();
  const { createChallan, generateChallanNo, challanNo, challanLoading } = useChallanStore();
  const { chaData, getAllCha, createCha } = useChaStore();

  const [chaForm, setChaForm] = useState({
    cha_name: "",
    cha_mobile: "",
    cha_address: "",
  });

  const handleChaChange = (e) => {
    setChaForm({ ...chaForm, [e.target.name]: e.target.value });
  };

  const handleChaSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      if (!chaForm.cha_name) {
        toast.error("CHA Name is required.");
        return;
      }
      let payload = {
        name: chaForm.cha_name,
        mobile: chaForm.cha_mobile,
        address: chaForm.cha_address,
      };
      let result = await createCha(payload, token);
      if (result.status === 200) {
        toast.success(result.message);
        setChaForm({ cha_name: "", cha_mobile: "", cha_address: "" });
        isChaModal(false);
        getAllCha(token);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  };

  // const getChallanNo = async () => {
  //   let result = await generateChallanNo(token);
  //   if (result.status === 200) {
  //     setForm(prev => ({ ...prev, cn_no: result.body }));
  //   }
  // };

  useEffect(() => {
    getAllParty(token);
    getAllCompany(token);
    getAllCha(token);
    // getChallanNo();
  }, []);

  const [data, setData] = useState([
    { id: Math.floor(Math.random() * 10000000000), packages: "", description: "", weight: "", amount: "" },
  ]);

  const [form, setForm] = useState({
    company_id: "",
    consignor_id: "",
    consignee_id: "",
    cha: "",
    cn_no: "",
    date: moment().format("YYYY-MM-DD"),
    invoice_no: "",
    from_loc: "",
    to_loc: "",
    truck_no: "",
    way_bill_no: "",
    way_bill_date: "",
    container: "",
    booking_number: "",
    note: "",
    total_amount: 0,
    data: data,
  });

  const handleChange = async (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    if (e.target.name === "company_id") {
      let result = await generateChallanNo(token, e.target.value);
      if (result.status === 200) {
        setForm(prev => ({ ...prev, cn_no: result.body }));
      }
    }
  };

  const handleChangeData = (e) => {
    setData((prev) =>
      prev.map((row) =>
        row.id == e.target.id ? { ...row, [e.target.name]: e.target.value } : row
      ),
    );
  };

  useEffect(() => {
    const total = data.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    setForm(prev => ({ ...prev, data: data, total_amount: total }));
  }, [data]);


  const handleAddFields = () => {
    setData([...data, {
      id: Math.floor(Math.random() * 10000000000),
      packages: "",
      description: "",
      weight: "",
      amount: ""
    }]);
  };

  const handleRemoveFields = (id) => {
    let Lneitem = data.find((item) => item.id === id);
    if (Lneitem.description == "" && Lneitem.packages == "" && Lneitem.weight == "" && Lneitem.amount == "") {
      setData(data.filter(item => item.id !== id));
    } else {
      toast.success("Are you sure you want to delete this line? Remove all data first.");
    };
  };

  const handleSubmitForm = async (e) => {
    if (e) e.preventDefault();
    try {
      if (!form.company_id || !form.consignor_id || !form.consignee_id) {
        toast.error("Company, Consignor and Consignee are required.");
      };
      let payload = { ...form, data: data };
      let result = await createChallan(payload, token);
      if (result.status === 200) {
        toast.success(result.message);
        navigate("/view-challan");
      } else {
        toast.success(result.message);
      };
    } catch (error) {
      toast.success(error.message);
      console.log(error);
    };
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSubmitForm(e);
      };

      if (e.ctrlKey && e.key === 'i') {
        e.preventDefault();
        navigate("/view-challan");
      };
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [form, data]);

  return (
    <>
      <PageTitle>Create Challan</PageTitle>

      <div className="flex flex-col gap-1">
        <ActionArea>
          {
            back ?
              <div onClick={() => navigate(-1)}>
                <CustomButton title={"Back"} color={"slate"}><AiOutlineRollback /></CustomButton>
              </div>
              : ""
          }
          <div onClick={handleSubmitForm}>
            <CustomButton title={"Save (Ctrl+S)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
          </div>
          <Link to="/view-challan">
            <CustomButton title={"View (Ctrl+I)"} color={"blue"}><AiOutlineTable /></CustomButton>
          </Link>
        </ActionArea>
        <form>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-1'>
            <div className='flex flex-col gap-1'>
              <PageTitle>Consignor & Consignee</PageTitle>
              <MainArea>
                <div className='flex flex-col w-full gap-2 p-1'>
                  <div className='grid grid-cols-1 gap-2 w-full'>
                    <div className='flex justify-between items-center w-full gap-1'>
                      <label className='text-xs w-[20%]'>From Company</label>
                      <div className='flex items-center gap-1 w-[80%]'>
                        <SearchableSelect
                          className="w-full"
                          name="company_id"
                          value={form.company_id}
                          onChange={handleChange}
                          options={companyData?.map(item => ({ id: item.id, label: item.company_name }))}
                          placeholder="Select Company"
                          required
                        />
                      </div>
                    </div>

                    <div className='flex justify-between items-center w-full gap-1'>
                      <label className='text-xs w-[20%]'>Consignor</label>
                      <div className='flex items-center gap-1 w-[80%]'>
                        <SearchableSelect
                          className="w-full"
                          name="consignor_id"
                          value={form.consignor_id}
                          onChange={handleChange}
                          options={parties?.body?.map(item => ({ id: item.id, label: item.company_name }))}
                          placeholder="Select Consignor"
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
                      <label className='text-xs w-[20%]'>Consignee</label>
                      <div className='flex items-center gap-1 w-[80%]'>
                        <SearchableSelect
                          className="w-full"
                          name="consignee_id"
                          value={form.consignee_id}
                          onChange={handleChange}
                          options={parties?.body?.map(item => ({ id: item.id, label: item.company_name }))}
                          placeholder="Select Consignee"
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
                  </div>
                </div>
              </MainArea>
            </div>

            <div className='flex flex-col gap-1'>
              <PageTitle>Transport Details</PageTitle>
              <MainArea>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-2 w-full p-1'>
                  <div className='flex flex-col w-full gap-1'>
                    <label className='text-xs'>C/N No</label>
                    <input
                      className="h-8 p-1 rounded w-full text-slate-900 border border-slate-400 dark:border-slate-600"
                      type="text"
                      name="cn_no"
                      value={form.cn_no}
                      onChange={handleChange}
                      onKeyDown={(e) => handleEnter({ event: e, name: "date" })}
                      placeholder="C/N No"
                      required
                    />
                  </div>
                  <div className='flex flex-col w-full gap-1'>
                    <label className='text-xs'>Date</label>
                    <input
                      className="h-8 p-1 rounded w-full text-slate-900 border border-slate-400 dark:border-slate-600"
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      onKeyDown={(e) => handleEnter({ event: e, name: "from_loc" })}
                    />
                  </div>
                  <div className='flex flex-col w-full gap-1'>
                    <label className='text-xs'>From</label>
                    <input
                      className="capitalize h-8 p-1 rounded w-full text-slate-900 border border-slate-400 dark:border-slate-600"
                      type="text"
                      name="from_loc"
                      onChange={handleChange}
                      onKeyDown={(e) => handleEnter({ event: e, name: "to_loc" })}
                      placeholder="From"
                    />
                  </div>
                  <div className='flex flex-col w-full gap-1'>
                    <label className='text-xs'>To</label>
                    <input
                      className="capitalize h-8 p-1 rounded w-full text-slate-900 border border-slate-400 dark:border-slate-600"
                      type="text"
                      name="to_loc"
                      onChange={handleChange}
                      onKeyDown={(e) => handleEnter({ event: e, name: "packages", index: 0 })}
                      placeholder="To"
                    />
                  </div>
                </div>
              </MainArea>
            </div>
          </div>

          <PageTitle>Item Details</PageTitle>
          <MainArea>
            <div className="flex flex-col w-full">
              <table className='w-full select-none'>
                <thead>
                  <tr className='text-slate-600 dark:text-white text-sm font-semibold text-center'>
                    <th className='w-12'>Sl. No.</th>
                    <th className='w-32'>No. of Packages</th>
                    <th className=''>Particulars of Goods</th>
                    <th className='w-32'>Weight (KG)</th>
                    <th className='w-32'>Amount</th>
                    <th className='w-12'>#</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    data && data.map((item, index) => {
                      const isLast = index === data.length - 1;
                      return (
                        <tr key={item.id} className='items-center text-black'>
                          <td className=''>
                            <input
                              className="w-full p-1 rounded border border-slate-400 dark:border-slate-600 text-center"
                              value={index + 1}
                              disabled
                            />
                          </td>
                          <td className=''>
                            <input
                              className="w-full p-1 rounded border border-slate-400 dark:border-slate-600"
                              value={item.packages}
                              id={item.id}
                              name="packages"
                              onChange={(e) => handleChangeData(e)}
                              onKeyDown={(e) => handleEnter({ event: e, name: "description", index: index })}
                              type="number"
                            />
                          </td>
                          <td className=''>
                            <input
                              className="capitalize w-full p-1 rounded border border-slate-400 dark:border-slate-600"
                              value={item.description}
                              id={item.id}
                              name="description"
                              onChange={(e) => handleChangeData(e)}
                              onKeyDown={(e) => handleEnter({ event: e, name: "weight", index: index })}
                              type="text"
                            />
                          </td>
                          <td className=''>
                            <input
                              className="w-full p-1 rounded border border-slate-400 dark:border-slate-600 text-right"
                              value={item.weight}
                              id={item.id}
                              name="weight"
                              onChange={(e) => handleChangeData(e)}
                              onKeyDown={(e) => handleEnter({ event: e, name: "amount", index: index })}
                              type='number'
                            />
                          </td>
                          <td className=''>
                            <input
                              className="w-full p-1 rounded border border-slate-400 dark:border-slate-600 text-right"
                              value={item.amount}
                              id={item.id}
                              name="amount"
                              onChange={(e) => handleChangeData(e)}
                              onKeyDown={(e) => handleEnter({ event: e, name: "packages", index: index })}
                              type='number'
                            />
                          </td>
                          <td className=''>
                            {isLast ? (
                              <button
                                name='add-field'
                                type="button"
                                className="w-full flex justify-center text-2xl cursor-pointer transition"
                                onClick={(e) => handleAddFields(e)}
                              >
                                <AiOutlinePlusSquare className="text-green-600" />
                              </button>
                            ) : (
                              <button
                                name='remove-field'
                                type="button"
                                className="w-full flex justify-center text-2xl cursor-pointer transition"
                                onClick={(e) => handleRemoveFields(item.id)}
                              >
                                <AiOutlineMinusSquare className="text-red-600" />
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  }
                </tbody>
              </table>
              <div className='flex flex-col items-end w-full p-1 gap-1'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-semibold'>Total Amount:</span>
                  <span className='text-lg font-bold text-blue-600'>₹ {form.total_amount}</span>
                </div>
                <div className='text-xs italic text-slate-500'>
                  {inrToWords(form.total_amount)}
                </div>
              </div>
            </div>
          </MainArea>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-1'>
            <div className='flex flex-col gap-1'>
              <PageTitle>Document & Vehicle Info</PageTitle>
              <MainArea>
                <div className='grid gap-2 w-full p-1'>
                  <div className='flex items-center justify-between w-full gap-1'>
                    <label className='text-xs w-[20%]'>Invoice No</label>
                    <input
                      className="h-8 p-1 rounded w-[80%] text-slate-900 border border-slate-400 dark:border-slate-600"
                      type="text"
                      name="invoice_no"
                      onChange={handleChange}
                      onKeyDown={(e) => handleEnter({ event: e, name: "way_bill_no" })}
                      placeholder="Invoice No"
                    />
                  </div>
                  <div className='flex items-center justify-between w-full gap-1'>
                    <label className='text-xs w-[20%]'>Way Bill No</label>
                    <input
                      className="h-8 p-1 rounded w-[80%] text-slate-900 border border-slate-400 dark:border-slate-600"
                      type="number"
                      name="way_bill_no"
                      onChange={handleChange}
                      onKeyDown={(e) => handleEnter({ event: e, name: "way_bill_date" })}
                      placeholder="Way Bill No"
                    />
                  </div>
                  <div className='flex items-center justify-between w-full gap-1'>
                    <label className='text-xs w-[20%]'>Way Bill Date</label>
                    <input
                      className="h-8 p-1 rounded w-[80%] text-slate-900 border border-slate-400 dark:border-slate-600"
                      type="date"
                      name="way_bill_date"
                      onChange={handleChange}
                      onKeyDown={(e) => handleEnter({ event: e, name: "truck_no" })}
                      placeholder="Way Bill Date"
                    />
                  </div>
                  <div className='flex items-center justify-between w-full gap-1'>
                    <label className='text-xs w-[20%]'>Truck No</label>
                    <input
                      className="h-8 p-1 rounded w-[80%] text-slate-900 border border-slate-400 dark:border-slate-600"
                      type="text"
                      name="truck_no"
                      onChange={handleChange}
                      onKeyDown={(e) => handleEnter({ event: e, name: "container" })}
                      placeholder="Truck No"
                    />
                  </div>
                </div>
              </MainArea>
            </div>

            <div className='flex flex-col gap-1'>
              <PageTitle>Additional Remarks</PageTitle>
              <MainArea>
                <div className='grid gap-2 w-full p-1'>
                  <div className='flex items-center justify-between w-full gap-1'>
                    <label className='text-xs w-[20%]'>Container</label>
                    <input
                      className="h-8 p-1 rounded w-[80%] text-slate-900 border border-slate-400 dark:border-slate-600"
                      type="text"
                      name="container"
                      onChange={handleChange}
                      onKeyDown={(e) => handleEnter({ event: e, name: "cha" })}
                      placeholder="Container"
                    />
                  </div>
                  <div className='flex items-center justify-between w-full gap-1'>
                    <label className='text-xs w-[20%]'>CHA</label>
                    <div className='flex justify-between w-[80%] gap-1'>
                      <SearchableSelect
                        className="w-full"
                        name="cha"
                        value={form.cha}
                        onChange={handleChange}
                        options={chaData?.map(item => ({ id: item.id, label: item.name }))}
                        placeholder="Select CHA"
                        required
                      />
                      <button
                        onClick={() => isChaModal(true)}
                        type="button"
                        className="w-10% px-3 flex items-center justify-center rounded-md bg-blue-600 text-white hover:bg-blue-700 transition whitespace-nowrap"
                      ><AiOutlinePlusSquare /></button>
                    </div>
                  </div>
                  <div className='flex items-center justify-between w-full gap-1'>
                    <label className='text-xs w-[20%]'>Booking Number</label>
                    <input
                      className="h-8 p-1 rounded w-[80%] text-slate-900 border border-slate-400 dark:border-slate-600"
                      type="text"
                      name="booking_number"
                      onChange={handleChange}
                      onKeyDown={(e) => handleEnter({ event: e, name: "note" })}
                      placeholder="Booking Number"
                    />
                  </div>
                  <div className='flex items-center justify-between w-full gap-1'>
                    <label className='text-xs w-[20%]'>Additonal Info</label>
                    <textarea
                      className="p-1 rounded w-[80%] text-slate-900 border border-slate-400 dark:border-slate-600"
                      name="note"
                      rows="4"
                      onChange={handleChange}
                      placeholder="Info"
                    />
                  </div>
                </div>
              </MainArea>
            </div>
          </div >
        </form>
      </div >

      {/* Create CHA */}
      <Modal isOpen={chaModal} onClose={() => isChaModal(false)} title="Create New CHA">
        <form onSubmit={handleChaSubmit}>
          <MainArea>
            <div className='grid gap-2 w-full p-1'>
              <div className='flex items-center justify-between w-full gap-1'>
                <label className='text-xs w-[20%]'>CHA Name</label>
                <input
                  className="h-8 p-1 rounded w-[80%] text-slate-900 border border-slate-400 dark:border-slate-600"
                  type="text"
                  name="cha_name"
                  value={chaForm.cha_name}
                  onChange={handleChaChange}
                  onKeyDown={(e) => handleEnter({ event: e, name: "cha_mobile" })}
                  placeholder="CHA Name"
                />
              </div>
              <div className='flex items-center justify-between w-full gap-1'>
                <label className='text-xs w-[20%]'>CHA Mobile</label>
                <input
                  className="h-8 p-1 rounded w-[80%] text-slate-900 border border-slate-400 dark:border-slate-600"
                  type="text"
                  name="cha_mobile"
                  value={chaForm.cha_mobile}
                  onChange={handleChaChange}
                  onKeyDown={(e) => handleEnter({ event: e, name: "cha_address" })}
                  placeholder="CHA Mobile"
                />
              </div>
              <div className='flex items-center justify-between w-full gap-1'>
                <label className='text-xs w-[20%]'>Address (optional)</label>
                <input
                  className="h-8 p-1 rounded w-[80%] text-slate-900 border border-slate-400 dark:border-slate-600"
                  type="text"
                  name="cha_address"
                  value={chaForm.cha_address}
                  onChange={handleChaChange}
                  onKeyDown={(e) => handleEnter({ event: e, name: "cha_submit" })}
                  placeholder="Address (optional)"
                />
              </div>
              <div className='w-full flex justify-end' name="cha_submit" onClick={handleChaSubmit}>
                <CustomButton title={"Save (Ctrl+S)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
              </div>
            </div>
          </MainArea>
        </form>
      </Modal>
    </>
  )
}

export default CreateChallan