import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'sonner';

// Components...
import PageTitle from '../../../components/PageTitle';
import ActionArea from '../../../components/ActionArea';
import CustomButton from '../../../components/CustomButton';
import {
    FilterSidebar, FilterToggleButton, FilterSection, ChipGroup, useFilterPanel,
    ListTable, Pagination, paginate, rowCls, thCls, matchText,
} from '../../../components/ListKit';

// Icons...
import {
    AiOutlineFileAdd,
    AiOutlineSync,
    AiOutlineDelete,
    AiOutlineEdit,
} from "react-icons/ai";

// Hooks...
import { usePartyHook } from '../../../hooks/usePartyHook';
import useShortcuts from "../../../hooks/useShortcuts";
import useClientFilters from "../../../hooks/useClientFilters";

const GST_OPTIONS = [
    { value: "registered", label: "Registered" },
    { value: "unregistered", label: "Unregistered" },
];

const ViewParty = () => {
    const [checkedIds, setCheckedIds] = useState(null);
    const { parties, getParty, handleDeleteParty } = usePartyHook({
        onSuccess: () => {
            setCheckedIds(null);
        }
    });

    const panel = useFilterPanel();
    const { filters, onFilterChange, filtered, page, setPage } = useClientFilters(
        parties?.body,
        { search: "", gst: "" },
        (item, f) =>
            matchText(f.search, item.company_name, item.owner, item.mobile, item.email, item.gst, item.pan) &&
            (!f.gst || (f.gst === "registered" ? Boolean(item.gst) : !item.gst))
    );
    const paging = paginate(filtered, page);

    const toggleChecked = (id) => setCheckedIds(prev => (prev === id ? null : id));

    const handleRefresh = () => {
        getParty({});
        toast.info("Data refreshed.");
    };

    const navigate = useNavigate();
    useShortcuts({
        f: () => panel.openAndFocus(),
        n: () => navigate("/add-party"),
        d: () => {
            if (!checkedIds) return toast.warning("Please select which one you want to delete.");
            return handleDeleteParty(checkedIds);
        },
        e: () => {
            if (!checkedIds) return toast.warning("Please select which one you want to edit.");
            navigate(`/edit-party/${checkedIds}`);
        },
    });

    return (
        <>
            <PageTitle>View All Party</PageTitle>
            <div className="flex items-start gap-2">
                <div className='flex flex-col gap-1 flex-1 min-w-0'>
                    <ActionArea>
                        <div className="flex flex-wrap items-center justify-between w-full gap-2">
                            <div className="flex flex-wrap gap-1">
                                <Link to="/add-party">
                                    <CustomButton title={"New (Ctrl+N)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
                                </Link>
                                {checkedIds && (
                                    <Link to={`/edit-party/${checkedIds}`}>
                                        <CustomButton title={"Edit (Ctrl+E)"} color={"blue"}><AiOutlineEdit /></CustomButton>
                                    </Link>
                                )}
                                {checkedIds && (
                                    <div onClick={() => handleDeleteParty(checkedIds)}>
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
                        minWidth="min-w-[900px]"
                        colSpan={9}
                        isEmpty={!paging.pageRows.length}
                        emptyText={parties?.body?.length ? "No parties match these filters." : "No parties found."}
                        head={<>
                            <th className={`${thCls} text-center w-12`}>Select</th>
                            <th className={`${thCls} text-left`}>Company</th>
                            <th className={`${thCls} text-left`}>Mobile</th>
                            <th className={`${thCls} text-left`}>Email</th>
                            <th className={`${thCls} text-left`}>Owner</th>
                            <th className={`${thCls} text-left`}>PAN</th>
                            <th className={`${thCls} text-left`}>GST</th>
                            <th className={`${thCls} text-left`}>Trade Licence</th>
                            <th className={`${thCls} text-left`}>Bank A/C No</th>
                        </>}
                    >
                        {paging.pageRows.map((item) => {
                            const selected = checkedIds === item.id;
                            return (
                                <tr key={item.id} onClick={() => toggleChecked(item.id)} className={rowCls(selected)}>
                                    <td className="p-2 text-center" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            aria-label={`Select ${item.company_name}`}
                                            checked={selected}
                                            onChange={() => toggleChecked(item.id)}
                                        />
                                    </td>
                                    <td className="p-2 max-w-48 truncate capitalize font-medium" onClick={(e) => e.stopPropagation()}>
                                        <Link to={`/edit-party/${item.id}`} className="text-blue-700 dark:text-blue-400 hover:underline" title={item.company_name}>
                                            {item.company_name || "--"}
                                        </Link>
                                    </td>
                                    <td className="p-2 whitespace-nowrap">{item.mobile || "--"}</td>
                                    <td className="p-2 max-w-48 truncate" title={item.email}>{item.email || "--"}</td>
                                    <td className="p-2 max-w-40 truncate capitalize">{item.owner || "--"}</td>
                                    <td className="p-2 whitespace-nowrap uppercase">{item.pan || "--"}</td>
                                    <td className="p-2 whitespace-nowrap uppercase">{item.gst || "--"}</td>
                                    <td className="p-2 max-w-36 truncate uppercase">{item.trade_licence || "--"}</td>
                                    <td className="p-2 whitespace-nowrap">{item.account_no || "--"}</td>
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
                    searchPlaceholder="Search name, owner, mobile, GST..."
                    resultCount={filtered.length}
                    showDates={false}
                >
                    <FilterSection
                        title="GST registration"
                        onClear={filters.gst ? () => onFilterChange({ target: { name: "gst", value: "" } }) : undefined}
                    >
                        <ChipGroup name="gst" label="GST registration" value={filters.gst} onChange={onFilterChange} options={GST_OPTIONS} />
                    </FilterSection>
                </FilterSidebar>
            </div>
        </>
    )
}

export default ViewParty
