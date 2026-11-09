const moment = require("moment");
const { inrToWords } = require("./InWordConverter");
const { esc, escObj, multiline, money, uploadUrl } = require("./html");
const { INVOICE_STYLES } = require("./generateInvoiceHtml");

const TITLES = { credit: "Credit Note", debit: "Debit Note" };

const fmtDate = (value) => (value ? moment(value).format("DD MMM YYYY") : "--");

// Same layout and stylesheet as the tax invoice. Every text value is HTML-escaped.
module.exports.generateNoteHtml = ({ note: rawNote, invoice: rawInvoice, company: rawCompany }) => {
    const note = { ...escObj(rawNote), party_id: escObj(rawNote.party_id) };
    const invoice = rawInvoice ? escObj(rawInvoice) : null;
    const company = escObj(rawCompany);
    const logoSrc = esc(uploadUrl("company", rawCompany?.logo));
    const items = (rawNote.data || []).map(escObj);
    const title = TITLES[rawNote.note_type] || "Note";
    const isCredit = rawNote.note_type === "credit";

    let itemsHtml = items.map((item, index) => `
        <tr>
            <td style="text-align:center;">${index + 1}</td>
            <td>${item.description || '--'}</td>
            <td style="text-align:center;">${item.hsn || '--'}</td>
            <td style="text-align:right;">${Number(item.quantity) || 0}</td>
            <td style="text-align:right;">${money(item.rate)}</td>
            <td style="text-align:right;">${Number(item.gst) || 0}%</td>
            <td style="text-align:right;">${money((Number(item.quantity) || 0) * (Number(item.rate) || 0))}</td>
        </tr>
    `).join('');
    for (let i = items.length; i < 6; i++) {
        itemsHtml += `<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>`;
    }

    const grandTotal = Math.round(((Number(rawNote.total_amount) || 0)
        + (Number(rawNote.total_cgst) || 0)
        + (Number(rawNote.total_sgst) || 0)
        + (Number(rawNote.total_igst) || 0)) * 100) / 100;

    const party = note.party_id || {};

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title} : ${note.note_no || ''}</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">
    <style>${INVOICE_STYLES}</style>
</head>
<body>
<button class="print-btn" onclick="window.print()">Print</button>
<div class="page">

    <!-- HEADER -->
    <div class="header">
        <div class="header-left">
            <div class="company-name">${company.company_name || 'Your Company Name'}</div>
            <div class="company-sub">${company.address_1 || ''}${company.address_2 ? ', ' + company.address_2 : ''}</div>
            <div class="company-sub">${company.city || ''}${company.state ? ', ' + company.state : ''} – ${company.pincode || ''}</div>
            <div class="company-sub">Mobile: ${company.mobile || ''} &nbsp;|&nbsp; Email: ${company.email || ''}</div>
            ${company.gst ? `<div class="company-sub">GSTIN: <strong>${company.gst}</strong></div>` : ''}
        </div>
        <div class="header-right">
            ${company.logo
            ? `<img src="${logoSrc}" alt="Logo" style="max-height:70px; max-width:160px; object-fit:contain;" />`
            : `<div style="width:160px; height:70px; border:1px dashed #aaa; display:flex; align-items:center; justify-content:center; font-size:9px; color:#aaa; text-align:center;">LOGO<br/>160×70</div>`
        }
        </div>
    </div>

    <!-- TITLE ROW -->
    <div class="title-row">
        <div class="doc-title">${title}</div>
        <div class="inv-meta">
            ${isCredit ? 'Credit' : 'Debit'} Note No: <span>${note.note_no || '--'}</span>
            &nbsp;&nbsp; Date: <span>${fmtDate(rawNote.note_date)}</span>
        </div>
    </div>

    <!-- PARTY / ORIGINAL INVOICE / REASON -->
    <table class="info-table">
        <tr>
            <td style="width:40%;">
                <span class="lbl">Issued To</span>
                <strong>${party.company_name || '--'}</strong><br/>
                ${party.address_1 || '--'}<br/>
                ${party.city || ''} ${party.pincode || ''}<br/>
                GSTIN: ${party.gst || '--'}
            </td>
            <td style="width:25%;">
                <span class="lbl">Original Invoice</span>
                Invoice No: <strong>${invoice?.invoice_no || '--'}</strong><br/>
                Invoice Date: ${fmtDate(rawInvoice?.invoice_date)}<br/>
                Place of Supply: ${note.placeOfSupply || '--'}
            </td>
            <td style="width:35%;" class="shaded">
                <span class="lbl">Reason</span>
                ${multiline(rawNote.reason) || '--'}
            </td>
        </tr>
    </table>

    <!-- ITEMS TABLE -->
    <table class="items">
        <thead>
            <tr>
                <th style="width:30px;">Sl.</th>
                <th>Description</th>
                <th style="width:65px;">HSN/SAC</th>
                <th style="width:50px; text-align:right;">Qty</th>
                <th style="width:80px; text-align:right;">Rate</th>
                <th style="width:50px; text-align:right;">GST</th>
                <th style="width:90px; text-align:right;">Amount</th>
            </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
            <tr>
                <td colspan="3" style="text-align:right; padding:5px 10px;">Total</td>
                <td style="text-align:right; padding:5px 10px;">${Number(rawNote.total_quantity) || 0}</td>
                <td></td>
                <td></td>
                <td style="text-align:right; padding:5px 10px;">${money(rawNote.total_amount)}</td>
            </tr>
        </tfoot>
    </table>

    <!-- SUMMARY -->
    <div class="summary-wrap">
        <div class="amount-words">
            <span class="lbl">Amount in Words</span>
            ${inrToWords(grandTotal)}
            <div style="margin-top:15px;">
                <span class="lbl">Note</span>
                ${isCredit
            ? 'The amount above has been credited to your account and will be adjusted against your outstanding balance.'
            : 'The amount above has been debited to your account and is payable along with your outstanding balance.'}
            </div>
        </div>
        <table class="tax-table">
            <tr><td>Total Before Tax</td><td>${money(rawNote.total_amount)}</td></tr>
            ${Number(rawNote.total_igst) ? `<tr><td>IGST</td><td>${money(rawNote.total_igst)}</td></tr>` : `
            <tr><td>CGST</td><td>${money(rawNote.total_cgst)}</td></tr>
            <tr><td>SGST</td><td>${money(rawNote.total_sgst)}</td></tr>`}
            <tr class="grand">
                <td>Total ${isCredit ? 'Credit' : 'Debit'}</td>
                <td>${money(grandTotal)}</td>
            </tr>
        </table>
    </div>

    <!-- FOOTER -->
    <div class="footer">
        <div class="bank-col"></div>
        <div class="sig-col">
            <span class="for-company">For <strong>${company.company_name || 'Your Company Name'}</strong></span>
            <span class="sig-line">Authorised Signatory</span>
        </div>
    </div>
    <div class="footer-note">This is a computer generated ${title.toLowerCase()}.</div>

</div>
</body>
</html>`;
};
