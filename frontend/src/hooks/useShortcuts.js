import { useEffect, useRef } from "react";

/**
 * Registers Ctrl (or Cmd) + <key> keyboard shortcuts for a page.
 *
 * Usage:
 *   useShortcuts({
 *     s: () => handleSubmit(),
 *     i: () => navigate("/view-x"),
 *   });
 *
 * - Handlers are read through a ref, so they always see the latest state/props
 *   (no stale closures, no need to maintain a dependency array per page).
 * - Keys are matched case-insensitively (works with Caps Lock) and fall back to
 *   `event.code`, so non-English keyboard layouts still work.
 * - The browser/Electron default (save page, print, bookmark, ...) is always
 *   suppressed for registered keys, even when the handler decides to do nothing.
 * - Holding the keys down does not re-fire the handler.
 * - Shift / Alt combinations are ignored so they never clash with Ctrl+Shift+I
 *   (DevTools) and similar system shortcuts.
 */
const useShortcuts = (shortcuts, enabled = true) => {
    const ref = useRef(shortcuts);
    ref.current = shortcuts;

    useEffect(() => {
        if (!enabled) return;

        const onKeyDown = (e) => {
            if (!(e.ctrlKey || e.metaKey) || e.shiftKey || e.altKey) return;

            const fromKey = typeof e.key === "string" ? e.key.toLowerCase() : "";
            const fromCode = e.code && e.code.startsWith("Key") ? e.code.slice(3).toLowerCase() : "";

            const map = ref.current || {};
            const key = [fromKey, fromCode].find((k) => k && typeof map[k] === "function");
            if (!key) return;

            e.preventDefault();
            e.stopPropagation();
            if (e.repeat) return;

            try {
                const result = map[key](e);
                if (result && typeof result.catch === "function") result.catch(console.error);
            } catch (error) {
                console.error(error);
            }
        };

        window.addEventListener("keydown", onKeyDown, true);
        return () => window.removeEventListener("keydown", onKeyDown, true);
    }, [enabled]);
};

export default useShortcuts;
