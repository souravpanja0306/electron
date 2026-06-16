const moment = require("moment");
const { inrToWords } = require("./InWordConverter");

exports.generateInvoiceHtml = ({ invoice, company }) => {
    const items = invoice.data || [];

    let itemsHtml = items.map((item, index) => `
        <tr>
            <td style="text-align:center;">${index + 1}</td>
            <td>${item.description || '--'}</td>
            <td style="text-align:center;">${item.hsn || '--'}</td>
            <td style="text-align:right;">${item.quantity || '0'}</td>
            <td style="text-align:right;">${item.rate || '0.00'}</td>
            <td style="text-align:right;">${(item.quantity * item.rate).toFixed(2)}</td>
        </tr>
    `).join('');

    const emptyRowsCount = Math.max(0, 8 - items.length);
    for (let i = 0; i < emptyRowsCount; i++) {
        itemsHtml += `<tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>`;
    }

    const formattedDate = invoice.invoice_date
        ? moment(invoice.invoice_date).format('DD MMM YYYY')
        : '--';

    const grandTotal = (invoice.total_amount || 0)
        + (invoice.total_cgst || 0)
        + (invoice.total_sgst || 0)
        + (invoice.total_igst || 0);

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Tax Invoice : ${invoice.invoice_no || ''}</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'DM Sans', Arial, sans-serif;
            font-size: 11px;
            background: #fff;
            color: #000;
            padding: 16px;
        }

        .page { width: 100%; border: 2px solid #000; }

        /* ── PRINT BUTTON ── */
        .print-btn {
            display: block;
            margin: 0 auto 12px auto;
            padding: 8px 28px;
            background: #000;
            color: #fff;
            font-family: 'Outfit', Arial, sans-serif;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            border: none;
            cursor: pointer;
        }
        .print-btn:hover { background: #333; }

        /* ── HEADER ── */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: stretch;
            border-bottom: 2px solid #000;
        }
        .header-left { padding: 12px 16px; flex: 1; border-right: 1px solid #000; }
        .company-name {
            font-family: 'Outfit', Arial, sans-serif;
            font-size: 20px;
            font-weight: 800;
            letter-spacing: 3px;
            text-transform: uppercase;
        }
        .company-sub { font-size: 10px; margin-top: 2px; line-height: 1.6; }
        .header-right {
            padding: 12px 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 180px;
        }

        /* ── TITLE ROW ── */
        .title-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px 14px;
            background: #f0f0f0;
            border-bottom: 1px solid #000;
        }
        .doc-title {
            font-family: 'Outfit', Arial, sans-serif;
            font-size: 13px;
            font-weight: 800;
            letter-spacing: 2px;
            text-transform: uppercase;
        }
        .inv-meta { font-size: 11px; }
        .inv-meta span {
            font-family: 'Outfit', Arial, sans-serif;
            font-size: 13px;
            font-weight: 700;
        }

        /* ── INFO GRID ── */
        .info-table { width: 100%; border-collapse: collapse; }
        .info-table td {
            border: 1px solid #000;
            padding: 8px 12px;
            vertical-align: top;
            font-size: 10.5px;
            line-height: 1.7;
        }
        .info-table td.shaded { background: #f5f5f5; }
        .lbl {
            display: block;
            font-family: 'Outfit', Arial, sans-serif;
            font-size: 8px;
            font-weight: 700;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            border-bottom: 1px solid #ccc;
            margin-bottom: 5px;
            padding-bottom: 3px;
        }

        /* ── ITEMS TABLE ── */
        table.items { width: 100%; border-collapse: collapse; }
        table.items th {
            border: 1px solid #000;
            padding: 6px 8px;
            background: #e8e8e8;
            font-family: 'Outfit', Arial, sans-serif;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.3px;
        }
        table.items td {
            border-left: 1px solid #000;
            border-right: 1px solid #000;
            border-bottom: 1px solid #ddd;
            padding: 4px 8px;
            font-size: 10.5px;
            height: 22px;
        }
        table.items tbody tr:nth-child(even) td { background: #fafafa; }
        table.items tfoot td {
            background: #ebebeb;
            font-family: 'Outfit', Arial, sans-serif;
            font-weight: 700;
            font-size: 11px;
            border-top: 2px solid #000;
            border: 1px solid #000;
        }

        /* ── SUMMARY ── */
        .summary-wrap {
            display: flex;
            border-top: 1px solid #000;
            border-bottom: 1px solid #000;
        }
        .amount-words {
            flex: 1;
            border-right: 1px solid #000;
            padding: 9px 12px;
            font-size: 10.5px;
            line-height: 1.7;
        }
        .tax-table { width: 220px; border-collapse: collapse; }
        .tax-table td {
            border-bottom: 1px solid #ddd;
            padding: 5px 10px;
            font-size: 10.5px;
        }
        .tax-table td:last-child { text-align: right; }
        .tax-table tr.grand td {
            font-family: 'Outfit', Arial, sans-serif;
            font-weight: 700;
            font-size: 11px;
            background: #ebebeb;
            border-top: 2px solid #000;
            border-bottom: 1px solid #000;
        }

        /* ── FOOTER ── */
        .footer {
            display: flex;
            border-top: 2px solid #000;
            background: #fafafa;
        }
        .bank-col {
            flex: 1;
            border-right: 1px solid #000;
            padding: 10px 14px;
            font-size: 10.5px;
            line-height: 1.8;
        }
        .sig-col {
            width: 220px;
            padding: 10px 14px;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            align-items: flex-end;
            text-align: right;
        }
        .for-company { font-size: 10px; color: #444; }
        .sig-line {
            border-top: 1px solid #000;
            margin-top: 38px;
            padding-top: 4px;
            font-family: 'Outfit', Arial, sans-serif;
            font-size: 9.5px;
            font-weight: 700;
            letter-spacing: 0.5px;
            display: inline-block;
        }
        .footer-note {
            text-align: center;
            font-size: 9px;
            color: #555;
            font-style: italic;
            padding: 6px;
            border-top: 1px solid #ddd;
        }

        @media print {
            body { padding: 0; }
            .print-btn { display: none; }
        }
    </style>
</head>
<body>
<button class="print-btn" onclick="window.print()">🖨 Print Invoice</button>
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
            ? `<img src="http://localhost:3001/uploads/company/${company.logo}" alt="Logo" style="max-height:70px; max-width:160px; object-fit:contain;" />`
            : `<div style="width:160px; height:70px; border:1px dashed #aaa; display:flex; align-items:center; justify-content:center; font-size:9px; color:#aaa; text-align:center;">LOGO<br/>160×70</div>`
        }
        </div>
    </div>

    <!-- TITLE ROW -->
    <div class="title-row">
        <div class="doc-title">Tax Invoice</div>
        <div class="inv-meta">
            Invoice No: <span>${invoice.invoice_no || '--'}</span>
            &nbsp;&nbsp; Date: <span>${formattedDate}</span>
        </div>
    </div>

    <!-- BILL TO / SHIP TO / DISPATCH -->
    <table class="info-table">
        <tr>
            <td style="width:33.33%;">
                <span class="lbl">Bill To</span>
                <strong>${invoice.party_id?.company_name || '--'}</strong><br/>
                ${invoice.party_id?.address_1 || '--'}<br/>
                ${invoice.party_id?.city || ''} ${invoice.party_id?.pincode || ''}<br/>
                GSTIN: ${invoice.party_id?.gst || '--'}
            </td>
            <td style="width:33.33%;">
                <span class="lbl">Ship To</span>
                <strong>${invoice.party_id?.company_name || '--'}</strong><br/>
                ${invoice.party_id?.address_1 || '--'}<br/>
                ${invoice.party_id?.city || ''} ${invoice.party_id?.pincode || ''}<br/>
                GSTIN: ${invoice.party_id?.gst || '--'}
            </td>
            <td style="width:33.33%;" class="shaded">
                <span class="lbl">Dispatch Details</span>
                Place of Supply: <strong>${invoice.placeOfSupply || '--'}</strong><br/>
                Transporter: ${invoice.transporter || '--'}<br/>
                Vehicle No: ${invoice.lorry_no || '--'}
            </td>
        </tr>
    </table>

    <!-- ITEMS TABLE -->
    <table class="items">
        <thead>
            <tr>
                <th style="width:30px;">Sl.</th>
                <th>Description of Goods</th>
                <th style="width:65px;">HSN/SAC</th>
                <th style="width:50px; text-align:right;">Qty</th>
                <th style="width:80px; text-align:right;">Rate</th>
                <th style="width:90px; text-align:right;">Amount</th>
            </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
            <tr>
                <td colspan="3" style="text-align:right; padding:5px 10px;">Total</td>
                <td style="text-align:right; padding:5px 10px;">${invoice.total_quantity || '0'}</td>
                <td></td>
                <td style="text-align:right; padding:5px 10px;">${(invoice.total_amount || 0).toFixed(2)}</td>
            </tr>
        </tfoot>
    </table>

    <!-- SUMMARY -->
    <div class="summary-wrap">
        <div class="amount-words">
            <span class="lbl">Amount in Words</span>
            ${inrToWords(Math.round(grandTotal))}

            <div class="bank-details" style="margin-top:15px;">
                <span class="lbl">Bank Details</span>
                Bank: <strong>${company.bank || '--'}</strong><br/>
                A/c No: <strong>${company.account_no || '--'}</strong><br/>
                IFSC: <strong>${company.ifse || '--'}</strong><br/>
                Branch: ${company.branch || '--'}
            </div>
        </div>
        <table class="tax-table">
            <tr><td>Total Before Tax</td><td>${(invoice.total_amount || 0).toFixed(2)}</td></tr>
            <tr><td>Add: CGST</td><td>${(invoice.total_cgst || 0).toFixed(2)}</td></tr>
            <tr><td>Add: SGST</td><td>${(invoice.total_sgst || 0).toFixed(2)}</td></tr>
            <tr><td>Add: IGST</td><td>${(invoice.total_igst || 0).toFixed(2)}</td></tr>
            <tr class="grand">
                <td>Grand Total</td>
                <td>${grandTotal.toFixed(2)}</td>
            </tr>
        </table>
    </div>

    <!-- FOOTER -->
    <div class="footer">
        <div class="bank-col">
           <td style="width:50%; background:#f5f5f5;">
                <span class="lbl">Remarks / Note</span>
                    Goods are transported at owner's risk. Claims for damage or shortage must be reported at the time of delivery. This is not a tax invoice. Subject to City jurisdiction only.
            </td>
        </div>
        <div class="sig-col">
            <span class="for-company">For <strong>${company.company_name || 'Your Company Name'}</strong></span>
            <span class="sig-line">Authorised Signatory</span>
        </div>
    </div>
    <div class="footer-note">This is a computer generated invoice.</div>

</div>
</body>
</html>`;
};