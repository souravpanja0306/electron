import { AiOutlineArrowLeft } from "react-icons/ai";
import { Link } from "react-router-dom";
import { MdCropSquare, MdOutlineClose, MdHorizontalRule } from "react-icons/md";


const ChangePassword = () => {
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
      <div className="min-h-[calc(100vh-2.5rem)] w-full bg-slate-900 flex justify-center items-center">
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
                className="px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded transition-all">
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
    </>
  )
}

export default ChangePassword