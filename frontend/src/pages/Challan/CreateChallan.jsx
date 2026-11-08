import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import moment from 'moment';
import { useNavigate, useSearchParams } from "react-router-dom";

// Components...
import PageTitle from '../../components/PageTitle';
import ActionArea from '../../components/ActionArea';
import CustomButton from '../../components/CustomButton';
import ChallanForm, { QuickAddModals } from '../../components/ChallanForm';

// Icon...
import {
  AiOutlineFileAdd,
  AiOutlineTable,
  AiOutlineRollback,
} from "react-icons/ai";

// Stores...
import useCompanyStore from "../../store/CompanyStore";
import useAuthStore from '../../store/AuthStore';
import useChallanStore from "../../store/ChallanStore";

// Custom Hooks...
import { usePartyHook } from '../../hooks/usePartyHook';
import { useChaHook } from '../../hooks/useChaHook';
import useShortcuts from "../../hooks/useShortcuts";
import useFormFieldSettings from "../../hooks/useFormFieldSettings";

const newRow = () => ({
  id: Math.floor(Math.random() * 10000000000),
  packages: "",
  description: "",
  weight: "",
  amount: ""
});

const CreateChallan = () => {
  const [chaModal, isChaModal] = useState(false);
  const [partyModal, isPartyModal] = useState(false);
  const { token } = useAuthStore();
  const [searchParams] = useSearchParams();
  const back = searchParams.get("back");
  const navigate = useNavigate();

  const { companyData, getAllCompany } = useCompanyStore();
  const { createChallan, generateChallanNo, challanLoading } = useChallanStore();

  const { handlePartySubmit, parties, getParty, loading: partyLoading, error: partyError } = usePartyHook({
    onSuccess: () => {
      isPartyModal(false);
    }
  });
  const { handleChaSubmit, chaData, getCha, loading: chaLoading, error: chaError } = useChaHook({
    onSuccess: () => {
      isChaModal(false);
    }
  });

  useEffect(() => {
    getParty({});
    getAllCompany(token);
    getCha();
  }, []);

  const [data, setData] = useState([newRow()]);

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

  const { showCha } = useFormFieldSettings();

  const selectCompany = async (companyId) => {
    setForm(prev => ({ ...prev, company_id: companyId }));
    try {
      let result = await generateChallanNo(token, companyId);
      if (result.status === 200) {
        setForm(prev => ({ ...prev, cn_no: result.body }));
      }
    } catch (error) {
      console.log(error);
      toast.error("Could not generate the C/N number. Please enter it manually.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "company_id") return selectCompany(value);
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // With a single company there is nothing to choose, so pick it (and its C/N no.) automatically.
  useEffect(() => {
    if (!form.company_id && companyData?.length === 1) selectCompany(companyData[0].id);
  }, [companyData]);

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
    setData(prev => [...prev, newRow()]);
  };

  const handleRemoveFields = (id) => {
    setData(prev => (prev.length > 1 ? prev.filter(item => item.id !== id) : prev));
  };

  const handleSubmitForm = async (e) => {
    if (e) e.preventDefault();
    if (challanLoading) return;
    try {
      if (!form.company_id || !form.consignor_id || !form.consignee_id) {
        return toast.error("Company, Consignor and Consignee are required.");
      };
      if (!String(form.cn_no).trim()) {
        return toast.error("C/N No is required.");
      };
      if (form.consignor_id === form.consignee_id) {
        toast.warning("Consignor and Consignee are the same party.");
      };
      let payload = { ...form, data: data };
      // CHA switched off in settings: don't save one.
      if (!showCha) payload = { ...payload, cha: "" };
      let result = await createChallan(payload, token);
      if (result.status === 200) {
        toast.success(result.message);
        navigate("/view-challan");
      } else {
        toast.error(result.message);
      };
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      console.log(error);
    };
  };

  // Page shortcuts stay off while a quick-add dialog is open.
  useShortcuts({
    s: (e) => handleSubmitForm(e),
    i: () => navigate("/view-challan"),
  }, !chaModal && !partyModal);

  return (
    <>
      <PageTitle>Create Challan</PageTitle>
      <div className="flex flex-col gap-2">
        <ActionArea>
          {back && (
            <CustomButton onClick={() => navigate(-1)} title={"Back"} color={"slate"}><AiOutlineRollback /></CustomButton>
          )}
          <CustomButton onClick={handleSubmitForm} title={"Save (Ctrl+S)"} color={"blue"} disabled={challanLoading}><AiOutlineFileAdd /></CustomButton>
          <CustomButton onClick={() => navigate("/view-challan")} title={"View (Ctrl+I)"} color={"slate"}><AiOutlineTable /></CustomButton>
        </ActionArea>

        <ChallanForm
          form={form}
          data={data}
          onChange={handleChange}
          onChangeData={handleChangeData}
          onAddRow={handleAddFields}
          onRemoveRow={handleRemoveFields}
          onSubmit={handleSubmitForm}
          companyData={companyData}
          parties={parties}
          chaData={chaData}
          onAddParty={() => isPartyModal(true)}
          onAddCha={() => isChaModal(true)}
          showCha={showCha}
        />
      </div>

      <QuickAddModals
        chaOpen={chaModal}
        onCloseCha={() => isChaModal(false)}
        onSubmitCha={handleChaSubmit}
        chaLoading={chaLoading}
        chaError={chaError}
        partyOpen={partyModal}
        onCloseParty={() => isPartyModal(false)}
        onSubmitParty={handlePartySubmit}
        partyLoading={partyLoading}
        partyError={partyError}
      />
    </>
  )
}

export default CreateChallan
