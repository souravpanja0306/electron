import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

// Components...
import ActionArea from '../../../components/ActionArea';
import PageTitle from '../../../components/PageTitle';
import MainArea from '../../../components/MainArea';
import CustomButton from '../../../components/CustomButton';

// Icons...
import { AiOutlineFileAdd, AiOutlineTable, AiOutlineRollback, AiOutlineEdit } from "react-icons/ai";

// Stores...
import useChallanStore from "../../../store/ChallanStore";
import useAuthStore from '../../../store/AuthStore';
import useHsnSacStore from "../../../store/HsnSacStore";

const CreateHsnSac = () => {
    const { authToken, token } = useAuthStore();
    const { createHsnSac, updateHsnSac, hsnData, getAllHsnSac } = useHsnSacStore();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const isBack = searchParams.get("back") === "true";
    const editId = searchParams.get("id");

    useEffect(() => {
        authToken()
    }, []);

    const [formData, setFormData] = useState({ code: '', type: 'HSN', description: '', gst_rate: '' });

    useEffect(() => {
        if (editId) {
            if (hsnData?.body?.length) {
                const editData = hsnData.body.find(item => item.id.toString() === editId);
                if (editData) {
                    setFormData({
                        code: editData.code,
                        type: editData.type,
                        description: editData.description,
                        gst_rate: editData.gst_rate
                    });
                }
            } else {
                getAllHsnSac(token);
            }
        }
    }, [editId, hsnData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            if (!formData.code) return toast.error("Code is required");

            const payload = {
                ...formData,
                gst_rate: parseFloat(formData.gst_rate) || 0
            };
            let res = await createHsnSac(payload, token);
            if (res.status === 200) {
                toast.success(res.message);
                setFormData(initialState);
                navigate("/view-hsn-sac");
            } else {
                toast.error(res.message);
            };
        } catch (error) {
            toast.error("Failed to save data");
        };
    };

    return (
        <>
            <PageTitle>{editId ? "Edit HSN & SAC" : "Create HSN & SAC"}</PageTitle>
            <div className="flex flex-col gap-1 text-sm">
                <ActionArea>
                    {isBack || editId ? (
                        <div onClick={() => navigate(-1)}>
                            <CustomButton title={"Back"} color={"slate"}>
                                <AiOutlineRollback />
                            </CustomButton>
                        </div>
                    ) : null}
                    <div onClick={handleSubmit}>
                        <CustomButton title={editId ? "Update (Ctrl+S)" : "Save (Ctrl+S)"} color={"blue"}>
                            {editId ? <AiOutlineEdit /> : <AiOutlineFileAdd />}
                        </CustomButton>
                    </div>
                    <Link to="/view-hsn-sac">
                        <CustomButton title={"View (Ctrl+I)"} color={"blue"}>
                            <AiOutlineTable />
                        </CustomButton>
                    </Link>
                </ActionArea>

                <MainArea>
                    <div className='flex flex-col w-full sm:md:lg:xl:w-[50%] gap-1'>
                        <PageTitle>HSN/SAC Details</PageTitle>
                        <table className="w-full text-sm">
                            <tbody>
                                <tr className="dark:bg-slate-800">
                                    <td className="p-1">Type</td>
                                    <td className="p-1">
                                        <select
                                            className="w-full p-1 rounded text-slate-900 border border-slate-300 dark:border-slate-600"
                                            name="type"
                                            value={formData.type}
                                            onChange={handleChange}
                                        >
                                            <option value="HSN">HSN (Goods)</option>
                                            <option value="SAC">SAC (Services)</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr className="dark:bg-slate-800">
                                    <td className="p-1">Code</td>
                                    <td className="p-1">
                                        <input
                                            className="w-full p-1 rounded text-slate-900 border border-slate-300 dark:border-slate-600"
                                            type="text"
                                            name="code"
                                            placeholder="Enter Code"
                                            value={formData.code}
                                            onChange={handleChange}
                                        />
                                    </td>
                                </tr>
                                <tr className="dark:bg-slate-800">
                                    <td className="p-1">GST Rate (%)</td>
                                    <td className="p-1">
                                        <input
                                            className="w-full p-1 rounded text-slate-900 border border-slate-300 dark:border-slate-600"
                                            type="number"
                                            name="gst_rate"
                                            placeholder="0.00"
                                            value={formData.gst_rate}
                                            onChange={handleChange}
                                        />
                                    </td>
                                </tr>
                                <tr className="dark:bg-slate-800">
                                    <td className="p-1">Description</td>
                                    <td className="p-1">
                                        <textarea
                                            className="w-full p-1 rounded text-slate-900 border border-slate-300 dark:border-slate-600"
                                            name="description"
                                            rows="3"
                                            placeholder="Enter description here..."
                                            value={formData.description}
                                            onChange={handleChange}
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </MainArea>
            </div>
        </>
    );
};

export default CreateHsnSac;
