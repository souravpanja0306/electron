import ReactDOM from 'react-dom/client';
import './index.css';
import { createHashRouter, RouterProvider } from "react-router-dom";

import Home from './pages/Home';
import About from './pages/About';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import CreateInvoice from './pages/Invoice/Create/CreateInvoice';
import ViewInvoice from './pages/Invoice/View/ViewInvoice';
import ViewInvoiceDetails from './pages/Invoice/View/ViewInvoiceDetails';
import Notification from './pages/Notification';
import Profile from './pages/Profile/Profile';
import Setting from './pages/Setting';
import SalesReport from './pages/Reports/SalesReport';
import EditProfile from './pages/Profile/EditProfile';
import CreateParty from './pages/Master/PartyMaster/Create/CreateParty';
import ViewParty from './pages/Master/PartyMaster/View/ViewParty';
import CompanyMaster from './pages/Master/CompanyMaster/View/CompanyMaster';
import Company from './pages/Master/CompanyMaster/Create/Company';
import ProductMaster from './pages/Master/ProductMaster/View/ProductMaster';
import Product from './pages/Master/ProductMaster/Create/Product';
import Signin from './pages/Auth/Signin';
import ForgotPassword from './pages/Auth/ForgotPassword';
import Debtors from './pages/Reports/Debtors';
import Error from './pages/Error';
import Creditors from './pages/Reports/Creditors';

import { Middleware } from './middleware/middleware';

const router = createHashRouter([
  {
    path: "/*", element: <Error />
  },
  {
    path: "/", element:
      <Middleware>
        <Layout>
          <Home />
        </Layout>
      </Middleware>
  },
  {
    path: "/create-invoice", element:
      <Middleware>
        <Layout>
          <CreateInvoice />
        </Layout>
      </Middleware>
  },
  {
    path: "/view-invoice", element:
      <Middleware>
        <Layout>
          <ViewInvoice />
        </Layout>
      </Middleware>
  },
  {
    path: "/view-invoice/details", element:
      <Middleware>
        <Layout>
          <ViewInvoiceDetails />
        </Layout>
      </Middleware>
  },
  {
    path: "/create-creditors", element:
      <Middleware>
        <Layout>
          <CreateInvoice />
        </Layout>
      </Middleware>
  },
  {
    path: "/view-all-creditors", element:
      <Middleware>
        <Layout>
          <ViewInvoice />
        </Layout>
      </Middleware>
  },
  {
    path: "/dashboard", element:
      <Middleware>
        <Layout>
          <Dashboard />
        </Layout>
      </Middleware>
  },
  {
    path: "/sales-reports", element:
      <Middleware>
        <Layout>
          <SalesReport />
        </Layout>
      </Middleware>
  },
  {
    path: "/debtors", element:
      <Middleware>
        <Layout>
          <Debtors />
        </Layout>
      </Middleware>
  },
  {
    path: "/creditors", element:
      <Middleware>
        <Layout>
          <Creditors />
        </Layout>
      </Middleware>
  },
  {
    path: "/notification", element:
      <Middleware>
        <Layout>
          <Notification />
        </Layout>
      </Middleware>
  },
  {
    path: "/profile", element:
      <Middleware>
        <Layout>
          <Profile />
        </Layout>
      </Middleware>
  },
  {
    path: "/edit-profile", element:
      <Middleware>
        <Layout>
          <EditProfile />
        </Layout>
      </Middleware>
  },
  {
    path: "/add-party", element:
      <Middleware>
        <Layout>
          <CreateParty />
        </Layout>
      </Middleware>
  },
  {
    path: "/party", element:
      <Middleware>
        <Layout>
          <ViewParty />
        </Layout>
      </Middleware>
  },
  {
    path: "/add-company", element:
      <Middleware>
        <Layout>
          <CompanyMaster />
        </Layout>
      </Middleware>
  },
  {
    path: "/company", element:
      <Middleware>
        <Layout>
          <Company />
        </Layout>
      </Middleware>
  },
  {
    path: "/add-product", element:
      <Middleware>
        <Layout>
          <ProductMaster />
        </Layout>
      </Middleware>
  },
  {
    path: "/product", element:
      <Middleware>
        <Layout>
          <Product />
        </Layout>
      </Middleware>
  },

  {
    path: "/about", element:
      <Middleware>
        <Layout>
          <About />
        </Layout>
      </Middleware>
  },
  {
    path: "/settings", element:
      <Middleware>
        <Layout>
          <Setting />
        </Layout>
      </Middleware>
  },
  {
    path: "/change-password", element:
      <Middleware>
        <Layout>
          <Setting />
        </Layout>
      </Middleware>
  },
  { path: "/signin", element: <Signin /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <RouterProvider router={router} />
);