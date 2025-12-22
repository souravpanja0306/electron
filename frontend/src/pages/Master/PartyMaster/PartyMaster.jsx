import React, { useState } from 'react'
import PageTitle from '../../../components/PageTitle';
import ActionArea from '../../../components/ActionArea';
import MainArea from '../../../components/MainArea';
import CustomButton from '../../../components/CustomButton';
import { Link } from "react-router-dom";
import { AiOutlineFileAdd } from "react-icons/ai";



const PartyMaster = () => {
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
            console.log("🚀 ~ handleSubmit ~ data:", data)
            if (!window.api) return;
            await window.api.createParty(data).then((res) => {
                console.log(res);
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
                })
            });
        } catch (error) {
            console.log(error);
        };
    };

    return (
        <>
            <PageTitle>Add/Update Party</PageTitle>

            <div className='flex flex-col gap-1'>
                <ActionArea>
                    <div onClick={(e) => handleSubmit(e)}>
                        <CustomButton title={"Save"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
                    </div>
                </ActionArea>
                <form className='flex flex-col gap-1'>
                    <MainArea>
                        <div className='flex flex-col w-full gap-1'>
                            <PageTitle>Personal Details</PageTitle>
                            <div className='flex gap-1 w-full'>
                                <div className='flex flex-col w-full gap-1'>
                                    <label className='text-xs uppercase'>Company Name <span className='text-red-600'>*</span></label>
                                    <input
                                        className="bg-slate-600 p-1 rounded-md w-full"
                                        placeholder="Company Name..."
                                        value={data.company_name}
                                        type="text"
                                        onChange={(e) => setData({ ...data, company_name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className='flex flex-col w-full gap-1'>
                                    <label className='text-xs uppercase'>Mobile <span className='text-red-600'>*</span></label>
                                    <input
                                        className='bg-slate-600 p-1 rounded-md w-full'
                                        placeholder='Mobile...'
                                        value={data.mobile}
                                        type="tel"
                                        onChange={(e) => setData({ ...data, mobile: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className='flex flex-col w-full gap-1'>
                                    <label className='text-xs uppercase'>Email <span className='text-red-600'>*</span></label>
                                    <input
                                        className='bg-slate-600 p-1 rounded-md w-full'
                                        placeholder='Email...'
                                        value={data.email}
                                        type="email"
                                        onChange={(e) => setData({ ...data, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className='flex flex-col w-full gap-1'>
                                    <label className='text-xs uppercase'>Director/Proprietor/Owner</label>
                                    <input
                                        className='bg-slate-600 p-1 rounded-md w-full'
                                        placeholder='Director/Proprietor/Owner...'
                                        value={data.owner}
                                        type="text"
                                        onChange={(e) => setData({ ...data, owner: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <hr />
                            <div className='flex gap-1 w-full'>
                                <div className='flex flex-col w-full gap-1'>
                                    <label className='text-xs uppercase'>Address 1</label>
                                    <input
                                        className='bg-slate-600 p-1 rounded-md w-full'
                                        placeholder='Address 1...'
                                        value={data.address_1}
                                        type="text"
                                        onChange={(e) => setData({ ...data, address_1: e.target.value })}
                                    />
                                </div>
                                <div className='flex flex-col w-full gap-1'>
                                    <label className='text-xs uppercase'>Address 2</label>
                                    <input
                                        className='bg-slate-600 p-1 rounded-md w-full'
                                        placeholder='Address 2...'
                                        value={data.address_2}
                                        type="text"
                                        onChange={(e) => setData({ ...data, address_2: e.target.value })}
                                    />
                                </div>
                                <div className='flex flex-col w-full gap-1'>
                                    <label className='text-xs uppercase'>City</label>
                                    <input
                                        className='bg-slate-600 p-1 rounded-md w-full'
                                        placeholder='City...'
                                        value={data.city}
                                        type="text"
                                        onChange={(e) => setData({ ...data, city: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className='flex gap-1 w-full'>
                                <div className='flex flex-col w-full gap-1'>
                                    <label className='text-xs uppercase'>State</label>
                                    <input
                                        className='bg-slate-600 p-1 rounded-md w-full'
                                        placeholder='State...'
                                        value={data.state}
                                        type="text"
                                        onChange={(e) => setData({ ...data, state: e.target.value })}
                                    />
                                </div>
                                <div className='flex flex-col w-full gap-1'>
                                    <label className='text-xs uppercase'>District</label>
                                    <input
                                        className='bg-slate-600 p-1 rounded-md w-full'
                                        placeholder='District...'
                                        value={data.district}
                                        type="text"
                                        onChange={(e) => setData({ ...data, district: e.target.value })}
                                    />
                                </div>
                                <div className='flex flex-col w-full gap-1'>
                                    <label className='text-xs uppercase'>Pincode</label>
                                    <input
                                        className='bg-slate-600 p-1 rounded-md w-full'
                                        placeholder='Pincode...'
                                        value={data.pincode}
                                        type="text"
                                        onChange={(e) => setData({ ...data, pincode: e.target.value })}
                                    />
                                </div>
                                <div className='flex flex-col w-full gap-1'>
                                    <label className='text-xs uppercase'>Country</label>
                                    <input
                                        value="INDIA"
                                        disabled
                                        type="text"
                                        className='bg-slate-600 p-1 rounded-md w-full'
                                        placeholder='Country...'
                                    />
                                </div>
                            </div>
                        </div>
                    </MainArea>
                    <MainArea>
                        <div className='flex flex-col w-full gap-1'>
                            <PageTitle>Business Details</PageTitle>
                            <div className='flex gap-1 w-full'>
                                <div className='flex flex-col w-full gap-1'>
                                    <label className='text-xs uppercase'>GST</label>
                                    <input
                                        className='bg-slate-600 p-1 rounded-md w-full'
                                        placeholder='GST...'
                                        value={data.gst}
                                        type="text"
                                        onChange={(e) => setData({ ...data, gst: e.target.value })}
                                    />
                                </div>
                                <div className='flex flex-col w-full gap-1'>
                                    <label className='text-xs uppercase'>PAN</label>
                                    <input
                                        className='bg-slate-600 p-1 rounded-md w-full'
                                        placeholder='PAN...'
                                        value={data.pan}
                                        type="text"
                                        onChange={(e) => setData({ ...data, pan: e.target.value })}
                                    />
                                </div>
                                <div className='flex flex-col w-full gap-1'>
                                    <label className='text-xs uppercase'>Trade Licence</label>
                                    <input
                                        className='bg-slate-600 p-1 rounded-md w-full'
                                        placeholder='Trade Licence...'
                                        value={data.trade_licence}
                                        type="text"
                                        onChange={(e) => setData({ ...data, trade_licence: e.target.value })}
                                    />
                                </div>
                            </div>
                            <hr />
                            <div className='flex gap-1 w-full'>
                                <div className='flex flex-col w-full gap-1'>
                                    <label className='text-xs uppercase'>Bank Name</label>
                                    <input
                                        className='bg-slate-600 p-1 rounded-md w-full'
                                        placeholder='Bank Name...'
                                        value={data.bank}
                                        type="text"
                                        onChange={(e) => setData({ ...data, bank: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className='flex gap-1 w-full'>
                                <div className='flex flex-col w-full gap-1'>
                                    <label className='text-xs uppercase'>Branch</label>
                                    <input
                                        className='bg-slate-600 p-1 rounded-md w-full'
                                        placeholder='Branch...'
                                        value={data.branch}
                                        type="text"
                                        onChange={(e) => setData({ ...data, branch: e.target.value })}
                                    />
                                </div>
                                <div className='flex flex-col w-full gap-1'>
                                    <label className='text-xs uppercase'>IFSE Code</label>
                                    <input
                                        className='bg-slate-600 p-1 rounded-md w-full'
                                        placeholder='IFSE Code...'
                                        value={data.ifse}
                                        type="tel"
                                        onChange={(e) => setData({ ...data, ifse: e.target.value })}
                                    />
                                </div>
                                <div className='flex flex-col w-full gap-1'>
                                    <label className='text-xs uppercase'>Account No</label>
                                    <input
                                        className='bg-slate-600 p-1 rounded-md w-full'
                                        placeholder='Account No...'
                                        value={data.account_no}
                                        type="tel"
                                        onChange={(e) => setData({ ...data, account_no: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </MainArea>
                </form>
            </div >
        </>
    )
}

export default PartyMaster