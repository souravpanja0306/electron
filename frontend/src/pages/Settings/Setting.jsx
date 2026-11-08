import React from 'react'
import { toast } from 'sonner';
import { AiOutlineCheckCircle } from 'react-icons/ai';

// Components...
import PageTitle from '../../components/PageTitle';
import { SettingsPanel, SettingsSection } from '../../components/SettingsKit';

// Stores...
import useThemeStore from '../../store/ThemeStore';

const THEMES = [
    { id: "light", label: "Light", description: "Bright surfaces, best in daylight." },
    { id: "dark", label: "Dark", description: "Dim surfaces, easier on the eyes at night." },
];

// A miniature of the app shell in the given theme.
const ThemePreview = ({ dark }) => (
    <div className={`h-24 w-full rounded-md overflow-hidden border ${dark ? "bg-slate-900 border-slate-700" : "bg-slate-100 border-slate-200"}`} aria-hidden="true">
        <div className={`h-3 ${dark ? "bg-slate-950" : "bg-white"} border-b ${dark ? "border-slate-800" : "border-slate-200"}`} />
        <div className="flex h-[calc(100%-0.75rem)]">
            <div className={`w-5 ${dark ? "bg-slate-950" : "bg-white"} flex flex-col items-center gap-1 pt-1`}>
                <span className="h-2 w-2 rounded-sm bg-blue-600" />
                <span className={`h-2 w-2 rounded-sm ${dark ? "bg-slate-700" : "bg-slate-200"}`} />
            </div>
            <div className={`w-10 ${dark ? "bg-slate-900" : "bg-slate-50"} border-r ${dark ? "border-slate-800" : "border-slate-200"} p-1 space-y-1`}>
                <span className="block h-1.5 rounded bg-blue-500/40" />
                <span className={`block h-1.5 rounded ${dark ? "bg-slate-700" : "bg-slate-200"}`} />
                <span className={`block h-1.5 rounded ${dark ? "bg-slate-700" : "bg-slate-200"}`} />
            </div>
            <div className="flex-1 p-1.5 space-y-1">
                <div className={`h-4 rounded ${dark ? "bg-slate-800" : "bg-white"} border ${dark ? "border-slate-700" : "border-slate-200"}`} />
                <div className={`h-9 rounded ${dark ? "bg-slate-800" : "bg-white"} border ${dark ? "border-slate-700" : "border-slate-200"} p-1 space-y-1`}>
                    <span className={`block h-1 w-3/4 rounded ${dark ? "bg-slate-600" : "bg-slate-200"}`} />
                    <span className={`block h-1 w-1/2 rounded ${dark ? "bg-slate-600" : "bg-slate-200"}`} />
                    <span className="block h-1.5 w-6 rounded bg-blue-600" />
                </div>
            </div>
        </div>
    </div>
);

const SHORTCUTS = [
    ["Ctrl + N", "New record (on list and form pages)"],
    ["Ctrl + S", "Save the current form"],
    ["Ctrl + E", "Edit the selected row"],
    ["Ctrl + D", "Delete the selected row"],
    ["Ctrl + P", "Print the selected document"],
    ["Ctrl + I", "Open the list for the current form"],
    ["Ctrl + F", "Open filters and search"],
    ["Ctrl + R", "Reload the app"],
    ["Enter", "Move to the next field in a form"],
    ["Esc", "Close menus, pickers and the filter drawer"],
];

const Kbd = ({ children }) => (
    <kbd className="inline-flex items-center h-6 px-2 rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 font-mono text-[11px] font-medium text-slate-700 dark:text-slate-200 shadow-[inset_0_-1px_0] shadow-slate-300 dark:shadow-slate-700">
        {children}
    </kbd>
);

const Setting = () => {
    const { theme, saveTheme } = useThemeStore();

    const changeTheme = async (next) => {
        if (next === theme) return;
        try {
            await saveTheme(next);
            toast.success(`${next === "dark" ? "Dark" : "Light"} theme applied.`);
        } catch (error) {
            console.log(error);
            toast.error("Could not save the theme. Please try again.");
        };
    };

    return (
        <div className='flex flex-col gap-1'>
            <PageTitle>General Settings</PageTitle>
            <SettingsPanel>
                <SettingsSection title="Appearance" description="Choose how MyERP looks. Saved to your account, so it follows you on sign-in.">
                    <div role="radiogroup" aria-label="Theme" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {THEMES.map((option) => {
                            const active = theme === option.id || (option.id === "light" && theme !== "dark");
                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    role="radio"
                                    aria-checked={active}
                                    onClick={() => changeTheme(option.id)}
                                    className={`relative text-left rounded-lg border-2 p-2 transition-colors ${active
                                        ? "border-blue-600 bg-blue-50/50 dark:bg-blue-500/10"
                                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"}`}
                                >
                                    <ThemePreview dark={option.id === "dark"} />
                                    <div className="flex items-start justify-between gap-2 px-1 pt-2">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{option.label}</p>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{option.description}</p>
                                        </div>
                                        {active && <AiOutlineCheckCircle className="shrink-0 text-lg text-blue-600 dark:text-blue-400" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </SettingsSection>

                <SettingsSection title="Keyboard shortcuts" description="Work faster without the mouse. Shortcuts apply on the pages that support the action.">
                    <div className="rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <table className="w-full text-sm">
                            <tbody>
                                {SHORTCUTS.map(([keys, action]) => (
                                    <tr key={keys} className="border-b last:border-b-0 border-slate-100 dark:border-slate-700/70">
                                        <td className="px-3 py-2 w-32 whitespace-nowrap"><Kbd>{keys}</Kbd></td>
                                        <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{action}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </SettingsSection>
            </SettingsPanel>
        </div>
    )
}

export default Setting
