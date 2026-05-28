import React from 'react';

const CreateCompany = ({ companyData, onCompanyDataChange }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onCompanyDataChange({
      ...companyData,
      [name]: value,
    });
  };

  return (
    <div className="space-y-4">
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
        name="companyName"
        value={companyData.companyName || ''}
        onChange={handleInputChange}
        placeholder="Company Name"
        className="p-1 rounded w-full text-slate-900 border border-slate-300 dark:border-slate-600"
      />
      <input
        type="text"
        name="address"
        value={companyData.address || ''}
        onChange={handleInputChange}
        placeholder="Address"
        className="p-1 rounded w-full text-slate-900 border border-slate-300 dark:border-slate-600"
      />
      <input
        type="text"
        name="mobileNumber"
        value={companyData.mobileNumber || ''}
        onChange={handleInputChange}
        placeholder="Mobile Number"
        className="p-1 rounded w-full text-slate-900 border border-slate-300 dark:border-slate-600"
      />
    </div>
  );
};

export default CreateCompany;
