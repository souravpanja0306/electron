const moment = require("moment");

exports.generateChallanHtml = ({ challan, company }) => {
    const items = challan.data || [];

    let itemsHtml = items.map((item, index) => `
        <tr>
            <td style="border: 1px solid #000; padding: 4px; text-align: center;">${index + 1}</td>
            <td style="border: 1px solid #000; padding: 4px; text-align: center;">${item.packages || '--'}</td>
            <td style="border: 1px solid #000; padding: 4px;">${item.description || '--'}</td>
            <td style="border: 1px solid #000; padding: 4px; text-align: right;">${item.weight || '--'}</td>
        </tr>
    `).join('');

    const emptyRowsCount = Math.max(0, 10 - items.length);
    for (let i = 0; i < emptyRowsCount; i++) {
        itemsHtml += `
            <tr>
                <td style="border: 1px solid #000; padding: 4px; height: 20px;"></td>
                <td style="border: 1px solid #000; padding: 4px;"></td>
                <td style="border: 1px solid #000; padding: 4px;"></td>
                <td style="border: 1px solid #000; padding: 4px;"></td>
            </tr>
        `;
    }

    const formattedDate = challan.date
        ? moment(challan.date).format('DD MMM YYYY')
        : (challan.date || '--');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Preview Challan : ${challan.cn_no}</title>
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
            .challan-meta { text-align: right; font-size: 11px; }
            .challan-meta span { font-size: 13px; font-weight: bold; }

            /* INFO TABLE */
            .info-table { width: 100%; border-collapse: collapse; }
            .info-table td { border: 1px solid #000; padding: 7px 9px; vertical-align: top; width: 50%; font-size: 11px; line-height: 1.6; }
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
                <div class="title">DELIVERY CHALLAN</div>
                <div class="challan-meta">
                    C/N No: <span>${challan.cn_no || '--'}</span>
                    &nbsp;&nbsp; Date: <span>${formattedDate}</span>
                </div>
            </div>

            <!-- PARTIES + DETAILS -->
            <table class="info-table">
                <tr>
                    <td>
                        <span class="section-label">Consignor</span>
                        <strong>${challan.consignor_id?.company_name || '--'}</strong><br/>
                        ${challan.consignor_id?.address_1 || '--'}<br/>
                        ${challan.consignor_id?.city || ''} ${challan.consignor_id?.pincode || ''}<br/>
                        GSTIN: ${challan.consignor_id?.gst || '--'}
                    </td>
                    <td>
                        <span class="section-label">Challan Details</span>
                        From: <strong>${challan.from_loc || '--'}</strong><br/>
                        To: <strong>${challan.to_loc || '--'}</strong><br/>
                        Invoice No: ${challan.invoice_no || '--'}<br/>
                        Way Bill No: ${challan.way_bill_no || '--'}<br/>
                        Truck No: ${challan.truck_no || '--'}
                    </td>
                </tr>
                <tr>
                    <td>
                        <span class="section-label">Consignee</span>
                        <strong>${challan.consignee_id?.company_name || '--'}</strong><br/>
                        ${challan.consignee_id?.address_1 || '--'}<br/>
                        ${challan.consignee_id?.city || ''} ${challan.consignee_id?.pincode || ''}<br/>
                        GSTIN: ${challan.consignee_id?.gst || '--'}
                    </td>
                    <td style="background: #f2f2f2;">
                        <span class="section-label">Summary</span>
                        Total Packages: <strong>${items.reduce((s, i) => s + (Number(i.packages) || 0), 0) || '--'}</strong><br/>
                        Total Weight: <strong>${items.reduce((s, i) => s + (Number(i.weight) || 0), 0).toFixed(2)} KG</strong>
                    </td>
                </tr>
            </table>

            <!-- ITEMS TABLE -->
            <table class="items-table">
                <thead>
                    <tr>
                        <th style="width: 40px;">Sl.</th>
                        <th style="width: 130px;">No. of Packages</th>
                        <th>Particulars of Goods</th>
                        <th style="width: 110px; text-align: right;">Weight (KG)</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                    <tr style="border-top: 2px solid #000; font-weight: bold;">
                        <td colspan="2" style="text-align: right; padding: 5px; border: 1px solid #000; background: #f2f2f2;">Total</td>
                        <td style="border: 1px solid #000; background: #f2f2f2;"></td>
                        <td style="text-align: right; padding: 5px; border: 1px solid #000; background: #f2f2f2;">${items.reduce((s, i) => s + (Number(i.weight) || 0), 0).toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>

            <!-- NOTE -->
            <table class="summary-table">
                <tr>
                    <td style="width: 100%;">
                        <span class="section-label">Remarks / Note</span>
                        ${challan.note || '--'}
                    </td>
                </tr>
            </table>

            <!-- FOOTER -->
            <div class="footer">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="width: 33%; text-align: center; vertical-align: bottom;">
                            <br/><br/><br/><br/>
                            <span class="sign-box">Consignee's Signature</span>
                        </td>
                        <td style="width: 33%; text-align: center; vertical-align: bottom;">
                            <br/><br/><br/><br/>
                            <span class="sign-box">Driver's Signature</span>
                        </td>
                        <td style="width: 33%; text-align: right; vertical-align: bottom;">
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