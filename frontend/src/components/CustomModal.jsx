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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2" onClick={onClose}>
            <div
                className={`w-full ${width} rounded-lg bg-white dark:bg-slate-800 shadow-xl`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b p-2 dark:text-slate-300 text-slate-900">
                    <h2 className="text-md font-semibold">{title}</h2>
                    <button onClick={onClose} className="text-xl font-bold hover:text-white p-2 border rounded hover:bg-red-500">
                        <MdOutlineClose size={16} />
                    </button>
                </div>
                <div className="p-2 dark:text-slate-300 text-slate-900">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;