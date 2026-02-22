import { Link } from 'react-router-dom';
import { useState } from 'react';

// Components...
import PageTitle from '../components/PageTitle';
import ActionArea from '../components/ActionArea';
import MainArea from '../components/MainArea';
import CustomButton from '../components/CustomButton';
import CustomLoader from "../components/CustomLoader";
import Alert from '../components/Alert';

const Home = () => {
  const [count, setCount] = useState(0);

  const handleNext = () => {
    setCount(prev => (prev < 2 ? prev + 1 : prev));
  };

  const handlePrev = () => {
    setCount(prev => (prev > 0 ? prev - 1 : prev));
  };

  const handleSubmit = () => {
    console.log(count)
  };

  return (
    <>
      <PageTitle>Home</PageTitle>
      <MainArea>
        <div className="items-center justify-center p-6">

          <div className="flex justify-between items-center mb-8">
            <div className="flex-1 text-center">
              <div
                onClick={() => setCount(0)}
                className={`cursor-pointer select-none w-8 h-8 mx-auto rounded-full ${count === 0 ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"} text-white flex items-center justify-center`}>
                1
              </div>
              <p className="text-xs mt-2 text-slate-600 dark:text-slate-300">Company</p>
            </div>
            <div className="flex-1 h-1 bg-slate-300 dark:bg-slate-600"></div>
            <div className="flex-1 text-center">
              <div
                onClick={() => setCount(1)}
                className={`cursor-pointer select-none w-8 h-8 mx-auto rounded-full ${count === 1 ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"} text-white flex items-center justify-center`}>
                2
              </div>
              <p className="text-xs mt-2 text-slate-600 dark:text-slate-300">GST Setup</p>
            </div>
            <div className="flex-1 h-1 bg-slate-300 dark:bg-slate-600"></div>
            <div className="flex-1 text-center">
              <div
                onClick={() => setCount(2)}
                className={`cursor-pointer select-none w-8 h-8 mx-auto rounded-full ${count === 2 ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"} text-white flex items-center justify-center`}>
                3
              </div>
              <p className="text-xs mt-2 text-slate-600 dark:text-slate-300">Create Party</p>
            </div>
          </div>

          {
            count === 0
              ? <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-700 dark:text-white">
                  🟦 Step 1 — Create Company
                </h2>
                <span>
                  Setup your business profile
                  Enter your company name, address, contact details and basic information.
                  This will be used in invoices, reports and all transactions.
                </span>
                <input
                  type="text"
                  placeholder="Company Name"
                  className="p-1 rounded w-full text-slate-900 border border-slate-300 dark:border-slate-600"
                />
                <input
                  type="text"
                  placeholder="Address"
                  className="p-1 rounded w-full text-slate-900 border border-slate-300 dark:border-slate-600"
                />
                <input
                  type="text"
                  placeholder="Mobile Number"
                  className="p-1 rounded w-full text-slate-900 border border-slate-300 dark:border-slate-600"
                />
              </div>
              : <></>
          }
          {
            count === 1
              ? < div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-700 dark:text-white">
                  🟦 Step 2 — GST Configuration
                </h2>
                <span>
                  Configure tax details
                  Add your GST number and tax settings.
                  This ensures correct tax calculation in invoices and compliance with regulations.
                </span>
                <input
                  type="text"
                  placeholder="Company Name"
                  className="p-1 rounded w-full text-slate-900 border border-slate-300 dark:border-slate-600"
                />
                <input
                  type="text"
                  placeholder="Address"
                  className="p-1 rounded w-full text-slate-900 border border-slate-300 dark:border-slate-600"
                />
                <input
                  type="text"
                  placeholder="Mobile Number"
                  className="p-1 rounded w-full text-slate-900 border border-slate-300 dark:border-slate-600"
                />
              </div>
              : <></>
          }
          {
            count === 2
              ? < div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-700 dark:text-white">
                  🟦 Step 3 — Create First Party
                </h2>
                <span>
                  Add your first customer or supplier
                  Create a party profile to start billing or recording transactions.
                  You can add more parties later anytime.
                </span>
                <input
                  type="text"
                  placeholder="Company Name"
                  className="p-1 rounded w-full text-slate-900 border border-slate-300 dark:border-slate-600"
                />
                <input
                  type="text"
                  placeholder="Address"
                  className="p-1 rounded w-full text-slate-900 border border-slate-300 dark:border-slate-600"
                />
                <input
                  type="text"
                  placeholder="Mobile Number"
                  className="p-1 rounded w-full text-slate-900 border border-slate-300 dark:border-slate-600"
                />
              </div>
              : <></>
          }

          <div className="flex justify-end gap-3 mt-6">
            {
              count == 2 ?
                <button
                  onClick={(e) => handleSubmit(e)}
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
                  Save & Continue
                </button>
                : <></>
            }
            <button
              onClick={(e) => handlePrev(e)}
              className="px-4 py-2 rounded border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-700">
              Back
            </button>
            <button
              onClick={(e) => handleNext(e)}
              className="px-4 py-2 rounded border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-700">
              Next
            </button>
          </div>
        </div>
      </MainArea >
    </>
  );
};

export default Home;
