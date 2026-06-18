import React, { useEffect } from "react";
import useAuthStore from "../../store/AuthStore";
import { Link } from "react-router-dom";
import { AiOutlineEdit } from "react-icons/ai";

// Components...
import PageTitle from "../../components/PageTitle";
import MainArea from '../../components/MainArea';
import ActionArea from '../../components/ActionArea';
import CustomButton from '../../components/CustomButton';

const Profile = () => {
  const { profileData, getProfileData, token } = useAuthStore();

  useEffect(() => {
    getProfileData(token);
  }, []);

  if (!profileData) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const subscription = {
    plan: "Pro",
    price: "₹499 / month",
    daysLeft: 12,
  };

  return (
    <>
      <PageTitle>Profile</PageTitle>
      <div className='flex flex-col gap-1'>
        <ActionArea>
          <Link to="/edit-profile">
            <CustomButton title={"Edit"} color={"blue"}><AiOutlineEdit /></CustomButton>
          </Link>
        </ActionArea>

        <div className='grid gap-1'>
          <div className='flex flex-col gap-1'>
            <PageTitle>Document & Vehicle Info</PageTitle>
            <MainArea>
              <div className="flex items-center gap-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 shadow-sm w-full">
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-600 border">
                  {profileData.name?.charAt(0) || "U"}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                    {profileData.name}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    @{profileData.username}
                  </p>
                </div>
              </div>
            </MainArea>
          </div>
          <div className='flex flex-col gap-1'>
            <PageTitle>Account Details</PageTitle>
            <MainArea>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1 w-full">
                <div className="rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 shadow-sm">
                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <p><span className="font-medium text-slate-500">Email:</span> {profileData.email}</p>
                    <p><span className="font-medium text-slate-500">Phone:</span> {profileData.mobile}</p>
                    <p><span className="font-medium text-slate-500">City:</span> {profileData.city || "Not set"}</p>
                    <p><span className="font-medium text-slate-500">Address:</span> {profileData.address_1} {profileData.address_2}</p>
                  </div>
                </div>
                <div className="rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 flex justify-between items-center shadow-sm">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 uppercase mb-2">
                      Subscription
                    </h3>
                    <p className="text-xl font-bold mt-1">{subscription.plan}</p>
                    <p className="text-xs text-slate-500">{subscription.price}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Days left:{" "}
                      <span className="text-green-500 font-semibold">
                        {subscription.daysLeft}
                      </span>
                    </p>
                  </div>
                  <button className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm">
                    Upgrade
                  </button>
                </div>
              </div>
            </MainArea>
          </div>
          <div className='flex flex-col gap-1'>
            <PageTitle>Business Details</PageTitle>
            <MainArea>
              <div className="rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 shadow-sm w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400">
                  <p><span className="font-medium text-slate-500">GST:</span> <span className="text-slate-800 dark:text-white">{profileData.gst || "Not set"}</span></p>
                  <p><span className="font-medium text-slate-500">PAN:</span> <span className="text-slate-800 dark:text-white">{profileData.pan || "Not set"}</span></p>
                  <p><span className="font-medium text-slate-500">Trade License:</span> <span className="text-slate-800 dark:text-white">{profileData.trade_licence || "Not set"}</span></p>
                </div>
              </div>
            </MainArea>
          </div>
          <div className='flex flex-col gap-1'>
            <PageTitle>Bank Details</PageTitle>
            <MainArea>
              <div className="rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 shadow-sm w-full">
                <div className="md:col-span-2 bg-slate-50 dark:bg-slate-800 rounded">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                    <p><span className="font-medium text-slate-500">Bank Name:</span> {profileData.bank || "Not set"}</p>
                    <p><span className="font-medium text-slate-500">A/C No:</span> {profileData.account_no || "Not set"}</p>
                    <p><span className="font-medium text-slate-500">IFSC:</span> {profileData.ifse || "Not set"}</p>
                    <p><span className="font-medium text-slate-500">Branch:</span> {profileData.branch || "Not set"}</p>
                  </div>
                </div>
              </div>
            </MainArea>
          </div>
        </div>
      </div >
    </>
  );
};

export default Profile;