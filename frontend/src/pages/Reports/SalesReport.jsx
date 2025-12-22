import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

const data = [
  { month: "Jan", sales: 12000 },
  { month: "Feb", sales: 18000 },
  { month: "Mar", sales: 15000 },
  { month: "Apr", sales: 22000 },
  { month: "May", sales: 17000 },
  { month: "Jun", sales: 25000 }
];

const SalesReport = () => {
  return (
    <div className="w-full h-full p-6 text-white">

      <h1 className="text-2xl font-semibold mb-4">Sales Report</h1>

      {/* Chart Box */}
      <div className="bg-slate-800 p-4 rounded-md mb-6">
        <h2 className="text-lg font-medium mb-3">Monthly Sales Chart</h2>

        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="month" stroke="#cbd5e1" />
              <YAxis stroke="#cbd5e1" />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table Box */}
      <div className="bg-slate-800 p-4 rounded-md">
        <h2 className="text-lg font-medium mb-3">Sales Table</h2>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-300">
              <th className="py-2 text-left">Month</th>
              <th className="py-2 text-left">Sales (₹)</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item, i) => (
              <tr key={i} className="border-b border-slate-700">
                <td className="py-2">{item.month}</td>
                <td className="py-2">₹ {item.sales.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default SalesReport;