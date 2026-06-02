const moment = require("moment");
const { inrToWords } = require("./InWordConverter");

exports.generateMoneyReceiptHtml = ({ receipt, company, party }) => {
    const items = receipt.data || [];
    
    let itemsHtml = items.map((item, index) => `
        <tr>
            <td style="text-align:center; border: 1px solid #000; padding: 6px;">${index + 1}</td>
            <td style="border: 1px solid #000; padding: 6px;">${item.description || ''}</td>
            <td style="text-align:right; border: 1px solid #000; padding: 6px;">${parseFloat(item.amount || 0).toFixed(2)}</td>
        </tr>
    `).join('');

    // Add empty rows to fill space
    const emptyRowsCount = Math.max(0, 5 - items.length);
    for (let i = 0; i < emptyRowsCount; i++) {
        itemsHtml += `<tr><td style="border: 1px solid #000; height: 25px;"></td><td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td></tr>`;
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
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'DM Sans', Arial, sans-serif;
            font-size: 11px;
            background: #fff;
            color: #000;
            padding: 20px;
        }
        .page {
            width: 100%;
            border: 2px solid #000;
            margin: auto;
            max-width: 800px;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: stretch;
            border-bottom: 2px solid #000;
        }
        .header-left {
            padding: 15px;
            flex: 1;
            border-right: 1px solid #000;
        }
        .company-name {
            font-family: 'Outfit', Arial, sans-serif;
            font-size: 22px;
            font-weight: 800;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .company-sub { font-size: 11px; margin-top: 2px; line-height: 1.5; }
        .header-right {
            padding: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 200px;
        }
        .title-row {
            text-align: center;
            padding: 8px;
            background: #f0f0f0;
            border-bottom: 1px solid #000;
            font-family: 'Outfit', Arial, sans-serif;
            font-size: 14px;
            font-weight: 800;
            letter-spacing: 3px;
            text-transform: uppercase;
        }
        .meta-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 15px;
            border-bottom: 1px solid #000;
            font-size: 12px;
        }
        .info-table { width: 100%; border-collapse: collapse; }
        .info-table td {
            border-bottom: 1px solid #000;
            padding: 12px 15px;
            vertical-align: top;
            width: 50%;
        }
        .info-table td:first-child { border-right: 1px solid #000; }
        .lbl {
            display: block;
            font-family: 'Outfit', Arial, sans-serif;
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
            color: #555;
            margin-bottom: 5px;
        }
        table.items { width: 100%; border-collapse: collapse; }
        table.items th {
            border: 1px solid #000;
            padding: 8px;
            background: #e8e8e8;
            font-family: 'Outfit', Arial, sans-serif;
            font-size: 11px;
            font-weight: 700;
        }
        table.items td {
            border: 1px solid #000;
            padding: 6px 8px;
            font-size: 11px;
        }
        .total-row {
            border-top: 2px solid #000;
            padding: 10px 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f9f9f9;
        }
        .amount-words {
            padding: 10px 15px;
            border-bottom: 1px solid #000;
            font-style: italic;
            font-size: 11px;
        }
        .footer {
            padding: 15px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }
        .sig-box {
            text-align: center;
            width: 200px;
        }
        .sig-line {
            border-top: 1px solid #000;
            margin-top: 50px;
            padding-top: 5px;
            font-weight: 700;
            font-size: 10px;
        }
        .print-btn {
            display: block;
            margin: 20px auto;
            padding: 10px 30px;
            background: #000;
            color: #fff;
            font-family: 'Outfit', Arial, sans-serif;
            font-weight: 700;
            text-transform: uppercase;
            border: none;
            cursor: pointer;
        }
        @media print { .print-btn { display: none; } body { padding: 0; } }
    </style>
</head>
<body>
    <button class="print-btn" onclick="window.print()">Print Receipt</button>
    <div class="page">
        <div class="header">
            <div class="header-left">
                <div class="company-name">${company.company_name || 'Your Company Name'}</div>
                <div class="company-sub">${company.address_1 || ''}${company.address_2 ? ', ' + company.address_2 : ''}</div>
                <div class="company-sub">${company.city || ''}${company.state ? ', ' + company.state : ''} – ${company.pincode || ''}</div>
                <div class="company-sub">Mobile: ${company.mobile || ''} | Email: ${company.email || ''}</div>
                ${company.gst ? `<div class="company-sub">GSTIN: <strong>${company.gst}</strong></div>` : ''}
            </div>
            <div class="header-right">
                ${company.logo ? `<img src="${company.logo}" style="max-height:80px; max-width:180px;" />` : 'LOGO'}
            </div>
        </div>
        
        <div class="title-row">Money Receipt</div>
        
        <div class="meta-row">
            <div>Receipt No: <strong>${receipt.receipt_no || '--'}</strong></div>
            <div>Date: <strong>${formattedDate}</strong></div>
        </div>
        
        <table class="info-table">
            <tr>
                <td>
                    <span class="lbl">Received From</span>
                    <strong style="font-size: 13px;">${party.company_name || '--'}</strong><br/>
                    ${party.address_1 || '--'}<br/>
                    ${party.city || ''} ${party.pincode || ''}<br/>
                    GSTIN: ${party.gst || '--'}
                </td>
                <td>
                    <span class="lbl">Remarks</span>
                    ${receipt.remarks || '--'}
                </td>
            </tr>
        </table>
        
        <table class="items">
            <thead>
                <tr>
                    <th style="width: 50px;">Sl.</th>
                    <th>Particulars / Description</th>
                    <th style="width: 150px; text-align: right;">Amount (₹)</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
        </table>
        
        <div class="total-row">
            <div style="font-size: 12px; font-weight: 700;">Total Received</div>
            <div style="font-size: 16px; font-weight: 800;">₹ ${totalAmount.toFixed(2)}</div>
        </div>
        
        <div class="amount-words">
            <strong>Amount in Words:</strong> ${amountInWords}
        </div>
        
        <div class="footer">
            <div class="sig-box">
                <div class="sig-line">Payer's Signature</div>
            </div>
            <div class="sig-box">
                <div style="margin-bottom: 10px;">For <strong>${company.company_name || 'Your Company Name'}</strong></div>
                <div class="sig-line">Authorised Signatory</div>
            </div>
        </div>
    </div>
</body>
</html>`;
};
