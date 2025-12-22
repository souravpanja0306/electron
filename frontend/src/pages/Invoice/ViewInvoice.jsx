import React, { useState } from "react";

const sampleData = [
    { id: 1, invoice: "INV-001", customer: "Rohan", amount: 2500, date: "2025-01-10" },
    { id: 2, invoice: "INV-002", customer: "Amit", amount: 1800, date: "2025-01-12" },
    { id: 3, invoice: "INV-003", customer: "Nisha", amount: 3200, date: "2025-01-14" },
    { id: 4, invoice: "INV-004", customer: "Suman", amount: 4999, date: "2025-01-15" },
    { id: 5, invoice: "INV-005", customer: "Priya", amount: 2100, date: "2025-01-18" },
    { id: 6, invoice: "INV-006", customer: "Rahul", amount: 4100, date: "2025-01-20" },
];

const ViewInvoice = () => {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const limit = 4;

    const filtered = sampleData.filter((item) =>
        item.invoice.toLowerCase().includes(search.toLowerCase()) ||
        item.customer.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / limit);
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    return (
        <div className="w-full h-full p-4 text-white">

            <h1 className="text-2xl font-semibold mb-4">View Invoices</h1>

            {/* Search */}
            <input
                type="text"
                placeholder="Search invoice or customer..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full p-2 mb-4 rounded bg-slate-800"
            />

            {/* Table */}
            <div className="bg-slate-800 p-4 rounded-md">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-700 text-slate-300">
                            <th className="py-2 text-left">Invoice</th>
                            <th className="py-2 text-left">Customer</th>
                            <th className="py-2 text-left">Amount</th>
                            <th className="py-2 text-left">Date</th>
                        </tr>
                    </thead>

                    <tbody>
                        {paginated.map((item) => (
                            <tr key={item.id} className="border-b border-slate-700">
                                <td className="py-2">{item.invoice}</td>
                                <td className="py-2">{item.customer}</td>
                                <td className="py-2">₹ {item.amount}</td>
                                <td className="py-2">{item.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-4">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="px-3 py-1 bg-slate-700 rounded disabled:opacity-40"
                    >
                        Prev
                    </button>

                    <span className="text-slate-300 text-sm">
                        Page {page} of {totalPages}
                    </span>

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        className="px-3 py-1 bg-slate-700 rounded disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            </div>

        </div>
    );
};

export default ViewInvoice;