import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

// Components
import ActionArea from '../../../components/ActionArea';
import PageTitle from '../../../components/PageTitle';
import MainArea from '../../../components/MainArea';
import CustomButton from '../../../components/CustomButton';

// Icons
import { AiOutlineFileAdd, AiOutlineTable, AiOutlineRollback } from "react-icons/ai";

// Store
import useHsnSacStore from '../../../store/HsnSacStore';

const CreateHsnSac = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { createHsnSac } = useHsnSacStore(); // Removed 'loading' to simplify as per theme
    
    const isBack = searchParams.get("back") === "true";
    const token = localStorage.getItem('token');

    // 1. Initial State for easy blanking
    const initialState = {
        code: '',
        type: 'HSN',
        description: '',
        gst_rate: ''
    };

    const [formData, setFormData] = useState(initialState);

    // 2. Simple Input Handler
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 3. Save and Reset Logic
    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        
        if (!formData.code) return toast.error("Code is required");
        
        // Prepare payload (convert GST to number)
        const payload = {
            ...formData,
            gst_rate: parseFloat(formData.gst_rate) || 0
        };
        
        try {
            await createHsnSac(payload, token);
            toast.success("Record Saved Successfully");

            // Blank the fields after submit
            setFormData(initialState);
            
            // If we came from another page, go back automatically
            if (isBack) {
                navigate(-1);
            }
        } catch (error) {
            toast.error("Failed to save data");
        }
    };

    return (
        <div className="flex flex-col gap-1">
            <PageTitle>Create HSN & SAC</PageTitle>
            
            <ActionArea>
                {isBack && (
                    <div onClick={() => navigate(-1)}>
                        <CustomButton title={"Back"} color={"slate"}>
                            <AiOutlineRollback />
                        </CustomButton>
                    </div>
                )}
                <div onClick={handleSubmit}>
                    <CustomButton title={"Save (Ctrl+S)"} color={"blue"}>
                        <AiOutlineFileAdd />
                    </CustomButton>
                </div>
                <Link to="/view-hsn-sac">
                    <CustomButton title={"View (Ctrl+I)"} color={"blue"}>
                        <AiOutlineTable />
                    </CustomButton>
                </Link>
            </ActionArea>

            <PageTitle>HSN/SAC Details</PageTitle>
            <MainArea>
                <div className='flex gap-1 justify-between w-full'>
                    <div className='flex flex-col w-full gap-1'>
                        <label className='text-xs'>Type</label>
                        <select
                            className="h-8 p-1 rounded w-full text-slate-900 border border-slate-400 dark:border-slate-600"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                        >
                            <option value="HSN">HSN (Goods)</option>
                            <option value="SAC">SAC (Services)</option>
                        </select>
                    </div>

                    <div className='flex flex-col w-full gap-1'>
                        <label className='text-xs'>Code</label>
                        <input
                            className="h-8 p-1 rounded w-full text-slate-900 border border-slate-400 dark:border-slate-600"
                            type="text"
                            name="code"
                            placeholder="Enter Code"
                            value={formData.code}
                            onChange={handleChange}
                        />
                    </div>

                    <div className='flex flex-col w-full gap-1'>
                        <label className='text-xs'>GST Rate (%)</label>
                        <input
                            className="h-8 p-1 rounded w-full text-slate-900 border border-slate-400 dark:border-slate-600"
                            type="number"
                            name="gst_rate"
                            placeholder="0.00"
                            value={formData.gst_rate}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </MainArea>

            <PageTitle>Description</PageTitle>
            <MainArea>
                <div className='flex flex-col w-full gap-1'>
                    <label className='text-xs'>Detailed Description</label>
                    <textarea
                        className="p-1 rounded w-full text-slate-900 border border-slate-400 dark:border-slate-600"
                        name="description"
                        rows="3"
                        placeholder="Enter description here..."
                        value={formData.description}
                        onChange={handleChange}
                    />
                </div>
            </MainArea>
        </div>
    );
};

export default CreateHsnSac;