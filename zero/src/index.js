import ReactDOM from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from './pages/App';
import About from './pages/About';
import Layout from './components/Layout';

const router = createBrowserRouter([
  { path: "/", element: <Layout> <App /></Layout> },
  { path: "/about", element: <Layout> <About /></Layout> },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <RouterProvider router={router} />
);