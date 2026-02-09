import React from "react";
import PageTitle from "../../components/PageTitle";

const Profile = () => {
  const subscription = {
    plan: "Pro",
    price: "₹499 / month",
    daysLeft: 12,
  };

  const businessDetails = {
    gst: "22AAAAA0000A1Z5",
    pan: "ABCDE1234F",
    tradeLicense: "TL-5678901234",
    bankAccount: "123456789012",
    bankIFSC: "HDFC0001234",
  };

  return (
    <>
      <PageTitle>Profile</PageTitle>

      <div className="w-full max-w-5xl mx-auto p-4 space-y-6">
        <div className="flex items-center gap-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4">
          <img
            src="https://via.placeholder.com/96"
            alt="profile"
            className="w-24 h-24 rounded-full border"
          />
          <div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
              Sourav Panja
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Software Engineer
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 uppercase">
              Account Details
            </h3>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p>Email: sourav@example.com</p>
              <p>Phone: +91 9876543210</p>
              <p>City: Kolkata, India</p>
            </div>
          </div>
          <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 uppercase">
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
            <button className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm">
              Upgrade
            </button>
          </div>
        </div>
        <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 uppercase">
            Business Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-400">
            <p>GST: <span className="text-slate-800 dark:text-white">{businessDetails.gst}</span></p>
            <p>PAN: <span className="text-slate-800 dark:text-white">{businessDetails.pan}</span></p>
            <p>Trade License: <span className="text-slate-800 dark:text-white">{businessDetails.tradeLicense}</span></p>
            <p>Bank A/C: <span className="text-slate-800 dark:text-white">{businessDetails.bankAccount}</span></p>
            <p>IFSC: <span className="text-slate-800 dark:text-white">{businessDetails.bankIFSC}</span></p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;