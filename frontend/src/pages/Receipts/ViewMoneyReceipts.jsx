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
    AiOutlineWallet,
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
import { PAYMENT_MODES } from '../../components/ReceiptForm';

// Stores...
import useMoneyReceiptStore from '../../store/MoneyReceiptStore';
import useAuthStore from '../../store/AuthStore';

// Utils / hooks...
import { errorMessage, formatDate, formatINR, openPrintWindow } from '../../utils/format';
import useShortcuts from "../../hooks/useShortcuts";
import useListFilters from "../../hooks/useListFilters";

const MODE_TONE = { "Cash": "green", "UPI": "blue", "Bank Transfer": "blue", "Cheque": "amber" };
const MODE_OPTIONS = PAYMENT_MODES.map(mode => ({ value: mode, label: mode }));

const SORT_ACCESSORS = {
    number: (r) => r.receipt_no,
    date: (r) => r.receipt_date || "",
    party: (r) => r.party_id?.name || "",
    mode: (r) => r.payment_mode || "",
    amount: (r) => Number(r.total_value) || 0,
};

const ViewMoneyReceipts = () => {
    const { moneyReceipts, getAllMoneyReceipts, printMoneyReceipt, deleteMoneyReceipts, loading } = useMoneyReceiptStore();
    const { token } = useAuthStore();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const back = searchParams.get("back");

    const [checkedIds, setCheckedIds] = useState(null);
    const [mode, setMode] = useState("");
    const [pageSize, setPageSize] = usePageSize();

    const panel = useFilterPanel();

    const { filters, onFilterChange, page, setPage, reload } = useListFilters((applied) => {
        setCheckedIds(null);
        return getAllMoneyReceipts(token, applied.startDate, applied.endDate, applied.search).catch((error) => {
            console.log(error);
            toast.error(errorMessage(error, "Could not load money receipts."));
        });
    });

    // Payment mode is filtered here, on top of the server-side search/date filters.
    const sidebarFilters = { ...filters, mode };
    const onSidebarChange = (e) => {
        if (e.target.name !== "mode") return onFilterChange(e);
        setMode(e.target.value);
        setPage(1);
    };

    const allRows = moneyReceipts?.body || [];
    const rows = allRows.filter(item => !mode || item.payment_mode === mode);
    const { sorted, sort, onSort } = useSort(rows, SORT_ACCESSORS);
    const paging = paginate(sorted, page, pageSize);

    const totalAmount = rows.reduce((sum, item) => sum + (Number(item.total_value) || 0), 0);
    const byMode = rows.reduce((acc, item) => {
        const key = item.payment_mode === "Cash" ? "cash" : "bank";
        acc[key] += Number(item.total_value) || 0;
        acc[`${key}Count`] += 1;
        return acc;
    }, { cash: 0, bank: 0, cashCount: 0, bankCount: 0 });
    const filtered = activeFilterCount(sidebarFilters) > 0;

    const hasSelection = checkedIds != null;
    const checkedReceipt = rows.find(item => item.id === checkedIds);

    const toggleChecked = (id) => setCheckedIds(prev => (prev === id ? null : id));
    const openReceipt = (id) => navigate(`/view-money-receipt/details?id=${id}&back=true`);

    const handleEdit = () => {
        if (!hasSelection) return toast.warning("Please select which one you want to edit.");
        openReceipt(checkedIds);
    };

    const handleDelete = async () => {
        if (!hasSelection) return toast.warning("Please select which one you want to delete.");
        if (!window.confirm("Are you sure you want to delete this record? This cannot be undone.")) return;
        try {
            const result = await deleteMoneyReceipts({ id: checkedIds, token: token });
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
            const result = await printMoneyReceipt({ id, token });
            if (result.status !== 200) return toast.error(result.message);
            if (!openPrintWindow(result.body.html)) return toast.error("Nothing to print.");
        } catch (error) {
            console.log(error);
            toast.error(errorMessage(error));
        }
    };

    const handleRefresh = async () => {
        await reload();
        toast.info("Data refreshed.");
    };

    const clearFilters = () => Object.keys(sidebarFilters).forEach((name) => onSidebarChange({ target: { name, value: "" } }));

    useShortcuts({
        f: () => panel.openAndFocus(),
        n: () => navigate("/create-moeny-receipts"),
        d: () => handleDelete(),
        e: () => handleEdit(),
        p: () => handlePrint(checkedIds),
    });

    useRowKeys({ rows: paging.pageRows, selectedId: checkedIds, onSelect: setCheckedIds, onOpen: openReceipt });

    const sortProps = { sort, onSort };

    return (
        <>
            <PageTitle>Money Receipts</PageTitle>
            <div className="flex items-start gap-2">
                <div className='flex flex-col gap-2 flex-1 min-w-0'>
                    <ActionArea>
                        <div className="flex flex-wrap items-center justify-between w-full gap-2">
                            <div className="flex flex-wrap gap-1">
                                {back && <CustomButton onClick={() => navigate(-1)} title={"Back"} color={"slate"}><AiOutlineRollback /></CustomButton>}
                                <CustomButton onClick={() => navigate("/create-moeny-receipts")} title={"New (Ctrl+N)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
                                <CustomButton onClick={handleEdit} title={"Edit (Ctrl+E)"} color={"slate"} disabled={!hasSelection}><AiOutlineEdit /></CustomButton>
                                <CustomButton onClick={() => handlePrint(checkedIds)} title={"Print (Ctrl+P)"} color={"slate"} disabled={!hasSelection}><AiOutlinePrinter /></CustomButton>
                                <CustomButton onClick={handleDelete} title={"Delete (Ctrl+D)"} color={"red"} disabled={!hasSelection}><AiOutlineDelete /></CustomButton>
                            </div>
                            <div className="flex items-center gap-2">
                                {checkedReceipt && (
                                    <span className="hidden md:inline text-xs text-slate-500 dark:text-slate-400">
                                        Selected <span className="font-semibold text-slate-800 dark:text-slate-100">{checkedReceipt.receipt_no}</span>
                                    </span>
                                )}
                                <CustomButton onClick={handleRefresh} title={"Refresh"} color={"slate"}><AiOutlineSync /></CustomButton>
                                <FilterToggleButton panel={panel} filters={sidebarFilters} />
                            </div>
                        </div>
                    </ActionArea>

                    <StatStrip items={[
                        { label: "Receipts", value: rows.length, hint: filtered ? "For the filtered list" : "All receipts" },
                        { label: "Total received", value: formatINR(totalAmount), tone: "blue" },
                        { label: "Cash", value: formatINR(byMode.cash), tone: "green", hint: `${byMode.cashCount} receipt${byMode.cashCount === 1 ? "" : "s"}` },
                        { label: "Bank / UPI / Cheque", value: formatINR(byMode.bank), hint: `${byMode.bankCount} receipt${byMode.bankCount === 1 ? "" : "s"}` },
                    ]} />

                    <ListTable
                        minWidth="min-w-[860px]"
                        colSpan={7}
                        loading={loading}
                        isEmpty={!rows.length}
                        emptyState={
                            <EmptyState
                                icon={<AiOutlineWallet />}
                                title={filtered ? "No receipts match these filters" : "No money receipts yet"}
                                hint={filtered ? "Try a wider date range, another payment mode or a different search." : "Record a receipt each time a party pays you."}
                                action={filtered
                                    ? <CustomButton onClick={clearFilters} title="Clear filters" color="slate" />
                                    : <CustomButton onClick={() => navigate("/create-moeny-receipts")} title="New receipt" color="blue"><AiOutlineFileAdd /></CustomButton>}
                            />
                        }
                        head={<>
                            <th className={`${thCls} text-center w-10`}><span className="sr-only">Select</span></th>
                            <SortTh label="Receipt No" sortKey="number" {...sortProps} />
                            <SortTh label="Date" sortKey="date" {...sortProps} />
                            <SortTh label="Received From" sortKey="party" {...sortProps} />
                            <SortTh label="Mode" sortKey="mode" {...sortProps} />
                            <SortTh label="Amount" sortKey="amount" align="right" {...sortProps} />
                            <th className={`${thCls} text-right w-24`}><span className="sr-only">Actions</span></th>
                        </>}
                    >
                        {paging.pageRows.map((item) => {
                            const selected = checkedIds === item.id;
                            return (
                                <tr
                                    key={item.id}
                                    id={`row-${item.id}`}
                                    onClick={() => toggleChecked(item.id)}
                                    onDoubleClick={() => openReceipt(item.id)}
                                    aria-selected={selected}
                                    className={rowCls(selected)}
                                >
                                    <td className={`p-2 text-center ${selCellCls(selected)}`} onClick={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            aria-label={`Select receipt ${item.receipt_no}`}
                                            checked={selected}
                                            onChange={() => toggleChecked(item.id)}
                                        />
                                    </td>
                                    <td className="p-2 whitespace-nowrap" onClick={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
                                        <Link to={`/view-money-receipt/details?id=${item.id}&back=true`} className="font-semibold text-blue-700 dark:text-blue-400 hover:underline" title="Open receipt">
                                            {item.receipt_no || "--"}
                                        </Link>
                                    </td>
                                    <td className="p-2 whitespace-nowrap tabular-nums">{formatDate(item.receipt_date)}</td>
                                    <td className="p-2 max-w-72">
                                        <CellStack
                                            primary={<span className="capitalize font-medium text-slate-900 dark:text-slate-100">{item.party_id?.name}</span>}
                                            secondary={item.remarks || item.party_id?.mobile}
                                            title={[item.party_id?.name, item.remarks].filter(Boolean).join(" — ")}
                                        />
                                    </td>
                                    <td className="p-2 max-w-48">
                                        <div className="flex flex-col items-start gap-0.5 min-w-0">
                                            {item.payment_mode ? <Badge tone={MODE_TONE[item.payment_mode] || "slate"}>{item.payment_mode}</Badge> : "--"}
                                            {item.reference && <span className="max-w-full truncate text-xs text-slate-500 dark:text-slate-400" title={item.reference}>{item.reference}</span>}
                                        </div>
                                    </td>
                                    <td className="p-2 text-right whitespace-nowrap tabular-nums font-semibold text-slate-900 dark:text-white">{formatINR(item.total_value)}</td>
                                    <td className="p-1 text-right whitespace-nowrap">
                                        <RowAction icon={<AiOutlineEdit />} label={`Edit receipt ${item.receipt_no}`} onClick={() => openReceipt(item.id)} />
                                        <RowAction icon={<AiOutlinePrinter />} label={`Print receipt ${item.receipt_no}`} onClick={() => handlePrint(item.id)} />
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
                    searchPlaceholder="Search receipt no, mode, reference..."
                    resultCount={rows.length}
                >
                    <FilterSection title="Payment mode" onClear={mode ? () => onSidebarChange({ target: { name: "mode", value: "" } }) : undefined}>
                        <ChipGroup name="mode" value={mode} onChange={onSidebarChange} options={MODE_OPTIONS} label="Payment mode" />
                    </FilterSection>
                </FilterSidebar>
            </div>
        </>
    );
};

export default ViewMoneyReceipts;
