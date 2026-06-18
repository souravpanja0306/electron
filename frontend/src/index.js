import ReactDOM from 'react-dom/client';
import './index.css';
import { createHashRouter, RouterProvider } from "react-router-dom";

import Home from './pages/Home';
import About from './pages/About';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import CreateInvoice from './pages/Invoice/CreateInvoice';
import ViewInvoice from './pages/Invoice/ViewInvoice';
import ViewInvoiceDetails from './pages/Invoice/ViewInvoiceDetails';
import Notification from './pages/Notification';
import Profile from './pages/Profile/Profile';
import Setting from './pages/Setting';
import SalesReport from './pages/Reports/SalesReport';
import EditProfile from './pages/Profile/EditProfile';
import PartyCreate from './pages/Master/PartyMaster/PartyCreate';
import PartyView from './pages/Master/PartyMaster/PartyView';
import CompanyMaster from './pages/Master/CompanyMaster/CompanyView';
import Company from './pages/Master/CompanyMaster/CompanyCreate';
import ProductMaster from './pages/Master/ProductMaster/ProductMaster';
import Product from './pages/Master/ProductMaster/Product';
import Signin from './pages/Auth/Signin';
import Signup from './pages/Auth/Signup';
import ForgotPassword from './pages/Auth/ForgotPassword';
import Debtors from './pages/Reports/Debtors';
import CustomerLedger from './pages/Reports/CustomerLedger';
import Error from './pages/Error';
import Creditors from './pages/Reports/Creditors';
import CreateMoneyReceipts from './pages/Receipts/MoneyReceipts';
import ViewMoneyReceipts from './pages/Receipts/ViewMoneyReceipts';
import EditMoneyReceipts from './pages/Receipts/EditMoneyReceipts';
import CreateHsnSac from './pages/Master/HsnMaster/CreateHsnSac';
import ViewHsnSac from './pages/Master/HsnMaster/ViewHsnSac';
import CreateGst from './pages/Master/GstMaster/CreateGst';
import ViewGst from './pages/Master/GstMaster/ViewGst';
import ChangePassword from './pages/Auth/ChangePassword';
import CreateChallan from './pages/Challan/CreateChallan';
import ViewChallan from './pages/Challan/ViewChallan';
import EditChallan from './pages/Challan/EditChallan';
import CompanyViewDetails from './pages/Master/CompanyMaster/CompanyViewDetails';
import PartyEdit from './pages/Master/PartyMaster/PartyEdit';
import Documentation from './pages/Documentation';
import ContactUs from './pages/ContactUs';

import { Middleware } from './middleware/middleware';

const router = createHashRouter([
  {
    element: (
      <Middleware>
        <Layout />
      </Middleware>
    ),
    children: [
      { path: "/", element: <Home /> },
      { path: "/create-invoice", element: <CreateInvoice /> },
      { path: "/view-invoice", element: <ViewInvoice /> },
      { path: "/view-invoice/details", element: <ViewInvoiceDetails /> },
      { path: "/create-creditors", element: <CreateInvoice /> },
      { path: "/create-moeny-receipts", element: <CreateMoneyReceipts /> },
      { path: "/view-money-receipts", element: <ViewMoneyReceipts /> },
      { path: "/view-money-receipt/details", element: <EditMoneyReceipts /> },
      { path: "/view-all-creditors", element: <ViewInvoice /> },
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/sales-reports", element: <SalesReport /> },
      { path: "/debtors", element: <Debtors /> },
      { path: "/debtors/details-debtors", element: <CustomerLedger /> },
      { path: "/creditors", element: <Creditors /> },
      { path: "/notification", element: <Notification /> },
      { path: "/profile", element: <Profile /> },
      { path: "/edit-profile", element: <EditProfile /> },
      { path: "/add-party", element: <PartyCreate /> },
      { path: "/party", element: <PartyView /> },
      { path: "/edit-party/:id", element: <PartyEdit /> },
      { path: "/add-product", element: <ProductMaster /> },
      { path: "/product", element: <Product /> },

      // CMS
      { path: "/about", element: <About /> },
      { path: "/documentation", element: <Documentation /> },
      { path: "/contact-us", element: <ContactUs /> },
      { path: "/settings", element: <Setting /> },

      // Add Company
      { path: "/add-company", element: <Company /> },
      { path: "/company", element: <CompanyMaster /> },
      { path: "/edit-company/:id", element: <CompanyViewDetails /> },
      { path: "/view-company-details/:id", element: <CompanyViewDetails /> },

      // Challans
      { path: "/create-challan", element: <CreateChallan /> },
      { path: "/view-challan", element: <ViewChallan /> },
      { path: "/edit-challan/:id", element: <EditChallan /> },

      // GST
      { path: "/create-gst", element: <CreateGst /> },
      { path: "/view-gst", element: <ViewGst /> },

      // HSN and SAC
      { path: "/create-hsn-sac", element: <CreateHsnSac /> },
      { path: "/view-hsn-sac", element: <ViewHsnSac /> },

      // Vehicles
      { path: "/create-hsn-sac", element: <CreateHsnSac /> },
      { path: "/view-hsn-sac", element: <ViewHsnSac /> },

      // Auth
      { path: "/change-password", element: <ChangePassword /> },
    ]
  },
  // Auth
  { path: "/signin", element: <Signin /> },
  { path: "/signup", element: <Signup /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/*", element: <Error /> },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <RouterProvider router={router} />
);