import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import useAuthStore from '../../store/AuthStore';
import { MdCropSquare, MdOutlineClose, MdHorizontalRule } from "react-icons/md";


const Signup = () => {
    const navigate = useNavigate();
    const { signup, checkUsername, usernameExists, signinLoading } = useAuthStore();
    const [data, setData] = useState({ name: "", mobile: "", email: "", username: "", password: "", machineId: "" });
    const [usernameMsg, setUsernameMsg] = useState("");

    useEffect(() => {
        const getMachineId = async () => {
            try {
                const MACHINE_ID = await window.api?.getMachineId();
                if (MACHINE_ID) {
                    setData(prev => ({ ...prev, machineId: MACHINE_ID }));
                }
            } catch (err) {
                console.error("Failed to get machine ID", err);
            }
        };
        getMachineId();
    }, []);

    const handleKeyUpUsername = async (e) => {
        if (!e.target.value) {
            setUsernameMsg("");
            return;
        };
        try {
            const res = await checkUsername(e.target.value);
            if (res.status === 409) {
                setUsernameMsg(res.message);
            } else {
                setUsernameMsg("");
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleSubmitSignup = async (e) => {
        e.preventDefault();
        if (signinLoading) return;

        if (usernameExists) {
            return toast.error("Username already taken. Please choose another.");
        }

        if (!data.machineId) {
            return toast.error("Hardware ID not found. Please restart the app.");
        }

        try {
            let result = await signup(data);
            if (result.status === 200) {
                window.api?.setItem("token", result.body.token);
                window.api?.setItem("user", JSON.stringify(result.body));
                navigate("/");
                toast.success(result.message);
            } else {
                toast.error(result.message);
            };
        } catch (error) {
            console.error(error);
            toast.error("An unexpected error occurred. Please try again.");
        };
    };
    return (
        <>
            <Toaster />
            {/* Custom Title Bar */}
            <div className="titlebar border-b border-slate-600 w-full h-10 bg-slate-950 text-white flex items-center justify-between p-2 shadow-md">
                <div className="flex items-center gap-2">
                    <div className="font-semibold tracking-wide">
                        <Link to="#">ZeroERP</Link>
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
                <div className="w-[380px] bg-slate-800 rounded-xl shadow-lg shadow-black/40 p-6 border border-slate-700">

                    <h1 className="text-white text-center text-2xl font-semibold mb-4">Sign up</h1>

                    <form className="flex flex-col gap-4" onSubmit={handleSubmitSignup}>
                        <div className="flex flex-col gap-1">
                            <label className="text-slate-400 text-xs uppercase">Name</label>
                            <input
                                className="px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-blue-600"
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
                                className="px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-blue-600"
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
                                className="px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                                placeholder="Enter email"
                                value={data.email}
                                type="email"
                                onChange={(e) => setData({ ...data, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1 relative">
                            <label className="text-slate-400 text-xs uppercase">Username</label>
                            <input
                                className={`px-3 py-2 rounded bg-slate-900 border ${usernameMsg ? 'border-red-500' : 'border-slate-700'} text-white focus:outline-none focus:ring-1 focus:ring-blue-600`}
                                placeholder="Choose username"
                                value={data.username}
                                type="text"
                                onChange={(e) => setData({ ...data, username: e.target.value })}
                                onKeyUp={handleKeyUpUsername}
                                required
                            />
                            {usernameMsg && (
                                <div className="flex items-center gap-2 p-2 rounded-md border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
                                    <span>{usernameMsg}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-1 mt-1">
                            <label className="text-slate-400 text-xs uppercase">Password</label>
                            <input
                                className="px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                                placeholder="Create password"
                                value={data.password}
                                type="password"
                                onChange={(e) => setData({ ...data, password: e.target.value })}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={signinLoading}
                            className={`mt-2 ${signinLoading ? 'bg-blue-800 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium py-2 rounded transition-all flex justify-center items-center`}
                        >
                            {signinLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : "Sign up"}
                        </button>

                        <div className="text-center text-xs text-slate-400 mt-1">
                            Already have an account?
                            <Link to="/signin" className="ml-1 text-blue-400 hover:underline">
                                Sign in
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}

export default Signup