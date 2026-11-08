import { useCallback, useEffect, useRef, useState } from "react";
import { useBlocker } from "react-router-dom";
import { toast } from "sonner";

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Form state for master-data pages.
 *
 * - `validateFn(data)` returns { field: message }. Errors show for a field once it has
 *   been blurred (`touch(name)`), and for every field after the first submit attempt.
 * - `submit(onValid)` returns a handler: blocks while a save is running, validates,
 *   focuses the first invalid field (`#f-<name>`), then awaits `onValid(data)`.
 * - Leaving the page with unsaved edits asks for confirmation. Call `markSaved()`
 *   before navigating away after a successful save.
 */
const useForm = (initial, validateFn) => {
    const [data, setData] = useState(initial);
    const [touched, setTouched] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [saving, setSaving] = useState(false);
    const savingRef = useRef(false);
    const baselineRef = useRef(initial);

    const allErrors = validateFn ? validateFn(data) : {};
    const errors = submitted
        ? allErrors
        : Object.fromEntries(Object.entries(allErrors).filter(([key]) => touched[key]));

    const dirty = !same(data, baselineRef.current);
    const dirtyRef = useRef(dirty);
    dirtyRef.current = dirty;

    /** Merge a patch (object, or function of the previous data) into the form. */
    const set = useCallback((patch) => {
        setData((prev) => ({ ...prev, ...(typeof patch === "function" ? patch(prev) : patch) }));
    }, []);

    const touch = useCallback((name) => {
        setTouched((prev) => (prev[name] ? prev : { ...prev, [name]: true }));
    }, []);

    /** Replace the data and treat it as the saved state (after loading a record, or after a save). */
    const load = useCallback((next) => {
        baselineRef.current = next;
        dirtyRef.current = false;
        setData(next);
        setTouched({});
        setSubmitted(false);
    }, []);

    /** Throw away edits and go back to the last loaded/saved data. */
    const reset = useCallback(() => {
        dirtyRef.current = false;
        setData(baselineRef.current);
        setTouched({});
        setSubmitted(false);
    }, []);

    const markSaved = useCallback(() => {
        dirtyRef.current = false;
        setData((current) => {
            baselineRef.current = current;
            return current;
        });
    }, []);

    const submit = (onValid) => async (e) => {
        e?.preventDefault?.();
        if (savingRef.current) return;
        setSubmitted(true);

        const found = validateFn ? validateFn(data) : {};
        const first = Object.keys(found)[0];
        if (first) {
            toast.error(found[first]);
            document.getElementById(`f-${first}`)?.focus();
            return;
        }

        savingRef.current = true;
        setSaving(true);
        try {
            await onValid(data);
        } finally {
            savingRef.current = false;
            setSaving(false);
        }
    };

    // Unsaved-changes guard for in-app navigation. (No `beforeunload`: in Electron it would
    // silently cancel the window's close button instead of asking.)
    const blocker = useBlocker(
        useCallback(({ currentLocation, nextLocation }) =>
            dirtyRef.current && currentLocation.pathname !== nextLocation.pathname, [])
    );
    useEffect(() => {
        if (blocker.state !== "blocked") return;
        if (window.confirm("You have unsaved changes. Leave this page and discard them?")) blocker.proceed();
        else blocker.reset();
    }, [blocker]);

    return { data, set, errors, touch, submit, saving, dirty, load, reset, markSaved };
};

export default useForm;
