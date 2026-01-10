import { useEffect, useState } from "react";
import PageTitle from '../../../components/PageTitle';
import ActionArea from '../../../components/ActionArea';
import MainArea from '../../../components/MainArea';
import CustomButton from '../../../components/CustomButton';
import { Link, NavLink } from "react-router-dom";
import Alert from '../../../components/Alert';
import { AiOutlineFileAdd } from "react-icons/ai";
import { useNavigate } from "react-router-dom";


const ViewInvoices = () => {
    const [alart, setAlart] = useState({ show: false });
    const [party, setParty] = useState([]);
    useEffect(() => {
        if (!window.api) return;
        window.api.getParty({}).then((data) => {
            if (data.body.length) {
                data.body.map(item => item.is_selected = false)
                setParty(data.body);
            };
        });
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
                setAlart({
                    show: true,
                    title: "Error",
                    type: "error",
                    message: "Please select data."
                });
            } else {
                await window.api.deleteParty({ ids: checkedIds }).then((res) => {
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
                navigate("/create-invoice");
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
            <PageTitle>View All Party</PageTitle>
            <div className='flex flex-col gap-1'>
                <ActionArea>
                    <Link to="/create-invoice">
                        <CustomButton title={"New (Ctrl+N)"} color={"green"}><AiOutlineFileAdd /></CustomButton>
                    </Link>
                    <div onClick={(e) => handleDelete(e)}>
                        <CustomButton title={"Delete (Ctrl+D)"} color={"red"}><AiOutlineFileAdd /></CustomButton>
                    </div>
                </ActionArea>
                <MainArea>
                    <table className="table-fixed w-full">
                        <thead>
                            <tr className="border-b border-slate-600 p-1 ">
                                <th className="p-1 w-4">
                                    <input type="checkbox" onChange={(e) => handleSelectAll(e)} />
                                </th>
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
                                                    <tr key={item.id} className="border-b border-slate-600 p-1 hover:bg-slate-600 duration-200 cursor-pointer">
                                                        <td className="p-1 text-center truncate capitalize">
                                                            <input
                                                                type="checkbox"
                                                                onChange={(e) => handleChecked(e, item.id)}
                                                                checked={item.is_selected}
                                                            />
                                                        </td>
                                                        <td className="p-1 text-center truncate capitalize hover:underline hover:text-slate-300">
                                                            <Link to={`/`}>
                                                                {item.company_name ? item.company_name : "--"}
                                                            </Link>
                                                        </td>
                                                        <td className="p-1 text-center truncate capitalize">{item.mobile ? item.mobile : "--"}</td>
                                                        <td className="p-1 text-center truncate capitalize">{item.email ? item.email : "--"}</td>
                                                        <td className="p-1 text-center truncate capitalize">{item.owner ? item.owner : "--"}</td>
                                                        <td className="p-1 text-center truncate capitalize">{item.pan ? item.pan : "--"}</td>
                                                        <td className="p-1 text-center truncate capitalize">{item.gst ? item.gst : "--"}</td>
                                                        <td className="p-1 text-center truncate capitalize">{item.trade_licence ? item.trade_licence : "--"}</td>
                                                        <td className="p-1 text-center truncate capitalize">{item.account_no ? item.account_no : "--"}</td>
                                                    </tr>
                                                )
                                            })
                                        }
                                    </>
                                    :
                                    <>
                                        {
                                            <tr className="border-b border-slate-600 p-1 hover:bg-slate-600 duration-200 cursor-pointer">
                                                <td className="p-1 text-center" colSpan={9}>No Data Found</td>
                                            </tr>
                                        }
                                    </>
                            }
                        </tbody>
                    </table>
                </MainArea>
            </div >

            <Alert
                open={alart.show}
                type={alart.type}
                title={alart.title}
                message={alart.message}
                onClose={() => setAlart({ ...alart, show: false })}
            />
        </>
    )
}

export default ViewInvoices