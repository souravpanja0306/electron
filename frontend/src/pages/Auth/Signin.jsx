import { Link, useNavigate } from 'react-router-dom';
import PageTitle from '../../components/PageTitle';
import CustomButton from '../../components/CustomButton';
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import useAuthStore from '../../store/AuthStore';
import { MdCropSquare, MdOutlineClose, MdHorizontalRule } from "react-icons/md";

const Signin = () => {
  const { signinData, signin, createMoneyReceipts, generateMoneyReceiptNo, signinLoading } = useAuthStore(); // Store...
  const navigate = useNavigate();

  useEffect(() => {
    const isAuth = localStorage.getItem("token");
    if (isAuth) navigate("/dashboard"); localStorage.setItem("currentMenu", "dashboard")
    console.log("hello");
  }, [])

  const [data, setData] = useState({ username: "", password: "" });
  const handleSubmitSignin = async () => {
    try {
      let result = await signin({ username: data.username, password: data.password });
      if (result.status === 200) {
        localStorage.setItem("token", result.body.token);
        localStorage.setItem("user", JSON.stringify(result.body));
        navigate("/");
      } else {
        toast(result.message, { theme: "dark" });
      };
    } catch (error) {
      console.log(error)
    };
  };

  return (
    <>
      {/* Custom Title Bar */}
      <div className="titlebar border-b border-slate-300 dark:border-slate-600 w-full h-10 bg-slate-200 dark:bg-slate-950 text-slate-900 dark:text-white flex items-center justify-between p-2 shadow-md">
        <div className="flex items-center gap-2">
          <div className="font-semibold tracking-wide">
            <Link to="#">HelloWorld</Link>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="flex text-sm">
              <div className="relative group">
                <button
                  title="Minimize"
                  onClick={() => window.api?.minimize()}
                  className="btn p-2 hover:bg-gray-300 dark:hover:bg-slate-800 hover:rounded hover:text-blue-600">
                  <MdHorizontalRule />
                </button>
              </div>
              <div className="relative group">
                <button
                  title="Restore"
                  onClick={() => window.api?.maximize()}
                  className="btn p-2 hover:bg-gray-300 dark:hover:bg-slate-800 hover:rounded hover:text-blue-600">
                  <MdCropSquare />
                </button>
              </div>
              <div className="relative group">
                <button
                  title="Close"
                  onClick={() => window.api?.close()}
                  className="btn p-2 hover:bg-red-500 dark:hover:bg-red-500 hover:rounded hover:text-white">
                  <MdOutlineClose />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Screen */}
      <div className="min-h-[calc(100vh-2.5rem)] w-full bg-slate-900 flex justify-center items-center select-none">
        <div className="w-[380px] bg-slate-800 rounded-xl shadow-lg shadow-black/40 p-6">

          <h1 className="text-white text-center text-2xl font-semibold mb-4">
            Sign in
          </h1>

          <form
            className="flex flex-col gap-4"
            onSubmit={() => handleSubmitSignin()}
          >
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 text-xs uppercase">
                Username
              </label>
              <input
                className="px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white 
                     focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Enter username"
                value={data.username}
                type="text"
                onChange={(e) => setData({ ...data, username: e.target.value })}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-400 text-xs uppercase">
                Password
              </label>
              <input
                className="px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white 
                     focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Enter password"
                value={data.password}
                type="password"
                onChange={(e) => setData({ ...data, password: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded transition-all"
            >
              Sign in
            </button>

            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>
                Don’t have an account?
                <Link to="/signup" className="ml-1 text-blue-400 hover:underline">
                  Register
                </Link>
              </span>

              <Link to="/forgot-password" className="text-blue-400 hover:underline">
                Forgot password?
              </Link>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </>
  )
}

export default Signin