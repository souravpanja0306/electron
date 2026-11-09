import { create } from "zustand";

// The document currently shown in the print preview (one at a time, app-wide).
// Any page opens it through `openPrintWindow(html)` in utils/format.js.
const usePrintStore = create((set) => ({
    html: "",
    title: "",
    openPreview: (html, title = "") => set({ html: String(html || ""), title }),
    closePreview: () => set({ html: "", title: "" }),
}));

export default usePrintStore;
