import { useEffect, useState } from "react";
import { toast } from 'sonner';
import { Link, useNavigate } from "react-router-dom";

// Icon...
import { AiOutlineFileAdd, AiOutlineSync, AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";

// Components...
import PageTitle from '../../../components/PageTitle';
import ActionArea from '../../../components/ActionArea';
import CustomButton from '../../../components/CustomButton';
import {
    FilterSidebar, FilterToggleButton, FilterSection, ChipGroup, useFilterPanel,
    ListTable, Pagination, Badge, paginate, rowCls, thCls, matchText,
} from '../../../components/ListKit';

// Stores...
import useAuthStore from '../../../store/AuthStore';
import useHsnSacStore from "../../../store/HsnSacStore";
import useShortcuts from "../../../hooks/useShortcuts";
import useClientFilters from "../../../hooks/useClientFilters";

const TYPE_OPTIONS = [
    { value: "HSN", label: "HSN (Goods)" },
    { value: "SAC", label: "SAC (Services)" },
];

const STATUS_OPTIONS = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
];

const ViewHsnSac = () => {
    const { token } = useAuthStore();
    const { hsnData, getAllHsnSac, deleteHsnSac, loading } = useHsnSacStore();
    const navigate = useNavigate();
    const [checkedIds, setCheckedIds] = useState(null);

    const panel = useFilterPanel();
    const { filters, onFilterChange, filtered, page, setPage } = useClientFilters(
        hsnData,
        { search: "", type: "", status: "" },
        (item, f) =>
            matchText(f.search, item.code, item.description) &&
            (!f.type || String(item.type || "").toUpperCase() === f.type) &&
            (!f.status || (f.status === "active" ? Boolean(item.is_active) : !item.is_active))
    );
    const paging = paginate(filtered, page);
    const clear = (name) => () => onFilterChange({ target: { name, value: "" } });

    useEffect(() => {
        getAllHsnSac(token);
    }, []);

    const toggleChecked = (id) => setCheckedIds(prev => (prev === id ? null : id));

    const handleDelete = async () => {
        if (!checkedIds) return toast.error("Please select a record to delete.");
        if (window.confirm("Are you sure you want to delete this record?")) {
            try {
                const res = await deleteHsnSac(checkedIds, token);
                if (res.status === 200) {
                    toast.success(res.message);
                    getAllHsnSac(token);
                    setCheckedIds(null);
                } else {
                    toast.error(res.message);
                }
            } catch (error) {
                toast.error("Failed to delete record.");
            }
        }
    };

    const handleRefresh = () => {
        getAllHsnSac(token);
        toast.info("Data refreshed.");
    };

    useShortcuts({
        f: () => panel.openAndFocus(),
        n: () => navigate("/create-hsn-sac"),
        d: () => handleDelete(),
        e: () => {
            if (!checkedIds) return toast.error("Please select a record to edit.");
            navigate(`/create-hsn-sac?id=${checkedIds}`);
        },
    });

    return (
        <>
            <PageTitle>View All HSN/SAC Code</PageTitle>
            <div className="flex items-start gap-2">
                <div className='flex flex-col gap-1 flex-1 min-w-0'>
                    <ActionArea>
                        <div className="flex flex-wrap items-center justify-between w-full gap-2">
                            <div className="flex flex-wrap gap-1">
                                <Link to="/create-hsn-sac">
                                    <CustomButton title={"New (Ctrl+N)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
                                </Link>
                                {checkedIds && (
                                    <div onClick={() => navigate(`/create-hsn-sac?id=${checkedIds}`)}>
                                        <CustomButton title={"Edit (Ctrl+E)"} color={"blue"}><AiOutlineEdit /></CustomButton>
                                    </div>
                                )}
                                {checkedIds && (
                                    <div onClick={handleDelete}>
                                        <CustomButton title={"Delete (Ctrl+D)"} color={"red"}><AiOutlineDelete /></CustomButton>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                <div onClick={handleRefresh}>
                                    <CustomButton title={"Refresh"} color={"slate"}><AiOutlineSync /></CustomButton>
                                </div>
                                <FilterToggleButton panel={panel} filters={filters} />
                            </div>
                        </div>
                    </ActionArea>

                    <ListTable
                        minWidth="min-w-[720px]"
                        colSpan={6}
                        loading={loading}
                        isEmpty={!paging.pageRows.length}
                        emptyText={hsnData?.length ? "No codes match these filters." : "No HSN/SAC codes found."}
                        head={<>
                            <th className={`${thCls} text-center w-12`}>Select</th>
                            <th className={`${thCls} text-left w-32`}>Code</th>
                            <th className={`${thCls} text-left w-24`}>Type</th>
                            <th className={`${thCls} text-left`}>Description</th>
                            <th className={`${thCls} text-right w-24`}>GST Rate</th>
                            <th className={`${thCls} text-center w-24`}>Status</th>
                        </>}
                    >
                        {paging.pageRows.map((item) => {
                            const selected = checkedIds === item.id;
                            return (
                                <tr key={item.id} onClick={() => toggleChecked(item.id)} className={rowCls(selected)}>
                                    <td className="p-2 text-center" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            aria-label={`Select ${item.code}`}
                                            checked={selected}
                                            onChange={() => toggleChecked(item.id)}
                                        />
                                    </td>
                                    <td className="p-2 whitespace-nowrap font-medium tabular-nums">{item.code || "--"}</td>
                                    <td className="p-2">
                                        {item.type ? <Badge tone={String(item.type).toUpperCase() === "SAC" ? "amber" : "blue"}>{item.type}</Badge> : "--"}
                                    </td>
                                    <td className="p-2 max-w-96 truncate" title={item.description}>{item.description || "--"}</td>
                                    <td className="p-2 text-right tabular-nums">{item.gst_rate ? `${item.gst_rate}%` : "0%"}</td>
                                    <td className="p-2 text-center">
                                        <Badge tone={item.is_active ? "green" : "red"}>{item.is_active ? "Active" : "Inactive"}</Badge>
                                    </td>
                                </tr>
                            );
                        })}
                    </ListTable>

                    <Pagination paging={paging} onPage={setPage} />
                </div>
                <FilterSidebar
                    panel={panel}
                    filters={filters}
                    onChange={onFilterChange}
                    searchPlaceholder="Search code or description..."
                    resultCount={filtered.length}
                    showDates={false}
                >
                    <FilterSection title="Type" onClear={filters.type ? clear("type") : undefined}>
                        <ChipGroup name="type" label="Type" value={filters.type} onChange={onFilterChange} options={TYPE_OPTIONS} />
                    </FilterSection>
                    <FilterSection title="Status" onClear={filters.status ? clear("status") : undefined}>
                        <ChipGroup name="status" label="Status" value={filters.status} onChange={onFilterChange} options={STATUS_OPTIONS} />
                    </FilterSection>
                </FilterSidebar>
            </div>
        </>
    );
};

export default ViewHsnSac;
