import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AiOutlinePrinter, AiOutlineFilePdf, AiOutlineClose, AiOutlineZoomIn, AiOutlineZoomOut, AiOutlineLoading3Quarters } from "react-icons/ai";

import usePrintStore from "../store/PrintStore";

// Scripts never run in a preview, and the document's own "Print" button is replaced by the toolbar.
const prepareHtml = (html) => {
    const clean = String(html || "").replace(/<script[\s\S]*?<\/script>/gi, "");
    const style = "<style>.print-btn{display:none!important}</style>";
    return /<\/head>/i.test(clean) ? clean.replace(/<\/head>/i, `${style}</head>`) : style + clean;
};

const titleOf = (html) => {
    const m = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html || "");
    return m ? m[1].replace(/\s+/g, " ").trim() : "";
};

// Wait for web fonts so the print never falls back to a system font (capped, in case the font host is offline).
const fontsReady = (doc) => Promise.race([
    doc?.fonts?.ready || Promise.resolve(),
    new Promise((resolve) => setTimeout(resolve, 2500)),
]);

const ZOOMS = [50, 67, 75, 90, 100, 110, 125, 150];

const ToolButton = ({ onClick, title, disabled, primary, children }) => (
    <button
        type="button"
        onClick={onClick}
        title={title}
        disabled={disabled}
        className={`h-8 px-3 rounded-md flex items-center gap-1.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${primary
            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-600/30"
            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"}`}
    >
        {children}
    </button>
);

/**
 * App-wide print preview. Shows the document, then opens the printer dialog straight away.
 * In Electron the document is printed from a hidden window (native dialog, exact page output);
 * in a plain browser it falls back to printing the preview frame.
 */
const PrintPreview = () => {
    const { html, title, closePreview } = usePrintStore();
    const frameRef = useRef(null);
    const autoPrinted = useRef(false);
    const [loaded, setLoaded] = useState(false);
    const [busy, setBusy] = useState("");
    const [zoom, setZoom] = useState(100);
    const [frameHeight, setFrameHeight] = useState(0);

    const srcDoc = useMemo(() => (html ? prepareHtml(html) : ""), [html]);
    const docTitle = title || titleOf(html) || "Document";
    const canSavePdf = typeof window.api?.savePdf === "function";

    // Fresh state for every new document.
    useEffect(() => {
        autoPrinted.current = false;
        setLoaded(false);
        setBusy("");
        setFrameHeight(0);
    }, [html]);

    const print = useCallback(async () => {
        if (!srcDoc || busy) return;
        setBusy("print");
        try {
            if (typeof window.api?.printHtml === "function") {
                const result = await window.api.printHtml(srcDoc);
                if (!result?.ok && result?.error && !/cancel/i.test(result.error)) toast.error(`Print failed: ${result.error}`);
            } else {
                const win = frameRef.current?.contentWindow;
                if (!win) return;
                await fontsReady(win.document);
                win.focus();
                win.print();
            }
        } catch (error) {
            console.error(error);
            toast.error("Could not open the printer dialog.");
        } finally {
            setBusy("");
        }
    }, [srcDoc, busy]);

    const savePdf = useCallback(async () => {
        if (!srcDoc || busy || !canSavePdf) return;
        setBusy("pdf");
        try {
            const name = docTitle.replace(/[^\w\- ]+/g, " ").replace(/\s+/g, "_").replace(/^_+|_+$/g, "") || "document";
            const result = await window.api.savePdf(srcDoc, `${name}.pdf`);
            if (result?.ok) toast.success("PDF saved.");
            else if (result?.error) toast.error(`Could not save PDF: ${result.error}`);
        } catch (error) {
            console.error(error);
            toast.error("Could not save the PDF.");
        } finally {
            setBusy("");
        }
    }, [srcDoc, busy, canSavePdf, docTitle]);

    // Grow the frame to the document so the preview scrolls as one page, like paper.
    const measure = () => {
        const doc = frameRef.current?.contentDocument;
        if (doc?.documentElement) setFrameHeight(doc.documentElement.scrollHeight);
    };

    const onFrameLoad = async () => {
        measure();
        setLoaded(true);
        await fontsReady(frameRef.current?.contentDocument);
        measure();
        if (autoPrinted.current) return;
        autoPrinted.current = true;
        print();
    };

    const zoomBy = (step) => setZoom((z) => {
        const i = ZOOMS.indexOf(z);
        return ZOOMS[Math.min(ZOOMS.length - 1, Math.max(0, (i < 0 ? 4 : i) + step))];
    });

    // Esc closes, Ctrl+P prints. Also listens inside the frame, which keeps its own key events.
    useEffect(() => {
        if (!html) return;
        const onKey = (e) => {
            if (e.key === "Escape") { e.preventDefault(); closePreview(); return; }
            if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && (e.key?.toLowerCase() === "p" || e.code === "KeyP")) {
                e.preventDefault();
                e.stopPropagation();
                if (!e.repeat) print();
            }
        };
        window.addEventListener("keydown", onKey, true);
        const frameWin = loaded ? frameRef.current?.contentWindow : null;
        frameWin?.addEventListener("keydown", onKey, true);
        return () => {
            window.removeEventListener("keydown", onKey, true);
            frameWin?.removeEventListener("keydown", onKey, true);
        };
    }, [html, loaded, print, closePreview]);

    if (!html) return null;

    return (
        <div className="fixed inset-0 z-[1100] flex flex-col bg-slate-950/60 backdrop-blur-[1px] p-3 select-none" role="dialog" aria-modal="true" aria-label={`Print preview: ${docTitle}`}>
            <div className="flex flex-col flex-1 min-h-0 w-full max-w-6xl mx-auto rounded-lg overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl shadow-slate-950/30">
                {/* Toolbar */}
                <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="w-8 h-8 shrink-0 rounded-md flex items-center justify-center bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-300">
                        <AiOutlinePrinter size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{docTitle}</h2>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {busy === "print" ? "Opening printer…" : busy === "pdf" ? "Preparing PDF…" : loaded ? "Print preview" : "Loading preview…"}
                        </p>
                    </div>

                    <div className="flex items-center gap-0.5 mr-1 rounded-md border border-slate-200 dark:border-slate-700 px-0.5">
                        <ToolButton onClick={() => zoomBy(-1)} title="Zoom out" disabled={zoom === ZOOMS[0]}><AiOutlineZoomOut size={14} /></ToolButton>
                        <button type="button" onClick={() => setZoom(100)} title="Reset zoom" className="w-12 text-center text-xs font-semibold tabular-nums text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">{zoom}%</button>
                        <ToolButton onClick={() => zoomBy(1)} title="Zoom in" disabled={zoom === ZOOMS[ZOOMS.length - 1]}><AiOutlineZoomIn size={14} /></ToolButton>
                    </div>

                    {canSavePdf && (
                        <ToolButton onClick={savePdf} title="Save as PDF" disabled={!loaded || !!busy}>
                            {busy === "pdf" ? <AiOutlineLoading3Quarters size={14} className="animate-spin" /> : <AiOutlineFilePdf size={14} />}
                            Save PDF
                        </ToolButton>
                    )}
                    <ToolButton onClick={print} title="Print (Ctrl+P)" disabled={!loaded || !!busy} primary>
                        {busy === "print" ? <AiOutlineLoading3Quarters size={14} className="animate-spin" /> : <AiOutlinePrinter size={14} />}
                        Print
                    </ToolButton>
                    <ToolButton onClick={closePreview} title="Close (Esc)"><AiOutlineClose size={14} /></ToolButton>
                </div>

                {/* Page */}
                <div className="relative flex-1 min-h-0 overflow-auto bg-slate-200 dark:bg-slate-900 p-4">
                    {!loaded && (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-500 dark:text-slate-400">
                            <AiOutlineLoading3Quarters size={22} className="animate-spin" />
                        </div>
                    )}
                    {/* A4 width; CSS zoom (not transform) so scrolling follows the zoomed size. */}
                    <div className="mx-auto bg-white shadow-lg shadow-slate-950/20" style={{ width: "210mm", zoom: zoom / 100 }}>
                        <iframe
                            ref={frameRef}
                            title={`Print preview: ${docTitle}`}
                            srcDoc={srcDoc}
                            onLoad={onFrameLoad}
                            className="block w-full bg-white border-0"
                            style={{ height: frameHeight ? `${frameHeight}px` : "297mm" }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrintPreview;
