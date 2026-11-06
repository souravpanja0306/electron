import { useEffect, useRef, useState } from "react";

export const EMPTY_FILTERS = { startDate: "", endDate: "", search: "" };

const sameFilters = (a, b) =>
    a.startDate === b.startDate && a.endDate === b.endDate && a.search === b.search;

/**
 * Search / date-range filters for a list page.
 *
 * - Typing in search is debounced (300 ms) before `load(filters)` runs.
 * - `load` is read through a ref, so it always sees the page's latest state.
 * - `reload()` re-runs the current query (after a delete, say); `reset()` clears
 *   every filter and loads once.
 */
const useListFilters = (load) => {
    const loadRef = useRef(load);
    loadRef.current = load;

    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [applied, setApplied] = useState(EMPTY_FILTERS);
    const [page, setPage] = useState(1);

    useEffect(() => {
        const timer = setTimeout(() => {
            setApplied((prev) => (sameFilters(prev, filters) ? prev : filters));
        }, 300);
        return () => clearTimeout(timer);
    }, [filters]);

    useEffect(() => {
        setPage(1);
        loadRef.current(applied);
    }, [applied]);

    const onFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const reload = () => loadRef.current(applied);

    const reset = () => {
        const cleared = { ...EMPTY_FILTERS };
        setFilters(cleared);
        // A fresh object always triggers the load effect, even if nothing was filtered.
        setApplied(cleared);
    };

    return { filters, onFilterChange, page, setPage, reload, reset };
};

export default useListFilters;
