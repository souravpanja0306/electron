import React, { useState, useEffect } from 'react'
import PageTitle from '../../../../components/PageTitle';
import ActionArea from '../../../../components/ActionArea';
import MainArea from '../../../../components/MainArea';
import CustomButton from '../../../../components/CustomButton';
import { Link, NavLink } from "react-router-dom";
import { AiOutlineFileAdd } from "react-icons/ai";
import Alert from "../../../../components/Alert";
import { useNavigate } from "react-router-dom";

const CreateParty = () => {
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

    const handleSubmit = async () => {
        try {
            if (!data.company_name && data.company_name == "") {
                setAlart({
                    show: true,
                    title: "Field required",
                    type: "warning",
                    message: "Company Name Required."
                });
                return;
            };
            if (!window.api) return;
            await window.api.createParty(data).then((res) => {
                if (parseInt(res.status) === 200) {
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
                    setAlart({
                        show: true,
                        title: "Sccesss",
                        type: "success",
                        message: "Party Created Successfully..."
                    });
                };
            });
        } catch (error) {
            console.log(error);
        };
    };

    const navigate = useNavigate();
    useEffect(() => {
        const onKey = (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                handleSubmit();
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
            <PageTitle>Add/Update Party</PageTitle>

            <div className='flex flex-col gap-1'>
                <ActionArea>
                    <div onClick={(e) => handleSubmit(e)}>
                        <CustomButton title={"Save (Ctrl+S)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
                    </div>
                    <Link to="/party">
                        <CustomButton title={"View (Ctrl+I)"} color={"yellow"}><AiOutlineFileAdd /></CustomButton>
                    </Link>
                </ActionArea>
                <form className='flex flex-col gap-1'>
                    <br />
                    <PageTitle>Personal Details</PageTitle>
                    <MainArea>
                        <div className='flex flex-col w-full gap-1'>
                            <div className='flex gap-1 w-full'>
                                <div className='flex flex-col w-full gap-1'>
                                    <label className='text-xs uppercase'>Company Name <span className='text-red-600'>*</span></label>
                                    <input
                                        className="p-1 rounded-md w-full capitalize text-slate-900"
                                        placeholder="Company Name..."
                                        value={data.company_name}
                                        type="text"
                                        onChange={(e) => setData({ ...data, company_name: (e.target.value).toLowerCase() })}
                                        required
                                        autoCapitalize='true'
                                    />
                                </div>
                                <div className='flex flex-col w-full gap-1'>
                                    <label className='text-xs uppercase'>Mobile <span className='text-red-600'>*</span></label>
                                    <input
                                        className='p-1 rounded-md w-full capitalize text-slate-900'
                                        placeholder='Mobile...'
                                        value={data.mobile}
                                        maxLength={10}
                                        type="tel"
                                        onChange={(e) => setData({ ...data, mobile: e.target.value.replace(/\D/g, '') })}
                                        required
                                    />
                                </div>
                                <div className='flex flex-col w-full gap-1'>
                                    <label className='text-xs uppercase'>Email <span className='text-red-600'>*</span></label>
                                    <input
                                        className='p-1 rounded-md w-full capitalize text-slate-900'
                                        placeholder='Email...'
                                        value={data.email}
                                        type="email"
                                        onChange={(e) => setData({ ...data, email: (e.target.value).toLowerCase() })}
                                        required
                                    />
                                </div>
                                <div className='flex flex-col w-full gap-1'>
                                    <label className='text-xs uppercase'>Director/Proprietor/Owner</label>
                                    <input
                                        className='p-1 rounded-md w-full capitalize text-slate-900'
                                        placeholder='Director/Proprietor/Owner...'
                                        value={data.owner}
                                        type="text"
                                        onChange={(e) => setData({ ...data, owner: (e.target.value).toLowerCase() })}
                                        required
                                    />
                                </div>
                            </div>
                            <hr />
                            <div className='flex gap-1 w-full'>
                                <div className='flex flex-col w-full gap-1'>
                                    <label className='text-xs uppercase'>Address 1</label>
                                    <input
                                        className='p-1 rounded-md w-full capitalize text-slate-900'
                                        placeholder='Address 1...'
                                        value={data.address_1}
                                        type="text"
                                        onChange={(e) => setData({ ...data, address_1: (e.target.value).toLowerCase() })}
                                    />
                                </div>
                                <div className='flex flex-col w-full gap-1'>
                                    <label className='text-xs uppercase'>Address 2</label>
                                    <input
                                        className='p-1 rounded-md w-full capitalize text-slate-900'
                                        placeholder='Address 2...'
                                        value={data.address_2}
                                        type="text"
                                        onChange={(e) => setData({ ...data, address_2: (e.target.value).toLowerCase() })}
                                    />
                                </div>
                                <div className='flex flex-col w-full gap-1'>
                                    <label className='text-xs uppercase'>City</label>
                                    <input
                                        className='p-1 rounded-md w-full capitalize text-slate-900'
                                        placeholder='City...'
                                        value={data.city}
                                        type="text"
                                        onChange={(e) => setData({ ...data, city: (e.target.value).toLowerCase() })}
                                    />
                                </div>
                            </div>
                            <div className='flex gap-1 w-full'>
                                <div className='flex flex-col w-full gap-1'>
                                    <label className='text-xs uppercase'>State</label>
                                    <input
                                        className='p-1 rounded-md w-full capitalize text-slate-900'
                                        placeholder='State...'
                                        value={data.state}
                                        type="text"
                                        onChange={(e) => setData({ ...data, state: (e.target.value).toLowerCase() })}
                                    />
                                </div>
                                <div className='flex flex-col w-full gap-1'>
                                    <label className='text-xs uppercase'>District</label>
                                    <input
                                        className='p-1 rounded-md w-full capitalize text-slate-900'
                                        placeholder='District...'
                                        value={data.district}
                                        type="text"
                                        onChange={(e) => setData({ ...data, district: (e.target.value).toLowerCase() })}
                                    />
                                </div>
                                <div className='flex flex-col w-full gap-1 min-w-48'>
                                    <label className='text-xs uppercase'>Pincode</label>
                                    <input
                                        className='p-1 rounded-md w-full capitalize text-slate-900'
                                        placeholder='Pincode...'
                                        value={data.pincode}
                                        type="text"
                                        onChange={(e) => setData({ ...data, pincode: (e.target.value).toLowerCase() })}
                                    />
                                </div>
                                <div className='flex flex-col w-full gap-1'>
                                    <label className='text-xs uppercase'>Country</label>
                                    <input
                                        value="INDIA"
                                        disabled
                                        type="text"
                                        className='p-1 rounded-md w-full capitalize text-slate-900'
                                        placeholder='Country...'
                                    />
                                </div>
                            </div>
                        </div>
                    </MainArea>
                    <br />
                    <PageTitle>Business Details</PageTitle>
                    <MainArea>
                        <div className='flex flex-col w-full gap-1'>
                            <div className='flex gap-1 w-full'>
                                <div className='flex flex-col w-full gap-1'>
                                    <label className='text-xs uppercase'>GST</label>
                                    <input
                                        className='p-1 rounded-md w-full capitalize text-slate-900'
                                        placeholder='GST...'
                                        value={data.gst}
                                        type="text"
                                        onChange={(e) => setData({ ...data, gst: (e.target.value).toLowerCase() })}
                                    />
                                </div>
                                <div className='flex flex-col w-full gap-1'>
                                    <label className='text-xs uppercase'>PAN</label>
                                    <input
                                        className='p-1 rounded-md w-full capitalize text-slate-900'
                                        placeholder='PAN...'
                                        value={data.pan}
                                        type="text"
                                        onChange={(e) => setData({ ...data, pan: (e.target.value).toLowerCase() })}
                                    />
                                </div>
                                <div className='flex flex-col w-full gap-1'>
                                    <label className='text-xs uppercase'>Trade Licence</label>
                                    <input
                                        className='p-1 rounded-md w-full capitalize text-slate-900'
                                        placeholder='Trade Licence...'
                                        value={data.trade_licence}
                                        type="text"
                                        onChange={(e) => setData({ ...data, trade_licence: (e.target.value).toLowerCase() })}
                                    />
                                </div>
                            </div>
                            <hr />
                            <div className='flex gap-1 w-full'>
                                <div className='flex flex-col w-full gap-1'>
                                    <label className='text-xs uppercase'>Bank Name</label>
                                    <input
                                        className='p-1 rounded-md w-full capitalize text-slate-900'
                                        placeholder='Bank Name...'
                                        value={data.bank}
                                        type="text"
                                        onChange={(e) => setData({ ...data, bank: (e.target.value).toLowerCase() })}
                                    />
                                </div>
                            </div>
                            <div className='flex gap-1 w-full'>
                                <div className='flex flex-col w-full gap-1'>
                                    <label className='text-xs uppercase'>Branch</label>
                                    <input
                                        className='p-1 rounded-md w-full capitalize text-slate-900'
                                        placeholder='Branch...'
                                        value={data.branch}
                                        type="text"
                                        onChange={(e) => setData({ ...data, branch: (e.target.value).toLowerCase() })}
                                    />
                                </div>
                                <div className='flex flex-col w-full gap-1'>
                                    <label className='text-xs uppercase'>IFSE Code</label>
                                    <input
                                        className='p-1 rounded-md w-full capitalize text-slate-900'
                                        placeholder='IFSE Code...'
                                        value={data.ifse}
                                        type="tel"
                                        onChange={(e) => setData({ ...data, ifse: (e.target.value).toLowerCase() })}
                                    />
                                </div>
                                <div className='flex flex-col w-full gap-1'>
                                    <label className='text-xs uppercase'>Account No</label>
                                    <input
                                        className='p-1 rounded-md w-full capitalize text-slate-900'
                                        placeholder='Account No...'
                                        value={data.account_no}
                                        type="tel"
                                        onChange={(e) => setData({ ...data, account_no: (e.target.value).toLowerCase() })}
                                    />
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