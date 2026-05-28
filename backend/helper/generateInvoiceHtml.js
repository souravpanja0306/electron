const moment = require("moment");
const { inrToWords } = require("./InWordConverter"); // Assuming this exists based on frontend/src/utils/InWordConverter.js

exports.generateInvoiceHtml = ({ invoice, company }) => {
    const items = invoice.data || [];
    
    let itemsHtml = items.map((item, index) => `
        <tr>
            <td style="border: 1px solid #000; padding: 4px; text-align: center;">${index + 1}</td>
            <td style="border: 1px solid #000; padding: 4px;">${item.description || '--'}</td>
            <td style="border: 1px solid #000; padding: 4px; text-align: center;">${item.hsn || '--'}</td>
            <td style="border: 1px solid #000; padding: 4px; text-align: right;">${item.quantity || '0'}</td>
            <td style="border: 1px solid #000; padding: 4px; text-align: right;">${item.rate || '0.00'}</td>
            <td style="border: 1px solid #000; padding: 4px; text-align: right;">${(item.quantity * item.rate).toFixed(2)}</td>
        </tr>
    `).join('');

    // Fill empty rows to maintain height
    const emptyRowsCount = Math.max(0, 8 - items.length);
    for(let i=0; i<emptyRowsCount; i++) {
        itemsHtml += `
            <tr>
                <td style="border: 1px solid #000; padding: 4px; height: 20px;"></td>
                <td style="border: 1px solid #000; padding: 4px;"></td>
                <td style="border: 1px solid #000; padding: 4px;"></td>
                <td style="border: 1px solid #000; padding: 4px;"></td>
                <td style="border: 1px solid #000; padding: 4px;"></td>
                <td style="border: 1px solid #000; padding: 4px;"></td>
            </tr>
        `;
    }

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; font-size: 11px; margin: 0; padding: 15px; }
            .container { width: 100%; border: 1px solid #000; padding: 0; box-sizing: border-box; }
            .header { text-align: center; border-bottom: 1px solid #000; padding: 10px; }
            .company-name { font-size: 18px; font-weight: bold; text-transform: uppercase; }
            .title { font-size: 14px; font-weight: bold; padding: 5px; background: #eee; border-bottom: 1px solid #000; text-align: center; }
            .info-table { width: 100%; border-collapse: collapse; }
            .info-table td { border: 1px solid #000; padding: 5px; vertical-align: top; width: 33.33%; }
            .items-table { width: 100%; border-collapse: collapse; }
            .items-table th { border: 1px solid #000; padding: 5px; background-color: #f2f2f2; }
            .items-table td { border-left: 1px solid #000; border-right: 1px solid #000; }
            .summary-table { width: 100%; border-collapse: collapse; }
            .summary-table td { border: 1px solid #000; padding: 4px; }
            .footer { padding: 10px; }
            .bank-details { font-size: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="company-name">${company.company_name || 'Your Company Name'}</div>
                <div>${company.address_1 || ''}, ${company.address_2 || ''}</div>
                <div>${company.city || ''}, ${company.state || ''} - ${company.pincode || ''}</div>
                <div>Mobile: ${company.mobile || ''} | Email: ${company.email || ''}</div>
                ${company.gst ? `<div>GSTIN: ${company.gst}</div>` : ''}
            </div>

            <div class="title">TAX INVOICE</div>

            <table class="info-table">
                <tr>
                    <td>
                        <strong>Bill To:</strong><br/>
                        ${invoice.party_id?.company_name || '--'}<br/>
                        ${invoice.party_id?.address_1 || '--'}<br/>
                        ${invoice.party_id?.city || ''} ${invoice.party_id?.pincode || ''}<br/>
                        GSTIN: ${invoice.party_id?.gst || '--'}
                    </td>
                    <td>
                        <strong>Ship To:</strong><br/>
                        ${invoice.party_id?.company_name || '--'}<br/>
                        ${invoice.party_id?.address_1 || '--'}<br/>
                        ${invoice.party_id?.city || ''} ${invoice.party_id?.pincode || ''}<br/>
                        GSTIN: ${invoice.party_id?.gst || '--'}
                    </td>
                    <td>
                        Invoice No: <strong>${invoice.invoice_no || '--'}</strong><br/>
                        Date: ${invoice.invoice_date || '--'}<br/>
                        Place of Supply: ${invoice.placeOfSupply || '--'}<br/>
                        Transporter: ${invoice.transporter || '--'}<br/>
                        Vehicle No: ${invoice.lorry_no || '--'}
                    </td>
                </tr>
            </table>

            <table class="items-table">
                <thead>
                    <tr>
                        <th style="width: 30px;">Sl</th>
                        <th>Description of Goods</th>
                        <th style="width: 60px;">HSN/SAC</th>
                        <th style="width: 50px;">Qty</th>
                        <th style="width: 70px;">Rate</th>
                        <th style="width: 80px;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                    <tr style="border-top: 1px solid #000; font-weight: bold;">
                        <td colspan="3" style="text-align: right; padding: 4px; border: 1px solid #000;">Total</td>
                        <td style="text-align: right; padding: 4px; border: 1px solid #000;">${invoice.total_quantity || '0'}</td>
                        <td style="border: 1px solid #000;"></td>
                        <td style="text-align: right; padding: 4px; border: 1px solid #000;">${(invoice.total_amount || 0).toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>

            <table class="summary-table">
                <tr>
                    <td style="width: 60%;" rowspan="4">
                        <strong>Amount in Words:</strong><br/>
                        ${inrToWords(Math.round(invoice.total_amount + (invoice.total_cgst || 0) + (invoice.total_sgst || 0) + (invoice.total_igst || 0)))}
                    </td>
                    <td style="width: 25%; text-align: right;">Total Amount Before Tax</td>
                    <td style="width: 15%; text-align: right;">${(invoice.total_amount || 0).toFixed(2)}</td>
                </tr>
                <tr>
                    <td style="text-align: right;">Add: CGST</td>
                    <td style="text-align: right;">${(invoice.total_cgst || 0).toFixed(2)}</td>
                </tr>
                <tr>
                    <td style="text-align: right;">Add: SGST</td>
                    <td style="text-align: right;">${(invoice.total_sgst || 0).toFixed(2)}</td>
                </tr>
                <tr>
                    <td style="text-align: right; font-weight: bold;">Total Amount After Tax</td>
                    <td style="text-align: right; font-weight: bold;">${(invoice.total_amount + (invoice.total_cgst || 0) + (invoice.total_sgst || 0)).toFixed(2)}</td>
                </tr>
            </table>

            <div class="footer">
                <table style="width: 100%;">
                    <tr>
                        <td style="width: 50%;" class="bank-details">
                            <strong>Bank Details:</strong><br/>
                            Bank: ${company.bank || '--'}<br/>
                            A/c No: ${company.account_no || '--'}<br/>
                            IFSC: ${company.ifse || '--'}<br/>
                            Branch: ${company.branch || '--'}
                        </td>
                        <td style="width: 50%; text-align: right;">
                            For <strong>${company.company_name || 'Your Company Name'}</strong>
                            <br/><br/><br/>
                            Authorised Signatory
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    </body>
    </html>
    `;
};