const moment = require("moment");

exports.generateChallanHtml = ({ challan, company }) => {
    const items = challan.data || [];
    
    let itemsHtml = items.map((item, index) => `
        <tr>
            <td style="border: 1px solid #000; padding: 5px; text-align: center;">${index + 1}</td>
            <td style="border: 1px solid #000; padding: 5px; text-align: center;">${item.packages || '--'}</td>
            <td style="border: 1px solid #000; padding: 5px;">${item.description || '--'}</td>
            <td style="border: 1px solid #000; padding: 5px; text-align: right;">${item.weight || '--'}</td>
        </tr>
    `).join('');

    // Fill empty rows to maintain height
    const emptyRowsCount = Math.max(0, 10 - items.length);
    for(let i=0; i<emptyRowsCount; i++) {
        itemsHtml += `
            <tr>
                <td style="border: 1px solid #000; padding: 5px; height: 25px;"></td>
                <td style="border: 1px solid #000; padding: 5px;"></td>
                <td style="border: 1px solid #000; padding: 5px;"></td>
                <td style="border: 1px solid #000; padding: 5px;"></td>
            </tr>
        `;
    }

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; font-size: 12px; margin: 0; padding: 20px; }
            .container { width: 100%; border: 1px solid #000; padding: 10px; box-sizing: border-box; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
            .company-name { font-size: 20px; font-weight: bold; text-transform: uppercase; }
            .title { font-size: 16px; font-weight: bold; text-decoration: underline; margin: 10px 0; }
            .info-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
            .info-table td { border: 1px solid #000; padding: 8px; vertical-align: top; width: 50%; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
            .items-table th { border: 1px solid #000; padding: 8px; background-color: #f2f2f2; }
            .footer { margin-top: 20px; }
            .signature-section { display: flex; justify-content: space-between; margin-top: 50px; }
            .sign-box { text-align: center; width: 200px; border-top: 1px solid #000; padding-top: 5px; }
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

            <div style="text-align: center;">
                <span class="title">DELIVERY CHALLAN</span>
            </div>

            <table class="info-table">
                <tr>
                    <td>
                        <strong>Consignor:</strong><br/>
                        ${challan.consignor_id?.company_name || '--'}<br/>
                        ${challan.consignor_id?.address_1 || '--'}<br/>
                        ${challan.consignor_id?.city || ''} ${challan.consignor_id?.pincode || ''}<br/>
                        GSTIN: ${challan.consignor_id?.gst || '--'}
                    </td>
                    <td>
                        <strong>Challan Details:</strong><br/>
                        C/N No: <strong>${challan.cn_no || '--'}</strong><br/>
                        Date: ${challan.date || '--'}<br/>
                        From: ${challan.from_loc || '--'}<br/>
                        To: ${challan.to_loc || '--'}
                    </td>
                </tr>
                <tr>
                    <td>
                        <strong>Consignee:</strong><br/>
                        ${challan.consignee_id?.company_name || '--'}<br/>
                        ${challan.consignee_id?.address_1 || '--'}<br/>
                        ${challan.consignee_id?.city || ''} ${challan.consignee_id?.pincode || ''}<br/>
                        GSTIN: ${challan.consignee_id?.gst || '--'}
                    </td>
                    <td>
                        <strong>Additional Info:</strong><br/>
                        Invoice No: ${challan.invoice_no || '--'}<br/>
                        Way Bill No: ${challan.way_bill_no || '--'}<br/>
                        Truck No: ${challan.truck_no || '--'}
                    </td>
                </tr>
            </table>

            <table class="items-table">
                <thead>
                    <tr>
                        <th style="width: 50px;">Sl.</th>
                        <th style="width: 150px;">No. of Packages</th>
                        <th>Particulars of Goods</th>
                        <th style="width: 120px;">Weight (KG)</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>

            <div style="margin-top: 10px; border: 1px solid #000; padding: 8px; min-height: 40px;">
                <strong>Note:</strong> ${challan.note || '--'}
            </div>

            <div class="footer">
                <div class="signature-section">
                    <div class="sign-box">Consignee's Signature</div>
                    <div class="sign-box">Driver's Signature</div>
                    <div style="text-align: center;">
                        For <strong>${company.company_name || 'Your Company Name'}</strong>
                        <br/><br/><br/><br/>
                        <div class="sign-box" style="margin: auto;">Authorised Signatory</div>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};