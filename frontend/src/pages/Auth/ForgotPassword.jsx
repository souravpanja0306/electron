import { AiOutlineArrowLeft } from "react-icons/ai";
import { Link } from "react-router-dom";


const ChangePassword = () => {
  return (
    <div className="min-h-screen w-full bg-slate-900 flex justify-center items-center">
      <div className="w-[380px] bg-slate-800 rounded-xl shadow-lg shadow-black/40 p-6">

        {/* Back link */}
        <Link
          to={-1}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-400 mb-3"
        >
          <AiOutlineArrowLeft />
          Back
        </Link>

        <h2 className="text-white text-xl font-semibold text-center mb-1">
          Forgot Password
        </h2>
        <p className="text-slate-400 text-xs text-center mb-4">
          Enter your registered email or username
        </p>

        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-slate-400 text-xs uppercase">
              Email / Username
            </label>
            <input
              type="text"
              placeholder="Enter email or username"
              className="px-3 py-2 rounded-md bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition-all">
            Send Reset Link
          </button>

          <div className="text-center text-xs text-slate-400">
            Remember your password?
            <Link to="/signin" className="ml-1 text-blue-400 hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChangePassword