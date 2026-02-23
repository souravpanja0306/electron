import { useEffect, useState } from "react";
import PageTitle from '../../../components/PageTitle';
import ActionArea from '../../../components/ActionArea';
import MainArea from '../../../components/MainArea';
import CustomButton from '../../../components/CustomButton';
import { Link, NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";

// Icon...
import { AiOutlineFileAdd, AiOutlineSync, AiOutlineDownload } from "react-icons/ai";

const ViewCompany = () => {
    const [party, setParty] = useState([]);

    // const getPartys = async () => {
    //     let result = await handleGetParty();
    //     if (result.body.length) {
    //         result.body.map(item => item.is_selected = false)
    //         setParty(result.body);
    //     };
    // };
    useEffect(() => {
        // getPartys();
    }, []);

    const [checkedIds, setCheckedIds] = useState([]);
    const handleChecked = (e, id) => {
        setParty(prev =>
            prev.map(item =>
                item.id === id ? { ...item, is_selected: e.target.checked } : item
            )
        );
        setCheckedIds(prev =>
            e.target.checked ? [...prev, id] : prev.filter(itemId => itemId !== id)
        );
    };

    const handleSelectAll = (e) => {
        const checked = e.target.checked;
        setParty(prev =>
            prev.map(item => ({ ...item, is_selected: checked })),
        );
        setCheckedIds(checked ? party.map(item => item.id) : []);
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
                navigate("/add-company");
            };

            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                handleDelete()
            };
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    return (
        <>
            <PageTitle>View All Company</PageTitle>
            <div className='flex flex-col gap-1'>
                <ActionArea>
                    <div className="flex justify-between w-full">
                        <div className="flex gap-1">
                            <Link to="/add-company">
                                <CustomButton title={"New (Ctrl+N)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
                            </Link>
                            <div>
                                <CustomButton title={"Delete (Ctrl+D)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <div>
                                <CustomButton title={"Refrash"} color={"blue"}><AiOutlineSync /></CustomButton>
                            </div>
                        </div>
                    </div>
                </ActionArea>
                <MainArea>
                    <table className="table-fixed w-full">
                        <thead>
                            <tr className="border-b border-slate-300 dark:border-slate-600 p-1 ">
                                <th className="p-1 text-start w-8">
                                    <input type="checkbox" onChange={(e) => handleSelectAll(e)} />
                                </th>
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
                                                                checked={item.is_selected}
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
            </div >
        </>
    )
}

export default ViewCompany