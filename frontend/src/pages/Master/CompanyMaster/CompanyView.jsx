import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'sonner';

// Icon...
import {
    AiOutlineFileAdd,
    AiOutlineSync,
    AiOutlineDelete,
    AiOutlineEdit,
} from "react-icons/ai";

// Components...
import PageTitle from '../../../components/PageTitle';
import ActionArea from '../../../components/ActionArea';
import CustomButton from '../../../components/CustomButton';
import {
    FilterSidebar, FilterToggleButton, FilterSection, ChipGroup, useFilterPanel,
    ListTable, Pagination, paginate, rowCls, thCls, matchText,
} from '../../../components/ListKit';

// Stores...
import useCompanyStore from "../../../store/CompanyStore";
import useAuthStore from "../../../store/AuthStore";
import useShortcuts from "../../../hooks/useShortcuts";
import useClientFilters from "../../../hooks/useClientFilters";

const GST_OPTIONS = [
    { value: "registered", label: "Registered" },
    { value: "unregistered", label: "Unregistered" },
];

const ViewCompany = () => {
    const { companyData, getAllCompany, deleteCompany, companyLoading } = useCompanyStore();
    const { token } = useAuthStore();

    const navigate = useNavigate();
    const [checkedIds, setCheckedIds] = useState([]);

    const panel = useFilterPanel();
    const { filters, onFilterChange, filtered, page, setPage } = useClientFilters(
        companyData,
        { search: "", gst: "" },
        (item, f) =>
            matchText(f.search, item.company_name, item.owner, item.mobile, item.email, item.gst, item.pan) &&
            (!f.gst || (f.gst === "registered" ? Boolean(item.gst) : !item.gst))
    );
    const paging = paginate(filtered, page);

    useEffect(() => {
        getAllCompany(token);
    }, []);

    const toggleChecked = (id) =>
        setCheckedIds(prev => (prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]));

    // "Select all" acts on the rows the filters leave visible.
    const allVisibleChecked = filtered.length > 0 && filtered.every(item => checkedIds.includes(item.id));
    const handleSelectAll = (e) => {
        setCheckedIds(e.target.checked ? filtered.map(item => item.id) : []);
    };

    const handleDelete = async () => {
        if (!checkedIds.length) {
            toast.warning("Please select an item to delete.");
            return;
        }
        if (!window.confirm(`Delete ${checkedIds.length} selected compan${checkedIds.length === 1 ? "y" : "ies"}? This cannot be undone.`)) return;
        try {
            let result = await deleteCompany({ ids: checkedIds, token: token });
            if (result.status === 200) {
                toast.success(result.message);
                setCheckedIds([]);
                getAllCompany(token);
            } else {
                toast.error(result.message);
            };
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong!");
        };
    };

    const handleRefresh = () => {
        getAllCompany(token);
        toast.info("Data refreshed.");
    };

    useShortcuts({
        f: () => panel.openAndFocus(),
        n: () => navigate("/add-company"),
        d: () => {
            if (!checkedIds.length) return toast.warning("Please select an item to delete.");
            return handleDelete();
        },
        e: () => {
            if (checkedIds.length !== 1) return toast.warning("Please select exactly one company to edit.");
            navigate(`/edit-company/${checkedIds[0]}`);
        },
    });

    return (
        <>
            <PageTitle>View All Company</PageTitle>
            <div className="flex items-start gap-2">
                <div className='flex flex-col gap-1 flex-1 min-w-0'>
                    <ActionArea>
                        <div className="flex flex-wrap items-center justify-between w-full gap-2">
                            <div className="flex flex-wrap gap-1">
                                <Link to="/add-company">
                                    <CustomButton title={"New (Ctrl+N)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
                                </Link>
                                {checkedIds.length === 1 && (
                                    <Link to={`/edit-company/${checkedIds[0]}`}>
                                        <CustomButton title={"Edit (Ctrl+E)"} color={"blue"}><AiOutlineEdit /></CustomButton>
                                    </Link>
                                )}
                                {checkedIds.length > 0 && (
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
                        minWidth="min-w-[960px]"
                        colSpan={10}
                        loading={companyLoading}
                        isEmpty={!paging.pageRows.length}
                        emptyText={companyData?.length ? "No companies match these filters." : "No companies found."}
                        head={<>
                            <th className={`${thCls} text-center w-12`}>
                                <input
                                    type="checkbox"
                                    aria-label="Select all visible companies"
                                    onChange={handleSelectAll}
                                    checked={allVisibleChecked}
                                />
                            </th>
                            <th className={`${thCls} text-left w-16`}>Logo</th>
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
                            const selected = checkedIds.includes(item.id);
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
                                    <td className="p-2">
                                        {item.logo
                                            ? <img src={`${item.logo}`} alt="" className="w-9 h-9 object-contain rounded bg-white ring-1 ring-slate-200 dark:ring-slate-700" />
                                            : <span className="text-slate-400 dark:text-slate-500">--</span>}
                                    </td>
                                    <td className="p-2 max-w-48 truncate capitalize font-medium" onClick={(e) => e.stopPropagation()}>
                                        <Link to={`/view-company-details/${item.id}?back=true`} className="text-blue-700 dark:text-blue-400 hover:underline" title={item.company_name}>
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

export default ViewCompany;
