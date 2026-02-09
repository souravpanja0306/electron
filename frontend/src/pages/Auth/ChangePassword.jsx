import { AiOutlineArrowLeft } from "react-icons/ai";
import { Link } from "react-router-dom";


const ChangePassword = () => {
  return (
    <div className="min-h-screen w-full bg-slate-900 flex justify-center items-center">
      <div className="w-[380px] bg-slate-800 rounded-xl shadow-lg shadow-black/40 p-6">
        <Link
          to={-1}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-400 mb-3"
        >
          <AiOutlineArrowLeft />
          Back
        </Link>
        <h2 className="text-white text-xl font-semibold text-center mb-4">
          Change Password
        </h2>

        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-slate-400 text-xs uppercase">
              Current Password
            </label>
            <input
              type="password"
              placeholder="Enter current password"
              className="px-3 py-2 rounded-md bg-slate-900 border border-slate-700 text-white
                     focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-slate-400 text-xs uppercase">
              New Password
            </label>
            <input
              type="password"
              placeholder="Enter new password"
              className="px-3 py-2 rounded-md bg-slate-900 border border-slate-700 text-white
                     focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-slate-400 text-xs uppercase">
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="Re-enter new password"
              className="px-3 py-2 rounded-md bg-slate-900 border border-slate-700 text-white
                     focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <button
            type="submit"
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium
                   py-2 rounded-md transition-all"
          >
            Update Password
          </button>
        </form>

      </div>
    </div>
  )
}

export default ChangePassword