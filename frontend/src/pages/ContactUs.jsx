import React from 'react'

const ContactUs = () => {
  return (
    <div className="flex justify-center items-center h-full">
      <div className="flex justify-center items-center">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl overflow-hidden dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-200 dark:border-slate-700">
            <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-content text-2xl dark:bg-slate-900 dark:border-slate-700">
              📄
            </div>
            <div>
              <p className="text-base font-bold text-gray-900 dark:text-slate-100">MyERP</p>
              <p className="text-xs text-gray-400 mt-0.5">Complete ERP Solution</p>
            </div>
          </div>
          <table className="w-full">
            <tbody>
              {/* {info.map((row, i) => (
                <tr key={i} className={i < info.length - 1 ? 'border-b border-gray-100 dark:border-slate-700' : ''}>
                  <td className="px-5 py-3 text-xs text-gray-400 w-2/5">{row.label}</td>
                  <td className="px-5 py-3 text-xs text-gray-800 font-medium dark:text-slate-100">{row.value}</td>
                </tr>
              ))} */}
            </tbody>
          </table>
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 text-center text-xs text-gray-400 dark:bg-slate-900/60 dark:border-slate-700">
            © 2026 MyERP. &nbsp;·&nbsp; All rights reserved
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactUs