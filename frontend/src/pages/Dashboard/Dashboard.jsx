import { useEffect, useState } from "react";

const Dashboard = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        if (!window.api) return;
        window.api.getUsers({}).then((data) => {
            setUsers(data.body);
        });
    }, []);

    const submitData = async (e) => {
        if (!window.api) return;
        await window.api.createUser({
            name: "John",
            email: "john@test.com"
        }).then((res) => {
            console.log(res)
        });
        const data = await window.api.getUsers({});
        setUsers(data.body);
    };

    const submitDelete = async (id) => {
        if (!window.api) return;

        console.log("🚀 ~ submitDelete ~ e, id:", id)
        await window.api.deleteUser({ id: id }).then((res) => {
            console.log(res)
        });
        const data = await window.api.getUsers({ params: {} });
        setUsers(data.body);
    };

    return (
        <div className="p-4">
            <table className="min-w-full border border-slate-700 text-xs text-white">
                <thead className="bg-slate-800">
                    <tr>
                        <th className="border border-slate-700 px-3 py-2">ID</th>
                        <th className="border border-slate-700 px-3 py-2">Name</th>
                        <th className="border border-slate-700 px-3 py-2">Email</th>
                        <th className="border border-slate-700 px-3 py-2">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.id} className="hover:bg-slate-800">
                            <td className="border border-slate-700 px-3 py-2">{u.id}</td>
                            <td className="border border-slate-700 px-3 py-2">{u.name}</td>
                            <td className="border border-slate-700 px-3 py-2">{u.email}</td>
                            <td className="border border-slate-700 px-3 py-2">
                                <button
                                    className="mb-4 px-3 py-1 bg-blue-600 rounded"
                                    onClick={() => submitDelete(u.id)}
                                >
                                    Delete User
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <button
                className="mb-4 px-3 py-1 bg-blue-600 rounded"
                onClick={(e) => submitData(e)}
            >
                Add User
            </button>

        </div >
    );
};

export default Dashboard