// Number / currency formatting shared by the challan, invoice and receipt pages.

export const formatNumber = (value, maxDigits = 2) =>
    (Number(value) || 0).toLocaleString("en-IN", { maximumFractionDigits: maxDigits });

// "₹ 1,23,456.00"
export const formatINR = (value) =>
    `₹ ${(Number(value) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Opens the server-rendered HTML in a new window for printing.
// Returns false when the window could not be opened (pop-up blocked).
export const openPrintWindow = (html) => {
    const win = window.open();
    if (!win) return false;
    win.document.write(html);
    win.document.close();
    return true;
};

// Pulls the most useful message out of an axios error.
export const errorMessage = (error, fallback = "Something went wrong!") =>
    error?.response?.data?.message || error?.message || fallback;
