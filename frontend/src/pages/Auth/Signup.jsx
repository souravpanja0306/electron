import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import useAuthStore from '../../store/AuthStore';

const Signup = () => {
    const navigate = useNavigate();
    const { signinData, signup, signinLoading } = useAuthStore(); // Store...
    const [data, setData] = useState({ name: "", mobile: "", mobile: "", username: "", password: "" });

    const handleSubmitSignup = async (e) => {
        try {
            e.preventDefault();
            let result = await signup(data);
            if (result.status === 200) {
                localStorage.setItem("token", result.body.token);
                localStorage.setItem("user", JSON.stringify(result.body));
                navigate("/");
                toast(result.message, { theme: "dark" });
            } else {
                toast(result.message, { theme: "dark" });
            };
        } catch (error) {
            console.log(error)
        };
    };
    return (
        <div className="min-h-screen w-full bg-slate-900 flex justify-center items-center select-none">
            <div className="w-[380px] bg-slate-800 rounded-xl shadow-lg shadow-black/40 p-6">

                <h1 className="text-white text-center text-2xl font-semibold mb-4">Sign up</h1>

                <form className="flex flex-col gap-4" onSubmit={(e) => handleSubmitSignup(e)}>
                    <div className="flex flex-col gap-1">
                        <label className="text-slate-400 text-xs uppercase">Name</label>
                        <input
                            className="px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                            placeholder="Enter full name"
                            value={data.name}
                            type="text"
                            onChange={(e) => setData({ ...data, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-slate-400 text-xs uppercase">Mobile</label>
                        <input
                            className="px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                            placeholder="Enter mobile number"
                            value={data.mobile}
                            maxLength={10}
                            type="tel"
                            onChange={(e) => setData({ ...data, mobile: e.target.value.replace(/\D/g, "") })}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-slate-400 text-xs uppercase">Email</label>
                        <input
                            className="px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                            placeholder="Enter email"
                            value={data.email}
                            type="email"
                            onChange={(e) => setData({ ...data, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-slate-400 text-xs uppercase">Username</label>
                        <input
                            className="px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                            placeholder="Choose username"
                            value={data.username}
                            type="text"
                            onChange={(e) => setData({ ...data, username: e.target.value })}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-slate-400 text-xs uppercase">Password</label>
                        <input
                            className="px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                            placeholder="Create password"
                            value={data.password}
                            type="password"
                            onChange={(e) => setData({ ...data, password: e.target.value })}
                            required
                        />
                    </div>

                    <button type="submit" className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded transition-all">
                        Sign up
                    </button>

                    <div className="text-center text-xs text-slate-400 mt-1">
                        Already have an account?
                        <Link to="/signin" className="ml-1 text-blue-400 hover:underline">
                            Sign in
                        </Link>
                    </div>
                </form>
            </div>
            <ToastContainer />
        </div>
    )
}

export default Signup