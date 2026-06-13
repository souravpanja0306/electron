const moment = require("moment");
const { inrToWords } = require("./InWordConverter");

exports.generateMoneyReceiptHtml = ({ receipt, company, party }) => {
    const items = receipt.data || [];
    
    let itemsHtml = items.map((item, index) => `
        <tr>
            <td style="text-align:center;">${index + 1}</td>
            <td>${item.description || ''}</td>
            <td style="text-align:right;">${parseFloat(item.amount || 0).toFixed(2)}</td>
        </tr>
    `).join('');

    // Add empty rows to fill space
    const emptyRowsCount = Math.max(0, 10 - items.length);
    for (let i = 0; i < emptyRowsCount; i++) {
        itemsHtml += `<tr><td></td><td></td><td></td></tr>`;
    }

    const totalAmount = parseFloat(receipt.total_value || 0);
    const amountInWords = inrToWords(totalAmount);

    const formattedDate = receipt.receipt_date
        ? moment(receipt.receipt_date).format('DD MMM YYYY')
        : '--';

    return `<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Money Receipt : ${receipt.receipt_no || ''}</title>
    <link
        href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap"
        rel="stylesheet">
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'DM Sans', Arial, sans-serif;
            font-size: 11px;
            background: #fff;
            color: #000;
            padding: 16px;
        }

        .page {
            width: 100%;
            border: 2px solid #000;
        }

        /* ── HEADER ── */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: stretch;
            border-bottom: 2px solid #000;
        }

        .header-left {
            padding: 12px 16px;
            flex: 1;
            border-right: 1px solid #000;
        }

        .company-name {
            font-family: 'Outfit', Arial, sans-serif;
            font-size: 20px;
            font-weight: 800;
            letter-spacing: 3px;
            text-transform: uppercase;
        }

        .company-sub {
            font-size: 10px;
            margin-top: 2px;
            line-height: 1.6;
        }

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

        .meta {
            font-size: 11px;
        }

        .meta span {
            font-family: 'Outfit', Arial, sans-serif;
            font-size: 13px;
            font-weight: 700;
        }

        /* ── INFO GRID ── */
        .info-table {
            width: 100%;
            border-collapse: collapse;
        }

        .info-table td {
            border: 1px solid #000;
            padding: 8px 12px;
            vertical-align: top;
            width: 50%;
            font-size: 10.5px;
            line-height: 1.7;
        }

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
        table.items {
            width: 100%;
            border-collapse: collapse;
        }

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
            padding: 4px 8px;
            font-size: 10.5px;
            height: 22px;
        }

        table.items tbody tr:nth-child(even) td {
            background: #fafafa;
        }

        /* ── TOTAL ROW ── */
        .total-row {
            border-top: 2px solid #000;
            background: #ebebeb;
            display: flex;
            justify-content: space-between;
            padding: 8px 12px;
            font-family: 'Outfit', Arial, sans-serif;
            font-weight: 700;
            font-size: 12px;
        }

        /* ── WORDS ── */
        .words-row {
            border-top: 1px solid #000;
            padding: 8px 12px;
            font-size: 10.5px;
            font-style: italic;
        }

        /* ── FOOTER ── */
        .footer {
            border-top: 2px solid #000;
            padding: 10px 16px 14px;
            background: #fafafa;
        }

        .sig-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 6px;
        }

        .sig-table td {
            padding: 0 8px;
            text-align: center;
            vertical-align: bottom;
            width: 50%;
        }

        .sig-table td:last-child {
            text-align: right;
        }

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

        .print-btn {
            display: block;
            margin: 0 auto 8px auto;
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

        @media print {
            body { padding: 0; }
            .page { border: 1.5px solid #000; }
            .print-btn { display: none; }
        }
    </style>
</head>

<body>
    <button class="print-btn" onclick="window.print()">Print Receipt</button>
    <div class="page">

        <!-- HEADER -->
        <div class="header">
            <div class="header-left">
                <div class="company-name">${company.company_name || 'Your Company Name'}</div>
                <div class="company-sub">${company.address_1 || ''}${company.address_2 ? ', ' + company.address_2 : ''}
                </div>
                <div class="company-sub">${company.city || ''}${company.state ? ', ' + company.state : ''} –
                    ${company.pincode || ''}</div>
                <div class="company-sub">Mobile: ${company.mobile || ''} &nbsp;|&nbsp; Email: ${company.email || ''}
                </div>
                ${company.gst ? `<div class="company-sub">GSTIN: <strong>${company.gst}</strong></div>` : ''}
            </div>
            <div class="header-right">
                ${company.logo ? `<img src="http://localhost:3001/uploads/company/${company.logo}" alt="Logo"
                    style="max-height:70px; max-width:160px; object-fit:contain;" />` : `<div
                    style="width:160px; height:70px; border:1px dashed #aaa; display:flex; align-items:center; justify-content:center; font-size:9px; color:#aaa; text-align:center;">
                    LOGO</div>`}
            </div>
        </div>

        <!-- TITLE ROW -->
        <div class="title-row">
            <div class="doc-title">Money Receipt</div>
            <div class="meta">
                No: <span>${receipt.receipt_no || '--'}</span>
                &nbsp;&nbsp; Date: <span>${formattedDate}</span>
            </div>
        </div>

        <!-- INFO GRID -->
        <table class="info-table">
            <tr>
                <td>
                    <span class="lbl">Received From</span>
                    <strong>${party.company_name || '--'}</strong><br />
                    ${party.address_1 || '--'}<br />
                    ${party.city || ''} - ${party.pincode || ''}<br />
                    GSTIN: ${party.gst || '--'}
                </td>
                <td>
                    <span class="lbl">Payment Details</span>
                    Mode: <strong>${receipt.payment_mode || '--'}</strong><br />
                    Reference: ${receipt.reference || '--'}<br />
                    Remarks: ${receipt.remarks || '--'}
                </td>
            </tr>
        </table>

        <!-- ITEMS TABLE -->
        <table class="items">
            <thead>
                <tr>
                    <th style="width:50px;">Sl.</th>
                    <th>Particulars / Description</th>
                    <th style="width:120px; text-align:right;">Amount (₹)</th>
                </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
        </table>

        <!-- TOTAL ROW -->
        <div class="total-row">
            <span>Total Amount Received</span>
            <span>₹ ${totalAmount.toFixed(2)}</span>
        </div>

        <!-- WORDS ROW -->
        <div class="words-row">
            <strong>Amount in Words:</strong> ${amountInWords}
        </div>

        <!-- FOOTER -->
        <div class="footer">
            <table class="sig-table">
                <tr>
                    <td><span class="sig-line">Payer's Signature</span></td>
                    <td>
                        <span style="font-size:10px;">For <strong>${company.company_name || 'Your Company Name'}</strong></span>
                        <br /><span class="sig-line">Authorised Signatory</span>
                    </td>
                </tr>
            </table>
        </div>
    </div>
</body>
</html>`;
};
