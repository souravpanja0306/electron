import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AiOutlineArrowLeft, AiOutlineArrowRight, AiOutlineCheck } from 'react-icons/ai';

// Components...
import PageTitle from '../components/PageTitle';
import ActionArea from '../components/ActionArea';
import MainArea from '../components/MainArea';
import CustomButton from '../components/CustomButton';
import CustomLoader from "../components/CustomLoader";

// Store...
import useAuthStore from '../store/AuthStore';

const Home = () => {
  const { authToken, token } = useAuthStore(); // Store...
  const navigate = useNavigate();

  useEffect(() => {
    authToken();
  }, []);

  const [count, setCount] = useState(0);
  const [companyData, setCompanyData] = useState({});

  const handleCompanyDataChange = (data) => {
    setCompanyData(data);
  };

  const handleNext = () => {
    if (count === 0) {
      if (!companyData.companyName) {
        console.error("Company Name is required.");
        return;
      }
    }
    setCount(prev => (prev < 2 ? prev + 1 : prev));
  };

  const handlePrev = () => {
    setCount(prev => (prev > 0 ? prev - 1 : prev));
  };

  const handleSubmit = () => {
    console.log("Final Data:", { companyData }); // Placeholder for actual submission
  };

  return (
    <>
      <PageTitle>Home</PageTitle>
      <MainArea>
        {/* <div className="items-center justify-center p-6">

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

          {count === 0 && (
            <CreateCompany
              companyData={companyData}
              onCompanyDataChange={handleCompanyDataChange}
            />
          )}
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
            <button
              disabled={count === 0}
              onClick={(e) => handlePrev(e)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all shadow-sm
                ${count === 0 
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200" 
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95"}`}
            >
              <AiOutlineArrowLeft size={14} />
              <span>Back</span>
            </button>

            {count === 2 ? (
              <button
                onClick={(e) => handleSubmit(e)}
                className="flex items-center gap-2 px-5 py-1.5 rounded bg-green-600 text-white text-xs font-semibold uppercase tracking-wider hover:bg-green-700 transition-all active:scale-95 shadow-md"
              >
                <AiOutlineCheck size={14} />
                <span>Save & Continue</span>
              </button>
            ) : (
              <button
                onClick={(e) => handleNext(e)}
                className="flex items-center gap-2 px-5 py-1.5 rounded bg-blue-600 text-white text-xs font-semibold uppercase tracking-wider hover:bg-blue-700 transition-all active:scale-95 shadow-md shadow-blue-500/20"
              >
                <span>Next</span>
                <AiOutlineArrowRight size={14} />
              </button>
            )}
          </div>
        </div> */}
        Hello
      </MainArea >
    </>
  );
};

export default Home;
