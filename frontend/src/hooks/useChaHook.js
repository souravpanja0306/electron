import { useState } from "react";

// Store...
import useChaStore from "../store/ChaStore";

export const useChaHook = (options = {}) => {
    const { chaData, getAllCha, createCha } = useChaStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChaSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData(e.currentTarget);
            const payload = Object.fromEntries(formData.entries());

            const finalPayload = {
                name: payload.cha_name || "",
                mobile: payload.cha_mobile || "",
                address: payload.cha_address || "",
            };

            setLoading(true);
            setError(null);

            const response = await createCha({ data: finalPayload });

            if (parseInt(response.status) === 200) {
                await getAllCha();
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

    const getCha = async () => {
        try {
            await getAllCha();
        } catch (error) {
            console.log("Error fetching CHAs:", error.message || error);
        };
    };

    return { handleChaSubmit, getCha, chaData, loading, error };
};