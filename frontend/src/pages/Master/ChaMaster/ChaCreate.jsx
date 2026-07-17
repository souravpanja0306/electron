import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { toast } from 'sonner';

// Icons...
import { AiOutlineFileAdd, AiOutlineRollback } from "react-icons/ai";

// Components...
import PageTitle from '../../../components/PageTitle';
import ActionArea from '../../../components/ActionArea';
import MainArea from '../../../components/MainArea';
import CustomButton from '../../../components/CustomButton';

// Store...
import useAuthStore from '../../../store/AuthStore';
import useChaStore from '../../../store/ChaStore';

const ChaCreate = () => {
    const { token } = useAuthStore();
    const { createCha } = useChaStore();
    const [searchParams] = useSearchParams();
    const back = searchParams.get("back");
    const navigate = useNavigate();

    const [data, setData] = useState({
        name: "",
        mobile: "",
        address: ""
    });

    const handleSubmit = async (e) => {
        try {
            if (e) e.preventDefault();
            if (!data.name || data.name === "") {
                toast.warning("CHA Name Required.");
                return;
            };

            let result = await createCha(data, token);
            if (result && result.status === 200) {
                toast.success(result.message || "CHA Created Successfully");
                setData({
                    name: "",
                    mobile: "",
                    address: ""
                });
            } else {
                toast.error(result.message || "Failed to create CHA");
            };
        } catch (error) {
            toast.error("Something went wrong!");
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
                navigate("/view-cha");
            };
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [data]);

    return (
        <>
            <PageTitle>Add New CHA</PageTitle>

            <div className='flex flex-col gap-1'>
                <ActionArea>
                    {back &&
                        <div onClick={() => navigate(-1)}>
                            <CustomButton title={"Back"} color={"slate"}><AiOutlineRollback /></CustomButton>
                        </div>
                    }
                    <div onClick={(e) => handleSubmit(e)}>
                        <CustomButton title={"Save (Ctrl+S)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
                    </div>
                    <Link to="/view-cha">
                        <CustomButton title={"View (Ctrl+I)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
                    </Link>
                </ActionArea>

                <form className='flex flex-col gap-1'>
                    <MainArea>
                        <div className='flex flex-col w-full sm:w-1/2 gap-1'>
                            <PageTitle>CHA Details</PageTitle>
                            <hr />
                            <table className="w-full text-sm">
                                <tbody>
                                    <tr className="dark:bg-slate-800">
                                        <td className="p-1 min-w-36">CHA Name</td>
                                        <td className="p-1 min-w-36">
                                            <input
                                                placeholder='CHA Name'
                                                className="w-full p-1 rounded border border-slate-300 dark:border-slate-600 text-slate-900"
                                                value={data.name}
                                                type="text"
                                                onChange={(e) =>
                                                    setData({ ...data, name: e.target.value })
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
                                            />
                                        </td>
                                    </tr>
                                    <tr className="dark:bg-slate-800">
                                        <td className="p-1 min-w-36">Address</td>
                                        <td className="p-1 min-w-36">
                                            <input
                                                placeholder='Address'
                                                className="w-full p-1 rounded border border-slate-300 dark:border-slate-600 text-slate-900"
                                                value={data.address}
                                                type="text"
                                                onChange={(e) =>
                                                    setData({ ...data, address: e.target.value })
                                                }
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </MainArea>
                </form>
            </div>
        </>
    )
}

export default ChaCreate;
