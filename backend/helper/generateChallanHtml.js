const moment = require("moment");

exports.generateChallanHtml = ({ challan, company }) => {
    const items = challan.data || [];

    let itemsHtml = items.map((item, index) => `
        <tr>
            <td style="text-align:center;">${index + 1}</td>
            <td style="text-align:center;">${item.packages || ''}</td>
            <td>${item.description || ''}</td>
            <td style="text-align:right;">${item.weight || ''}</td>
            <td style="text-align:right;">${item.amount || ''}</td>
        </tr>
    `).join('');

    const emptyRowsCount = Math.max(0, 10 - items.length);
    for (let i = 0; i < emptyRowsCount; i++) {
        itemsHtml += `<tr><td></td><td></td><td></td><td></td><td></td></tr>`;
    }

    const totalPackages = items.reduce((s, i) => s + (Number(i.packages) || 0), 0);
    const totalWeight = items.reduce((s, i) => s + (Number(i.weight) || 0), 0).toFixed(2);
    const totalAmount = challan.total_amount || 0;

    const formattedDate = challan.date
        ? moment(challan.date).format('DD MMM YYYY')
        : '--';

    return `<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Delivery Challan : ${challan.cn_no || ''}</title>
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
            // border-bottom: 1px solid #000;
        }

        .doc-title {
            font-family: 'Outfit', Arial, sans-serif;
            font-size: 13px;
            font-weight: 800;
            letter-spacing: 2px;
            text-transform: uppercase;
        }

        .cn-meta {
            font-size: 11px;
        }

        .cn-meta span {
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

        .info-table td.shaded {
            background: #f5f5f5;
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

        /* ── ROUTE BAR ── */
        .route-bar {
            display: flex;
            gap: 30px;
            align-items: center;
            padding: 6px 14px;
            background: #f8f8f8;
            border-bottom: 1px solid #000;
            border-top: 1px solid #000;
            font-size: 10.5px;
        }

        .route-bar strong {
            font-size: 11.5px;
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

        table.items tfoot td {
            background: #ebebeb;
            font-family: 'Outfit', Arial, sans-serif;
            font-weight: 700;
            font-size: 11px;
            border-top: 2px solid #000;
        }

        /* ── NOTE ── */
        .note-row {
            border-top: 1px solid #000;
        }

        .note-row td {
            border: 1px solid #000;
            padding: 8px 12px;
            font-size: 10.5px;
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
            width: 33%;
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

        .title-row {
    border-bottom: 1px solid #000;  /* ADD this, remove the commented-out line */
}

/* 2. Remove redundant double-border on route-bar — 
   info-table's last row already has border-bottom */
.route-bar {
    border-bottom: 1px solid #000;
    border-top: none;  /* REMOVE top border — info-table provides it */
}

        .footer-note {
            text-align: center;
            font-size: 9px;
            color: #555;
            font-style: italic;
            margin-top: 10px;
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

        .print-btn:hover {
            background: #333;
        }

        @media print {
            body {
                padding: 0;
            }

            .page {
                border: 1.5px solid #000;
            }

            .print-btn {
                display: none;
            }
        }
    </style>
</head>

<body>
    <button class="print-btn" onclick="window.print()">Print</button>
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
                ${company.logo ? `<img src="${company.logo}" alt="Logo"
                    style="max-height:70px; max-width:160px; object-fit:contain;" />` : `<div
                    style="width:160px; height:70px; border:1px dashed #aaa; display:flex; align-items:center; justify-content:center; font-size:9px; color:#aaa; text-align:center;">
                    LOGO<br />160×70</div>`}
            </div>
        </div>

        <!-- TITLE ROW -->
        <div class="title-row">
            <div class="doc-title">Consignment Note</div>
            <div class="cn-meta">
                C/N No: <span>${challan.cn_no || '--'}</span>
                &nbsp;&nbsp; Date: <span>${formattedDate}</span>
            </div>
        </div>

        <!-- CONSIGNOR / CONSIGNEE / DETAILS -->
        <table class="info-table">
            <tr>
                <td>
                    <span class="lbl">Consignor</span>
                    <strong>${challan.consignor_id?.company_name || '--'}</strong><br />
                    ${challan.consignor_id?.address_1 || '--'}<br />
                    ${challan.consignor_id?.city || ''} - ${challan.consignor_id?.pincode || ''}<br />
                    GSTIN: ${challan.consignor_id?.gst || '--'}
                </td>
                <td>
                    <span class="lbl">Consignee</span>
                    <strong>${challan.consignee_id?.company_name || '--'}</strong><br />
                    ${challan.consignee_id?.address_1 || '--'}<br />
                    ${challan.consignee_id?.city || ''} - ${challan.consignee_id?.pincode || ''}<br />
                    GSTIN: ${challan.consignee_id?.gst || '--'}
                </td>
            </tr>
            <tr>
                <td>
                    <span class="lbl">Challan Details</span>
                    Invoice No: ${challan.invoice_no || '--'}<br />
                    Truck No: ${challan.truck_no || '--'}<br />
                    Way Bill No: ${challan.way_bill_no || '--'}<br />
                    Way Bill Date: ${challan.way_bill_date || '--'}<br />
                </td>
                <td>
                    <span class="lbl">Additional Details</span>
                    Container No: ${challan.container || '--'}<br />
                    Booking No: ${challan.booking_number || '--'}<br />
                    CHA: ${challan.cha || '--'}<br />
                    ${challan.note || '--'}<br />
                </td>
            </tr>
        </table>

        <!-- ROUTE BAR -->
        <div class="route-bar">
            <span>From: <strong>${challan.from_loc || '--'}</strong></span>
            <span style="font-size:15px;">→</span>
            <span>To: <strong>${challan.to_loc || '--'}</strong></span>
        </div>

        <!-- ITEMS TABLE -->
        <table class="items">
            <thead>
                <tr>
                    <th style="width:38px;">Sl.</th>
                    <th style="width:100px;">No. of Pkgs</th>
                    <th>Particulars of Goods</th>
                    <th style="width:90px; text-align:right;">Weight (KG)</th>
                    <th style="width:100px; text-align:right;">Amount (₹)</th>
                </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot>
                <tr>
                    <td colspan="2" style="text-align:right; padding:5px 10px;">Total</td>
                    <td></td>
                    <td style="text-align:right; padding:5px 10px;">${totalWeight}</td>
                    <td style="text-align:right; padding:5px 10px;">${totalAmount.toFixed(2)}</td>
                </tr>
            </tfoot>
        </table>

        <!-- SUMMARY -->
        <table style="width:100%; border-collapse:collapse;" class="note-row">
            <tr>
                <td style="width:50%;">
                    <span class="lbl">Summary</span>
                    Total Packages: <strong>${totalPackages || '--'}</strong> &nbsp;&nbsp;|&nbsp;&nbsp;
                    Total Weight: <strong>${totalWeight} KG</strong>
                </td>
                <td style="width:50%; background:#f5f5f5;">
                    <span class="lbl">Remarks / Note</span>
                    Goods are transported at owner's risk. Claims for damage or shortage must be reported at the time of delivery. This is not a tax invoice. Subject to City jurisdiction only.
                </td>
            </tr>
        </table>

        <!-- FOOTER -->
        <div class="footer">
            <table class="sig-table">
                <tr>
                    <td><span class="sig-line">Consignee's Signature</span></td>
                    <td><span class="sig-line">Driver's Signature</span></td>
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