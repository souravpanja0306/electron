import React from "react";
import PageTitle from '../../components/PageTitle';

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
      <PageTitle>Update Profile</PageTitle>

      <div className="w-full h-full p-4">

        {/* Title */}
        <h1 className="text-2xl font-semibold mb-4">Profile</h1>

        {/* Profile card */}
        <div className="bg-slate-900 p-4 rounded-md flex gap-4 items-center">
          <img
            src="https://via.placeholder.com/80"
            alt="profile"
            className="w-20 h-20 rounded-full border border-slate-600"
          />

          <div>
            <h2 className="text-xl font-medium">Sourav Panja</h2>
            <p className="text-slate-600 text-sm">Software Engineer</p>
          </div>
        </div>

        {/* Account */}
        <div className="mt-4 bg-slate-900 p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Account Details</h3>

          <div className="space-y-2 text-sm text-slate-300">
            <p>Email: sourav@example.com</p>
            <p>Phone: +91 9876543210</p>
            <p>City: Kolkata, India</p>
          </div>
        </div>

        {/* Subscription */}
        <div className="mt-4 bg-slate-900 p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-3">Subscription</h3>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-300 text-sm">Current Plan:</p>
              <p className="text-xl font-medium">{subscription.plan}</p>

              <p className="text-slate-600 text-sm mt-1">Price: {subscription.price}</p>
              <p className="text-slate-600 text-sm">
                Remaining Days:{" "}
                <span className="text-green-400 font-semibold">
                  {subscription.daysLeft}
                </span>
              </p>
            </div>

            <button className="bg-slate-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium">
              Upgrade Plan
            </button>
          </div>
        </div>

        {/* Business Details */}
        <div className="mt-4 bg-slate-900 p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-3">Business Details</h3>

          <div className="space-y-2 text-sm text-slate-300">
            <p>GST Number: <span className="text-white">{businessDetails.gst}</span></p>
            <p>PAN: <span className="text-white">{businessDetails.pan}</span></p>
            <p>Trade License No.: <span className="text-white">{businessDetails.tradeLicense}</span></p>
            <p>Bank Account: <span className="text-white">{businessDetails.bankAccount}</span></p>
            <p>IFSC Code: <span className="text-white">{businessDetails.bankIFSC}</span></p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;