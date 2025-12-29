import { Link } from 'react-router-dom';
import PageTitle from '../../components/PageTitle';
import CustomButton from '../../components/CustomButton';
import { useState } from 'react';

const Signin = () => {
  const [data, setData] = useState({
    username: "",
    password: ""
  });

  const handleSubmit = async () => {
    try {
    } catch (error) {
      console.log(error)
    };
  };

  return (
    <>
      <div className='min-h-screen w-full bg-slate-900 flex justify-center items-center'>
        <div className='w-[400px] bg-slate-900 rounded-md shadow-md shadow-slate-600 p-1'>
          <h1 className='text-white text-center text-xl'>Signin</h1>

          <form className='flex flex-col justify-center items-center gap-2' onSubmit={() => handleSubmit()}>

            <div className='flex flex-col w-full gap-1'>
              <label className='text-white text-xs uppercase'>Username</label>
              <input
                className="bg-slate-900 p-1 text-white rounded-md w-full lowercase"
                placeholder="Username"
                value={data.username}
                type="text"
                onChange={(e) => setData({ ...data, username: e.target.value })}
                required
              />
            </div>
            <div className='flex flex-col w-full gap-1'>
              <label className='text-white text-xs uppercase'>Password</label>
              <input
                className="bg-slate-900 p-1 text-white rounded-md w-full"
                placeholder="Password"
                value={data.password}
                type="password"
                onChange={(e) => setData({ ...data, password: e.target.value })}
                required
              />
            </div>
            <div className='flex w-full gap-1 justify-between'>
              <div className='text-start text-xs text-white'>Don't have an account?
                <Link to="/" className='hover:text-slate-600'> click here</Link>
              </div>
              <div className='text-start text-xs text-white'>
                <Link to="/forgot-password" className='hover:text-slate-600'>Forgot password</Link>
              </div>
            </div>
            <button type="submit" className='border border-slate-600 p-1 w-full bg-blue-500 rounded-md' >
              Signin
            </button>
          </form>
          <Link to="/" className='text-white'>Home</Link>
        </div>
      </div>
    </>
  )
}

export default Signin