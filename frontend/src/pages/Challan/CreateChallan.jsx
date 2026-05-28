import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import PageTitle from '../../components/PageTitle';
import ActionArea from '../../components/ActionArea';
import MainArea from '../../components/MainArea';
import CustomButton from '../../components/CustomButton';
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
import useCompanyStore from "../../store/CompanyStore";
import usePartyStore from "../../store/PartyStore"


const CreateChallan = () => {
  let token = localStorage.getItem("token");
  const [searchParams] = useSearchParams();
  const back = searchParams.get("back");
  const navigate = useNavigate();

  const { parties, getAllParty } = usePartyStore();
  const { companyData, getAllCompany } = useCompanyStore();

  useEffect(() => {
    getAllParty();
    getAllCompany(token);
  }, []);

  const [data, setData] = useState([
    { id: Math.floor(Math.random() * 10000000000), packages: "", description: "", weight: "", },
  ]);

  const [form, setForm] = useState({
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
    data: data,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleChangeData = (e) => {
    setData((prev) =>
      prev.map((row) =>
        row.id == e.target.id ? { ...row, [e.target.name]: e.target.value } : row
      ),
    );
    setForm({ ...form, data: data, });
  };

  const handleAddFields = () => {
    setData([...data, {
      id: Math.floor(Math.random() * 10000000000),
      packages: "",
      description: "",
      weight: ""
    }]);
  };

  const handleRemoveFields = (id) => {
    setData(data.filter(item => item.id !== id));
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    console.log(form);
    toast.success("Challan Saved (Check Console)");
  };

  const printInvoice = (e) => {
    if (e) e.preventDefault();
    console.log(form);
  };

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
          <div onClick={printInvoice}>
            <CustomButton title={"Print (Ctrl+P)"} color={"blue"} ><AiOutlinePrinter /></CustomButton>
          </div>
        </ActionArea>

        <PageTitle>Challan Details</PageTitle>
        <MainArea>
          <div className='flex flex-col w-full gap-2 p-1'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-2 w-full'>
              <div className='flex flex-col w-full gap-1'>
                <label className='text-xs'>Consignor</label>
                <div className='flex items-center gap-1'>
                  <select
                    className="h-8 p-1 rounded w-full text-slate-900 border border-slate-400 dark:border-slate-600"
                    name="consignor_id"
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled selected>Select Consignor</option>
                    {parties?.body?.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.company_name}
                      </option>
                    ))}
                  </select>
                  <Link
                    to="/add-party?back=true"
                    className="h-8 px-3 flex items-center justify-center rounded-md bg-blue-600 text-white hover:bg-blue-700 transition whitespace-nowrap"
                  >
                    + New
                  </Link>
                </div>
              </div>

              <div className='flex flex-col w-full gap-1'>
                <label className='text-xs'>Consignee</label>
                <div className='flex items-center gap-1'>
                  <select
                    className="h-8 p-1 rounded w-full text-slate-900 border border-slate-400 dark:border-slate-600"
                    name="consignee_id"
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled selected>Select Consignee</option>
                    {parties?.body?.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.company_name}
                      </option>
                    ))}
                  </select>
                  <Link
                    to="/add-party?back=true"
                    className="h-8 px-3 flex items-center justify-center rounded-md bg-blue-600 text-white hover:bg-blue-700 transition whitespace-nowrap"
                  >
                    + New
                  </Link>
                </div>
              </div>

              <div className='flex flex-col w-full gap-1'>
                <label className='text-xs'>CHA</label>
                <input
                  className="h-8 p-1 rounded w-full text-slate-900 border border-slate-400 dark:border-slate-600"
                  type="text"
                  name="cha"
                  onChange={handleChange}
                  placeholder="CHA"
                />
              </div>
            </div>

            <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 w-full'>
              <div className='flex flex-col w-full gap-1'>
                <label className='text-xs'>C/N No</label>
                <input
                  className="h-8 p-1 rounded w-full text-slate-900 border border-slate-400 dark:border-slate-600"
                  type="text"
                  name="cn_no"
                  onChange={handleChange}
                  placeholder="C/N No"
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
                />
              </div>
              <div className='flex flex-col w-full gap-1'>
                <label className='text-xs'>Invoice No</label>
                <input
                  className="h-8 p-1 rounded w-full text-slate-900 border border-slate-400 dark:border-slate-600"
                  type="text"
                  name="invoice_no"
                  onChange={handleChange}
                  placeholder="Invoice No"
                />
              </div>
              <div className='flex flex-col w-full gap-1'>
                <label className='text-xs'>From</label>
                <input
                  className="h-8 p-1 rounded w-full text-slate-900 border border-slate-400 dark:border-slate-600"
                  type="text"
                  name="from_loc"
                  onChange={handleChange}
                  placeholder="From"
                />
              </div>
              <div className='flex flex-col w-full gap-1'>
                <label className='text-xs'>To</label>
                <input
                  className="h-8 p-1 rounded w-full text-slate-900 border border-slate-400 dark:border-slate-600"
                  type="text"
                  name="to_loc"
                  onChange={handleChange}
                  placeholder="To"
                />
              </div>
              <div className='flex flex-col w-full gap-1'>
                <label className='text-xs'>Truck No</label>
                <input
                  className="h-8 p-1 rounded w-full text-slate-900 border border-slate-400 dark:border-slate-600"
                  type="text"
                  name="truck_no"
                  onChange={handleChange}
                  placeholder="Truck No"
                />
              </div>
              <div className='flex flex-col w-full gap-1'>
                <label className='text-xs'>Way Bill No</label>
                <input
                  className="h-8 p-1 rounded w-full text-slate-900 border border-slate-400 dark:border-slate-600"
                  type="text"
                  name="way_bill_no"
                  onChange={handleChange}
                  placeholder="Way Bill No"
                />
              </div>
            </div>
          </div>
        </MainArea>

        <PageTitle>Item Details</PageTitle>
        <MainArea>
          <table className='w-full select-none'>
            <thead>
              <tr className='text-slate-600 dark:text-white text-sm font-semibold text-center'>
                <th className='w-12'>Sl. No.</th>
                <th className='w-32'>No. of Packages</th>
                <th className=''>Particulars of Goods</th>
                <th className='w-32'>Weight (KG)</th>
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
                          type="text"
                        />
                      </td>
                      <td className=''>
                        <input
                          className="w-full p-1 rounded border border-slate-400 dark:border-slate-600"
                          value={item.description}
                          id={item.id}
                          name="description"
                          onChange={(e) => handleChangeData(e)}
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
                          type='text'
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

      </div>
      <ToastContainer />
    </>
  )
}

export default CreateChallan