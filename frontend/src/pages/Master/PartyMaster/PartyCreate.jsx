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

// Store / hooks...
import useAuthStore from '../../../store/AuthStore';
import usePartyStore from '../../../store/PartyStore';
import useShortcuts from "../../../hooks/useShortcuts";
import useForm from "../../../hooks/useForm";
import { errorMessage } from '../../../utils/format';

const PartyCreate = () => {
    const { token } = useAuthStore();
    const { createParty, getAllParty, parties } = usePartyStore();
    const [searchParams] = useSearchParams();
    const back = searchParams.get("back");
    const navigate = useNavigate();

    // Existing parties, to stop the same GSTIN being entered twice.
    useEffect(() => { getAllParty(); }, []);
    const duplicateOf = (d) => (parties?.body || []).find((p) => p.gst && p.gst.toUpperCase() === d.gst)?.company_name || "";

    const form = useForm(EMPTY_BUSINESS, businessValidator({ nameLabel: "Party name", duplicateOf }));

    const save = form.submit(async (data) => {
        try {
            const result = await createParty({ data, token });
            if (result?.status === 200) {
                toast.success(result.message || "Party created.");
                form.load(EMPTY_BUSINESS);
                getAllParty();
                setTimeout(() => document.getElementById("f-company_name")?.focus(), 0);
            } else {
                toast.error(result?.message || "Could not create the party.");
            }
        } catch (error) {
            toast.error(errorMessage(error, "Could not create the party."));
        }
    });

    useShortcuts({
        s: (e) => save(e),
        i: () => navigate("/party"),
    });

    return (
        <>
            <PageTitle>Add New Party</PageTitle>
            <div className='flex flex-col gap-1'>
                <ActionArea>
                    {back && (
                        <div onClick={() => navigate(-1)}>
                            <CustomButton title={"Back"} color={"slate"}><AiOutlineRollback /></CustomButton>
                        </div>
                    )}
                    <CustomButton type="submit" form="party-form" title={form.saving ? "Saving..." : "Save (Ctrl+S)"} color={"blue"} disabled={form.saving}>
                        <AiOutlineSave />
                    </CustomButton>
                    <Link to="/party">
                        <CustomButton title={"View (Ctrl+I)"} color={"slate"}><AiOutlineTable /></CustomButton>
                    </Link>
                </ActionArea>

                <form id="party-form" onSubmit={save} onKeyDown={focusNextOnEnter} noValidate autoComplete="off">
                    <BusinessForm form={form} nameLabel="Party name" autoFocus />
                </form>
            </div>
        </>
    )
}

export default PartyCreate
