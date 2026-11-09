import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from 'sonner';

// Icon...
import {
    AiOutlineFileAdd,
    AiOutlinePrinter,
    AiOutlineDelete,
    AiOutlineEdit,
    AiOutlineRollback,
    AiOutlineSync,
    AiOutlineDiff,
    AiOutlineArrowRight,
    AiOutlineCar,
} from "react-icons/ai";

// Components...
import PageTitle from '../../components/PageTitle';
import ActionArea from '../../components/ActionArea';
import CustomButton from '../../components/CustomButton';
import {
    FilterSidebar, FilterToggleButton, FilterSection, ChipGroup, useFilterPanel, ListTable, Pagination, Badge,
    StatStrip, SortTh, useSort, CellStack, RowAction, EmptyState, useRowKeys, usePageSize, activeFilterCount,
    paginate, rowCls, selCellCls, thCls,
} from '../../components/ListKit';

// Stores...
import useChallanStore from "../../store/ChallanStore";
import useAuthStore from '../../store/AuthStore';

// Utils / hooks...
import { errorMessage, formatDate, formatINR, openPrintWindow } from '../../utils/format';
import useShortcuts from "../../hooks/useShortcuts";
import useListFilters from "../../hooks/useListFilters";

const STATUS_OPTIONS = [
    { value: "pending", label: "Not invoiced" },
    { value: "invoiced", label: "Invoiced" },
];

const SORT_ACCESSORS = {
    number: (r) => r.cn_no,
    date: (r) => r.date || "",
    party: (r) => r.consignor_id?.company_name || "",
    route: (r) => `${r.from_loc || ""} ${r.to_loc || ""}`,
    amount: (r) => Number(r.total_amount) || 0,
    status: (r) => (r.invoiced ? 1 : 0),
};

const ViewChallan = () => {
    const { token } = useAuthStore();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const back = searchParams.get("back");

    const { challanData, challanLoading, getAllChallan, deleteChallan, printChallan } = useChallanStore();
    const [checkedIds, setCheckedIds] = useState(null);
    const [status, setStatus] = useState("");
    const [pageSize, setPageSize] = usePageSize();

    const panel = useFilterPanel();

    const { filters, onFilterChange, page, setPage, reload } = useListFilters((applied) => {
        setCheckedIds(null);
        return getAllChallan({ token, ...applied }).catch((error) => {
            console.log(error);
            toast.error(errorMessage(error, "Could not load challans."));
        });
    });

    // "Invoiced" is filtered here, on top of the server-side search/date filters.
    const sidebarFilters = { ...filters, status };
    const onSidebarChange = (e) => {
        if (e.target.name !== "status") return onFilterChange(e);
        setStatus(e.target.value);
        setPage(1);
    };

    const allRows = challanData?.body || [];
    const rows = allRows.filter(item => !status || (status === "invoiced" ? item.invoiced : !item.invoiced));
    const { sorted, sort, onSort } = useSort(rows, SORT_ACCESSORS);
    const paging = paginate(sorted, page, pageSize);

    const totalAmount = rows.reduce((sum, item) => sum + (Number(item.total_amount) || 0), 0);
    const pendingRows = rows.filter(item => !item.invoiced);
    const pendingAmount = pendingRows.reduce((sum, item) => sum + (Number(item.total_amount) || 0), 0);
    const multiCompany = new Set(allRows.map(item => item.company_id?.id)).size > 1;
    const filtered = activeFilterCount(sidebarFilters) > 0;

    const hasSelection = checkedIds != null;
    const checkedChallan = rows.find(item => item.id === checkedIds);

    // Clicking a selected row again clears the selection.
    const toggleChecked = (id) => setCheckedIds(prev => (prev === id ? null : id));
    const openChallan = (id) => navigate(`/edit-challan/${id}?back=true`);

    const handleEdit = () => {
        if (!hasSelection) return toast.warning("Please select which one you want to edit.");
        openChallan(checkedIds);
    };

    const handleDelete = async () => {
        if (!hasSelection) return toast.warning("Please select which one you want to delete.");
        if (!window.confirm("Are you sure you want to delete this record? This cannot be undone.")) return;
        try {
            const result = await deleteChallan({ id: checkedIds, token: token });
            if (result.status === 200) {
                toast.success(result.message);
                await reload();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(errorMessage(error));
        }
    };

    const handlePrint = async (id) => {
        if (!id) return toast.warning("Please select which one you want to print.");
        try {
            const result = await printChallan({ id, token });
            if (result.status !== 200) return toast.error(result.message);
            if (!openPrintWindow(result.body.html)) return toast.error("Nothing to print.");
        } catch (error) {
            console.log(error);
            toast.error(errorMessage(error));
        }
    };

    const createInvoiceFor = (challan) => {
        if (!challan) return;
        if (challan.invoiced) {
            toast.info("An invoice has already been created for this challan.");
            return;
        }
        navigate(`/create-invoice?challanId=${challan.id}&back=true`);
    };

    const handleRefresh = async () => {
        await reload();
        toast.info("Data refreshed.");
    };

    const clearFilters = () => Object.keys(sidebarFilters).forEach((name) => onSidebarChange({ target: { name, value: "" } }));

    useShortcuts({
        f: () => panel.openAndFocus(),
        n: () => navigate("/create-challan"),
        d: () => handleDelete(),
        e: () => handleEdit(),
        p: () => handlePrint(checkedIds),
    });

    useRowKeys({ rows: paging.pageRows, selectedId: checkedIds, onSelect: setCheckedIds, onOpen: openChallan });

    const colSpan = multiCompany ? 10 : 9;
    const sortProps = { sort, onSort };

    return (
        <>
            <PageTitle>Challans</PageTitle>
            <div className="flex items-start gap-2">
                <div className='flex flex-col gap-2 flex-1 min-w-0'>
                    <ActionArea>
                        <div className="flex flex-wrap items-center justify-between w-full gap-2">
                            <div className="flex flex-wrap gap-1">
                                {back && <CustomButton onClick={() => navigate(-1)} title={"Back"} color={"slate"}><AiOutlineRollback /></CustomButton>}
                                <CustomButton onClick={() => navigate("/create-challan")} title={"New (Ctrl+N)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
                                <CustomButton onClick={handleEdit} title={"Edit (Ctrl+E)"} color={"slate"} disabled={!hasSelection}><AiOutlineEdit /></CustomButton>
                                <CustomButton onClick={() => handlePrint(checkedIds)} title={"Print (Ctrl+P)"} color={"slate"} disabled={!hasSelection}><AiOutlinePrinter /></CustomButton>
                                <CustomButton
                                    onClick={() => createInvoiceFor(checkedChallan)}
                                    title={checkedChallan?.invoiced ? "Invoice Created" : "Create Invoice"}
                                    color={checkedChallan?.invoiced ? "green" : "yellow"}
                                    disabled={!hasSelection || checkedChallan?.invoiced}
                                >
                                    <AiOutlineDiff />
                                </CustomButton>
                                <CustomButton onClick={handleDelete} title={"Delete (Ctrl+D)"} color={"red"} disabled={!hasSelection}><AiOutlineDelete /></CustomButton>
                            </div>
                            <div className="flex items-center gap-2">
                                {checkedChallan && (
                                    <span className="hidden md:inline text-xs text-slate-500 dark:text-slate-400">
                                        Selected <span className="font-semibold text-slate-800 dark:text-slate-100">{checkedChallan.cn_no}</span>
                                    </span>
                                )}
                                <CustomButton onClick={handleRefresh} title={"Refresh"} color={"slate"}><AiOutlineSync /></CustomButton>
                                <FilterToggleButton panel={panel} filters={sidebarFilters} />
                            </div>
                        </div>
                    </ActionArea>

                    <StatStrip items={[
                        { label: "Challans", value: rows.length, hint: filtered ? "For the filtered list" : "All challans" },
                        { label: "Total freight", value: formatINR(totalAmount), tone: "blue" },
                        { label: "Invoiced", value: rows.length - pendingRows.length, tone: "green", hint: rows.length ? `${Math.round(((rows.length - pendingRows.length) / rows.length) * 100)}% of challans` : "" },
                        { label: "Not invoiced", value: pendingRows.length, tone: pendingRows.length ? "amber" : undefined, hint: pendingRows.length ? `${formatINR(pendingAmount)} yet to bill` : "Nothing pending" },
                    ]} />

                    <ListTable
                        minWidth={multiCompany ? "min-w-[1100px]" : "min-w-[960px]"}
                        colSpan={colSpan}
                        loading={challanLoading}
                        isEmpty={!rows.length}
                        emptyState={
                            <EmptyState
                                icon={<AiOutlineCar />}
                                title={filtered ? "No challans match these filters" : "No challans yet"}
                                hint={filtered ? "Try a wider date range or a different search." : "Create a challan for each consignment you carry."}
                                action={filtered
                                    ? <CustomButton onClick={clearFilters} title="Clear filters" color="slate" />
                                    : <CustomButton onClick={() => navigate("/create-challan")} title="New challan" color="blue"><AiOutlineFileAdd /></CustomButton>}
                            />
                        }
                        head={<>
                            <th className={`${thCls} text-center w-10`}><span className="sr-only">Select</span></th>
                            <SortTh label="C/N No" sortKey="number" {...sortProps} />
                            <SortTh label="Date" sortKey="date" {...sortProps} />
                            <SortTh label="Consignor → Consignee" sortKey="party" {...sortProps} />
                            {multiCompany && <th className={`${thCls} text-left`}>Company</th>}
                            <SortTh label="Route" sortKey="route" {...sortProps} />
                            <th className={`${thCls} text-left`}>Truck</th>
                            <SortTh label="Amount" sortKey="amount" align="right" {...sortProps} />
                            <SortTh label="Status" sortKey="status" align="center" {...sortProps} />
                            <th className={`${thCls} text-right w-28`}><span className="sr-only">Actions</span></th>
                        </>}
                    >
                        {paging.pageRows.map((item) => {
                            const selected = checkedIds === item.id;
                            const route = item.from_loc || item.to_loc;
                            return (
                                <tr
                                    key={item.id}
                                    id={`row-${item.id}`}
                                    onClick={() => toggleChecked(item.id)}
                                    onDoubleClick={() => openChallan(item.id)}
                                    aria-selected={selected}
                                    className={rowCls(selected)}
                                >
                                    <td className={`p-2 text-center ${selCellCls(selected)}`} onClick={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            aria-label={`Select challan ${item.cn_no}`}
                                            checked={selected}
                                            onChange={() => toggleChecked(item.id)}
                                        />
                                    </td>
                                    <td className="p-2 whitespace-nowrap" onClick={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
                                        <Link to={`/edit-challan/${item.id}?back=true`} className="font-semibold text-blue-700 dark:text-blue-400 hover:underline" title="Open challan">
                                            {item.cn_no || "--"}
                                        </Link>
                                    </td>
                                    <td className="p-2 whitespace-nowrap tabular-nums">{formatDate(item.date)}</td>
                                    <td className="p-2 max-w-64">
                                        <CellStack
                                            primary={<span className="capitalize font-medium text-slate-900 dark:text-slate-100">{item.consignor_id?.company_name}</span>}
                                            secondary={item.consignee_id?.company_name ? <span className="capitalize">to {item.consignee_id.company_name}</span> : ""}
                                            title={`${item.consignor_id?.company_name || "--"} → ${item.consignee_id?.company_name || "--"}`}
                                        />
                                    </td>
                                    {multiCompany && <td className="p-2 max-w-44 truncate capitalize" title={item.company_id?.company_name}>{item.company_id?.company_name || "--"}</td>}
                                    <td className="p-2 max-w-52">
                                        {route ? (
                                            <span className="flex items-center gap-1 min-w-0 capitalize" title={`${item.from_loc || "--"} → ${item.to_loc || "--"}`}>
                                                <span className="truncate">{item.from_loc || "--"}</span>
                                                <AiOutlineArrowRight className="shrink-0 text-xs text-slate-400" />
                                                <span className="truncate">{item.to_loc || "--"}</span>
                                            </span>
                                        ) : "--"}
                                    </td>
                                    <td className="p-2 whitespace-nowrap uppercase tracking-wide text-xs">{item.truck_no || "--"}</td>
                                    <td className="p-2 text-right whitespace-nowrap tabular-nums font-semibold text-slate-900 dark:text-white">{formatINR(item.total_amount)}</td>
                                    <td className="p-2 text-center">
                                        <Badge tone={item.invoiced ? "green" : "amber"}>{item.invoiced ? "Invoiced" : "Pending"}</Badge>
                                    </td>
                                    <td className="p-1 text-right whitespace-nowrap">
                                        {!item.invoiced && (
                                            <RowAction icon={<AiOutlineDiff />} tone="amber" label={`Create invoice from ${item.cn_no}`} onClick={() => createInvoiceFor(item)} />
                                        )}
                                        <RowAction icon={<AiOutlineEdit />} label={`Edit challan ${item.cn_no}`} onClick={() => openChallan(item.id)} />
                                        <RowAction icon={<AiOutlinePrinter />} label={`Print challan ${item.cn_no}`} onClick={() => handlePrint(item.id)} />
                                    </td>
                                </tr>
                            );
                        })}
                    </ListTable>

                    <Pagination paging={paging} onPage={setPage} totalAmount={totalAmount} pageSize={pageSize} onPageSize={setPageSize} />
                </div>
                <FilterSidebar
                    panel={panel}
                    filters={sidebarFilters}
                    onChange={onSidebarChange}
                    searchPlaceholder="Search C/N, truck, from, to..."
                    resultCount={rows.length}
                >
                    <FilterSection title="Invoice status" onClear={status ? () => onSidebarChange({ target: { name: "status", value: "" } }) : undefined}>
                        <ChipGroup name="status" value={status} onChange={onSidebarChange} options={STATUS_OPTIONS} label="Invoice status" />
                    </FilterSection>
                </FilterSidebar>
            </div>
        </>
    );
};

export default ViewChallan;
