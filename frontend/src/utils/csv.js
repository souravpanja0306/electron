// CSV export that opens cleanly in Excel (UTF-8 BOM, CRLF, quoted where needed).

const cell = (value) => {
    if (value === null || value === undefined) return "";
    const text = String(value);
    // Guard against formula injection when the file is opened in a spreadsheet.
    const safe = /^[=+\-@\t\r]/.test(text) && !/^-?\d+(\.\d+)?$/.test(text) ? `'${text}` : text;
    return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

/** columns: [{ label, value: (row) => any }] */
export const toCsv = (columns, rows) =>
    [columns.map((c) => cell(c.label)).join(","), ...rows.map((row) => columns.map((c) => cell(c.value(row))).join(","))].join("\r\n");

export const downloadCsv = (fileName, columns, rows) => {
    const blob = new Blob(["﻿", toCsv(columns, rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
};
