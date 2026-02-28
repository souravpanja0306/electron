import React, { useState, useEffect } from 'react'
import PageTitle from '../../../components/PageTitle';
import ActionArea from '../../../components/ActionArea';
import MainArea from '../../../components/MainArea';
import CustomButton from '../../../components/CustomButton';
import { Link, NavLink } from "react-router-dom";
import { AiOutlineFileAdd, AiOutlineIdcard, AiOutlineRollback } from "react-icons/ai";
import Alert from "../../../components/Alert";
import { useSearchParams, useNavigate } from "react-router-dom";
import useCompanyStore from '../../../store/CompnayStore';


const CreateParty = () => {
    let token = localStorage.getItem("token");
    const { companyData, createCompany, getAllCompany, companyLoading } = useCompanyStore();
    const [active, setActive] = useState(0);
    const [searchParams] = useSearchParams();
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
            e.preventDefault();
            let result = await createCompany(data, token);
            if ((result.status) === 200) {
                setAlart({ show: true, title: "Sccesss", type: "success", message: result.message });
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
            };
        } catch (error) {
            console.log(error);
        };
    };

    useEffect(() => {
        const onKey = (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                // handleSubmit(e);
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
            <PageTitle>Add/Update Company</PageTitle>

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
                    <Link to="/comapny">
                        <CustomButton title={"View (Ctrl+I)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
                    </Link>
                </ActionArea>

                <form className='flex flex-col gap-1'>
                    <div className='grid sm:md:lg:xl:flex w-full gap-1'>
                        <MainArea>
                            <div className='flex flex-col w-full gap-1'>
                                <PageTitle>Company Details</PageTitle>
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
                                                        setData({ ...data, company_name: e.target.value.toLowerCase() })
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
                                                        setData({ ...data, owner: e.target.value.toLowerCase() })
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
                                                        setData({ ...data, email: e.target.value.toLowerCase() })
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
                                <PageTitle>Business Icon/Logo</PageTitle>
                                <hr />
                                <table className="w-full text-sm">
                                    <tbody>
                                        <tr className="dark:bg-slate-800 flex justify-between items-center">
                                            <td className="rounded flex flex-col justify-center items-center p-1 w-36 h-36 border border-slate-300 dark:border-slate-600 text-xs">
                                                <span className="font-medium text-slate-600 dark:text-slate-300">
                                                    Image Size
                                                </span>
                                                <span className="text-slate-400">512 × 512</span>
                                            </td>
                                            <td className="p-1 w-full">
                                                <label className="rounded flex flex-col items-center justify-center h-36 border border-dashed border-slate-300 dark:border-slate-600 cursor-pointer hover:border-blue-600 hover:bg-blue-100 dark:hover:bg-slate-900 transition">
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                                        Click to upload image
                                                    </span>
                                                    <input type="file" accept="image/*" className="hidden" />
                                                </label>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
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
                                    {/* <PageTitle>Address Details</PageTitle>
                                    <hr /> */}
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
                                                            setData({ ...data, address_1: e.target.value.toLowerCase() })
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
                                                            setData({ ...data, address_2: e.target.value.toLowerCase() })
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
                                                            setData({ ...data, city: e.target.value.toLowerCase() })
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                            <tr className="dark:bg-slate-800">
                                                <td className="p-1 min-w-36">
                                                    State
                                                </td>
                                                <td className="p-1 min-w-36">
                                                    <input
                                                        placeholder='State'
                                                        className="w-full p-1 rounded border border-slate-300 dark:border-slate-600 text-slate-900"
                                                        value={data.state}
                                                        type="text"
                                                        onChange={(e) =>
                                                            setData({ ...data, state: e.target.value.toLowerCase() })
                                                        }
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
                                                            setData({ ...data, district: e.target.value.toLowerCase() })
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
                                                            setData({ ...data, pincode: e.target.value.toLowerCase() })
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
                                    {/* <PageTitle>Business Details</PageTitle>
                                    <hr /> */}
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
                                                            setData({ ...data, gst: e.target.value.toLowerCase() })
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
                                                            setData({ ...data, pan: e.target.value.toLowerCase() })
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
                                                            setData({ ...data, trade_licence: e.target.value.toLowerCase() })
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
                                    {/* <PageTitle>Payment Details</PageTitle>
                                    <hr /> */}
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
                                                            setData({ ...data, bank: e.target.value.toLowerCase() })
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
                                                            setData({ ...data, branch: e.target.value.toLowerCase() })
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
                                                            setData({ ...data, ifse: e.target.value.toLowerCase() })
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
                                                            setData({ ...data, account_no: e.target.value.toLowerCase() })
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

export default CreateParty