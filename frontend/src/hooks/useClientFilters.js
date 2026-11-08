import { useCallback, useState } from "react";

/**
 * Filter state for list pages that already hold every row in memory (master data, reports).
 *
 * - `initial` lists every filter key with its "All" value (""), e.g. { search: "", status: "" }.
 * - `predicate(row, filters)` decides whether a row is shown.
 * - Changing any filter jumps back to page 1.
 *
 * Returns the same `filters` / `onFilterChange` shape as `useListFilters`, so the
 * FilterSidebar works with either.
 */
const useClientFilters = (rows, initial, predicate) => {
    const [filters, setFilters] = useState(initial);
    const [page, setPage] = useState(1);

    const onFilterChange = useCallback((e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
        setPage(1);
    }, []);

    const filtered = (Array.isArray(rows) ? rows : []).filter((row) => predicate(row, filters));

    return { filters, onFilterChange, filtered, page, setPage };
};

export default useClientFilters;
