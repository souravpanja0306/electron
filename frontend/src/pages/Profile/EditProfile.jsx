import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AiOutlineSave, AiOutlineRollback, AiOutlineLock } from "react-icons/ai";

// Components...
import PageTitle from '../../components/PageTitle';
import ActionArea from '../../components/ActionArea';
import CustomButton from '../../components/CustomButton';
import CustomLoader from '../../components/CustomLoader';
import BusinessForm, { EMPTY_BUSINESS, businessValidator } from '../../components/BusinessForm';
import { StackedField, focusNextOnEnter, inputCls, readOnlyCls } from '../../components/FormKit';

// Store / hooks...
import useAuthStore from '../../store/AuthStore';
import useShortcuts from "../../hooks/useShortcuts";
import useForm from "../../hooks/useForm";

// The shared business form calls the name `company_name`; the users table calls it `name`.
const fromProfile = (p = {}) => ({
    ...Object.fromEntries(Object.keys(EMPTY_BUSINESS).map((key) => [key, p?.[key] ?? EMPTY_BUSINESS[key]])),
    company_name: p?.name ?? "",
    country: p?.country || "INDIA",
});

const toProfile = ({ company_name, owner, ...rest }) => ({ ...rest, name: company_name.trim() });

const EditProfile = () => {
    const navigate = useNavigate();
    const { profileData, getProfileData, updateProfileData } = useAuthStore();
    const [ready, setReady] = useState(Boolean(profileData));
    const form = useForm(fromProfile(profileData), businessValidator({ nameLabel: "Full name" }));

    // Always edit the latest copy from the server.
    useEffect(() => {
        let alive = true;
        getProfileData().then((result) => {
            if (!alive) return;
            if (result?.status === 200) form.load(fromProfile(result.body));
            else toast.error(result?.message || "Could not load your profile.");
            setReady(true);
        });
        return () => { alive = false; };
    }, []);

    const save = form.submit(async (data) => {
        const result = await updateProfileData(toProfile(data));
        if (result?.status === 200) {
            toast.success("Profile updated.");
            form.markSaved();
            navigate('/profile');
        } else {
            toast.error(result?.message || "Failed to update profile");
        }
    });

    useShortcuts({
        s: (e) => ready && save(e),
        i: () => navigate("/profile"),
    });

    if (!ready) return <CustomLoader />;

    return (
        <>
            <PageTitle>Edit Profile</PageTitle>
            <div className='flex flex-col gap-1'>
                <ActionArea>
                    <div onClick={() => navigate(-1)}>
                        <CustomButton title={"Back"} color={"slate"}><AiOutlineRollback /></CustomButton>
                    </div>
                    <CustomButton type="submit" form="profile-form" title={form.saving ? "Saving..." : "Save (Ctrl+S)"} color={"blue"} disabled={form.saving || !form.dirty}>
                        <AiOutlineSave />
                    </CustomButton>
                    <Link to="/change-password">
                        <CustomButton title={"Change password"} color={"slate"}><AiOutlineLock /></CustomButton>
                    </Link>
                </ActionArea>

                <form id="profile-form" onSubmit={save} onKeyDown={focusNextOnEnter} noValidate autoComplete="off">
                    <BusinessForm
                        form={form}
                        nameLabel="Full name"
                        hideOwner
                        autoFocus
                        basicTitle="Personal details"
                        basicDescription="Your name and how customers can reach you."
                        basicExtra={
                            <StackedField label="Username" htmlFor="f-username" hint="Used to sign in. It can't be changed.">
                                <input id="f-username" value={profileData?.username ? `@${profileData.username}` : ""} readOnly tabIndex={-1} className={`${inputCls} ${readOnlyCls}`} />
                            </StackedField>
                        }
                    />
                </form>
            </div>
        </>
    );
};

export default EditProfile;
