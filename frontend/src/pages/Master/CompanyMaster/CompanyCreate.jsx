import React, { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AiOutlineSave, AiOutlineRollback, AiOutlineTable } from "react-icons/ai";
import { toast } from 'sonner';

// Components...
import PageTitle from '../../../components/PageTitle';
import ActionArea from '../../../components/ActionArea';
import CustomButton from '../../../components/CustomButton';
import BusinessForm, { EMPTY_BUSINESS, businessValidator } from '../../../components/BusinessForm';
import { focusNextOnEnter } from '../../../components/FormKit';

// Stores / hooks...
import useCompanyStore from '../../../store/CompanyStore';
import useAuthStore from '../../../store/AuthStore';
import useShortcuts from "../../../hooks/useShortcuts";
import useForm from "../../../hooks/useForm";
import useLogoPicker from "../../../hooks/useLogoPicker";
import { errorMessage } from '../../../utils/format';

const CompanyCreate = () => {
    const { token } = useAuthStore();
    const { companyData, createCompany, getAllCompany } = useCompanyStore();
    const [searchParams] = useSearchParams();
    const back = searchParams.get("back");
    const navigate = useNavigate();

    useEffect(() => { getAllCompany(token); }, []);
    const duplicateOf = (d) => (companyData || []).find((c) => c.gst && c.gst.toUpperCase() === d.gst)?.company_name || "";

    const form = useForm(EMPTY_BUSINESS, businessValidator({ nameLabel: "Company name", duplicateOf }));
    const logo = useLogoPicker();

    const save = form.submit(async (data) => {
        try {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => formData.append(key, value ?? ""));
            if (logo.file) formData.append('logo', logo.file);

            const result = await createCompany(formData, token);
            if (result?.status === 200) {
                toast.success(result.message || "Company created.");
                form.load(EMPTY_BUSINESS);
                logo.clear();
                setTimeout(() => document.getElementById("f-company_name")?.focus(), 0);
            } else {
                toast.error(result?.message || "Could not create the company.");
            }
        } catch (error) {
            toast.error(errorMessage(error, "Could not create the company."));
        }
    });

    useShortcuts({
        s: (e) => save(e),
        i: () => navigate("/company"),
    });

    return (
        <>
            <PageTitle>Add New Company</PageTitle>
            <div className='flex flex-col gap-1'>
                <ActionArea>
                    {back && (
                        <div onClick={() => navigate(-1)}>
                            <CustomButton title={"Back"} color={"slate"}><AiOutlineRollback /></CustomButton>
                        </div>
                    )}
                    <CustomButton type="submit" form="company-form" title={form.saving ? "Saving..." : "Save (Ctrl+S)"} color={"blue"} disabled={form.saving}>
                        <AiOutlineSave />
                    </CustomButton>
                    <Link to="/company">
                        <CustomButton title={"View (Ctrl+I)"} color={"slate"}><AiOutlineTable /></CustomButton>
                    </Link>
                </ActionArea>

                <form id="company-form" onSubmit={save} onKeyDown={focusNextOnEnter} noValidate autoComplete="off">
                    <BusinessForm form={form} nameLabel="Company name" logo={logo.props} autoFocus />
                </form>
            </div>
        </>
    )
}

export default CompanyCreate
