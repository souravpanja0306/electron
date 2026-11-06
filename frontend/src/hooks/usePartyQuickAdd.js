import { useState } from "react";
import { toast } from "sonner";

import usePartyStore from "../store/PartyStore";
import { errorMessage } from "../utils/format";

/**
 * State + submit handler for <PartyQuickAddModal>.
 *
 *   const partyAdd = usePartyQuickAdd({ token, onCreated: (id, field) => select(field, id) });
 *   <AddButton onClick={() => partyAdd.open("billTo")} />
 *   <PartyQuickAddModal {...partyAdd.modalProps} />
 *
 * `field` is whatever was passed to open(); the new party's id is handed back
 * so the page can select it in that field.
 */
const usePartyQuickAdd = ({ token, onCreated } = {}) => {
    const { getAllParty, createParty } = usePartyStore();
    const [isOpen, setIsOpen] = useState(false);
    const [field, setField] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const open = (target = null) => {
        setField(target);
        setError("");
        setIsOpen(true);
    };

    const close = () => setIsOpen(false);

    const onSubmit = async (event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(event.currentTarget).entries());
        setLoading(true);
        setError("");
        try {
            const result = await createParty({ data, token });
            if (Number(result.status) !== 200) throw new Error(result.message || "Unable to create party.");
            await getAllParty(token);
            const newId = result.body?.lastInsertRowid;
            if (newId && onCreated) onCreated(String(newId), field);
            setIsOpen(false);
            toast.success("Party created successfully.");
        } catch (err) {
            setError(errorMessage(err, "Unable to create party."));
        } finally {
            setLoading(false);
        }
    };

    return { open, isOpen, modalProps: { isOpen, onClose: close, onSubmit, loading, error } };
};

export default usePartyQuickAdd;
