import React, { useState, useEffect } from 'react'
import PageTitle from '../../../components/PageTitle';
import ActionArea from '../../../components/ActionArea';
import MainArea from '../../../components/MainArea';
import CustomButton from '../../../components/CustomButton';
import { Link, NavLink } from "react-router-dom";
import { AiOutlineFileAdd, AiOutlineIdcard, AiOutlineRollback } from "react-icons/ai";
import Alert from "../../../components/Alert";
import { useSearchParams, useNavigate } from "react-router-dom";

const CreateParty = () => {
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

    // const handleSubmit = async () => {
    //     try {
    //         if (!data.company_name && data.company_name == "") {
    //             setAlart({
    //                 show: true,
    //                 title: "Field required",
    //                 type: "warning",
    //                 message: "Company Name Required."
    //             });
    //             return;
    //         };

    //         let result = await handleCreateParty(data);
    //         if ((result.status) === 200) {
    //             setAlart({ show: true, title: "Sccesss", type: "success", message: result.message });
    //             setData({
    //                 company_name: "",
    //                 email: "",
    //                 mobile: "",
    //                 owner: "",
    //                 address_1: "",
    //                 address_2: "",
    //                 city: "",
    //                 state: "",
    //                 district: "",
    //                 pincode: "",
    //                 country: "INDIA",
    //                 gst: "",
    //                 pan: "",
    //                 trade_licence: "",
    //                 bank: "",
    //                 ifse: "",
    //                 branch: "",
    //                 account_no: ""
    //             });
    //         };
    //     } catch (error) {
    //         console.log(error);
    //     };
    // };

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
                    <div>
                        <CustomButton title={"Save (Ctrl+S)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
                    </div>
                    <Link to="/comapny">
                        <CustomButton title={"View (Ctrl+I)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
                    </Link>
                </ActionArea>

                <form className='flex gap-1'>
                    <MainArea>
                        <div className='flex flex-col w-full gap-1'>
                            <PageTitle>Personal Details</PageTitle>

                            <table className="w-full border border-slate-300 dark:border-slate-600 text-sm">
                                <tbody>
                                    <tr className="border border-slate-300 dark:border-slate-600">
                                        <td className="p-1 w-1/3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600">
                                            Company Name
                                        </td>
                                        <td className="p-1 border border-slate-300 dark:border-slate-600">
                                            <input
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

                                    <tr className="border border-slate-300 dark:border-slate-600">
                                        <td className="p-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600">
                                            Owner
                                        </td>
                                        <td className="p-1 border border-slate-300 dark:border-slate-600">
                                            <input
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

                                    <tr className="border border-slate-300 dark:border-slate-600">
                                        <td className="p-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600">
                                            Email
                                        </td>
                                        <td className="p-1 border border-slate-300 dark:border-slate-600">
                                            <input
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

                                    <tr className="border border-slate-300 dark:border-slate-600">
                                        <td className="p-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600">
                                            Mobile
                                        </td>
                                        <td className="p-1 border border-slate-300 dark:border-slate-600">
                                            <input
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

                            <PageTitle>Address Details</PageTitle>
                            <table className="w-full border border-slate-300 dark:border-slate-600 text-sm">
                                <tbody>

                                    <tr className="border border-slate-300 dark:border-slate-600">
                                        <td className="p-1 w-1/3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600">
                                            Address 1
                                        </td>
                                        <td className="p-1 border border-slate-300 dark:border-slate-600">
                                            <input
                                                className="w-full rounded p-1 border border-slate-300 dark:border-slate-600 text-slate-900"
                                                value={data.address_1}
                                                type="text"
                                                onChange={(e) =>
                                                    setData({ ...data, address_1: e.target.value.toLowerCase() })
                                                }
                                            />
                                        </td>
                                    </tr>

                                    <tr className="border border-slate-300 dark:border-slate-600">
                                        <td className="p-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600">
                                            Address 2
                                        </td>
                                        <td className="p-1 border border-slate-300 dark:border-slate-600">
                                            <input
                                                className="w-full rounded p-1 border border-slate-300 dark:border-slate-600 text-slate-900"
                                                value={data.address_2}
                                                type="text"
                                                onChange={(e) =>
                                                    setData({ ...data, address_2: e.target.value.toLowerCase() })
                                                }
                                            />
                                        </td>
                                    </tr>

                                    <tr className="border border-slate-300 dark:border-slate-600">
                                        <td className="p-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600">
                                            City
                                        </td>
                                        <td className="p-1 border border-slate-300 dark:border-slate-600">
                                            <input
                                                className="w-full p-1 rounded border border-slate-300 dark:border-slate-600 text-slate-900"
                                                value={data.city}
                                                type="text"
                                                onChange={(e) =>
                                                    setData({ ...data, city: e.target.value.toLowerCase() })
                                                }
                                            />
                                        </td>
                                    </tr>

                                    <tr className="border border-slate-300 dark:border-slate-600">
                                        <td className="p-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600">
                                            State
                                        </td>
                                        <td className="p-1 border border-slate-300 dark:border-slate-600">
                                            <input
                                                className="w-full p-1 rounded border border-slate-300 dark:border-slate-600 text-slate-900"
                                                value={data.state}
                                                type="text"
                                                onChange={(e) =>
                                                    setData({ ...data, state: e.target.value.toLowerCase() })
                                                }
                                            />
                                        </td>
                                    </tr>

                                    <tr className="border border-slate-300 dark:border-slate-600">
                                        <td className="p-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600">
                                            District
                                        </td>
                                        <td className="p-1 border border-slate-300 dark:border-slate-600">
                                            <input
                                                className="w-full p-1 rounded border border-slate-300 dark:border-slate-600 text-slate-900"
                                                value={data.district}
                                                type="text"
                                                onChange={(e) =>
                                                    setData({ ...data, district: e.target.value.toLowerCase() })
                                                }
                                            />
                                        </td>
                                    </tr>

                                    <tr className="border border-slate-300 dark:border-slate-600">
                                        <td className="p-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600">
                                            Pincode
                                        </td>
                                        <td className="p-1 border border-slate-300 dark:border-slate-600">
                                            <input
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

                            <PageTitle>Business Details</PageTitle>
                            <table className="w-full border border-slate-300 dark:border-slate-600 text-sm">
                                <tbody>

                                    <tr className="border border-slate-300 dark:border-slate-600">
                                        <td className="p-1 w-1/3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600">
                                            GST
                                        </td>
                                        <td className="p-1 border border-slate-300 dark:border-slate-600">
                                            <input
                                                className="w-full p-1 rounded border border-slate-300 dark:border-slate-600 text-slate-900"
                                                value={data.gst}
                                                type="text"
                                                onChange={(e) =>
                                                    setData({ ...data, gst: e.target.value.toLowerCase() })
                                                }
                                            />
                                        </td>
                                    </tr>

                                    <tr className="border border-slate-300 dark:border-slate-600">
                                        <td className="p-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600">
                                            PAN
                                        </td>
                                        <td className="p-1 border border-slate-300 dark:border-slate-600">
                                            <input
                                                className="w-full p-1 rounded border border-slate-300 dark:border-slate-600 text-slate-900"
                                                value={data.pan}
                                                type="text"
                                                onChange={(e) =>
                                                    setData({ ...data, pan: e.target.value.toLowerCase() })
                                                }
                                            />
                                        </td>
                                    </tr>

                                    <tr className="border border-slate-300 dark:border-slate-600">
                                        <td className="p-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600">
                                            Trade Licence
                                        </td>
                                        <td className="p-1 border border-slate-300 dark:border-slate-600">
                                            <input
                                                className="w-full p-1 rounded border border-slate-300 dark:border-slate-600 text-slate-900"
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

                            <PageTitle>Payment Details</PageTitle>
                            <table className="w-full border border-slate-300 dark:border-slate-600 text-sm">
                                <tbody>

                                    <tr className="border border-slate-300 dark:border-slate-600">
                                        <td className="p-1 w-1/3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600">
                                            Bank Name
                                        </td>
                                        <td className="p-1 border border-slate-300 dark:border-slate-600">
                                            <input
                                                className="w-full p-1 rounded border border-slate-300 dark:border-slate-600 text-slate-900"
                                                value={data.bank}
                                                type="text"
                                                onChange={(e) =>
                                                    setData({ ...data, bank: e.target.value.toLowerCase() })
                                                }
                                            />
                                        </td>
                                    </tr>

                                    <tr className="border border-slate-300 dark:border-slate-600">
                                        <td className="p-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600">
                                            Branch
                                        </td>
                                        <td className="p-1 border border-slate-300 dark:border-slate-600">
                                            <input
                                                className="w-full p-1 rounded border border-slate-300 dark:border-slate-600 text-slate-900"
                                                value={data.branch}
                                                type="text"
                                                onChange={(e) =>
                                                    setData({ ...data, branch: e.target.value.toLowerCase() })
                                                }
                                            />
                                        </td>
                                    </tr>

                                    <tr className="border border-slate-300 dark:border-slate-600">
                                        <td className="p-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600">
                                            IFSE Code
                                        </td>
                                        <td className="p-1 border border-slate-300 dark:border-slate-600">
                                            <input
                                                className="w-full p-1 rounded border border-slate-300 dark:border-slate-600 text-slate-900"
                                                value={data.ifse}
                                                type="tel"
                                                onChange={(e) =>
                                                    setData({ ...data, ifse: e.target.value.toLowerCase() })
                                                }
                                            />
                                        </td>
                                    </tr>

                                    <tr className="border border-slate-300 dark:border-slate-600">
                                        <td className="p-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600">
                                            Account No
                                        </td>
                                        <td className="p-1 border border-slate-300 dark:border-slate-600">
                                            <input
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
                    <MainArea>
                        <div className='flex flex-col w-full'>
                            <PageTitle>Preview</PageTitle>
                            <div className='flex w-full p-1'>
                                <AiOutlineIdcard className='text-9xl' />
                                <div className='p-1 flex flex-col justify-center'>
                                    <div className='flex gap-1'>
                                        <span className='font-bold'>Company Name : </span>
                                        <p className='text-slate-400'>{(data.company_name).toUpperCase()}</p>
                                    </div>
                                    <div className='flex gap-1'>
                                        <span className='font-bold'>Name : </span>
                                        <p className='text-slate-400'>{(data.owner).toUpperCase()}</p>
                                    </div>
                                    <div className='flex gap-1'>
                                        <span className='font-bold'>Email : </span>
                                        <p className='text-slate-400'>{(data.email).toUpperCase()}</p>
                                    </div>
                                    <div className='flex gap-1'>
                                        <span className='font-bold'>Mobile : </span>
                                        <p className='text-slate-400'>{(data.mobile).toUpperCase()}</p>
                                    </div>
                                </div>
                            </div>
                            <hr />
                            <div className='flex w-full p-1'>
                                <div className='flex flex-col justify-center w-[60%]'>
                                    <div className='flex gap-1'>
                                        <span className='font-bold'>Address/ Street/ Road : </span>
                                        <p className='text-slate-400'>{(data.address_1).toUpperCase()}</p>
                                    </div>
                                    <div className='flex gap-1'>
                                        <span className='font-bold'>Flat No./ Builing/ Floor : </span>
                                        <p className='text-slate-400'>{(data.address_2).toUpperCase()}</p>
                                    </div>
                                    <div className='flex gap-1'>
                                        <span className='font-bold'>City : </span>
                                        <p className='text-slate-400'>{(data.city).toUpperCase()}</p>
                                    </div>
                                    <div className='flex gap-1'>
                                        <span className='font-bold'>State : </span>
                                        <p className='text-slate-400'>{(data.state).toUpperCase()}</p>
                                    </div>
                                    <div className='flex gap-1'>
                                        <span className='font-bold'>District : </span>
                                        <p className='text-slate-400'>{(data.district).toUpperCase()}</p>
                                    </div>
                                    <div className='flex gap-1'>
                                        <span className='font-bold'>Pincode : </span>
                                        <p className='text-slate-400'>{(data.pincode).toUpperCase()}</p>
                                    </div>
                                </div>
                                <div className='flex flex-col justify-start w-[40%]'>
                                    <div className='flex gap-1'>
                                        <span className='font-bold'>GSTIN : </span>
                                        <p className='text-slate-400'>{(data.gst).toUpperCase()}</p>
                                    </div>
                                    <div className='flex gap-1'>
                                        <span className='font-bold'>PAN No : </span>
                                        <p className='text-slate-400'>{(data.pan).toUpperCase()}</p>
                                    </div>
                                    <div className='flex gap-1'>
                                        <span className='font-bold'>Trade Licence : </span>
                                        <p className='text-slate-400'>{(data.trade_licence).toUpperCase()}</p>
                                    </div>
                                </div>
                            </div>
                            <hr />
                            <div className='flex w-full p-1 flex-col'>
                                <div className='flex gap-1'>
                                    <span className='font-bold'>Account No : </span>
                                    <p className='text-slate-400'>{(data.account_no).toUpperCase()}</p>
                                </div>
                                <div className='flex gap-1'>
                                    <span className='font-bold'>Branch : </span>
                                    <p className='text-slate-400'>{(data.address_2).toUpperCase()}</p>
                                </div>
                                <div className='flex gap-1'>
                                    <span className='font-bold'>IFSE Code : </span>
                                    <p className='text-slate-400'>{(data.city).toUpperCase()}</p>
                                </div>
                                <div className='flex gap-1'>
                                    <span className='font-bold'>Bank Name : </span>
                                    <p className='text-slate-400'>{(data.bank).toUpperCase()}</p>
                                </div>
                            </div>
                        </div>
                    </MainArea>
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