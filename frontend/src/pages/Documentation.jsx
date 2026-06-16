import React from 'react'

const Documentation = () => {
  return (
    <div className="flex justify-center items-center h-full">
      <div className="flex justify-center items-center">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-200">
            <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-content text-2xl">
              📄
            </div>
            <div>
              <p className="text-base font-bold text-gray-900">Zero® ERP</p>
              <p className="text-xs text-gray-400 mt-0.5">Complete ERP Solution</p>
            </div>
          </div>
          <table className="w-full">
            <tbody>

            </tbody>
          </table>
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 text-center text-xs text-gray-400">
            © 2026 Zero® ERP. &nbsp;·&nbsp; All rights reserved
          </div>
        </div>
      </div>
    </div>
  )
}

export default Documentation