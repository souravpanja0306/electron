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
import useMoneyReceiptStore from '../../store/MoneyReceiptStore';
import useAuthStore from '../../store/AuthStore';

// Utils / hooks...
import { errorMessage, formatINR, openPrintWindow } from '../../utils/format';
import useShortcuts from "../../hooks/useShortcuts";
import useListFilters from "../../hooks/useListFilters";

const MODE_TONE = { "Cash": "green", "UPI": "blue", "Bank Transfer": "blue", "Cheque": "amber" };

const ViewMoneyReceipts = () => {
    const { moneyReceipts, getAllMoneyReceipts, printMoneyReceipt, deleteMoneyReceipts, loading } = useMoneyReceiptStore();
    const { token } = useAuthStore();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const back = searchParams.get("back");

    const [checkedIds, setCheckedIds] = useState(null);

    const { filters, onFilterChange, page, setPage, reload, reset } = useListFilters((applied) => {
        setCheckedIds(null);
        return getAllMoneyReceipts(token, applied.startDate, applied.endDate, applied.search).catch((error) => {
            console.log(error);
            toast.error(errorMessage(error, "Could not load money receipts."));
        });
    });

    const rows = moneyReceipts?.body || [];
    const paging = paginate(rows, page);
    const totalAmount = rows.reduce((sum, item) => sum + (Number(item.total_value) || 0), 0);
    const hasSelection = checkedIds != null;

    const toggleChecked = (id) => setCheckedIds(prev => (prev === id ? null : id));

    const handleEdit = () => {
        if (!hasSelection) return toast.warning("Please select which one you want to edit.");
        navigate(`/view-money-receipt/details?id=${checkedIds}&back=true`);
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
        n: () => navigate("/create-moeny-receipts"),
        d: () => handleDelete(),
        e: () => handleEdit(),
        p: () => handlePrint(checkedIds),
    });

    return (
        <>
            <PageTitle>All Money Receipts</PageTitle>
            <div className='flex flex-col gap-1'>
                <ActionArea>
                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between w-full gap-2">
                        <div className="flex flex-wrap gap-1">
                            {back && (
                                <div onClick={() => navigate(-1)}>
                                    <CustomButton title={"Back"} color={"slate"}><AiOutlineRollback /></CustomButton>
                                </div>
                            )}
                            <Link to="/create-moeny-receipts">
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
                            searchPlaceholder="Search receipt no, mode, reference..."
                        />
                    </div>
                </ActionArea>

                <ListTable
                    minWidth="min-w-[860px]"
                    colSpan={9}
                    loading={loading}
                    isEmpty={!rows.length}
                    emptyText="No money receipts found."
                    head={<>
                        <th className={`${thCls} text-center w-12`}>Select</th>
                        <th className={`${thCls} text-left`}>Receipt No</th>
                        <th className={`${thCls} text-left`}>Date</th>
                        <th className={`${thCls} text-left`}>Received From</th>
                        <th className={`${thCls} text-center`}>Mode</th>
                        <th className={`${thCls} text-left`}>Reference</th>
                        <th className={`${thCls} text-left`}>Remarks</th>
                        <th className={`${thCls} text-right`}>Amount</th>
                        <th className={`${thCls} text-center w-14`}>Print</th>
                    </>}
                >
                    {paging.pageRows.map((item) => {
                        const selected = checkedIds === item.id;
                        return (
                            <tr key={item.id} onClick={() => toggleChecked(item.id)} className={rowCls(selected)}>
                                <td className="p-2 text-center" onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="checkbox"
                                        aria-label={`Select receipt ${item.receipt_no}`}
                                        checked={selected}
                                        onChange={() => toggleChecked(item.id)}
                                    />
                                </td>
                                <td className="p-2 max-w-40 truncate font-medium" onClick={(e) => e.stopPropagation()}>
                                    <Link to={`/view-money-receipt/details?id=${item.id}&back=true`} className="text-blue-700 dark:text-blue-400 hover:underline" title="Open receipt">
                                        {item.receipt_no || "--"}
                                    </Link>
                                </td>
                                <td className="p-2 whitespace-nowrap">{item.receipt_date || "--"}</td>
                                <td className="p-2 max-w-48 truncate capitalize" title={item.party_id?.name}>{item.party_id?.name || "--"}</td>
                                <td className="p-2 text-center">
                                    {item.payment_mode ? <Badge tone={MODE_TONE[item.payment_mode] || "slate"}>{item.payment_mode}</Badge> : "--"}
                                </td>
                                <td className="p-2 max-w-36 truncate" title={item.reference}>{item.reference || "--"}</td>
                                <td className="p-2 max-w-48 truncate" title={item.remarks}>{item.remarks || "--"}</td>
                                <td className="p-2 text-right whitespace-nowrap tabular-nums font-semibold">{formatINR(item.total_value)}</td>
                                <td className="p-2 text-center">
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); handlePrint(item.id); }}
                                        className="p-1 rounded text-xl text-slate-500 dark:text-slate-300 hover:text-yellow-500 hover:bg-yellow-500/10 active:text-yellow-700 transition"
                                        title="Print"
                                        aria-label={`Print receipt ${item.receipt_no}`}
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

export default ViewMoneyReceipts;
