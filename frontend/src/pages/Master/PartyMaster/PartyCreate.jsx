import React, { useState, useEffect } from 'react'
import { Link, NavLink } from "react-router-dom";
import { AiOutlineFileAdd, AiOutlineIdcard, AiOutlineRollback } from "react-icons/ai";
import { useSearchParams, useNavigate } from "react-router-dom";
import StateList from '../../../utils/StateList';
import { toast } from 'sonner';

// Components...
import PageTitle from '../../../components/PageTitle';
import ActionArea from '../../../components/ActionArea';
import MainArea from '../../../components/MainArea';
import CustomButton from '../../../components/CustomButton';
import SearchableSelect from '../../../components/SearchableSelect';

// Service...
import { handleCreateParty } from "../../../services/partyService";


const PartyCreate = () => {
    const [searchParams] = useSearchParams();
    const [active, setActive] = useState(0);
    const back = searchParams.get("back");

    const navigate = useNavigate();

    const [alart, setAlart] = useState({ show: false });
    const [data, setData] = useState({
        company_name: "",
        email: "",
        mobile: "",
        owner: "",
        address_1: "",
        address_2: "",
        city: "",
        state: "",
        district: "",
        pincode: "",
        country: "INDIA",
        gst: "",
        pan: "",
        trade_licence: "",
        bank: "",
        ifse: "",
        branch: "",
        account_no: ""
    });
    const handleSubmit = async (e) => {
        try {
            if (e) e.preventDefault();
            if (!data.company_name || data.company_name === "") {
                toast.success("Company Name Required.");
                return;
            };

            let result = await handleCreateParty(data);
            if (result && (result.status) === 200) {
                toast.success(result.message);
                setData({
                    company_name: "",
                    email: "",
                    mobile: "",
                    owner: "",
                    address_1: "",
                    address_2: "",
                    city: "",
                    state: "",
                    district: "",
                    pincode: "",
                    country: "INDIA",
                    gst: "",
                    pan: "",
                    trade_licence: "",
                    bank: "",
                    ifse: "",
                    branch: "",
                    account_no: ""
                });
            } else {
                toast.success(result.message);
            };
        } catch (error) {
            toast.success("Something went wrong!");
        };
    };

    useEffect(() => {
        const onKey = (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                handleSubmit(e);
            };

            if (e.ctrlKey && e.key === 'i') {
                e.preventDefault();
                navigate("/party");
            };
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);


    return (
        <>
            <PageTitle>Add New Party</PageTitle>

            <div className='flex flex-col gap-1'>
                <ActionArea>
                    {back ?
                        <div onClick={() => navigate(-1)}>
                            <CustomButton title={"Back"} color={"slate"}><AiOutlineRollback /></CustomButton>
                        </div>
                        : ""
                    }
                    <div onClick={(e) => handleSubmit(e)}>
                        <CustomButton title={"Save (Ctrl+S)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
                    </div>
                    <Link to="/party">
                        <CustomButton title={"View (Ctrl+I)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
                    </Link>
                </ActionArea>

                <form className='flex flex-col gap-1'>
                    <div className='grid sm:md:lg:xl:flex w-full gap-1'>
                        <MainArea>
                            <div className='flex flex-col w-full gap-1'>
                                <PageTitle>Personal Details</PageTitle>
                                <hr />
                                <table className="w-full text-sm">
                                    <tbody>
                                        <tr className="dark:bg-slate-800">
                                            <td className="p-1 min-w-36">Company Name</td>
                                            <td className="p-1 min-w-36">
                                                <input
                                                    placeholder='Company Name'
                                                    className="w-full p-1 rounded border border-slate-300 dark:border-slate-600 text-slate-900"
                                                    value={data.company_name}
                                                    type="text"
                                                    onChange={(e) =>
                                                        setData({ ...data, company_name: e.target.value })
                                                    }
                                                    required
                                                />
                                            </td>
                                        </tr>
                                        <tr className="dark:bg-slate-800">
                                            <td className="p-1 min-w-36">Owner</td>
                                            <td className="p-1 min-w-36">
                                                <input
                                                    placeholder='Owner'
                                                    className="w-full p-1 rounded border border-slate-300 dark:border-slate-600 text-slate-900"
                                                    value={data.owner}
                                                    type="text"
                                                    onChange={(e) =>
                                                        setData({ ...data, owner: e.target.value })
                                                    }
                                                    required
                                                />
                                            </td>
                                        </tr>
                                        <tr className="dark:bg-slate-800">
                                            <td className="p-1 min-w-36">Email</td>
                                            <td className="p-1 min-w-36">
                                                <input
                                                    placeholder='Email'
                                                    className="w-full p-1 rounded border border-slate-300 dark:border-slate-600 text-slate-900"
                                                    value={data.email}
                                                    type="email"
                                                    onChange={(e) =>
                                                        setData({ ...data, email: e.target.value })
                                                    }
                                                    required
                                                />
                                            </td>
                                        </tr>
                                        <tr className="dark:bg-slate-800">
                                            <td className="p-1 min-w-36">Mobile</td>
                                            <td className="p-1 min-w-36">
                                                <input
                                                    placeholder='Mobile'
                                                    className="w-full p-1 rounded border border-slate-300 dark:border-slate-600 text-slate-900"
                                                    value={data.mobile}
                                                    maxLength={10}
                                                    type="tel"
                                                    onChange={(e) =>
                                                        setData({
                                                            ...data,
                                                            mobile: e.target.value.replace(/\D/g, ""),
                                                        })
                                                    }
                                                    required
                                                />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </MainArea>
                        <MainArea>
                            <div className='flex flex-col w-full gap-1'>
                                <PageTitle>Preview</PageTitle>
                                <hr />
                                <div className='flex w-full p-1'>
                                    <AiOutlineIdcard className='text-9xl' />
                                    <div className='p-2 flex flex-col justify-center'>
                                        <div className='flex gap-1'>
                                            <span className='font-bold text-sm'>Company Name : </span>
                                            <p className='text-slate-500 text-sm'>{(data.company_name).toUpperCase()}</p>
                                        </div>
                                        <div className='flex gap-1'>
                                            <span className='font-bold text-sm'>Name : </span>
                                            <p className='text-slate-500 text-sm'>{(data.owner).toUpperCase()}</p>
                                        </div>
                                        <div className='flex gap-1'>
                                            <span className='font-bold text-sm'>Email : </span>
                                            <p className='text-slate-500 text-sm'>{(data.email).toUpperCase()}</p>
                                        </div>
                                        <div className='flex gap-1'>
                                            <span className='font-bold text-sm'>Mobile : </span>
                                            <p className='text-slate-500 text-sm'>{(data.mobile).toUpperCase()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </MainArea>
                    </div>

                    <div className="flex border-slate-700">
                        <span
                            onClick={() => setActive(0)}
                            className={`cursor-pointer px-4 py-2 text-sm font-medium transition ${active === 0 ? "bg-slate-200 dark:bg-slate-900 border-b-2 border-blue-600 text-blue-600 dark:text-white rounded-t" : "text-slate-800 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-200"}`}
                        >Address Details</span>
                        <span
                            onClick={() => setActive(1)}
                            className={`cursor-pointer px-4 py-2 text-sm font-medium transition ${active === 1 ? "bg-slate-200 dark:bg-slate-900 border-b-2 border-blue-600 text-blue-600 dark:text-white rounded-t" : "text-slate-800 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-200"}`}
                        >Business Details
                        </span>
                        <span
                            onClick={() => setActive(2)}
                            className={`cursor-pointer px-4 py-2 text-sm font-medium transition ${active === 2 ? "bg-slate-200 dark:bg-slate-900 border-b-2 border-blue-600 text-blue-600 dark:text-white rounded-t" : "text-slate-800 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-200"}`}
                        >Payment Details</span>
                    </div>
                    <div className="">
                        {active === 0 &&
                            <MainArea>
                                <div className='flex flex-col w-full sm:md:lg:xl:w-[50%] gap-1'>
                                    <table className="w-full text-sm">
                                        <tbody>
                                            <tr className="dark:bg-slate-800">
                                                <td className="p-1 min-w-36">Address 1</td>
                                                <td className="p-1 min-w-36">
                                                    <input
                                                        placeholder='Address 1'
                                                        className="w-full rounded p-1 border border-slate-300 dark:border-slate-600 text-slate-900"
                                                        value={data.address_1}
                                                        type="text"
                                                        onChange={(e) =>
                                                            setData({ ...data, address_1: e.target.value })
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                            <tr className="dark:bg-slate-800">
                                                <td className="p-1 min-w-36">Address 2</td>
                                                <td className="p-1 min-w-36">
                                                    <input
                                                        placeholder='Address 2'
                                                        className="w-full rounded p-1 border border-slate-300 dark:border-slate-600 text-slate-900"
                                                        value={data.address_2}
                                                        type="text"
                                                        onChange={(e) =>
                                                            setData({ ...data, address_2: e.target.value })
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                            <tr className="dark:bg-slate-800">
                                                <td className="p-1 min-w-36">City</td>
                                                <td className="p-1 min-w-36">
                                                    <input
                                                        placeholder='City'
                                                        className="w-full p-1 rounded border border-slate-300 dark:border-slate-600 text-slate-900"
                                                        value={data.city}
                                                        type="text"
                                                        onChange={(e) =>
                                                            setData({ ...data, city: e.target.value })
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                            <tr className="dark:bg-slate-800">
                                                <td className="p-1 min-w-36">
                                                    State
                                                </td>
                                                <td className="p-1 min-w-36">
                                                    <SearchableSelect
                                                        className="w-full"
                                                        name="consignee_id"
                                                        value={data.state}
                                                        onChange={(e) => setData({ ...data, state: e.target.value })}
                                                        options={StateList?.map(state => ({ id: state.value, label: state.value }))}
                                                        placeholder="State"
                                                        required
                                                    />
                                                </td>
                                            </tr>
                                            <tr className="dark:bg-slate-800">
                                                <td className="p-1 min-w-36">District</td>
                                                <td className="p-1 min-w-36">
                                                    <input
                                                        placeholder='District'
                                                        className="w-full p-1 rounded border border-slate-300 dark:border-slate-600 text-slate-900"
                                                        value={data.district}
                                                        type="text"
                                                        onChange={(e) =>
                                                            setData({ ...data, district: e.target.value })
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                            <tr className="dark:bg-slate-800">
                                                <td className="p-1 min-w-36">Pincode</td>
                                                <td className="p-1 min-w-36">
                                                    <input
                                                        placeholder='Pincode'
                                                        className="w-full p-1 rounded border border-slate-300 dark:border-slate-600 text-slate-900"
                                                        value={data.pincode}
                                                        type="text"
                                                        onChange={(e) =>
                                                            setData({ ...data, pincode: e.target.value })
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </MainArea>
                        }
                        {
                            active === 1 &&
                            <MainArea>
                                <div className='flex flex-col w-full sm:md:lg:xl:w-[50%] gap-1'>
                                    <table className="w-full text-sm">
                                        <tbody>
                                            <tr className="dark:bg-slate-800">
                                                <td className="p-1 min-w-36">GST</td>
                                                <td className="p-1 min-w-36">
                                                    <input
                                                        placeholder='GST'
                                                        className="w-full rounded p-1 border border-slate-300 dark:border-slate-600 text-slate-900"
                                                        value={data.gst}
                                                        type="text"
                                                        onChange={(e) =>
                                                            setData({ ...data, gst: e.target.value })
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                            <tr className="dark:bg-slate-800">
                                                <td className="p-1 min-w-36">PAN</td>
                                                <td className="p-1 min-w-36">
                                                    <input
                                                        placeholder='PAN'
                                                        className="w-full rounded p-1 border border-slate-300 dark:border-slate-600 text-slate-900"
                                                        value={data.pan}
                                                        type="text"
                                                        onChange={(e) =>
                                                            setData({ ...data, pan: e.target.value })
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                            <tr className="dark:bg-slate-800">
                                                <td className="p-1 min-w-36">Trade Licence</td>
                                                <td className="p-1 min-w-36">
                                                    <input
                                                        placeholder='Trade Licence'
                                                        className="w-full rounded p-1 border border-slate-300 dark:border-slate-600 text-slate-900"
                                                        value={data.trade_licence}
                                                        type="text"
                                                        onChange={(e) =>
                                                            setData({ ...data, trade_licence: e.target.value })
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </MainArea>
                        }
                        {active === 2 &&
                            <MainArea>
                                <div className='flex flex-col w-full sm:md:lg:xl:w-[50%] gap-1'>
                                    <table className="w-full text-sm">
                                        <tbody>
                                            <tr className="dark:bg-slate-800">
                                                <td className="p-1 min-w-36">Bank Name</td>
                                                <td className="p-1 min-w-36">
                                                    <input
                                                        placeholder='Bank Name'
                                                        className="w-full p-1 rounded border border-slate-300 dark:border-slate-600 text-slate-900"
                                                        value={data.bank}
                                                        type="text"
                                                        onChange={(e) =>
                                                            setData({ ...data, bank: e.target.value })
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                            <tr className="dark:bg-slate-800">
                                                <td className="p-1 min-w-36">Branch</td>
                                                <td className="p-1 min-w-36">
                                                    <input
                                                        placeholder='Branch'
                                                        className="w-full p-1 rounded border border-slate-300 dark:border-slate-600 text-slate-900"
                                                        value={data.branch}
                                                        type="text"
                                                        onChange={(e) =>
                                                            setData({ ...data, branch: e.target.value })
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                            <tr className="dark:bg-slate-800">
                                                <td className="p-1 min-w-36">IFSE Code</td>
                                                <td className="p-1 min-w-36">
                                                    <input
                                                        placeholder='IFSE Code'
                                                        className="w-full p-1 rounded border border-slate-300 dark:border-slate-600 text-slate-900"
                                                        value={data.ifse}
                                                        type="tel"
                                                        onChange={(e) =>
                                                            setData({ ...data, ifse: e.target.value })
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                            <tr className="dark:bg-slate-800">
                                                <td className="p-1 min-w-36">Account No</td>
                                                <td className="p-1 min-w-36">
                                                    <input
                                                        placeholder='Account No'
                                                        className="w-full p-1 rounded border border-slate-300 dark:border-slate-600 text-slate-900"
                                                        value={data.account_no}
                                                        type="tel"
                                                        onChange={(e) =>
                                                            setData({ ...data, account_no: e.target.value })
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </MainArea>
                        }
                    </div>
                </form>
            </div >
        </>
    )
}

export default PartyCreate