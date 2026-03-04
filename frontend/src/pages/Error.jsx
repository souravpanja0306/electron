import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Error = () => {
    const navigate = useNavigate();
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
            <h1 className="text-7xl font-bold mb-4">404</h1>
            <p className="text-lg mb-6 text-slate-500 dark:text-slate-400">
                Page not found
            </p>
            <div className="flex gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="px-5 py-2 rounded-md bg-slate-500 text-white hover:bg-slate-600"
                >
                    Go Back
                </button>
                <Link
                    to="/"
                    className="px-5 py-2 rounded-md bg-slate-800 text-white hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-900"
                >
                    Home
                </Link>
            </div>
        </div>
    );
};

export default Error;