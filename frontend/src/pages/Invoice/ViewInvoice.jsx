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
    FilterSidebar, FilterToggleButton, FilterSection, ChipGroup, useFilterPanel, ListTable, Pagination, Badge,
    StatStrip, SortTh, useSort, CellStack, RowAction, EmptyState, useRowKeys, usePageSize, activeFilterCount,
    paginate, rowCls, selCellCls, thCls,
} from '../../components/ListKit';

// Stores...
import useInvoiceStore from '../../store/InvoiceStore';
import useAuthStore from '../../store/AuthStore';

// Utils / hooks...
import { invoiceGrandTotal } from '../../utils/invoiceTotals';
import { errorMessage, formatDate, formatINR, openPrintWindow } from '../../utils/format';
import useShortcuts from "../../hooks/useShortcuts";
import useListFilters from "../../hooks/useListFilters";

const SOURCE_OPTIONS = [
    { value: "challan", label: "From challan" },
    { value: "direct", label: "Direct" },
];

const invoiceTax = (item) => (Number(item.total_cgst) || 0) + (Number(item.total_sgst) || 0) + (Number(item.total_igst) || 0);

const SORT_ACCESSORS = {
    number: (r) => r.invoice_no,
    date: (r) => r.invoice_date || "",
    party: (r) => r.party_id?.company_name || "",
    taxable: (r) => Number(r.total_amount) || 0,
    tax: invoiceTax,
    total: invoiceGrandTotal,
};

const ViewInvoices = () => {
    const { invoiceData, getAllInvoice, deleteInvoice, printInvoice, invoiceLoading } = useInvoiceStore();
    const { token } = useAuthStore();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const back = searchParams.get("back");

    const [checkedIds, setCheckedIds] = useState(null);
    const [source, setSource] = useState("");
    const [pageSize, setPageSize] = usePageSize();

    const panel = useFilterPanel();

    const { filters, onFilterChange, page, setPage, reload } = useListFilters((applied) => {
        setCheckedIds(null);
        return getAllInvoice({ token, ...applied }).catch((error) => {
            console.log(error);
            toast.error(errorMessage(error, "Could not load invoices."));
        });
    });

    // "Source" is filtered here, on top of the server-side search/date filters.
    const sidebarFilters = { ...filters, source };
    const onSidebarChange = (e) => {
        if (e.target.name !== "source") return onFilterChange(e);
        setSource(e.target.value);
        setPage(1);
    };

    const allRows = invoiceData?.body || [];
    const rows = allRows.filter(item => !source || (source === "challan" ? item.challan_id : !item.challan_id));
    const { sorted, sort, onSort } = useSort(rows, SORT_ACCESSORS);
    const paging = paginate(sorted, page, pageSize);

    const totals = rows.reduce((acc, item) => ({
        taxable: acc.taxable + (Number(item.total_amount) || 0),
        tax: acc.tax + invoiceTax(item),
        grand: acc.grand + invoiceGrandTotal(item),
    }), { taxable: 0, tax: 0, grand: 0 });
    const fromChallan = rows.filter(item => item.challan_id).length;
    const multiCompany = new Set(allRows.map(item => item.company_id?.id)).size > 1;
    const filtered = activeFilterCount(sidebarFilters) > 0;

    const hasSelection = checkedIds != null;
    const checkedInvoice = rows.find(item => item.id === checkedIds);

    const toggleChecked = (id) => setCheckedIds(prev => (prev === id ? null : id));
    const openInvoice = (id) => navigate(`/view-invoice/details?id=${id}&back=true`);

    const handleEdit = () => {
        if (!hasSelection) return toast.warning("Please select which one you want to edit.");
        openInvoice(checkedIds);
    };

    const handleDelete = async () => {
        if (!hasSelection) return toast.warning("Please select which one you want to delete.");
        const message = checkedInvoice?.challan_id
            ? "Delete this invoice? Its challan will become available for a new invoice. This cannot be undone."
            : "Are you sure you want to delete this record? This cannot be undone.";
        if (!window.confirm(message)) return;
        try {
            const result = await deleteInvoice({ id: checkedIds, token: token });
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
            const result = await printInvoice({ id, token });
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
        n: () => navigate("/create-invoice"),
        d: () => handleDelete(),
        e: () => handleEdit(),
        p: () => handlePrint(checkedIds),
    });

    useRowKeys({ rows: paging.pageRows, selectedId: checkedIds, onSelect: setCheckedIds, onOpen: openInvoice });

    const colSpan = multiCompany ? 10 : 9;
    const sortProps = { sort, onSort };

    return (
        <>
            <PageTitle>Invoices</PageTitle>
            <div className="flex items-start gap-2">
                <div className='flex flex-col gap-2 flex-1 min-w-0'>
                    <ActionArea>
                        <div className="flex flex-wrap items-center justify-between w-full gap-2">
                            <div className="flex flex-wrap gap-1">
                                {back && <CustomButton onClick={() => navigate(-1)} title={"Back"} color={"slate"}><AiOutlineRollback /></CustomButton>}
                                <CustomButton onClick={() => navigate("/create-invoice")} title={"New (Ctrl+N)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
                                <CustomButton onClick={handleEdit} title={"Edit (Ctrl+E)"} color={"slate"} disabled={!hasSelection}><AiOutlineEdit /></CustomButton>
                                <CustomButton onClick={() => handlePrint(checkedIds)} title={"Print (Ctrl+P)"} color={"slate"} disabled={!hasSelection}><AiOutlinePrinter /></CustomButton>
                                <CustomButton onClick={handleDelete} title={"Delete (Ctrl+D)"} color={"red"} disabled={!hasSelection}><AiOutlineDelete /></CustomButton>
                            </div>
                            <div className="flex items-center gap-2">
                                {checkedInvoice && (
                                    <span className="hidden md:inline text-xs text-slate-500 dark:text-slate-400">
                                        Selected <span className="font-semibold text-slate-800 dark:text-slate-100">{checkedInvoice.invoice_no}</span>
                                    </span>
                                )}
                                <CustomButton onClick={handleRefresh} title={"Refresh"} color={"slate"}><AiOutlineSync /></CustomButton>
                                <FilterToggleButton panel={panel} filters={sidebarFilters} />
                            </div>
                        </div>
                    </ActionArea>

                    <StatStrip items={[
                        { label: "Invoices", value: rows.length, hint: fromChallan ? `${fromChallan} from challans` : "None from challans" },
                        { label: "Taxable value", value: formatINR(totals.taxable) },
                        { label: "GST", value: formatINR(totals.tax) },
                        { label: "Grand total", value: formatINR(totals.grand), tone: "blue", hint: filtered ? "For the filtered list" : "All invoices" },
                    ]} />

                    <ListTable
                        minWidth={multiCompany ? "min-w-[1080px]" : "min-w-[940px]"}
                        colSpan={colSpan}
                        loading={invoiceLoading}
                        isEmpty={!rows.length}
                        emptyState={
                            <EmptyState
                                icon={<AiOutlineFileText />}
                                title={filtered ? "No invoices match these filters" : "No invoices yet"}
                                hint={filtered ? "Try a wider date range or a different search." : "Create a tax invoice, or raise one from a challan."}
                                action={filtered
                                    ? <CustomButton onClick={clearFilters} title="Clear filters" color="slate" />
                                    : <CustomButton onClick={() => navigate("/create-invoice")} title="New invoice" color="blue"><AiOutlineFileAdd /></CustomButton>}
                            />
                        }
                        head={<>
                            <th className={`${thCls} text-center w-10`}><span className="sr-only">Select</span></th>
                            <SortTh label="Invoice No" sortKey="number" {...sortProps} />
                            <SortTh label="Date" sortKey="date" {...sortProps} />
                            <SortTh label="Bill To" sortKey="party" {...sortProps} />
                            {multiCompany && <th className={`${thCls} text-left`}>Company</th>}
                            <th className={`${thCls} text-left`}>Truck / LR</th>
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
                                    onDoubleClick={() => openInvoice(item.id)}
                                    aria-selected={selected}
                                    className={rowCls(selected)}
                                >
                                    <td className={`p-2 text-center ${selCellCls(selected)}`} onClick={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            aria-label={`Select invoice ${item.invoice_no}`}
                                            checked={selected}
                                            onChange={() => toggleChecked(item.id)}
                                        />
                                    </td>
                                    <td className="p-2 whitespace-nowrap" onClick={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
                                        <Link to={`/view-invoice/details?id=${item.id}&back=true`} className="font-semibold text-blue-700 dark:text-blue-400 hover:underline" title="Open invoice">
                                            {item.invoice_no || "--"}
                                        </Link>
                                        {item.challan_id ? <span className="ml-2"><Badge tone="slate">Challan</Badge></span> : null}
                                    </td>
                                    <td className="p-2 whitespace-nowrap tabular-nums">{formatDate(item.invoice_date)}</td>
                                    <td className="p-2 max-w-56">
                                        <CellStack primary={<span className="capitalize font-medium text-slate-900 dark:text-slate-100">{party?.company_name}</span>} secondary={place || party?.gst} title={party?.company_name} />
                                    </td>
                                    {multiCompany && <td className="p-2 max-w-44 truncate capitalize" title={item.company_id?.company_name}>{item.company_id?.company_name || "--"}</td>}
                                    <td className="p-2 max-w-40">
                                        <CellStack primary={<span className="uppercase">{item.lorry_no}</span>} secondary={item.lr_no ? `LR ${item.lr_no}` : ""} />
                                    </td>
                                    <td className="p-2 text-right whitespace-nowrap tabular-nums text-slate-600 dark:text-slate-300">{formatINR(item.total_amount)}</td>
                                    <td className="p-2 text-right whitespace-nowrap tabular-nums text-slate-600 dark:text-slate-300">{formatINR(invoiceTax(item))}</td>
                                    <td className="p-2 text-right whitespace-nowrap tabular-nums font-semibold text-slate-900 dark:text-white">{formatINR(invoiceGrandTotal(item))}</td>
                                    <td className="p-1 text-right whitespace-nowrap">
                                        <RowAction icon={<AiOutlineEdit />} label={`Edit invoice ${item.invoice_no}`} onClick={() => openInvoice(item.id)} />
                                        <RowAction icon={<AiOutlinePrinter />} label={`Print invoice ${item.invoice_no}`} onClick={() => handlePrint(item.id)} />
                                    </td>
                                </tr>
                            );
                        })}
                    </ListTable>

                    <Pagination paging={paging} onPage={setPage} totalAmount={totals.grand} pageSize={pageSize} onPageSize={setPageSize} />
                </div>
                <FilterSidebar
                    panel={panel}
                    filters={sidebarFilters}
                    onChange={onSidebarChange}
                    searchPlaceholder="Search invoice no, lorry, LR, transporter..."
                    resultCount={rows.length}
                >
                    <FilterSection title="Source" onClear={source ? () => onSidebarChange({ target: { name: "source", value: "" } }) : undefined}>
                        <ChipGroup name="source" value={source} onChange={onSidebarChange} options={SOURCE_OPTIONS} label="Source" />
                    </FilterSection>
                </FilterSidebar>
            </div>
        </>
    );
};

export default ViewInvoices;
