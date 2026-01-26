import { Link, useNavigate } from 'react-router-dom';
import PageTitle from '../../components/PageTitle';
import CustomButton from '../../components/CustomButton';
import { useState } from 'react';

// Functions...
import { handleSignin } from "./Service";

const Signin = () => {
  const navigate = useNavigate();
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
      <div className='min-h-screen w-full bg-slate-900 flex justify-center items-center select-none'>
        <div className='w-[400px] bg-slate-900 rounded-md shadow-md shadow-slate-600 p-1'>
          <h1 className='text-white text-center text-xl'>Signin</h1>

          <form className='flex flex-col justify-center items-center gap-2' onSubmit={() => handleSubmitSignin()}>

            <div className='flex flex-col w-full gap-1'>
              <label className='text-white text-xs uppercase'>Username</label>
              <input
                className="p-1 rounded-md w-full text-slate-900"
                placeholder="Username"
                value={data.username}
                type="text"
                onChange={(e) => setData({ ...data, username: e.target.value })}
                required
              />
            </div>
            <div className='flex flex-col w-full gap-1'>
              <label className='text-white text-xs'>Password</label>
              <input
                className="p-1 rounded-md w-full text-slate-900"
                placeholder="Password"
                value={data.password}
                type="password"
                onChange={(e) => setData({ ...data, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" className='border border-slate-600 p-1 w-full bg-blue-600 rounded-md' >
              Signin
            </button>
            <div className='flex w-full gap-1 justify-between'>
              <div className='text-start text-xs text-white'>Don't have an account?
                <Link to="/" className='hover:text-slate-600'> click here</Link>
              </div>
              <div className='text-start text-xs text-white'>
                <Link to="/forgot-password" className='hover:text-slate-600'>Forgot password</Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default Signin