import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'sonner';

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
import useGstStore from "../../../store/GstStore";
import useAuthStore from '../../../store/AuthStore';
import useShortcuts from "../../../hooks/useShortcuts";
import useClientFilters from "../../../hooks/useClientFilters";

const STATUS_OPTIONS = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
];

const TYPE_OPTIONS = [
    { value: "percentage", label: "Percentage" },
    { value: "fixed", label: "Fixed" },
];

const GstTable = () => {
    const { token } = useAuthStore();
    const { gstData, getAllGst, deleteGst, gstLoading } = useGstStore();
    const navigate = useNavigate();
    const [checkedIds, setCheckedIds] = useState(null);

    const panel = useFilterPanel();
    const { filters, onFilterChange, filtered, page, setPage } = useClientFilters(
        gstData,
        { search: "", status: "", type: "" },
        (item, f) =>
            matchText(f.search, item.title, item.total_rate, item.cgst, item.sgst, item.igst) &&
            (!f.status || (f.status === "active" ? Boolean(item.is_active) : !item.is_active)) &&
            (!f.type || String(item.type || "").toLowerCase() === f.type)
    );
    const paging = paginate(filtered, page);
    const clear = (name) => () => onFilterChange({ target: { name, value: "" } });

    useEffect(() => {
        getAllGst(token);
    }, []);

    const toggleChecked = (id) => setCheckedIds(prev => (prev === id ? null : id));

    const handleDelete = async () => {
        if (!checkedIds) return toast.error("Please select a GST record to delete.");
        if (window.confirm("Are you sure you want to delete this GST record?")) {
            try {
                const res = await deleteGst(checkedIds, token);
                if (res.status === 200) {
                    toast.success(res.message);
                    getAllGst(token);
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
        getAllGst(token);
        toast.info("Data refreshed.");
    };

    useShortcuts({
        f: () => panel.openAndFocus(),
        n: () => navigate("/create-gst"),
        d: () => handleDelete(),
        e: () => {
            if (!checkedIds) return toast.error("Please select a GST record to edit.");
            navigate(`/create-gst?id=${checkedIds}`);
        },
    });

    return (
        <>
            <PageTitle>View All GST Settings</PageTitle>
            <div className="flex items-start gap-2">
                <div className='flex flex-col gap-1 flex-1 min-w-0'>
                    <ActionArea>
                        <div className="flex flex-wrap items-center justify-between w-full gap-2">
                            <div className="flex flex-wrap gap-1">
                                <Link to="/create-gst">
                                    <CustomButton title={"New (Ctrl+N)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
                                </Link>
                                {checkedIds && (
                                    <div onClick={() => navigate(`/create-gst?id=${checkedIds}`)}>
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
                        colSpan={8}
                        loading={gstLoading}
                        isEmpty={!paging.pageRows.length}
                        emptyText={gstData?.length ? "No GST records match these filters." : "No GST records found."}
                        head={<>
                            <th className={`${thCls} text-center w-12`}>Select</th>
                            <th className={`${thCls} text-left`}>Title</th>
                            <th className={`${thCls} text-right`}>Total %</th>
                            <th className={`${thCls} text-right`}>CGST %</th>
                            <th className={`${thCls} text-right`}>SGST %</th>
                            <th className={`${thCls} text-right`}>IGST %</th>
                            <th className={`${thCls} text-center w-28`}>Type</th>
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
                                            aria-label={`Select ${item.title}`}
                                            checked={selected}
                                            onChange={() => toggleChecked(item.id)}
                                        />
                                    </td>
                                    <td className="p-2 max-w-56 truncate font-medium" title={item.title}>{item.title || "--"}</td>
                                    <td className="p-2 text-right tabular-nums">{item.total_rate}%</td>
                                    <td className="p-2 text-right tabular-nums">{item.cgst}%</td>
                                    <td className="p-2 text-right tabular-nums">{item.sgst}%</td>
                                    <td className="p-2 text-right tabular-nums">{item.igst}%</td>
                                    <td className="p-2 text-center capitalize">{item.type || "--"}</td>
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
                    searchPlaceholder="Search title or rate..."
                    resultCount={filtered.length}
                    showDates={false}
                >
                    <FilterSection title="Status" onClear={filters.status ? clear("status") : undefined}>
                        <ChipGroup name="status" label="Status" value={filters.status} onChange={onFilterChange} options={STATUS_OPTIONS} />
                    </FilterSection>
                    <FilterSection title="Type" onClear={filters.type ? clear("type") : undefined}>
                        <ChipGroup name="type" label="Type" value={filters.type} onChange={onFilterChange} options={TYPE_OPTIONS} />
                    </FilterSection>
                </FilterSidebar>
            </div>
        </>
    );
};

export default GstTable;
