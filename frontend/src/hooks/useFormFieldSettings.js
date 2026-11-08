import { useEffect } from "react";
import useFieldSettingStore from "../store/FieldSettingStore";

/**
 * Field visibility for the invoice / challan forms (e.g. whether to show CHA).
 * Re-reads the saved value whenever a page using it opens.
 */
const useFormFieldSettings = () => {
    const showCha = useFieldSettingStore((state) => state.showCha);
    const fetchFieldSettings = useFieldSettingStore((state) => state.fetchFieldSettings);

    useEffect(() => {
        fetchFieldSettings();
    }, [fetchFieldSettings]);

    return { showCha };
};

export default useFormFieldSettings;
