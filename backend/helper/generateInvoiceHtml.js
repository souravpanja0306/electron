const moment = require("moment");
const { inrToWords } = require("./InWordConverter");

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

    const emptyRowsCount = Math.max(0, 8 - items.length);
    for (let i = 0; i < emptyRowsCount; i++) {
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

    const formattedDate = invoice.invoice_date
        ? moment(invoice.invoice_date).format('DD MMM YYYY')
        : (invoice.invoice_date || '--');

    const grandTotal = (invoice.total_amount || 0)
        + (invoice.total_cgst || 0)
        + (invoice.total_sgst || 0)
        + (invoice.total_igst || 0);

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Invoice Preview - ${invoice.invoice_no}</title>
        <style>
            body { font-family: Arial, sans-serif; font-size: 11px; margin: 0; padding: 15px; background: #fff; color: #000; }
            .container { width: 100%; border: 2px solid #000; padding: 0; box-sizing: border-box; }

            /* HEADER */
            .header { text-align: center; border-bottom: 2px solid #000; padding: 10px; }
            .company-name { font-size: 20px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; }
            .company-sub { font-size: 10.5px; margin-top: 2px; }

            /* TITLE */
            .title-row { display: flex; justify-content: space-between; align-items: center; padding: 5px 8px; background: #e8e8e8; border-bottom: 1px solid #000; }
            .title { font-size: 14px; font-weight: bold; letter-spacing: 1px; }
            .invoice-meta { text-align: right; font-size: 11px; }
            .invoice-meta span { font-size: 13px; font-weight: bold; }

            /* INFO TABLE */
            .info-table { width: 100%; border-collapse: collapse; }
            .info-table td { border: 1px solid #000; padding: 7px 9px; vertical-align: top; width: 33.33%; font-size: 11px; line-height: 1.6; }
            .section-label { font-size: 9px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; border-bottom: 1px solid #000; margin-bottom: 4px; padding-bottom: 3px; display: block; }

            /* ITEMS TABLE */
            .items-table { width: 100%; border-collapse: collapse; }
            .items-table th { border: 1px solid #000; padding: 6px 5px; background-color: #e8e8e8; font-size: 11px; font-weight: bold; }
            .items-table td { border-left: 1px solid #000; border-right: 1px solid #000; padding: 4px 5px; }

            /* SUMMARY TABLE */
            .summary-table { width: 100%; border-collapse: collapse; }
            .summary-table td { border: 1px solid #000; padding: 4px 7px; font-size: 11px; }
            .summary-table .grand-total td { font-weight: bold; background: #e8e8e8; border-top: 2px solid #000; }

            /* FOOTER */
            .footer { padding: 10px; border-top: 1px solid #000; }
            .bank-details { font-size: 10.5px; line-height: 1.7; }
            .bank-label { font-size: 9px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; border-bottom: 1px solid #000; margin-bottom: 4px; padding-bottom: 3px; display: block; }
            .sign-box { border-top: 1px solid #000; padding-top: 5px; font-size: 10.5px; font-weight: bold; letter-spacing: 0.5px; display: inline-block; }

            @media print {
                body { padding: 0; }
            }
        </style>
    </head>
    <body>
        <div class="container">

            <!-- HEADER -->
            <div class="header">
                <div class="company-name">${company.company_name || 'Your Company Name'}</div>
                <div class="company-sub">${company.address_1 || ''}${company.address_2 ? ', ' + company.address_2 : ''}</div>
                <div class="company-sub">${company.city || ''}${company.state ? ', ' + company.state : ''} – ${company.pincode || ''}</div>
                <div class="company-sub">Mobile: ${company.mobile || ''} &nbsp;|&nbsp; Email: ${company.email || ''}</div>
                ${company.gst ? `<div class="company-sub">GSTIN: <strong>${company.gst}</strong></div>` : ''}
            </div>

            <!-- TITLE ROW -->
            <div class="title-row">
                <div class="title">TAX INVOICE</div>
                <div class="invoice-meta">
                    Invoice No: <span>${invoice.invoice_no || '--'}</span>
                    &nbsp;&nbsp; Date: <span>${formattedDate}</span>
                </div>
            </div>

            <!-- PARTY + DETAILS -->
            <table class="info-table">
                <tr>
                    <td>
                        <span class="section-label">Bill To</span>
                        <strong>${invoice.party_id?.company_name || '--'}</strong><br/>
                        ${invoice.party_id?.address_1 || '--'}<br/>
                        ${invoice.party_id?.city || ''} ${invoice.party_id?.pincode || ''}<br/>
                        GSTIN: ${invoice.party_id?.gst || '--'}
                    </td>
                    <td>
                        <span class="section-label">Ship To</span>
                        <strong>${invoice.party_id?.company_name || '--'}</strong><br/>
                        ${invoice.party_id?.address_1 || '--'}<br/>
                        ${invoice.party_id?.city || ''} ${invoice.party_id?.pincode || ''}<br/>
                        GSTIN: ${invoice.party_id?.gst || '--'}
                    </td>
                    <td>
                        <span class="section-label">Dispatch Details</span>
                        Place of Supply: <strong>${invoice.placeOfSupply || '--'}</strong><br/>
                        Transporter: ${invoice.transporter || '--'}<br/>
                        Vehicle No: ${invoice.lorry_no || '--'}
                    </td>
                </tr>
            </table>

            <!-- ITEMS TABLE -->
            <table class="items-table">
                <thead>
                    <tr>
                        <th style="width: 30px;">Sl.</th>
                        <th>Description of Goods</th>
                        <th style="width: 65px;">HSN/SAC</th>
                        <th style="width: 50px; text-align: right;">Qty</th>
                        <th style="width: 75px; text-align: right;">Rate</th>
                        <th style="width: 85px; text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                    <tr style="border-top: 2px solid #000; font-weight: bold;">
                        <td colspan="3" style="text-align: right; padding: 5px; border: 1px solid #000; background: #f2f2f2;">Total</td>
                        <td style="text-align: right; padding: 5px; border: 1px solid #000; background: #f2f2f2;">${invoice.total_quantity || '0'}</td>
                        <td style="border: 1px solid #000; background: #f2f2f2;"></td>
                        <td style="text-align: right; padding: 5px; border: 1px solid #000; background: #f2f2f2;">${(invoice.total_amount || 0).toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>

            <!-- SUMMARY -->
            <table class="summary-table">
                <tr>
                    <td style="width: 60%;" rowspan="5">
                        <span class="section-label">Amount in Words</span>
                        ${inrToWords(Math.round(grandTotal))}
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
                    <td style="text-align: right;">Add: IGST</td>
                    <td style="text-align: right;">${(invoice.total_igst || 0).toFixed(2)}</td>
                </tr>
                <tr class="grand-total">
                    <td style="text-align: right; font-weight: bold;">Total Amount After Tax</td>
                    <td style="text-align: right; font-weight: bold;">${grandTotal.toFixed(2)}</td>
                </tr>
            </table>

            <!-- FOOTER -->
            <div class="footer">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="width: 50%; vertical-align: top;" class="bank-details">
                            <span class="bank-label">Bank Details</span>
                            Bank: <strong>${company.bank || '--'}</strong><br/>
                            A/c No: <strong>${company.account_no || '--'}</strong><br/>
                            IFSC: <strong>${company.ifse || '--'}</strong><br/>
                            Branch: ${company.branch || '--'}
                        </td>
                        <td style="width: 50%; text-align: right; vertical-align: bottom;">
                            For <strong>${company.company_name || 'Your Company Name'}</strong>
                            <br/><br/><br/><br/>
                            <span class="sign-box">Authorised Signatory</span>
                        </td>
                    </tr>
                </table>
            </div>

        </div>
    </body>
    </html>
    `;
};