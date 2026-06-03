import React, { useEffect } from "react";
import PageTitle from "../../components/PageTitle";
import useAuthStore from "../../store/AuthStore";
import { Link } from "react-router-dom";
import { AiOutlineEdit } from "react-icons/ai";
import ActionArea from '../../components/ActionArea';
import CustomButton from '../../components/CustomButton';

const Profile = () => {
  const { profileData, getProfileData, authToken, token } = useAuthStore();

  useEffect(() => {
    const loadProfile = async () => {
      await authToken();
    };
    loadProfile();
  }, []);

  useEffect(() => {
    if (token) {
      getProfileData(token);
    }
  }, [token]);

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
      <ActionArea>
        <Link to="/edit-profile">
          <CustomButton title={"Edit"} color={"blue"}><AiOutlineEdit /></CustomButton>
        </Link>
      </ActionArea>

      <div className="w-full max-w-5xl mx-auto p-4 space-y-6">
        <div className="flex items-center gap-4 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 uppercase border-b pb-2">
              Account Details
            </h3>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p><span className="font-medium text-slate-500">Email:</span> {profileData.email}</p>
              <p><span className="font-medium text-slate-500">Phone:</span> {profileData.mobile}</p>
              <p><span className="font-medium text-slate-500">City:</span> {profileData.city || "Not set"}</p>
              <p><span className="font-medium text-slate-500">Address:</span> {profileData.address_1} {profileData.address_2}</p>
            </div>
          </div>
          <div className="rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 flex justify-between items-center shadow-sm">
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
        <div className="rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 uppercase border-b pb-2">
            Business Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400">
            <p><span className="font-medium text-slate-500">GST:</span> <span className="text-slate-800 dark:text-white">{profileData.gst || "Not set"}</span></p>
            <p><span className="font-medium text-slate-500">PAN:</span> <span className="text-slate-800 dark:text-white">{profileData.pan || "Not set"}</span></p>
            <p><span className="font-medium text-slate-500">Trade License:</span> <span className="text-slate-800 dark:text-white">{profileData.trade_licence || "Not set"}</span></p>
            <div className="md:col-span-2 mt-2 p-3 bg-slate-50 dark:bg-slate-800 rounded">
              <h4 className="font-semibold mb-2 text-slate-700 dark:text-slate-200">Bank Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <p><span className="font-medium text-slate-500">Bank Name:</span> {profileData.bank || "Not set"}</p>
                <p><span className="font-medium text-slate-500">A/C No:</span> {profileData.account_no || "Not set"}</p>
                <p><span className="font-medium text-slate-500">IFSC:</span> {profileData.ifse || "Not set"}</p>
                <p><span className="font-medium text-slate-500">Branch:</span> {profileData.branch || "Not set"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;