import { MdCropSquare, MdOutlineClose, MdHorizontalRule } from "react-icons/md";

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    width = "max-w-lg",
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/50 backdrop-blur-[1px] p-2" onClick={onClose}>
            <div
                className={`w-full ${width} rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl shadow-slate-950/20`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-slate-100">
                    <h2 className="text-md font-semibold">{title}</h2>
                    <button onClick={onClose} className="text-xl font-bold p-1.5 rounded text-slate-500 dark:text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-700 dark:hover:text-white transition-colors">
                        <MdOutlineClose size={16} />
                    </button>
                </div>
                <div className="p-2 text-slate-700 dark:text-slate-200">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;