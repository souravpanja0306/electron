import { Link, useNavigate } from 'react-router-dom';
import PageTitle from '../../components/PageTitle';
import CustomButton from '../../components/CustomButton';
import { useEffect, useState } from 'react';

// Functions...
import { handleSignin } from "./Service";

const Signin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isAuth = localStorage.getItem("token");
    if (isAuth) navigate("/");
    console.log("hello");
  }, [])

  const [data, setData] = useState({
    username: "",
    password: ""
  });

  const handleSubmitSignin = async () => {
    try {
      let result = await handleSignin({
        username: data.username,
        password: data.password,
      });
      if (result.status === 200) {
        sessionStorage.setItem("token", result.body.token);
        localStorage.setItem("token", result.body.token);
        sessionStorage.setItem("user", JSON.stringify(result.body));
        localStorage.setItem("user", JSON.stringify(result.body));
        navigate("/");
      };

    } catch (error) {
      console.log(error)
    };
  };

  return (
    <>
      <div className="min-h-screen w-full bg-slate-900 flex justify-center items-center select-none">
        <div className="w-[380px] bg-slate-800 rounded-xl shadow-lg shadow-black/40 p-6">

          <h1 className="text-white text-center text-2xl font-semibold mb-4">
            Sign in
          </h1>

          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmitSignin}
          >
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 text-xs uppercase">
                Username
              </label>
              <input
                className="px-3 py-2 rounded-md bg-slate-900 border border-slate-700 text-white 
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
                className="px-3 py-2 rounded-md bg-slate-900 border border-slate-700 text-white 
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
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition-all"
            >
              Sign in
            </button>

            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>
                Don’t have an account?
                <Link to="/" className="ml-1 text-blue-400 hover:underline">
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

    </>
  )
}

export default Signin