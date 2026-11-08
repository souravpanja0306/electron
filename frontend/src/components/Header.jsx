import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    AiOutlineFileText,
    AiOutlineDiff,
    AiOutlineWallet,
    AiOutlineSetting,
    AiOutlineLogout,
    AiOutlineUser,
    AiOutlineLock,
    AiOutlineReload,
    AiOutlineCode,
    AiOutlineBook,
    AiOutlinePhone,
    AiOutlineInfoCircle,
    AiOutlinePoweroff,
    AiOutlineDown,
    AiOutlineRight,
} from "react-icons/ai";
import { MdOutlineLightMode, MdOutlineDarkMode, MdLocalShipping } from "react-icons/md";
import { VscChromeMinimize, VscChromeMaximize, VscChromeRestore, VscChromeClose } from "react-icons/vsc";

import MenuMap from "../utils/menuMap";
import useThemeStore from "../store/ThemeStore";
import useShortcuts from "../hooks/useShortcuts";
import "../index.css";

/* ------------------------------ Page title ------------------------------- */

// Detail/edit routes that are not in the side menu.
const EXTRA_TITLES = [
    ["/view-invoice/details", "Invoices", "Invoice Details"],
    ["/view-money-receipt/details", "Money Receipts", "Receipt Details"],
    ["/debtors/details-debtors", "Reports", "Customer Ledger"],
    ["/edit-challan", "Challans", "Edit Challan"],
    ["/edit-party", "Party", "Edit Party"],
    ["/edit-company", "Company", "Edit Company"],
    ["/view-company-details", "Company", "Company Details"],
    ["/edit-cha", "CHA", "Edit CHA"],
    ["/profile", "Account", "Profile"],
    ["/edit-profile", "Account", "Edit Profile"],
    ["/change-password", "Account", "Change Password"],
    ["/about", "Help", "About"],
    ["/documentation", "Help", "Documentation"],
    ["/contact-us", "Help", "Contact Us"],
];

// url -> [group, title] from the side menu, so the title bar always matches it.
const MENU_TITLES = (() => {
    const map = {};
    Object.values(MenuMap).forEach((items) =>
        (items || []).forEach((item) => {
            if (item?.type === "main") item.submenu?.forEach((sub) => { map[sub.url] = [item.title, sub.title]; });
            else if (item?.url && item.url !== "#") map[item.url] = [null, item.title];
        })
    );
    return map;
})();

const pageTitleFor = (path) => {
    if (MENU_TITLES[path]) return MENU_TITLES[path];
    const extra = EXTRA_TITLES.find(([prefix]) => path === prefix || path.startsWith(`${prefix}/`));
    return extra ? [extra[1], extra[2]] : [null, null];
};

/* ------------------------------- Menu data -------------------------------- */

const buildMenus = ({ navigate, theme, toggleTheme }) => [
    {
        id: "file",
        label: "File",
        items: [
            { label: "New Challan", icon: <AiOutlineFileText />, onSelect: () => navigate("/create-challan") },
            { label: "New Invoice", icon: <AiOutlineDiff />, onSelect: () => navigate("/create-invoice") },
            { label: "New Money Receipt", icon: <AiOutlineWallet />, onSelect: () => navigate("/create-moeny-receipts") },
            { separator: true },
            { label: "Settings", icon: <AiOutlineSetting />, onSelect: () => navigate("/settings") },
            { separator: true },
            { label: "Exit", icon: <AiOutlinePoweroff />, danger: true, onSelect: () => window.api?.close() },
        ],
    },
    {
        id: "view",
        label: "View",
        items: [
            { label: "Reload", icon: <AiOutlineReload />, shortcut: "Ctrl+R", onSelect: () => window.location.reload() },
            {
                label: theme === "dark" ? "Light mode" : "Dark mode",
                icon: theme === "dark" ? <MdOutlineLightMode /> : <MdOutlineDarkMode />,
                onSelect: toggleTheme,
            },
            { separator: true },
            { label: "Developer tools", icon: <AiOutlineCode />, shortcut: "Ctrl+Shift+I", onSelect: () => window.api?.openDevTools() },
        ],
    },
    {
        id: "help",
        label: "Help",
        items: [
            { label: "Documentation", icon: <AiOutlineBook />, onSelect: () => navigate("/documentation") },
            { label: "Contact us", icon: <AiOutlinePhone />, onSelect: () => navigate("/contact-us") },
            { separator: true },
            { label: "About MyERP", icon: <AiOutlineInfoCircle />, onSelect: () => navigate("/about") },
        ],
    },
];

/* ------------------------------ Menu pieces ------------------------------ */

const itemCls = (danger) =>
    `w-full flex items-center gap-2.5 px-2.5 h-8 rounded text-left text-[13px] outline-none transition-colors ${danger
        ? "text-red-600 dark:text-red-400 hover:bg-red-50 focus-visible:bg-red-50 dark:hover:bg-red-500/10 dark:focus-visible:bg-red-500/10"
        : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 focus-visible:bg-slate-100 dark:hover:bg-slate-700 dark:focus-visible:bg-slate-700"}`;

const panelCls =
    "absolute z-[60] mt-1 p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 " +
    "shadow-xl shadow-slate-900/10 dark:shadow-black/40";

const MenuItems = ({ items, onDone }) => (
    <>
        {items.map((item, i) =>
            item.separator ? (
                <div key={`sep-${i}`} role="separator" className="my-1 h-px bg-slate-100 dark:bg-slate-700" />
            ) : (
                <button
                    key={item.label}
                    type="button"
                    role="menuitem"
                    tabIndex={-1}
                    onClick={() => { onDone(); item.onSelect(); }}
                    className={itemCls(item.danger)}
                >
                    <span className={`text-base ${item.danger ? "" : "text-slate-400 dark:text-slate-500"}`}>{item.icon}</span>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.shortcut && <kbd className="font-sans text-[11px] text-slate-400 dark:text-slate-500">{item.shortcut}</kbd>}
                </button>
            )
        )}
    </>
);

// Arrow keys / Home / End move between the open menu's items.
const onMenuKeyDown = (e) => {
    const keys = ["ArrowDown", "ArrowUp", "Home", "End"];
    if (!keys.includes(e.key)) return;
    const items = Array.from(e.currentTarget.querySelectorAll('[role="menuitem"]'));
    if (!items.length) return;
    e.preventDefault();
    const index = items.indexOf(document.activeElement);
    const next =
        e.key === "Home" ? 0 :
            e.key === "End" ? items.length - 1 :
                e.key === "ArrowDown" ? (index + 1) % items.length :
                    (index - 1 + items.length) % items.length;
    items[next].focus();
};

const initials = (name = "") =>
    name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("") || "U";

/* --------------------------------- Header -------------------------------- */

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, saveTheme } = useThemeStore();
    const [user, setUser] = useState({ name: "User" });
    const [openMenu, setOpenMenu] = useState(null); // "file" | "view" | "help" | "user" | null
    const [maximized, setMaximized] = useState(false);
    const barRef = useRef(null);

    useEffect(() => {
        (async () => {
            try {
                const userData = await window.api?.getItem("user");
                if (userData) setUser(JSON.parse(userData));
            } catch (error) {
                console.error("Error parsing user data:", error);
            }
        })();
        // Profile edits update the name/email shown here without a reload.
        const onUpdated = (e) => setUser((prev) => ({ ...prev, ...e.detail }));
        window.addEventListener("myerp:user-updated", onUpdated);
        return () => window.removeEventListener("myerp:user-updated", onUpdated);
    }, []);

    // Close menus on outside click, Escape, or navigation.
    useEffect(() => {
        if (!openMenu) return;
        const onPointer = (e) => { if (!barRef.current?.contains(e.target)) setOpenMenu(null); };
        const onKey = (e) => { if (e.key === "Escape") setOpenMenu(null); };
        document.addEventListener("mousedown", onPointer);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onPointer);
            document.removeEventListener("keydown", onKey);
        };
    }, [openMenu]);
    useEffect(() => { setOpenMenu(null); }, [location.pathname]);

    // Focus the first item when a menu opens (keyboard users land inside it).
    useEffect(() => {
        if (!openMenu) return;
        const first = barRef.current?.querySelector(`[data-menu="${openMenu}"] [role="menuitem"]`);
        first?.focus({ preventScroll: true });
    }, [openMenu]);

    // Frameless window: infer maximised state from the window size.
    useEffect(() => {
        const check = () =>
            setMaximized(window.outerWidth >= window.screen.availWidth && window.outerHeight >= window.screen.availHeight);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    const toggleTheme = useCallback(async () => {
        try {
            await saveTheme(theme === "dark" ? "light" : "dark");
        } catch {
            toast.error("Could not save the theme. Please try again.");
        }
    }, [theme, saveTheme]);

    const handleSignOut = async () => {
        await window.api?.clearAll();
        navigate("/signin");
    };

    useShortcuts({ r: () => window.location.reload() });

    const menus = useMemo(() => buildMenus({ navigate, theme, toggleTheme }), [navigate, theme, toggleTheme]);
    const [group, pageTitle] = pageTitleFor(location.pathname);
    const close = () => setOpenMenu(null);

    // Left/Right switch between the top-level menus while one is open.
    const onBarKeyDown = (e) => {
        if (!openMenu || openMenu === "user" || !["ArrowLeft", "ArrowRight"].includes(e.key)) return;
        e.preventDefault();
        const ids = menus.map((m) => m.id);
        const index = ids.indexOf(openMenu);
        setOpenMenu(ids[(index + (e.key === "ArrowRight" ? 1 : -1) + ids.length) % ids.length]);
    };

    const iconBtn =
        "btn no-drag h-7 w-7 flex items-center justify-center rounded-md text-slate-500 dark:text-slate-400 " +
        "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white transition-colors";
    const winBtn =
        "btn no-drag h-10 w-[46px] flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors";

    return (
        <header
            ref={barRef}
            onKeyDown={onBarKeyDown}
            className="titlebar relative z-50 w-full h-10 shrink-0 flex items-center bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 select-none"
        >
            {/* Brand + menubar */}
            <div className="flex items-center h-full pl-3 gap-3 min-w-0">
                <Link to="/" className="no-drag flex items-center gap-2 rounded-md pr-1 focus-visible:outline-blue-500" title="Home">
                    <span className="h-6 w-6 rounded-md bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center shadow-sm shadow-blue-700/30">
                        <MdLocalShipping className="text-[15px]" />
                    </span>
                    <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">MyERP</span>
                </Link>

                <nav role="menubar" aria-label="Application menu" className="no-drag flex items-center h-full">
                    {menus.map((menu) => {
                        const open = openMenu === menu.id;
                        return (
                            <div key={menu.id} className="relative h-full flex items-center" data-menu={menu.id}>
                                <button
                                    type="button"
                                    role="menuitem"
                                    aria-haspopup="menu"
                                    aria-expanded={open}
                                    onClick={() => setOpenMenu(open ? null : menu.id)}
                                    onMouseEnter={() => { if (openMenu && openMenu !== "user" && !open) setOpenMenu(menu.id); }}
                                    className={`btn h-7 px-2.5 rounded-md text-[13px] transition-colors ${open
                                        ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"}`}
                                >
                                    {menu.label}
                                </button>
                                {open && (
                                    <div role="menu" aria-label={menu.label} onKeyDown={onMenuKeyDown} className={`${panelCls} left-0 top-full w-60`}>
                                        <MenuItems items={menu.items} onDone={close} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </div>

            {/* Current page (drag area) */}
            <div className="flex-1 min-w-0 h-full flex items-center justify-center px-4 pointer-events-none">
                {pageTitle && (
                    <div className="flex items-center gap-1.5 text-xs truncate">
                        {group && (
                            <>
                                <span className="text-slate-400 dark:text-slate-500 truncate">{group}</span>
                                <AiOutlineRight className="shrink-0 text-[10px] text-slate-300 dark:text-slate-600" />
                            </>
                        )}
                        <span className="font-medium text-slate-700 dark:text-slate-200 truncate">{pageTitle}</span>
                    </div>
                )}
            </div>

            {/* Theme + account */}
            <div className="no-drag flex items-center gap-1 h-full pr-2">
                <button
                    type="button"
                    onClick={toggleTheme}
                    title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                    aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                    className={iconBtn}
                >
                    {theme === "dark" ? <MdOutlineLightMode size={16} /> : <MdOutlineDarkMode size={16} />}
                </button>

                <div className="relative h-full flex items-center" data-menu="user">
                    <button
                        type="button"
                        aria-haspopup="menu"
                        aria-expanded={openMenu === "user"}
                        onClick={() => setOpenMenu(openMenu === "user" ? null : "user")}
                        className={`btn no-drag h-8 pl-1 pr-2 flex items-center gap-2 rounded-md transition-colors ${openMenu === "user"
                            ? "bg-slate-100 dark:bg-slate-800"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                    >
                        <span className="h-6 w-6 rounded-full bg-blue-600 text-white text-[10px] font-semibold flex items-center justify-center ring-2 ring-white dark:ring-slate-950">
                            {initials(user?.name)}
                        </span>
                        <span className="hidden md:block max-w-[120px] truncate text-xs font-medium capitalize text-slate-700 dark:text-slate-200">
                            {user?.name}
                        </span>
                        <AiOutlineDown className={`text-[10px] text-slate-400 transition-transform ${openMenu === "user" ? "rotate-180" : ""}`} />
                    </button>

                    {openMenu === "user" && (
                        <div role="menu" aria-label="Account" onKeyDown={onMenuKeyDown} className={`${panelCls} right-0 top-full w-64`}>
                            <div className="flex items-center gap-3 px-2.5 py-2.5 mb-1 border-b border-slate-100 dark:border-slate-700">
                                <span className="h-9 w-9 shrink-0 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center">
                                    {initials(user?.name)}
                                </span>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold capitalize truncate text-slate-900 dark:text-white">{user?.name}</p>
                                    <p className="text-[11px] truncate text-slate-500 dark:text-slate-400">{user?.email || user?.username || "Signed in"}</p>
                                </div>
                            </div>
                            <MenuItems
                                onDone={close}
                                items={[
                                    { label: "Profile", icon: <AiOutlineUser />, onSelect: () => navigate("/profile") },
                                    { label: "Change password", icon: <AiOutlineLock />, onSelect: () => navigate("/change-password") },
                                    { label: "Settings", icon: <AiOutlineSetting />, onSelect: () => navigate("/settings") },
                                    { separator: true },
                                    { label: "Sign out", icon: <AiOutlineLogout />, danger: true, onSelect: handleSignOut },
                                ]}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Window controls (Windows style) */}
            <div className="no-drag flex items-stretch h-full border-l border-slate-200 dark:border-slate-800">
                <button type="button" title="Minimize" aria-label="Minimize" onClick={() => window.api?.minimize()}
                    className={`${winBtn} hover:bg-slate-100 dark:hover:bg-slate-800`}>
                    <VscChromeMinimize size={15} />
                </button>
                <button type="button" title={maximized ? "Restore down" : "Maximize"} aria-label={maximized ? "Restore down" : "Maximize"}
                    onClick={() => window.api?.maximize()}
                    className={`${winBtn} hover:bg-slate-100 dark:hover:bg-slate-800`}>
                    {maximized ? <VscChromeRestore size={14} /> : <VscChromeMaximize size={14} />}
                </button>
                <button type="button" title="Close" aria-label="Close" onClick={() => window.api?.close()}
                    className={`${winBtn} hover:bg-[#e81123] hover:text-white dark:hover:bg-[#e81123]`}>
                    <VscChromeClose size={15} />
                </button>
            </div>
        </header>
    );
};

export default Header;
