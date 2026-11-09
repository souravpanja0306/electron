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
    AiOutlineFileText,
} from "react-icons/ai";

// Components...
import PageTitle from '../../components/PageTitle';
import ActionArea from '../../components/ActionArea';
import CustomButton from '../../components/CustomButton';
import {
    FilterSidebar, FilterToggleButton, useFilterPanel, ListTable, Pagination, Badge,
    StatStrip, SortTh, useSort, CellStack, RowAction, EmptyState, useRowKeys, usePageSize, activeFilterCount,
    paginate, rowCls, selCellCls, thCls,
} from '../../components/ListKit';

// Stores...
import useNoteStore from '../../store/NoteStore';

// Utils / hooks...
import { invoiceGrandTotal } from '../../utils/invoiceTotals';
import { errorMessage, formatDate, formatINR, openPrintWindow } from '../../utils/format';
import { noteConfig } from '../../utils/noteTypes';
import useShortcuts from "../../hooks/useShortcuts";
import useListFilters from "../../hooks/useListFilters";

const noteTax = (item) => (Number(item.total_cgst) || 0) + (Number(item.total_sgst) || 0) + (Number(item.total_igst) || 0);

const SORT_ACCESSORS = {
    number: (r) => r.note_no,
    date: (r) => r.note_date || "",
    party: (r) => r.party_id?.company_name || "",
    invoice: (r) => r.invoice?.invoice_no || "",
    taxable: (r) => Number(r.total_amount) || 0,
    tax: noteTax,
    total: invoiceGrandTotal,
};

/** List of credit notes or debit notes (`type`). Same layout as the invoice list. */
const ViewNotes = ({ type }) => {
    const config = noteConfig(type);
    const { noteData, getNotes, deleteNote, printNote, noteLoading } = useNoteStore();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const back = searchParams.get("back");

    const [checkedIds, setCheckedIds] = useState(null);
    const [pageSize, setPageSize] = usePageSize();
    const panel = useFilterPanel();

    const { filters, onFilterChange, page, setPage, reload } = useListFilters((applied) => {
        setCheckedIds(null);
        return getNotes({ type, ...applied }).catch((error) => {
            console.log(error);
            toast.error(errorMessage(error, `Could not load ${config.plural.toLowerCase()}.`));
        });
    });

    // The store is shared by both note types; only show this page's type.
    const allRows = (noteData?.body || []).filter(item => item.note_type === type);
    const { sorted, sort, onSort } = useSort(allRows, SORT_ACCESSORS);
    const paging = paginate(sorted, page, pageSize);

    const totals = allRows.reduce((acc, item) => ({
        taxable: acc.taxable + (Number(item.total_amount) || 0),
        tax: acc.tax + noteTax(item),
        grand: acc.grand + invoiceGrandTotal(item),
    }), { taxable: 0, tax: 0, grand: 0 });
    const linked = allRows.filter(item => item.invoice).length;
    const multiCompany = new Set(allRows.map(item => item.company_id?.id)).size > 1;
    const filtered = activeFilterCount(filters) > 0;

    const hasSelection = checkedIds != null;
    const checkedNote = allRows.find(item => item.id === checkedIds);

    const toggleChecked = (id) => setCheckedIds(prev => (prev === id ? null : id));
    const openNote = (id) => navigate(config.detailsUrl(id));

    const handleEdit = () => {
        if (!hasSelection) return toast.warning("Please select which one you want to edit.");
        openNote(checkedIds);
    };

    const handleDelete = async () => {
        if (!hasSelection) return toast.warning("Please select which one you want to delete.");
        if (!window.confirm(`Delete ${checkedNote?.note_no || `this ${config.title.toLowerCase()}`}? This cannot be undone.`)) return;
        try {
            const result = await deleteNote(checkedIds);
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
            const result = await printNote(id);
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

    const clearFilters = () => Object.keys(filters).forEach((name) => onFilterChange({ target: { name, value: "" } }));

    useShortcuts({
        f: () => panel.openAndFocus(),
        n: () => navigate(config.createUrl),
        d: () => handleDelete(),
        e: () => handleEdit(),
        p: () => handlePrint(checkedIds),
    });

    useRowKeys({ rows: paging.pageRows, selectedId: checkedIds, onSelect: setCheckedIds, onOpen: openNote });

    const colSpan = multiCompany ? 10 : 9;
    const sortProps = { sort, onSort };

    return (
        <>
            <PageTitle>{config.plural}</PageTitle>
            <div className="flex items-start gap-2">
                <div className='flex flex-col gap-2 flex-1 min-w-0'>
                    <ActionArea>
                        <div className="flex flex-wrap items-center justify-between w-full gap-2">
                            <div className="flex flex-wrap gap-1">
                                {back && <CustomButton onClick={() => navigate(-1)} title={"Back"} color={"slate"}><AiOutlineRollback /></CustomButton>}
                                <CustomButton onClick={() => navigate(config.createUrl)} title={"New (Ctrl+N)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
                                <CustomButton onClick={handleEdit} title={"Edit (Ctrl+E)"} color={"slate"} disabled={!hasSelection}><AiOutlineEdit /></CustomButton>
                                <CustomButton onClick={() => handlePrint(checkedIds)} title={"Print (Ctrl+P)"} color={"slate"} disabled={!hasSelection}><AiOutlinePrinter /></CustomButton>
                                <CustomButton onClick={handleDelete} title={"Delete (Ctrl+D)"} color={"red"} disabled={!hasSelection}><AiOutlineDelete /></CustomButton>
                            </div>
                            <div className="flex items-center gap-2">
                                {checkedNote && (
                                    <span className="hidden md:inline text-xs text-slate-500 dark:text-slate-400">
                                        Selected <span className="font-semibold text-slate-800 dark:text-slate-100">{checkedNote.note_no}</span>
                                    </span>
                                )}
                                <CustomButton onClick={handleRefresh} title={"Refresh"} color={"slate"}><AiOutlineSync /></CustomButton>
                                <FilterToggleButton panel={panel} filters={filters} />
                            </div>
                        </div>
                    </ActionArea>

                    <StatStrip items={[
                        { label: config.plural, value: allRows.length, hint: linked ? `${linked} against an invoice` : "None linked to an invoice" },
                        { label: "Taxable value", value: formatINR(totals.taxable) },
                        { label: "GST", value: formatINR(totals.tax) },
                        { label: config.grandLabel, value: formatINR(totals.grand), tone: config.tone, hint: filtered ? "For the filtered list" : `All ${config.plural.toLowerCase()}` },
                    ]} />

                    <ListTable
                        minWidth={multiCompany ? "min-w-[1080px]" : "min-w-[940px]"}
                        colSpan={colSpan}
                        loading={noteLoading}
                        isEmpty={!allRows.length}
                        emptyState={
                            <EmptyState
                                icon={<AiOutlineFileText />}
                                title={filtered ? `No ${config.plural.toLowerCase()} match these filters` : `No ${config.plural.toLowerCase()} yet`}
                                hint={filtered ? "Try a wider date range or a different search." : config.effect}
                                action={filtered
                                    ? <CustomButton onClick={clearFilters} title="Clear filters" color="slate" />
                                    : <CustomButton onClick={() => navigate(config.createUrl)} title={`New ${config.title.toLowerCase()}`} color="blue"><AiOutlineFileAdd /></CustomButton>}
                            />
                        }
                        head={<>
                            <th className={`${thCls} text-center w-10`}><span className="sr-only">Select</span></th>
                            <SortTh label={`${config.short} No`} sortKey="number" {...sortProps} />
                            <SortTh label="Date" sortKey="date" {...sortProps} />
                            <SortTh label="Party" sortKey="party" {...sortProps} />
                            {multiCompany && <th className={`${thCls} text-left`}>Company</th>}
                            <SortTh label="Against Invoice" sortKey="invoice" {...sortProps} />
                            <SortTh label="Taxable" sortKey="taxable" align="right" {...sortProps} />
                            <SortTh label="GST" sortKey="tax" align="right" {...sortProps} />
                            <SortTh label="Total" sortKey="total" align="right" {...sortProps} />
                            <th className={`${thCls} text-right w-24`}><span className="sr-only">Actions</span></th>
                        </>}
                        foot={paging.totalPages > 1 ? null : (
                            <tr className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 font-semibold text-slate-800 dark:text-slate-100">
                                <td colSpan={multiCompany ? 6 : 5} className="p-2 text-right text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Total</td>
                                <td className="p-2 text-right tabular-nums whitespace-nowrap">{formatINR(totals.taxable)}</td>
                                <td className="p-2 text-right tabular-nums whitespace-nowrap">{formatINR(totals.tax)}</td>
                                <td className="p-2 text-right tabular-nums whitespace-nowrap text-blue-700 dark:text-blue-300">{formatINR(totals.grand)}</td>
                                <td></td>
                            </tr>
                        )}
                    >
                        {paging.pageRows.map((item) => {
                            const selected = checkedIds === item.id;
                            const party = item.party_id;
                            const place = [party?.city, party?.state].filter(Boolean).join(", ");
                            return (
                                <tr
                                    key={item.id}
                                    id={`row-${item.id}`}
                                    onClick={() => toggleChecked(item.id)}
                                    onDoubleClick={() => openNote(item.id)}
                                    aria-selected={selected}
                                    className={rowCls(selected)}
                                >
                                    <td className={`p-2 text-center ${selCellCls(selected)}`} onClick={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            aria-label={`Select ${item.note_no}`}
                                            checked={selected}
                                            onChange={() => toggleChecked(item.id)}
                                        />
                                    </td>
                                    <td className="p-2 whitespace-nowrap" onClick={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
                                        <Link to={config.detailsUrl(item.id)} className="font-semibold text-blue-700 dark:text-blue-400 hover:underline" title={`Open ${config.title.toLowerCase()}`}>
                                            {item.note_no || "--"}
                                        </Link>
                                    </td>
                                    <td className="p-2 whitespace-nowrap tabular-nums">{formatDate(item.note_date)}</td>
                                    <td className="p-2 max-w-56">
                                        <CellStack primary={<span className="capitalize font-medium text-slate-900 dark:text-slate-100">{party?.company_name}</span>} secondary={place || party?.gst} title={party?.company_name} />
                                    </td>
                                    {multiCompany && <td className="p-2 max-w-44 truncate capitalize" title={item.company_id?.company_name}>{item.company_id?.company_name || "--"}</td>}
                                    <td className="p-2 max-w-48">
                                        {item.invoice ? (
                                            <CellStack
                                                primary={item.invoice.is_deleted
                                                    ? <span>{item.invoice.invoice_no} <Badge tone="red">Deleted</Badge></span>
                                                    : <Link to={`/view-invoice/details?id=${item.invoice.id}&back=true`} onClick={(e) => e.stopPropagation()} className="text-blue-700 dark:text-blue-400 hover:underline">{item.invoice.invoice_no}</Link>}
                                                secondary={item.reason || formatDate(item.invoice.invoice_date)}
                                                title={item.reason}
                                            />
                                        ) : (
                                            <CellStack primary={<span className="text-slate-400 dark:text-slate-500">—</span>} secondary={item.reason} title={item.reason} />
                                        )}
                                    </td>
                                    <td className="p-2 text-right whitespace-nowrap tabular-nums text-slate-600 dark:text-slate-300">{formatINR(item.total_amount)}</td>
                                    <td className="p-2 text-right whitespace-nowrap tabular-nums text-slate-600 dark:text-slate-300">{formatINR(noteTax(item))}</td>
                                    <td className="p-2 text-right whitespace-nowrap tabular-nums font-semibold text-slate-900 dark:text-white">{formatINR(invoiceGrandTotal(item))}</td>
                                    <td className="p-1 text-right whitespace-nowrap">
                                        <RowAction icon={<AiOutlineEdit />} label={`Edit ${item.note_no}`} onClick={() => openNote(item.id)} />
                                        <RowAction icon={<AiOutlinePrinter />} label={`Print ${item.note_no}`} onClick={() => handlePrint(item.id)} />
                                    </td>
                                </tr>
                            );
                        })}
                    </ListTable>

                    <Pagination paging={paging} onPage={setPage} totalAmount={totals.grand} pageSize={pageSize} onPageSize={setPageSize} />
                </div>
                <FilterSidebar
                    panel={panel}
                    filters={filters}
                    onChange={onFilterChange}
                    searchPlaceholder={`Search ${config.short} no, party, invoice no, reason...`}
                    resultCount={allRows.length}
                />
            </div>
        </>
    );
};

export default ViewNotes;
