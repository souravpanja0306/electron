import { useState, useEffect } from "react";

// Store...
import usePartyStore from "../store/PartyStore";

export const usePartyHook = (options = {}) => {
    const { parties, getAllParty, createParty, deleteParty } = usePartyStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handlePartySubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData(e.currentTarget);
            const payload = Object.fromEntries(formData.entries());

            const finalPayload = {
                company_name: payload.company_name || "",
                owner: payload.owner || "",
                mobile: payload.mobile || "",
                email: payload.email || "",
                country: payload.country || "INDIA",
            };

            setLoading(true);
            setError(null);

            const response = await createParty({ data: finalPayload });

            if (parseInt(response.status) === 200) {
                await getAllParty();
                e.target.reset();

                if (options?.onSuccess) {
                    options.onSuccess(response);
                };
            };
        } catch (err) {
            const msg =
                err.response?.data?.message || err.message || "Submission failed";
            setError(msg);

            if (options?.onError) {
                options.onError(msg);
            }
        } finally {
            setLoading(false);
        };
    };
    const handleDeleteParty = async (id) => {
        if (!id) return;
        if (window.confirm("Are you sure you want to delete this record? This cannot be undone.")) {
            try {
                setLoading(true);
                setError(null);

                const response = await deleteParty(id);
                await getAllParty();
                if (options?.onSuccess) {
                    options.onSuccess(response);
                };
                return response;
            } catch (err) {
                const msg =
                    err.response?.data?.message || err.message || "Deletion failed";
                setError(msg);
                if (options?.onError) {
                    options.onError(msg);
                };
            } finally {
                setLoading(false);
            };
        };
    };
    const getParty = async ({
        user_id = "",
    }) => {
        let search_key = {};
        if (user_id) search_key.user_id = user_id;

        getAllParty(search_key);
    };

    useEffect(() => {
        getAllParty();
    }, []);

    return { handlePartySubmit, handleDeleteParty, getParty, parties, loading, error };
};