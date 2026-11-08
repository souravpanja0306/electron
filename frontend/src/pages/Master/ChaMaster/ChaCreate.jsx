import React, { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from 'sonner';

// Icons...
import { AiOutlineSave, AiOutlineRollback, AiOutlineTable } from "react-icons/ai";

// Components...
import PageTitle from '../../../components/PageTitle';
import ActionArea from '../../../components/ActionArea';
import CustomButton from '../../../components/CustomButton';
import ChaForm, { EMPTY_CHA, chaValidator } from '../../../components/ChaForm';
import { focusNextOnEnter } from '../../../components/FormKit';

// Store / hooks...
import useAuthStore from '../../../store/AuthStore';
import useChaStore from '../../../store/ChaStore';
import useShortcuts from "../../../hooks/useShortcuts";
import useForm from "../../../hooks/useForm";
import { trimAll } from '../../../utils/validators';

const ChaCreate = () => {
    const { token } = useAuthStore();
    const { createCha, getAllCha, chaData } = useChaStore();
    const [searchParams] = useSearchParams();
    const back = searchParams.get("back");
    const navigate = useNavigate();

    useEffect(() => { getAllCha(); }, []);
    const duplicateOf = (name) => (chaData || []).some((c) => (c.name || "").trim().toLowerCase() === name);

    const form = useForm(EMPTY_CHA, chaValidator({ duplicateOf }));

    const save = form.submit(async (data) => {
        const result = await createCha({ data: trimAll(data), token });
        if (result?.status === 200) {
            toast.success(result.message || "CHA created.");
            form.load(EMPTY_CHA);
            getAllCha();
            setTimeout(() => document.getElementById("f-name")?.focus(), 0);
        } else {
            toast.error(result?.message || "Could not create the CHA.");
        }
    });

    useShortcuts({
        s: (e) => save(e),
        i: () => navigate("/view-cha"),
    });

    return (
        <>
            <PageTitle>Add New CHA</PageTitle>
            <div className='flex flex-col gap-1'>
                <ActionArea>
                    {back && (
                        <div onClick={() => navigate(-1)}>
                            <CustomButton title={"Back"} color={"slate"}><AiOutlineRollback /></CustomButton>
                        </div>
                    )}
                    <CustomButton type="submit" form="cha-form" title={form.saving ? "Saving..." : "Save (Ctrl+S)"} color={"blue"} disabled={form.saving}>
                        <AiOutlineSave />
                    </CustomButton>
                    <Link to="/view-cha">
                        <CustomButton title={"View (Ctrl+I)"} color={"slate"}><AiOutlineTable /></CustomButton>
                    </Link>
                </ActionArea>

                <form id="cha-form" onSubmit={save} onKeyDown={focusNextOnEnter} noValidate autoComplete="off">
                    <ChaForm form={form} autoFocus />
                </form>
            </div>
        </>
    )
}

export default ChaCreate;
