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
} from "react-icons/ai";

// Components...
import PageTitle from '../../components/PageTitle';
import ActionArea from '../../components/ActionArea';
import CustomButton from '../../components/CustomButton';
import { ListFilters, ListTable, Pagination, Badge, paginate, rowCls, thCls } from '../../components/ListKit';

// Stores...
import useInvoiceStore from '../../store/InvoiceStore';
import useAuthStore from '../../store/AuthStore';

// Utils / hooks...
import { invoiceGrandTotal } from '../../utils/invoiceTotals';
import { errorMessage, formatINR, openPrintWindow } from '../../utils/format';
import useShortcuts from "../../hooks/useShortcuts";
import useListFilters from "../../hooks/useListFilters";

const ViewInvoices = () => {
    const { invoiceData, getAllInvoice, deleteInvoice, printInvoice, invoiceLoading } = useInvoiceStore();
    const { token } = useAuthStore();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const back = searchParams.get("back");

    const [checkedIds, setCheckedIds] = useState(null);

    const { filters, onFilterChange, page, setPage, reload, reset } = useListFilters((applied) => {
        setCheckedIds(null);
        return getAllInvoice({ token, ...applied }).catch((error) => {
            console.log(error);
            toast.error(errorMessage(error, "Could not load invoices."));
        });
    });

    const rows = invoiceData?.body || [];
    const paging = paginate(rows, page);
    const totalAmount = rows.reduce((sum, item) => sum + invoiceGrandTotal(item), 0);
    const hasSelection = checkedIds != null;
    const checkedInvoice = rows.find(item => item.id === checkedIds);

    const toggleChecked = (id) => setCheckedIds(prev => (prev === id ? null : id));

    const handleEdit = () => {
        if (!hasSelection) return toast.warning("Please select which one you want to edit.");
        navigate(`/view-invoice/details?id=${checkedIds}&back=true`);
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
            if (!openPrintWindow(result.body.html)) return toast.error("Pop-up blocked. Allow pop-ups to print.");
            toast.info("Generating Print View...");
        } catch (error) {
            console.log(error);
            toast.error(errorMessage(error));
        }
    };

    const handleRefresh = () => {
        reset();
        toast.info("Data refreshed.");
    };

    useShortcuts({
        n: () => navigate("/create-invoice"),
        d: () => handleDelete(),
        e: () => handleEdit(),
        p: () => handlePrint(checkedIds),
    });

    return (
        <>
            <PageTitle>View All Invoices</PageTitle>
            <div className='flex flex-col gap-1'>
                <ActionArea>
                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between w-full gap-2">
                        <div className="flex flex-wrap gap-1">
                            {back && (
                                <div onClick={() => navigate(-1)}>
                                    <CustomButton title={"Back"} color={"slate"}><AiOutlineRollback /></CustomButton>
                                </div>
                            )}
                            <Link to="/create-invoice">
                                <CustomButton title={"New (Ctrl+N)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
                            </Link>
                            <div onClick={handleEdit}>
                                <CustomButton title={"Edit (Ctrl+E)"} color={"blue"} disabled={!hasSelection}><AiOutlineEdit /></CustomButton>
                            </div>
                            <div onClick={() => hasSelection && handlePrint(checkedIds)}>
                                <CustomButton title={"Print (Ctrl+P)"} color={"blue"} disabled={!hasSelection}><AiOutlinePrinter /></CustomButton>
                            </div>
                            <div onClick={() => hasSelection && handleDelete()}>
                                <CustomButton title={"Delete (Ctrl+D)"} color={"red"} disabled={!hasSelection}><AiOutlineDelete /></CustomButton>
                            </div>
                        </div>
                        <ListFilters
                            filters={filters}
                            onChange={onFilterChange}
                            onRefresh={handleRefresh}
                            searchPlaceholder="Search invoice no, lorry, LR, transporter..."
                        />
                    </div>
                </ActionArea>

                <ListTable
                    minWidth="min-w-[1000px]"
                    colSpan={10}
                    loading={invoiceLoading}
                    isEmpty={!rows.length}
                    emptyText="No invoices found."
                    head={<>
                        <th className={`${thCls} text-center w-12`}>Select</th>
                        <th className={`${thCls} text-left`}>Invoice No</th>
                        <th className={`${thCls} text-left`}>Date</th>
                        <th className={`${thCls} text-left`}>Company</th>
                        <th className={`${thCls} text-left`}>Bill To</th>
                        <th className={`${thCls} text-left`}>Lorry No</th>
                        <th className={`${thCls} text-right`}>Taxable</th>
                        <th className={`${thCls} text-right`}>Tax</th>
                        <th className={`${thCls} text-right`}>Grand Total</th>
                        <th className={`${thCls} text-center w-14`}>Print</th>
                    </>}
                >
                    {paging.pageRows.map((item) => {
                        const selected = checkedIds === item.id;
                        const tax = (Number(item.total_cgst) || 0) + (Number(item.total_sgst) || 0) + (Number(item.total_igst) || 0);
                        return (
                            <tr key={item.id} onClick={() => toggleChecked(item.id)} className={rowCls(selected)}>
                                <td className="p-2 text-center" onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="checkbox"
                                        aria-label={`Select invoice ${item.invoice_no}`}
                                        checked={selected}
                                        onChange={() => toggleChecked(item.id)}
                                    />
                                </td>
                                <td className="p-2 max-w-40 truncate font-medium" onClick={(e) => e.stopPropagation()}>
                                    <Link to={`/view-invoice/details?id=${item.id}&back=true`} className="text-blue-700 dark:text-blue-400 hover:underline" title="Open invoice">
                                        {item.invoice_no || "--"}
                                    </Link>
                                    {item.challan_id ? <span className="ml-2"><Badge tone="slate">Challan</Badge></span> : null}
                                </td>
                                <td className="p-2 whitespace-nowrap">{item.invoice_date || "--"}</td>
                                <td className="p-2 max-w-44 truncate capitalize" title={item.company_id?.company_name}>{item.company_id?.company_name || "--"}</td>
                                <td className="p-2 max-w-44 truncate capitalize" title={item.party_id?.company_name}>{item.party_id?.company_name || "--"}</td>
                                <td className="p-2 whitespace-nowrap uppercase">{item.lorry_no || "--"}</td>
                                <td className="p-2 text-right whitespace-nowrap tabular-nums">{formatINR(item.total_amount)}</td>
                                <td className="p-2 text-right whitespace-nowrap tabular-nums">{formatINR(tax)}</td>
                                <td className="p-2 text-right whitespace-nowrap tabular-nums font-semibold">{formatINR(invoiceGrandTotal(item))}</td>
                                <td className="p-2 text-center">
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); handlePrint(item.id); }}
                                        className="p-1 rounded text-xl text-slate-500 dark:text-slate-300 hover:text-yellow-500 hover:bg-yellow-500/10 active:text-yellow-700 transition"
                                        title="Print"
                                        aria-label={`Print invoice ${item.invoice_no}`}
                                    >
                                        <AiOutlinePrinter />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </ListTable>

                <Pagination paging={paging} onPage={setPage} totalAmount={totalAmount} />
            </div>
        </>
    );
};

export default ViewInvoices;
