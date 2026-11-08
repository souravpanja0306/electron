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
    AiOutlineDiff,
} from "react-icons/ai";

// Components...
import PageTitle from '../../components/PageTitle';
import ActionArea from '../../components/ActionArea';
import CustomButton from '../../components/CustomButton';
import { ListFilters, ListTable, Pagination, Badge, paginate, rowCls, thCls } from '../../components/ListKit';

// Stores...
import useChallanStore from "../../store/ChallanStore";
import useAuthStore from '../../store/AuthStore';

// Utils / hooks...
import { errorMessage, formatINR, openPrintWindow } from '../../utils/format';
import useShortcuts from "../../hooks/useShortcuts";
import useListFilters from "../../hooks/useListFilters";

const ViewChallan = () => {
    const { token } = useAuthStore();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const back = searchParams.get("back");

    const { challanData, challanLoading, getAllChallan, deleteChallan, printChallan } = useChallanStore();
    const [checkedIds, setCheckedIds] = useState(null);

    const { filters, onFilterChange, page, setPage, reload, reset } = useListFilters((applied) => {
        setCheckedIds(null);
        return getAllChallan({ token, ...applied }).catch((error) => {
            console.log(error);
            toast.error(errorMessage(error, "Could not load challans."));
        });
    });

    const rows = challanData?.body || [];
    const paging = paginate(rows, page);
    const totalAmount = rows.reduce((sum, item) => sum + (Number(item.total_amount) || 0), 0);
    const hasSelection = checkedIds != null;
    const checkedChallan = rows.find(item => item.id === checkedIds);

    // Clicking a selected row again clears the selection.
    const toggleChecked = (id) => setCheckedIds(prev => (prev === id ? null : id));

    const handleEdit = () => {
        if (!hasSelection) return toast.warning("Please select which one you want to edit.");
        navigate(`/edit-challan/${checkedIds}?back=true`);
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
            if (!openPrintWindow(result.body.html)) return toast.error("Pop-up blocked. Allow pop-ups to print.");
            toast.info("Generating Print View...");
        } catch (error) {
            console.log(error);
            toast.error(errorMessage(error));
        }
    };

    const handleCreateInvoice = () => {
        if (!checkedChallan) return;
        if (checkedChallan.invoiced) {
            toast.info("An invoice has already been created for this challan.");
            return;
        }
        navigate(`/create-invoice?challanId=${checkedIds}&back=true`);
    };

    const handleRefresh = () => {
        reset();
        toast.info("Data refreshed.");
    };

    useShortcuts({
        n: () => navigate("/create-challan"),
        d: () => handleDelete(),
        e: () => handleEdit(),
        p: () => handlePrint(checkedIds),
    });

    return (
        <>
            <PageTitle>View All Challans</PageTitle>
            <div className='flex flex-col gap-1'>
                <ActionArea>
                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between w-full gap-2">
                        <div className="flex flex-wrap gap-1">
                            {back && (
                                <div onClick={() => navigate(-1)}>
                                    <CustomButton title={"Back"} color={"slate"}><AiOutlineRollback /></CustomButton>
                                </div>
                            )}
                            <Link to="/create-challan">
                                <CustomButton title={"New (Ctrl+N)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
                            </Link>
                            <div onClick={handleEdit}>
                                <CustomButton title={"Edit (Ctrl+E)"} color={"blue"} disabled={!hasSelection}><AiOutlineEdit /></CustomButton>
                            </div>
                            <div onClick={() => hasSelection && handlePrint(checkedIds)}>
                                <CustomButton title={"Print (Ctrl+P)"} color={"blue"} disabled={!hasSelection}><AiOutlinePrinter /></CustomButton>
                            </div>
                            <div onClick={() => hasSelection && handleCreateInvoice()}>
                                <CustomButton
                                    title={checkedChallan?.invoiced ? "Invoice Created" : "Create Invoice"}
                                    color={checkedChallan?.invoiced ? "green" : "yellow"}
                                    disabled={!hasSelection || checkedChallan?.invoiced}
                                >
                                    <AiOutlineDiff />
                                </CustomButton>
                            </div>
                            <div onClick={() => hasSelection && handleDelete()}>
                                <CustomButton title={"Delete (Ctrl+D)"} color={"red"} disabled={!hasSelection}><AiOutlineDelete /></CustomButton>
                            </div>
                        </div>
                        <ListFilters
                            filters={filters}
                            onChange={onFilterChange}
                            onRefresh={handleRefresh}
                            searchPlaceholder="Search C/N, truck, from, to..."
                        />
                    </div>
                </ActionArea>

                <ListTable
                    minWidth="min-w-[980px]"
                    colSpan={12}
                    loading={challanLoading}
                    isEmpty={!rows.length}
                    emptyText="No challans found."
                    head={<>
                        <th className={`${thCls} text-center w-12`}>Select</th>
                        <th className={`${thCls} text-left`}>C/N No</th>
                        <th className={`${thCls} text-left`}>Date</th>
                        <th className={`${thCls} text-left`}>Company</th>
                        <th className={`${thCls} text-left`}>Consignor</th>
                        <th className={`${thCls} text-left`}>Consignee</th>
                        <th className={`${thCls} text-left`}>From</th>
                        <th className={`${thCls} text-left`}>To</th>
                        <th className={`${thCls} text-left`}>Truck No</th>
                        <th className={`${thCls} text-right`}>Amount</th>
                        <th className={`${thCls} text-center`}>Invoiced</th>
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
                                        aria-label={`Select challan ${item.cn_no}`}
                                        checked={selected}
                                        onChange={() => toggleChecked(item.id)}
                                    />
                                </td>
                                <td className="p-2 max-w-40 truncate font-medium" onClick={(e) => e.stopPropagation()}>
                                    <Link to={`/edit-challan/${item.id}?back=true`} className="text-blue-700 dark:text-blue-400 hover:underline" title="Open challan">
                                        {item.cn_no || "--"}
                                    </Link>
                                </td>
                                <td className="p-2 whitespace-nowrap">{item.date || "--"}</td>
                                <td className="p-2 max-w-44 truncate capitalize" title={item.company_id?.company_name}>{item.company_id?.company_name || "--"}</td>
                                <td className="p-2 max-w-44 truncate capitalize" title={item.consignor_id?.company_name}>{item.consignor_id?.company_name || "--"}</td>
                                <td className="p-2 max-w-44 truncate capitalize" title={item.consignee_id?.company_name}>{item.consignee_id?.company_name || "--"}</td>
                                <td className="p-2 max-w-32 truncate capitalize">{item.from_loc || "--"}</td>
                                <td className="p-2 max-w-32 truncate capitalize">{item.to_loc || "--"}</td>
                                <td className="p-2 whitespace-nowrap uppercase">{item.truck_no || "--"}</td>
                                <td className="p-2 text-right whitespace-nowrap tabular-nums">{formatINR(item.total_amount)}</td>
                                <td className="p-2 text-center">
                                    <Badge tone={item.invoiced ? "green" : "slate"}>{item.invoiced ? "Yes" : "No"}</Badge>
                                </td>
                                <td className="p-2 text-center">
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); handlePrint(item.id); }}
                                        className="p-1 rounded text-xl text-slate-500 dark:text-slate-300 hover:text-yellow-500 hover:bg-yellow-500/10 active:text-yellow-700 transition"
                                        title="Print"
                                        aria-label={`Print challan ${item.cn_no}`}
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

export default ViewChallan;
