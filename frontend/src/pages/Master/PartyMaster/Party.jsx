import { useEffect, useState } from "react";
import PageTitle from '../../../components/PageTitle';
import ActionArea from '../../../components/ActionArea';
import MainArea from '../../../components/MainArea';
import CustomButton from '../../../components/CustomButton';
import { Link, NavLink } from "react-router-dom";
import { AiOutlineFileAdd } from "react-icons/ai";



const Party = () => {
    const [party, setParty] = useState([]);

    useEffect(() => {
        if (!window.api) return;
        window.api.getParty({}).then((data) => {
            setParty(data.body);
        });
    }, []);

    const [checkedIds, setCheckedIds] = useState([]);
    const handleChecked = (e, id) => {
        if (e.target.checked) {
            setCheckedIds([...checkedIds, id]);
        } else {
            setCheckedIds(checkedIds.filter(x => x !== id));
        };
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

    return (
        <>
            <PageTitle>View All Party</PageTitle>
            <div className='flex flex-col gap-1'>
                <ActionArea>
                    <Link to="/add-party">
                        <CustomButton title={"New"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
                    </Link>
                    <div onClick={(e) => handleDelete(e)}>
                        <CustomButton title={"Delete"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
                    </div>
                </ActionArea>
                <MainArea>
                    <table className="table-fixed w-full">
                        <thead>
                            <tr className="border-b border-slate-700 p-1 ">
                                <th className="p-1">#</th>
                                <th className="p-1">Company</th>
                                <th className="p-1">Mobile</th>
                                <th className="p-1">Email</th>
                                <th className="p-1">Owner</th>
                                <th className="p-1">Pan</th>
                                <th className="p-1">GST</th>
                                <th className="p-1">Trade Licence</th>
                                <th className="p-1">Bank a/c No</th>
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
                                                    <tr key={item.id} className="border-b border-slate-700 p-1 hover:bg-slate-800 duration-200 cursor-pointer">
                                                        <td className="p-1 text-center">
                                                            <input type="checkbox" onChange={(e) => handleChecked(e, item.id)} />
                                                        </td>
                                                        <td className="p-1 text-center hover:underline hover:text-blue-600">
                                                            <Link to={`/`}>
                                                                {item.company_name ? item.company_name : "--"}
                                                            </Link>
                                                        </td>
                                                        <td className="p-1 text-center">{item.mobile ? item.mobile : "--"}</td>
                                                        <td className="p-1 text-center">{item.email ? item.email : "--"}</td>
                                                        <td className="p-1 text-center">{item.owner ? item.owner : "--"}</td>
                                                        <td className="p-1 text-center">{item.pan ? item.pan : "--"}</td>
                                                        <td className="p-1 text-center">{item.gst ? item.gst : "--"}</td>
                                                        <td className="p-1 text-center">{item.trade_licence ? item.trade_licence : "--"}</td>
                                                        <td className="p-1 text-center">{item.account_no ? item.account_no : "--"}</td>
                                                    </tr>
                                                )
                                            })
                                        }
                                    </>
                                    :
                                    <>
                                        {
                                            <tr className="border-b border-slate-700 p-1 hover:bg-slate-800 duration-200 cursor-pointer">
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

export default Party