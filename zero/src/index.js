import ReactDOM from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from './pages/App';
import About from './pages/About';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import CreateInvoice from './pages/Invoice/CreateInvoice';
import ViewInvoice from './pages/Invoice/ViewInvoice';
import Notification from './pages/Notification';
import Profile from './pages/Profile/Profile';
import Setting from './pages/Setting';

const router = createBrowserRouter([
  { path: "/", element: <Layout> <App /></Layout> },
  { path: "/dashboard", element: <Layout> <Dashboard /></Layout> },
  { path: "/about", element: <Layout> <About /></Layout> },

  { path: "/create-invoice", element: <Layout> <CreateInvoice /></Layout> },
  { path: "/view-invoice", element: <Layout> <ViewInvoice /></Layout> },

  { path: "/notification", element: <Layout> <Notification /></Layout> },

  { path: "/profile", element: <Layout> <Profile /></Layout> },
  { path: "/settings", element: <Layout> <Setting /></Layout> },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <RouterProvider router={router} />
);