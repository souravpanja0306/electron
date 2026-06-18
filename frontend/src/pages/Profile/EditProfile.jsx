import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import useAuthStore from '../../store/AuthStore';
import { AiOutlineSave, AiOutlineRollback } from "react-icons/ai";

// Components...
import PageTitle from '../../components/PageTitle';
import ActionArea from '../../components/ActionArea';
import MainArea from '../../components/MainArea';
import CustomButton from '../../components/CustomButton';

const EditProfile = () => {
  const navigate = useNavigate();
  const { profileData, updateProfileData, token } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    address_1: '',
    address_2: '',
    city: '',
    state: '',
    district: '',
    pincode: '',
    country: '',
    gst: '',
    pan: '',
    trade_licence: '',
    bank: '',
    ifse: '',
    branch: '',
    account_no: ''
  });

  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.name || '',
        mobile: profileData.mobile || '',
        email: profileData.email || '',
        address_1: profileData.address_1 || '',
        address_2: profileData.address_2 || '',
        city: profileData.city || '',
        state: profileData.state || '',
        district: profileData.district || '',
        pincode: profileData.pincode || '',
        country: profileData.country || '',
        gst: profileData.gst || '',
        pan: profileData.pan || '',
        trade_licence: profileData.trade_licence || '',
        bank: profileData.bank || '',
        ifse: profileData.ifse || '',
        branch: profileData.branch || '',
        account_no: profileData.account_no || ''
      });
    }
  }, [profileData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await updateProfileData(formData, token);
      if (result.status === 200) {
        toast.success("Profile updated successfully!");
        navigate('/profile');
      } else {
        toast.error(result.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <>
      <PageTitle>Update Profile</PageTitle>
      <div className='flex flex-col gap-1'>
        <ActionArea>
          <div onClick={() => navigate(-1)}>
            <CustomButton title="Back" color="slate"><AiOutlineRollback /></CustomButton>
          </div>
          <div onClick={handleSubmit}>
            <CustomButton title="Save Changes" color="blue"><AiOutlineSave /></CustomButton>
          </div>
        </ActionArea>

        <form onSubmit={handleSubmit} className='flex flex-col gap-1'>
          <MainArea>
            <div className="p-4 w-full">
              <h3 className="text-lg font-semibold mb-4 border-b pb-2">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="p-1 rounded w-[80%] text-slate-900 border border-slate-400 dark:border-slate-600"
                    placeholder="Full Name"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold">Mobile Number</label>
                  <input
                    type="text"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="p-1 rounded w-[80%] text-slate-900 border border-slate-400 dark:border-slate-600"
                    placeholder="Mobile Number"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="p-1 rounded w-[80%] text-slate-900 border border-slate-400 dark:border-slate-600"
                    placeholder="Email Address"
                    required
                  />
                </div>
              </div>
            </div>
          </MainArea>

          <MainArea>
            <div className="p-4 w-full">
              <h3 className="text-lg font-semibold mb-4 border-b pb-2">Business & Address Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold">GST Number</label>
                  <input
                    type="text"
                    name="gst"
                    value={formData.gst}
                    onChange={handleChange}
                    className="p-1 rounded w-[80%] text-slate-900 border border-slate-400 dark:border-slate-600"
                    placeholder="GST Number"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold">PAN Number</label>
                  <input
                    type="text"
                    name="pan"
                    value={formData.pan}
                    onChange={handleChange}
                    className="p-1 rounded w-[80%] text-slate-900 border border-slate-400 dark:border-slate-600"
                    placeholder="PAN Number"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold">Trade License</label>
                  <input
                    type="text"
                    name="trade_licence"
                    value={formData.trade_licence}
                    onChange={handleChange}
                    className="p-1 rounded w-[80%] text-slate-900 border border-slate-400 dark:border-slate-600"
                    placeholder="Trade License"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold">Address Line 1</label>
                  <input
                    type="text"
                    name="address_1"
                    value={formData.address_1}
                    onChange={handleChange}
                    className="p-1 rounded w-[80%] text-slate-900 border border-slate-400 dark:border-slate-600"
                    placeholder="Address Line 1"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold">Address Line 2</label>
                  <input
                    type="text"
                    name="address_2"
                    value={formData.address_2}
                    onChange={handleChange}
                    className="p-1 rounded w-[80%] text-slate-900 border border-slate-400 dark:border-slate-600"
                    placeholder="Address Line 2"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="p-1 rounded w-[80%] text-slate-900 border border-slate-400 dark:border-slate-600"
                    placeholder="City"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="p-1 rounded w-[80%] text-slate-900 border border-slate-400 dark:border-slate-600"
                    placeholder="Pincode"
                  />
                </div>
              </div>
            </div>
          </MainArea>

          <MainArea>
            <div className="p-4 w-full">
              <h3 className="text-lg font-semibold mb-4 border-b pb-2">Bank Account Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold">Bank Name</label>
                  <input
                    type="text"
                    name="bank"
                    value={formData.bank}
                    onChange={handleChange}
                    className="p-1 rounded w-[80%] text-slate-900 border border-slate-400 dark:border-slate-600"
                    placeholder="Bank Name"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold">Account Number</label>
                  <input
                    type="text"
                    name="account_no"
                    value={formData.account_no}
                    onChange={handleChange}
                    className="p-1 rounded w-[80%] text-slate-900 border border-slate-400 dark:border-slate-600"
                    placeholder="Account Number"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold">IFSC Code</label>
                  <input
                    type="text"
                    name="ifse"
                    value={formData.ifse}
                    onChange={handleChange}
                    className="p-1 rounded w-[80%] text-slate-900 border border-slate-400 dark:border-slate-600"
                    placeholder="IFSC Code"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold">Branch</label>
                  <input
                    type="text"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className="p-1 rounded w-[80%] text-slate-900 border border-slate-400 dark:border-slate-600"
                    placeholder="Branch Name"
                  />
                </div>
              </div>
            </div>
          </MainArea>
        </form>
      </div>
    </>
  );
};

export default EditProfile;