import { useEffect, useState } from "react";
import { toast } from "sonner";

const MAX_BYTES = 2 * 1024 * 1024;
const TYPES = ["image/png", "image/jpeg", "image/webp"];

/**
 * Logo file selection for the company form: type/size checks, object-URL preview
 * (revoked when replaced), and "remove" to go back to the saved logo.
 */
const useLogoPicker = (savedUrl = "") => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(savedUrl);

    useEffect(() => { if (!file) setPreview(savedUrl); }, [savedUrl, file]);

    // Free the previous object URL whenever the preview changes.
    useEffect(() => () => {
        if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    }, [preview]);

    const onFile = (next) => {
        if (!TYPES.includes(next.type)) return toast.error("Logo must be a PNG, JPG or WebP image.");
        if (next.size > MAX_BYTES) return toast.error("Logo must be 2 MB or smaller.");
        setFile(next);
        setPreview(URL.createObjectURL(next));
    };

    // Only a newly picked (unsaved) file can be removed; the saved logo stays.
    const onRemove = file ? () => { setFile(null); setPreview(savedUrl); } : undefined;

    const clear = () => { setFile(null); setPreview(savedUrl); };

    return { file, clear, props: { preview, fileName: file?.name, onFile, onRemove } };
};

export default useLogoPicker;
