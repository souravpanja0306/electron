import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import { useSearchParams, useNavigate } from "react-router-dom";

// Icon...
import {
    AiOutlineFileAdd,
    AiOutlineSync,
    AiOutlineFilter,
    AiOutlineDelete,
    AiOutlineRollback
} from "react-icons/ai";

// Components
import PageTitle from '../../../components/PageTitle';
import MainArea from '../../../components/MainArea';
import CustomButton from '../../../components/CustomButton';
import CustomLoader from "../../../components/CustomLoader";
import ActionArea from "../../../components/ActionArea";

// Stores...
import useCompanyStore from "../../../store/CompanyStore";

const CompanyDetails = () => {
    const navigate = useNavigate();

    const { id } = useParams();
    const token = localStorage.getItem("token");
    const { companyData, deleteCompany, getCompanyById, companyLoading, error } = useCompanyStore();

    useEffect(() => {
        if (id && token) {
            getCompanyById(id, token);
        }
    }, [id, token, getCompanyById]);

    if (companyLoading) {
        return <CustomLoader />;
    };

    const handleRefresh = () => {
        getCompanyById(id, token);
        toast.info("Refreshing data...", { theme: "dark" });
    };

    const handleDelete = async () => {
        try {
            if (!id) {
                toast.warning("Please select an item to delete.", { theme: "dark" });
                return;
            }
            if (window.confirm("Are you sure you want to delete selected companies?")) {
                let result = await deleteCompany({ ids: id, token: token });
                if (result.status === 200) {
                    toast.success(result.message, { theme: "dark" });
                    getCompanyById(id, token);
                } else {
                    toast.error(result.message, { theme: "dark" });
                }
            }
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong!", { theme: "dark" });
        };
    };


    if (error) {
        toast.error(`Error loading company details: ${error}`, { theme: "dark" });
        return (
            <>
                <PageTitle>Company Details</PageTitle>
                <MainArea>
                    <div className="text-red-500 dark:text-red-400">Failed to load company details.</div>
                </MainArea>
            </>
        );
    }


    const {
        company_name,
        mobile,
        email,
        owner,
        pan,
        gst,
        trade_licence,
        account_no
    } = companyData[0];

    return (
        <>
            <PageTitle>Company Details</PageTitle>
            <div className='flex flex-col gap-1'>
                <ActionArea>
                    <div className="flex justify-between w-full">
                        <div className="flex gap-1">
                            {id ?
                                <div onClick={() => navigate(-1)}>
                                    <CustomButton title={"Back"} color={"slate"}><AiOutlineRollback /></CustomButton>
                                </div>
                                : ""
                            }
                            <Link to="/add-company">
                                <CustomButton title={"New (Ctrl+N)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
                            </Link>
                            <div onClick={handleDelete} className={`${id !== "" ? "block" : "hidden"}`}>
                                <CustomButton title={"Delete (Ctrl+D)"} color={"red"}><AiOutlineDelete /></CustomButton>
                            </div>
                            <div className={`${id !== "" ? "block" : "hidden"}`}>
                                <Link to={`/edit-company/${id}`}>
                                    <CustomButton title={"Edit (Ctrl+E)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
                                </Link>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <div onClick={handleRefresh}>
                                <CustomButton title={"Refresh"} color={"blue"}><AiOutlineSync /></CustomButton>
                            </div>
                            <div>
                                <CustomButton title={"Filter"} color={"blue"}><AiOutlineFilter /></CustomButton>
                            </div>
                        </div>
                    </div>
                </ActionArea>
                <MainArea>

                    {
                        companyData && companyData.length
                            ?
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                                {/* Company Name Header */}
                                <div className="col-span-full">
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white capitalize mb-4">{company_name || "N/A"}</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-300 italic">Company Profile</p>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-sm">
                                        <div className="font-semibold text-gray-700 dark:text-gray-200">Mobile</div>
                                        <div className="text-gray-500 dark:text-gray-300">{mobile || "--"}</div>
                                    </div>
                                    <div className="text-sm">
                                        <div className="font-semibold text-gray-700 dark:text-gray-200">Email</div>
                                        <div className="text-gray-500 dark:text-gray-300">{email || "--"}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-sm">
                                        <div className="font-semibold text-gray-700 dark:text-gray-200">Owner</div>
                                        <div className="text-gray-500 dark:text-gray-300 capitalize">{owner || "--"}</div>
                                    </div>
                                    <div className="text-sm">
                                        <div className="font-semibold text-gray-700 dark:text-gray-200">PAN</div>
                                        <div className="text-gray-500 dark:text-gray-300 uppercase">{pan || "--"}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-sm">
                                        <div className="font-semibold text-gray-700 dark:text-gray-200">GST</div>
                                        <div className="text-gray-500 dark:text-gray-300 uppercase">{gst || "--"}</div>
                                    </div>
                                    <div className="text-sm">
                                        <div className="font-semibold text-gray-700 dark:text-gray-200">Trade Licence</div>
                                        <div className="text-gray-500 dark:text-gray-300 uppercase">{trade_licence || "--"}</div>
                                    </div>
                                </div>

                                <div className="col-span-1 md:col-span-2 text-sm">
                                    <div className="font-semibold text-gray-700 dark:text-gray-200">Bank a/c No</div>
                                    <div className="text-gray-500 dark:text-gray-300">{account_no || "--"}</div>
                                </div>
                            </div>
                            :
                            <tr className="p-1 hover:bg-blue-200 dark:hover:bg-slate-600 duration-200 cursor-pointer">
                                <td className="p-1 text-center" colSpan={10}>No Data Found</td>
                            </tr>

                    }
                </MainArea>
            </div>
        </>
    );
};

export default CompanyDetails;