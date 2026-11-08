import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from 'sonner';

// Icons...
import { AiOutlineSave, AiOutlineRollback, AiOutlineTable } from "react-icons/ai";

// Components...
import PageTitle from '../../../components/PageTitle';
import ActionArea from '../../../components/ActionArea';
import CustomButton from '../../../components/CustomButton';
import CustomLoader from '../../../components/CustomLoader';
import MainArea from '../../../components/MainArea';
import ChaForm, { EMPTY_CHA, chaValidator, toChaData } from '../../../components/ChaForm';
import { focusNextOnEnter } from '../../../components/FormKit';

// Store / hooks...
import useAuthStore from '../../../store/AuthStore';
import useChaStore from '../../../store/ChaStore';
import useShortcuts from "../../../hooks/useShortcuts";
import useForm from "../../../hooks/useForm";
import { trimAll } from '../../../utils/validators';

const ChaEdit = () => {
    const { token } = useAuthStore();
    const { chaData, updateCha, getAllCha } = useChaStore();
    const navigate = useNavigate();
    const { id } = useParams();
    const [status, setStatus] = useState("loading"); // loading | ready | missing

    const duplicateOf = (name) =>
        (chaData || []).some((c) => String(c.id) !== String(id) && (c.name || "").trim().toLowerCase() === name);
    const form = useForm(EMPTY_CHA, chaValidator({ duplicateOf }));

    // Always fetch fresh so we never edit a stale copy.
    useEffect(() => {
        let alive = true;
        getAllCha().then((result) => {
            if (!alive) return;
            const record = (result?.body || []).find((item) => String(item.id) === String(id));
            if (record) {
                form.load(toChaData(record));
                setStatus("ready");
            } else {
                setStatus("missing");
                toast.error("CHA not found.");
            }
        });
        return () => { alive = false; };
    }, [id]);

    const save = form.submit(async (data) => {
        const result = await updateCha({ ...trimAll(data), id }, token);
        if (result?.status === 200) {
            toast.success(result.message || "CHA updated.");
            form.markSaved();
            navigate("/view-cha");
        } else {
            toast.error(result?.message || "Could not update the CHA.");
        }
    });

    useShortcuts({
        s: (e) => status === "ready" && save(e),
        i: () => navigate("/view-cha"),
    });

    if (status === "loading") return <CustomLoader />;

    return (
        <>
            <PageTitle>Edit CHA</PageTitle>
            <div className='flex flex-col gap-1'>
                <ActionArea>
                    <div onClick={() => navigate(-1)}>
                        <CustomButton title={"Back"} color={"slate"}><AiOutlineRollback /></CustomButton>
                    </div>
                    {status === "ready" && (
                        <CustomButton type="submit" form="cha-form" title={form.saving ? "Saving..." : "Save (Ctrl+S)"} color={"blue"} disabled={form.saving || !form.dirty}>
                            <AiOutlineSave />
                        </CustomButton>
                    )}
                    <Link to="/view-cha">
                        <CustomButton title={"View (Ctrl+I)"} color={"slate"}><AiOutlineTable /></CustomButton>
                    </Link>
                </ActionArea>

                {status === "missing" ? (
                    <MainArea>
                        <div className="w-full p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                            This CHA could not be found. It may have been deleted.
                        </div>
                    </MainArea>
                ) : (
                    <form id="cha-form" onSubmit={save} onKeyDown={focusNextOnEnter} noValidate autoComplete="off">
                        <ChaForm form={form} />
                    </form>
                )}
            </div>
        </>
    )
}

export default ChaEdit;
