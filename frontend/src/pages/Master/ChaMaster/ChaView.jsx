import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'sonner';

// Icons...
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
    FilterSidebar, FilterToggleButton, useFilterPanel,
    ListTable, Pagination, paginate, rowCls, thCls, matchText,
} from '../../../components/ListKit';

// Store...
import useAuthStore from '../../../store/AuthStore';
import useChaStore from '../../../store/ChaStore';
import useShortcuts from "../../../hooks/useShortcuts";
import useClientFilters from "../../../hooks/useClientFilters";

const ChaView = () => {
    const { token } = useAuthStore();
    const { chaData, getAllCha, deleteCha } = useChaStore();
    const [checkedIds, setCheckedIds] = useState([]);
    const navigate = useNavigate();

    const panel = useFilterPanel();
    const { filters, onFilterChange, filtered, page, setPage } = useClientFilters(
        chaData,
        { search: "" },
        (item, f) => matchText(f.search, item.name, item.mobile, item.address)
    );
    const paging = paginate(filtered, page);

    const fetchCha = () => {
        getAllCha();
    };

    useEffect(() => {
        fetchCha();
    }, []);

    const toggleChecked = (id) =>
        setCheckedIds(prev => (prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]));

    const handleDelete = async () => {
        if (!checkedIds.length) {
            toast.warning("Please select an item to delete.");
            return;
        }
        if (!window.confirm("Are you sure you want to delete this record? This cannot be undone.")) return;
        try {
            for (let id of checkedIds) {
                await deleteCha(id, token);
            }
            toast.success("Deleted Successfully");
            setCheckedIds([]);
            fetchCha();
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong!");
        };
    };

    const handleRefresh = () => {
        fetchCha();
        toast.info("Data refreshed.");
    };

    useShortcuts({
        f: () => panel.openAndFocus(),
        n: () => navigate("/add-cha"),
        d: () => {
            if (!checkedIds.length) return toast.warning("Please select an item to delete.");
            return handleDelete();
        },
        e: () => {
            if (checkedIds.length !== 1) return toast.warning("Please select exactly one CHA to edit.");
            navigate(`/edit-cha/${checkedIds[0]}`);
        },
    });

    return (
        <>
            <PageTitle>View All CHA</PageTitle>
            <div className="flex items-start gap-2">
                <div className='flex flex-col gap-1 flex-1 min-w-0'>
                    <ActionArea>
                        <div className="flex flex-wrap items-center justify-between w-full gap-2">
                            <div className="flex flex-wrap gap-1">
                                <Link to="/add-cha">
                                    <CustomButton title={"New (Ctrl+N)"} color={"blue"}><AiOutlineFileAdd /></CustomButton>
                                </Link>
                                {checkedIds.length === 1 && (
                                    <Link to={`/edit-cha/${checkedIds[0]}`}>
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
                        minWidth="min-w-[640px]"
                        colSpan={4}
                        isEmpty={!paging.pageRows.length}
                        emptyText={chaData?.length ? "No CHAs match these filters." : "No CHAs found."}
                        head={<>
                            <th className={`${thCls} text-center w-12`}>Select</th>
                            <th className={`${thCls} text-left`}>Name</th>
                            <th className={`${thCls} text-left`}>Mobile</th>
                            <th className={`${thCls} text-left`}>Address</th>
                        </>}
                    >
                        {paging.pageRows.map((item) => {
                            const selected = checkedIds.includes(item.id);
                            return (
                                <tr key={item.id} onClick={() => toggleChecked(item.id)} className={rowCls(selected)}>
                                    <td className="p-2 text-center" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            aria-label={`Select ${item.name}`}
                                            checked={selected}
                                            onChange={() => toggleChecked(item.id)}
                                        />
                                    </td>
                                    <td className="p-2 max-w-56 truncate capitalize font-medium" onClick={(e) => e.stopPropagation()}>
                                        <Link to={`/edit-cha/${item.id}`} className="text-blue-700 dark:text-blue-400 hover:underline" title={item.name}>
                                            {item.name || "--"}
                                        </Link>
                                    </td>
                                    <td className="p-2 whitespace-nowrap">{item.mobile || "--"}</td>
                                    <td className="p-2 max-w-80 truncate capitalize" title={item.address}>{item.address || "--"}</td>
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
                    searchPlaceholder="Search name, mobile, address..."
                    resultCount={filtered.length}
                    showDates={false}
                />
            </div>
        </>
    )
}

export default ChaView;
