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
            response.message = "Invoice Number Generate Successfully.";
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