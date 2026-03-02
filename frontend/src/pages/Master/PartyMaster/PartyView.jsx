import { useEffect, useState } from "react";
import PageTitle from '../../../components/PageTitle';
import ActionArea from '../../../components/ActionArea';
import MainArea from '../../../components/MainArea';
import CustomButton from '../../../components/CustomButton';
import { Link, NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";

// Icon...
import {
    AiOutlineFileAdd,
    AiOutlineSync,
    AiOutlineDownload,
    AiOutlineDelete,
    AiOutlineFilter
} from "react-icons/ai";

// Services...
import { handleGetParty } from "./PartyService"

const ViewParty = () => {
    const [page, setPage] = useState(1);
    const [party, setParty] = useState([]);

    const getPartys = async () => {
        let result = await handleGetParty();
        if (result.body.length) {
            result.body.map(item => item.is_selected = false)
            setParty(result.body);
        };
    };
    useEffect(() => {
        getPartys();
    }, []);

    const [checkedIds, setCheckedIds] = useState(null);
    const handleChecked = (e, id) => {
        setCheckedIds(null);
        if (e.target.checked) setCheckedIds(id);
    };

    const handleDelete = async () => {
        try {
            if (!checkedIds.length) {
                window.alert("Please select an item, that you want to delete.")
            } else {
                await window.api.deleteParty({ ids: checkedIds }).then((res) => {
                    console.log(res, "res")
                    if (res.status === 200) {
                        setCheckedIds([])
                    };
                });
                await window.api.getParty({}).then((data) => {
                    setParty(data.body);
                });

            };
        } catch (error) {
            console.log(error);
        };
    };

    const navigate = useNavigate();
    useEffect(() => {
        const onKey = (e) => {
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                navigate("/add-party");
            };

            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                handleDelete()
            };
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const limit = 10;
    const total = 0;
    const totalPages = Math.ceil(total / limit);

    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);

    return (
        <>
            <PageTitle>View All Party</PageTitle>
            <div className='flex flex-col gap-1'>
                <ActionArea>
                    <div className="flex justify-between w-full">
                        <div className="flex gap-1">
                            <Link to="/add-party">
                                <CustomButton title={"New (Ctrl+N)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
                            </Link>
                            <div onClick={(e) => handleDelete(e)}>
                                <CustomButton title={"Delete (Ctrl+D)"} color={"blue"}><AiOutlineDelete /></CustomButton>
                            </div>
                            <div onClick={(e) => handleDelete(e)}>
                                <CustomButton title={"Export (Ctrl+E)"} color={"blue"}><AiOutlineDownload /></CustomButton>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <div onClick={(e) => getPartys(e)}>
                                <CustomButton title={"Refrash"} color={"blue"}><AiOutlineSync /></CustomButton>
                            </div>
                            <div onClick={(e) => getPartys(e)}>
                                <CustomButton title={"Filter"} color={"blue"}><AiOutlineFilter /></CustomButton>
                            </div>
                        </div>
                    </div>
                </ActionArea>
                <MainArea>
                    <table className="table-fixed w-full">
                        <thead>
                            <tr className="border-b border-slate-600 p-1 ">
                                <th className="p-1 text-start w-8">Select</th>
                                <th className="p-1 text-start">Company</th>
                                <th className="p-1 text-start">Mobile</th>
                                <th className="p-1 text-start">Email</th>
                                <th className="p-1 text-start">Owner</th>
                                <th className="p-1 text-start">Pan</th>
                                <th className="p-1 text-start">GST</th>
                                <th className="p-1 text-start">Trade Licence</th>
                                <th className="p-1 text-start">Bank a/c No</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                party && party.length
                                    ?
                                    <>
                                        {
                                            party.map((item, index) => {
                                                return (
                                                    <tr key={item.id} className="border-b border-slate-300 p-1 hover:bg-blue-200 dark:hover:bg-slate-600 duration-200 cursor-pointer">
                                                        <td className="p-1 text-start truncate capitalize">
                                                            <input
                                                                type="checkbox"
                                                                onChange={(e) => handleChecked(e, item.id)}
                                                                checked={checkedIds === item.id}
                                                            />
                                                        </td>
                                                        <td className="p-1 text-start truncate capitalize hover:underline hover:text-slate-300">
                                                            <Link to={`/`}>
                                                                {item.company_name ? item.company_name : "--"}
                                                            </Link>
                                                        </td>
                                                        <td className="p-1 text-start truncate capitalize">{item.mobile ? item.mobile : "--"}</td>
                                                        <td className="p-1 text-start truncate capitalize">{item.email ? item.email : "--"}</td>
                                                        <td className="p-1 text-start truncate capitalize">{item.owner ? item.owner : "--"}</td>
                                                        <td className="p-1 text-start truncate capitalize">{item.pan ? item.pan : "--"}</td>
                                                        <td className="p-1 text-start truncate capitalize">{item.gst ? item.gst : "--"}</td>
                                                        <td className="p-1 text-start truncate capitalize">{item.trade_licence ? item.trade_licence : "--"}</td>
                                                        <td className="p-1 text-start truncate capitalize">{item.account_no ? item.account_no : "--"}</td>
                                                    </tr>
                                                )
                                            })
                                        }
                                    </>
                                    :
                                    <>
                                        {
                                            <tr className="p-1 hover:bg-blue-200 dark:hover:bg-slate-600 duration-200 cursor-pointer">
                                                <td className="p-1 text-center" colSpan={9}>No Data Found</td>
                                            </tr>
                                        }
                                    </>
                            }
                        </tbody>
                    </table>
                </MainArea>
                <div className="flex justify-between items-center mt-3 px-2 py-2 text-sm">
                    <div className="text-slate-600 dark:text-slate-300">Showing {start} to {end} of {total}</div>
                    <div className="flex items-center gap-1">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-blue-200 dark:hover:bg-slate-600 disabled:opacity-40">
                            Prev
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i + 1)}
                                className={`px-2 py-1 rounded border ${page === i + 1 ? "bg-blue-500 text-white border-blue-500" : "border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-blue-200 dark:hover:bg-slate-600"}`}>
                                {i + 1}
                            </button>
                        ))}
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(page + 1)}
                            className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-blue-200 dark:hover:bg-slate-600 disabled:opacity-40">
                            Next
                        </button>
                    </div>
                </div>
            </div >
        </>
    )
}

export default ViewParty