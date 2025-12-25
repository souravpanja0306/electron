import ReactDOM from 'react-dom/client';
import './index.css';
import { createHashRouter, RouterProvider } from "react-router-dom";

import Home from './pages/Home';
import About from './pages/About';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import CreateInvoice from './pages/Invoice/CreateInvoice';
import ViewInvoice from './pages/Invoice/ViewInvoice';
import Notification from './pages/Notification';
import Profile from './pages/Profile/Profile';
import Setting from './pages/Setting';
import SalesReport from './pages/Reports/SalesReport';
import EditProfile from './pages/Profile/EditProfile';
import PartyMaster from './pages/Master/PartyMaster/PartyMaster';
import Party from './pages/Master/PartyMaster/Party';
import CompanyMaster from './pages/Master/CompanyMaster';
import Company from './pages/Master/Company';
import ProductMaster from './pages/Master/ProductMaster';
import Product from './pages/Master/Product';
import Signin from './pages/Auth/Signin';
import ForgotPassword from './pages/Auth/ForgotPassword';

const router = createHashRouter([
  { path: "/", element: <Layout> <Home /></Layout> },

  { path: "/work", element: <Layout> <CreateInvoice /></Layout> },
  { path: "/create-invoice", element: <Layout> <CreateInvoice /></Layout> },
  { path: "/view-invoice", element: <Layout> <ViewInvoice /></Layout> },

  { path: "/dashboard", element: <Layout> <Dashboard /></Layout> },

  { path: "/sales-reports", element: <Layout> <SalesReport /></Layout> },

  { path: "/notification", element: <Layout> <Notification /></Layout> },

  { path: "/profile", element: <Layout> <Profile /></Layout> },
  { path: "/edit-profile", element: <Layout> <EditProfile /></Layout> },

  // Master...
  { path: "/add-party", element: <Layout> <PartyMaster /></Layout> },
  { path: "/party", element: <Layout> <Party /></Layout> },
  { path: "/add-company", element: <Layout> <CompanyMaster /></Layout> },
  { path: "/company", element: <Layout> <Company /></Layout> },
  { path: "/add-product", element: <Layout> <ProductMaster /></Layout> },
  { path: "/product", element: <Layout> <Product /></Layout> },

  { path: "/about", element: <Layout> <About /></Layout> },

  // Setting...
  { path: "/settings", element: <Layout> <Setting /></Layout> },
  { path: "/change-password", element: <Layout> <Setting /></Layout> },

  // Auth...
  { path: "/signin", element: <Signin /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <RouterProvider router={router} />
);