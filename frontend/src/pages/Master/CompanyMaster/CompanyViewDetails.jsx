import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AiOutlineSave, AiOutlineRollback, AiOutlineTable } from "react-icons/ai";
import { toast } from 'sonner';

// Components...
import PageTitle from '../../../components/PageTitle';
import ActionArea from '../../../components/ActionArea';
import CustomButton from '../../../components/CustomButton';
import CustomLoader from '../../../components/CustomLoader';
import MainArea from '../../../components/MainArea';
import BusinessForm, { EMPTY_BUSINESS, businessValidator, toBusinessData } from '../../../components/BusinessForm';
import { focusNextOnEnter } from '../../../components/FormKit';

// Stores / hooks...
import useCompanyStore from '../../../store/CompanyStore';
import useAuthStore from '../../../store/AuthStore';
import useShortcuts from "../../../hooks/useShortcuts";
import useForm from "../../../hooks/useForm";
import useLogoPicker from "../../../hooks/useLogoPicker";
import { errorMessage } from '../../../utils/format';

const CompanyViewDetails = () => {
    const { companyData, getAllCompany, updateCompany } = useCompanyStore();
    const { token } = useAuthStore();
    const [searchParams] = useSearchParams();
    const back = searchParams.get("back");
    const { id } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState("loading"); // loading | ready | missing
    const [savedLogo, setSavedLogo] = useState("");

    const duplicateOf = (d) =>
        (companyData || []).find((c) => String(c.id) !== String(id) && c.gst && c.gst.toUpperCase() === d.gst)?.company_name || "";
    const form = useForm(EMPTY_BUSINESS, businessValidator({ nameLabel: "Company name", duplicateOf }));
    const logo = useLogoPicker(savedLogo);

    // One request: the full list keeps the store intact (for the GSTIN duplicate check) and holds this record.
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const result = await getAllCompany(token);
                if (!alive) return;
                const record = (result?.body || []).find((c) => String(c.id) === String(id));
                if (record) {
                    form.load(toBusinessData(record));
                    setSavedLogo(record.logo || "");
                    setStatus("ready");
                } else {
                    setStatus("missing");
                    toast.error("Company not found.");
                }
            } catch (error) {
                if (alive) {
                    setStatus("missing");
                    toast.error(errorMessage(error, "Could not load the company."));
                }
            }
        })();
        return () => { alive = false; };
    }, [id]);

    const save = form.submit(async (data) => {
        try {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => formData.append(key, value ?? ""));
            if (logo.file) formData.append('logo', logo.file);

            const result = await updateCompany(id, formData, token);
            if (result?.status === 200) {
                toast.success(result.message || "Company updated.");
                form.markSaved();
                if (back) navigate(-1);
                else navigate("/company");
            } else {
                toast.error(result?.message || "Could not update the company.");
            }
        } catch (error) {
            toast.error(errorMessage(error, "Could not update the company."));
        }
    });

    const changed = form.dirty || Boolean(logo.file);

    useShortcuts({
        s: (e) => status === "ready" && save(e),
        i: () => navigate("/company"),
    });

    if (status === "loading") return <CustomLoader />;

    return (
        <>
            <PageTitle>Edit Company</PageTitle>
            <div className='flex flex-col gap-1'>
                <ActionArea>
                    <div onClick={() => navigate(-1)}>
                        <CustomButton title={"Back"} color={"slate"}><AiOutlineRollback /></CustomButton>
                    </div>
                    {status === "ready" && (
                        <CustomButton type="submit" form="company-form" title={form.saving ? "Saving..." : "Save (Ctrl+S)"} color={"blue"} disabled={form.saving || !changed}>
                            <AiOutlineSave />
                        </CustomButton>
                    )}
                    <Link to="/company">
                        <CustomButton title={"View (Ctrl+I)"} color={"slate"}><AiOutlineTable /></CustomButton>
                    </Link>
                </ActionArea>

                {status === "missing" ? (
                    <MainArea>
                        <div className="w-full p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                            This company could not be found. It may have been deleted.
                        </div>
                    </MainArea>
                ) : (
                    <form id="company-form" onSubmit={save} onKeyDown={focusNextOnEnter} noValidate autoComplete="off">
                        <BusinessForm form={form} nameLabel="Company name" logo={logo.props} />
                    </form>
                )}
            </div>
        </>
    )
}

export default CompanyViewDetails
