import { useState } from "react";
import { toast } from "sonner";

import useHsnSacStore from "../store/HsnSacStore";
import { errorMessage } from "../utils/format";

/**
 * State + submit handler for <HsnQuickAddModal>: adds a code to the HSN/SAC
 * master without leaving the page, then refreshes the dropdown list.
 *
 *   const hsnAdd = useHsnQuickAdd({ token });
 *   <button onClick={hsnAdd.open} />
 *   <HsnQuickAddModal {...hsnAdd.modalProps} />
 */
const useHsnQuickAdd = ({ token, onCreated } = {}) => {
    const { getAllHsnSac, createHsnSac } = useHsnSacStore();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const open = () => {
        setError("");
        setIsOpen(true);
    };

    const close = () => setIsOpen(false);

    const onSubmit = async (event) => {
        event.preventDefault();
        event.stopPropagation(); // the modal sits inside the page; never submit the invoice form
        const form = Object.fromEntries(new FormData(event.currentTarget).entries());
        const payload = {
            type: form.hsn_type || "HSN",
            code: String(form.hsn_code || "").trim(),
            gst_rate: parseFloat(form.hsn_gst_rate) || 0,
            description: String(form.hsn_description || "").trim(),
        };
        if (!payload.code) return setError("Code is required.");

        setLoading(true);
        setError("");
        try {
            const result = await createHsnSac(payload, token);
            if (Number(result.status) !== 200) throw new Error(result.message || "Unable to add HSN/SAC.");
            await getAllHsnSac(token);
            if (onCreated) onCreated(payload);
            setIsOpen(false);
            toast.success(`${payload.type} ${payload.code} added.`);
        } catch (err) {
            setError(errorMessage(err, "Unable to add HSN/SAC."));
        } finally {
            setLoading(false);
        }
    };

    return { open, isOpen, modalProps: { isOpen, onClose: close, onSubmit, loading, error } };
};

export default useHsnQuickAdd;
