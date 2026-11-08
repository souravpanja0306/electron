import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from "react-router-dom";
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
import usePartyStore from '../../../store/PartyStore';
import useAuthStore from '../../../store/AuthStore';
import useShortcuts from "../../../hooks/useShortcuts";
import useForm from "../../../hooks/useForm";
import { errorMessage } from '../../../utils/format';

const PartyEdit = () => {
    const { token } = useAuthStore();
    const { getPartyById, updateParty, getAllParty, parties } = usePartyStore();
    const { id } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState("loading"); // loading | ready | missing

    const duplicateOf = (d) =>
        (parties?.body || []).find((p) => String(p.id) !== String(id) && p.gst && p.gst.toUpperCase() === d.gst)?.company_name || "";
    const form = useForm(EMPTY_BUSINESS, businessValidator({ nameLabel: "Party name", duplicateOf }));

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const result = await getPartyById(id, token);
                if (!alive) return;
                if (result?.status === 200 && result.body?.length) {
                    form.load(toBusinessData(result.body[0]));
                    setStatus("ready");
                } else {
                    setStatus("missing");
                    toast.error(result?.message || "Party not found.");
                }
            } catch (error) {
                if (alive) {
                    setStatus("missing");
                    toast.error(errorMessage(error, "Could not load the party."));
                }
            }
        })();
        if (!parties?.body?.length) getAllParty();
        return () => { alive = false; };
    }, [id]);

    const save = form.submit(async (data) => {
        try {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => formData.append(key, value ?? ""));
            const result = await updateParty(id, formData, token);
            if (result?.status === 200) {
                toast.success(result.message || "Party updated.");
                form.markSaved();
                navigate("/party");
            } else {
                toast.error(result?.message || "Could not update the party.");
            }
        } catch (error) {
            toast.error(errorMessage(error, "Could not update the party."));
        }
    });

    useShortcuts({
        s: (e) => status === "ready" && save(e),
        i: () => navigate("/party"),
    });

    if (status === "loading") return <CustomLoader />;

    return (
        <>
            <PageTitle>Edit Party</PageTitle>
            <div className='flex flex-col gap-1'>
                <ActionArea>
                    <div onClick={() => navigate(-1)}>
                        <CustomButton title={"Back"} color={"slate"}><AiOutlineRollback /></CustomButton>
                    </div>
                    {status === "ready" && (
                        <CustomButton type="submit" form="party-form" title={form.saving ? "Saving..." : "Save (Ctrl+S)"} color={"blue"} disabled={form.saving || !form.dirty}>
                            <AiOutlineSave />
                        </CustomButton>
                    )}
                    <Link to="/party">
                        <CustomButton title={"View (Ctrl+I)"} color={"slate"}><AiOutlineTable /></CustomButton>
                    </Link>
                </ActionArea>

                {status === "missing" ? (
                    <MainArea>
                        <div className="w-full p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                            This party could not be found. It may have been deleted.
                        </div>
                    </MainArea>
                ) : (
                    <form id="party-form" onSubmit={save} onKeyDown={focusNextOnEnter} noValidate autoComplete="off">
                        <BusinessForm form={form} nameLabel="Party name" />
                    </form>
                )}
            </div>
        </>
    )
}

export default PartyEdit
