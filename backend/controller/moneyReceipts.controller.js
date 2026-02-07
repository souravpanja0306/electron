// Package...
const moment = require("moment");
const fs = require('fs');
const puppeteer = require("puppeteer");

// Contents...
const contents = require("../content/contents");

// Services...
const PartyService = require("../service/party.service");
const AuthService = require("../service/auth.service");
const InvoiceService = require("../service/invoice.service");
const MoneyReceiptService = require("../service/moneyReceipt.service");

const errorHandler = (res, status, message) => {
    return res.status(status).json({ status, message, body: [] });
};

exports.generateMoneyReceiptNo = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { t_userId, t_mobile, t_username, t_name } = req.body;
        const { types } = req.query;
        if (!types) {
            response.status = 400;
            response.message = "Type required";
            response.body = [];
            return res.status(response.status).json(response);
        };
        let type = "";
        if (types == "moneyreceipt") type = "MR";
        const date = moment().format("DDMMYYYY");

        const existsCheck = async ({
            type = ""
        }) => {
            let count = await MoneyReceiptService.findMoneyReceipts({ count: true });
            while (true) {
                const receiptNo = `${type}${(count + 1).toString().padStart(6, "0")}`;
                const exists = await MoneyReceiptService.findMoneyReceipts({ receipt_no: receiptNo });
                if (!exists.length) return receiptNo;
                count++;
            };
        };

        let result = await existsCheck({ type: type });
        if (result) {
            response.status = 200;
            response.message = "Money Receipt Number Generate Successfully.";
            response.body = result;
        };
    } catch (error) {
        console.log(`Something went wrong: controller: generateMoneyReceiptNo: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: generateMoneyReceiptNo`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
};

module.exports.createMoneyReceipt = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { t_userId, t_mobile, t_username, t_name } = req.body;
        let { company_id, party_id, receipt_no, receipt_date, data, remarks, total_value } = req.body;

        let totalValue = 0;
        data.length && data.map((item) => {
            totalValue += parseFloat(item.amount);
        });

        let finalData = {
            company_id: company_id,
            party_id: party_id,
            receipt_no: receipt_no,
            receipt_date: receipt_date,
            data: JSON.stringify(data),
            remarks: remarks,
            total_value: (totalValue).toFixed(2),
            created_by: t_userId,
        };

        let result = await MoneyReceiptService.insertMoneyReceipts(finalData);
        if (result) {
            response.status = 200;
            response.message = "Money Receipt Created Successfully.";
            response.body = result;
        };
    } catch (error) {
        console.log(`Something went wrong: controller: createMoneyReceipt: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: createMoneyReceipt`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
};

module.exports.getMoneyReceipt = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { t_userId, t_mobile, t_username, t_name } = req.body;
        const { id } = req.query;

        let search_key = {};
        if (id) search_key["id"] = id;
        if (t_userId) search_key["created_by"] = t_userId.toString();

        let result = await MoneyReceiptService.findMoneyReceipts(search_key);
        if (result.length) {
            let finalData = [];
            for (let item of result) {

                let newData = {
                    id: item.id,
                    company_id: item.company_id,
                    party_id: item.party_id,
                    receipt_no: item.receipt_no,
                    receipt_date: item.receipt_date,
                    data: JSON.parse(item.data),
                    remarks: item.remarks,
                    total_value: item.total_value,
                    created_by: item.t_userId,
                };
                finalData.push(newData);
            };
            response.status = 200;
            response.message = "Get Money Receipt All Successfully.";
            response.body = finalData;
        };
    } catch (error) {
        console.log(`Something went wrong: controller: getMoneyReceipt: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: getMoneyReceipt`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
};

module.exports.generateMoneyReceiptPdf = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { t_userId, t_mobile, t_username, t_name } = req.body;
        let { id } = req.params;
        if (!id) {
            response.status = 200;
            response.message = "ID required.";
            response.body = {};
            return res.status(response.status).json(response);
        };

        let search_key = {};
        if (id) search_key["id"] = id;
        if (t_userId) search_key["created_by"] = t_userId.toString();

        let result = await MoneyReceiptService.findMoneyReceipts(search_key);
        if (result.length) {
            let createFolder = "./uploads/money_receipt_pdf/";
            if (!fs.existsSync(createFolder)) fs.mkdirSync(createFolder);

            const browser = await puppeteer.launch();
            const page = await browser.newPage();

            await page.setContent(`
                <body style="font-family:Arial;font-size:12px">
                    <div style="width:700px;margin:auto;border:1px solid #000;padding:10px">

                      <div style="text-align:center;font-weight:bold;margin-bottom:5px">
                        MONEY RECEIPT
                      </div>

                      <table style="width:100%;border-collapse:collapse;margin-bottom:5px">
                        <tr>
                          <td style="width:60%;vertical-align:top">
                            <b>Company Name</b><br>
                            Address Line<br>
                            GSTIN: 22AAAAA0000A1Z5
                          </td>

                          <td style="width:40%;vertical-align:top;text-align:right">
                            Receipt No: MR-001<br>
                            Date: 01-02-2026
                          </td>
                        </tr>
                      </table>

                      <table style="width:100%;border-collapse:collapse;border:1px solid #000">
                        <tr>
                          <td style="width:50%;border:1px solid #000;padding:6px;vertical-align:top">
                            <b>Received From:</b><br>
                            Party Name<br>
                            Party Address<br>
                            GSTIN: 33BBBBB1111B2Z6
                          </td>

                          <td style="width:50%;border:1px solid #000;padding:6px;vertical-align:top">
                            <b>Payment Details:</b><br>
                            Payment Mode: Cash / UPI / Bank<br>
                            Reference No:<br>
                            Invoice Ref No:<br>
                            Invoice Date:
                          </td>
                        </tr>
                      </table>

                      <table style="width:100%;border-collapse:collapse;margin-top:5px">
                        <tr>
                          <th style="border:1px solid #000;padding:4px">Sl</th>
                          <th style="border:1px solid #000;padding:4px">Particulars</th>
                          <th style="border:1px solid #000;padding:4px;text-align:right">Amount</th>
                        </tr>
                        <tr>
                          <td style="border:1px solid #000;padding:4px">1</td>
                          <td style="border:1px solid #000;padding:4px">Payment against Invoice INV-001</td>
                          <td style="border:1px solid #000;padding:4px;text-align:right">1180</td>
                        </tr>
                      </table>

                      <table style="width:100%;margin-top:5px">
                        <tr>
                          <td style="text-align:right;font-weight:bold">Total Received</td>
                          <td style="text-align:right;font-weight:bold">₹ 1180</td>
                        </tr>
                      </table>

                      <div style="margin-top:5px">
                        <b>Amount in Words:</b> One Thousand One Hundred Eighty Only
                      </div>

                      <table style="width:100%;border-collapse:collapse;border:1px solid #000;margin-top:10px">
                        <tr>
                          <td style="width:70%;border:1px solid #000;padding:6px;vertical-align:top">
                            <b>Note:</b><br>
                            This is a receipt acknowledging payment received.
                          </td>

                          <td style="width:30%;border:1px solid #000;padding:6px;vertical-align:top;text-align:right">
                            <b>For Company Name</b><br><br><br>
                            Authorised Signatory
                          </td>
                        </tr>
                      </table>

                    </div>
                </body>
                    `,
                { waitUntil: "networkidle0" }
            );

            await page.pdf({
                path: `./uploads/money_receipt_pdf/${result[0].receipt_no}_${moment().format("DD-MM-YYYY")}.pdf`,
                format: "A4",
                printBackground: true
            });
            await browser.close();

            response.status = 200;
            response.message = "Money Receipt Downloaded Successfully.";
            response.body = {
                downloadLink: `http://localhost:3001/uploads/money_receipt_pdf/${result[0].receipt_no}_${moment().format("DD-MM-YYYY")}.pdf`
            };
        };
    } catch (error) {
        console.log(`Something went wrong: controller: generateMoneyReceiptPdf: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: generateMoneyReceiptPdf`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
};

module.exports.deleteMoneyReceipt = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { t_userId, t_mobile, t_username, t_name } = req.body;
        let { id } = req.params;
        if (!id) {
            response.status = 200;
            response.message = "ID required.";
            response.body = {};
            return res.status(response.status).json(response);
        };

        let search_key = {};
        if (id) search_key["id"] = id;
        if (t_userId) search_key["created_by"] = t_userId.toString();

        let result = await MoneyReceiptService.findMoneyReceipts(search_key);
        if (result.length) {
            let results = await MoneyReceiptService.deleteMoneyReceipt({ id: result[0].id });

            response.status = 200;
            response.message = "Money Receipt Deleted Successfully.";
            response.body = results;
        } else {
            response.status = 404;
            response.message = "Money Receipt Not Found";
            response.body = {};
        };
    } catch (error) {
        console.log(`Something went wrong: controller: generateMoneyReceiptPdf: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: generateMoneyReceiptPdf`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
};