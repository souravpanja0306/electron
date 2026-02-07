// Package...
const moment = require("moment");
const fs = require('fs');
const puppeteer = require("puppeteer");

// Contents...
const contents = require("../content/contents");

// Services...
const PartyService = require("../service/party.service");
const AuthService = require("../service/auth.service")
const InvoiceService = require("../service/invoice.service");

const errorHandler = (res, status, message) => {
    return res.status(status).json({ status, message, body: [] });
};

exports.generateInvoiceNo = async (req, res) => {
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
        if (types == "proforma") type = "PRO";
        if (types == "invoice") type = "INV";
        const date = moment().format("DDMMYYYY");

        const existsCheck = async ({
            type = ""
        }) => {
            let count = await InvoiceService.findInvoices({ count: true });
            while (true) {
                const invoiceNo = `${type}${(count + 1).toString().padStart(6, "0")}`;
                const exists = await InvoiceService.findInvoices({ invoice_no: invoiceNo });
                if (!exists.length) return invoiceNo;
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
        console.log(`Something went wrong: controller: generateInvoiceNo: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: generateInvoiceNo`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
};

exports.createInvoice = async (req, res) => {
    let response = { ...contents.defaultResponse }
    try {
        const { t_userId, t_mobile, t_username, t_name, company, type, invoiceNo,
            date, data, transporter, ewayBill, billTo, shipTo, placeOfSupply,
        } = req.body;

        if (!billTo) return errorHandler(res, 400, "Please select Party.");

        let search_key = {};
        if (invoiceNo) search_key["invoice_no"] = invoiceNo;

        let isInvoiceNumberExist = await InvoiceService.findInvoices(search_key);
        if (isInvoiceNumberExist.length) return errorHandler(res, 409, "Invoice Number Already Exists.");

        let totalQty = 0;
        let totalValue = 0;
        let totalSGST = 0;
        let totalCGST = 0;
        let totalIGST = 0;
        let totalRoundOff = 0;
        let totalDiscoount = 0;
        let totalAdvance = 0;
        let grandTotal = 0;

        if (data.length) {
            for (let item of data) {
                totalQty += parseInt(item.quantity);
                totalValue += (item.quantity * item.rate);
                // totalSGST +=
                //     totalCGST +=
                //     totalIGST +=
                //     totalRoundOff +=
                //     totalDiscoount +=
                //     totalAdvance +=
            };
        };

        let finalData = {
            type: type,
            invoice_no: invoiceNo,
            invoice_date: date,
            transporter: transporter,
            eway_bill: ewayBill,
            party_id: billTo,
            created_by: t_userId,
            total_amount: totalValue,
            total_quantity: totalQty,
            placeOfSupply: placeOfSupply,
            data: JSON.stringify(data)
        };
        let result = await InvoiceService.insertInvoiceData(finalData);

        response.status = 200;
        response.message = "Data created successfully.";
        response.body = result;
    } catch (error) {
        console.log(`Something went wrong: controller: createInvoice: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: createInvoice`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
};

exports.getAllInvoice = async (req, res) => {
    let response = { ...contents.defaultResponse }
    try {
        const { t_userId, t_mobile, t_username, t_name, } = req.body;
        const { id } = req.query;

        let search_key = {};
        if (id) search_key["id"] = id;
        if (t_userId) search_key["created_by"] = t_userId.toString();

        let result = await InvoiceService.findInvoices(search_key);
        if (result.length) {
            let finalData = [];
            for (let item of result) {

                let billTo = await PartyService.getParty({ id: item.party_id });
                let newData = {
                    id: item.id ? item.id : "",
                    type: item.type ? item.type : "",
                    invoice_no: item.invoice_no ? item.invoice_no : "",
                    eway_bill: item.eway_bill ? item.eway_bill : "",
                    party_id: billTo.length ? billTo[0] : "",
                    transporter: item.transporter ? item.transporter : "",
                    placeOfSupply: item.placeOfSupply ? item.placeOfSupply : "",
                    data: item.data ? JSON.parse(item.data) : "",
                    invoice_date: item.invoice_date ? item.invoice_date : "",
                    total_amount: item.total_amount ? item.total_amount : "",
                    total_quantity: item.total_quantity ? item.total_quantity : "",
                    total_sgst: item.total_sgst ? item.total_sgst : "",
                    total_cgst: item.total_cgst ? item.total_cgst : "",
                    total_igst: item.total_igst ? item.total_igst : "",
                    created_by: item.created_by ? item.created_by : "",
                    created_at: item.created_at ? item.created_at : "",
                    is_active: item.is_active ? item.is_active : "",
                    is_deleted: item.is_deleted ? item.is_deleted : ""
                };
                finalData.push(newData);
            };
            response.status = 200;
            response.message = "Data fetched succesfully.";
            response.body = finalData;
        } else {
            response.status = 202;
            response.message = "Data not found.";
            response.body = [];
        };
    } catch (error) {
        console.log(`Something went wrong: controller: getAllInvoice:  ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: getAllInvoice`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
};

exports.deleteInvoice = async (req, res) => {
    let response = { ...contents.defaultResponse }
    try {
        const { t_userId, t_mobile, t_username, t_name, } = req.body;
        const { id } = req.params;

        let search_key = {};
        if (id) search_key["id"] = id;
        if (t_userId) search_key["created_by"] = t_userId.toString();

        let result = await InvoiceService.findInvoices(search_key);
        if (result.length) {
            await InvoiceService.deleteInvoices(search_key);

        };
    } catch (error) {
        console.log(`Something went wrong: controller: deleteInvoice: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: deleteInvoice`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
};

exports.invoiceExports = async (req, res) => {
    let response = { ...contents.defaultResponse }
    try {

    } catch (error) {
        console.log(`Something went wrong: controller: invoiceExports: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: invoiceExports`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
};

exports.invoiceUpdate = async (req, res) => {
    let response = { ...contents.defaultResponse }
    try {

    } catch (error) {
        console.log(`Something went wrong: controller: invoiceUpdate: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: invoiceUpdate`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
};

exports.generateInvoicePdf = async (req, res) => {
    let response = { ...contents.defaultResponse }
    try {
        let createFolder = "./uploads/invoice_pdf/";
        if (!fs.existsSync(createFolder)) fs.mkdirSync(createFolder);

        let findInvoice = await InvoiceService.findInvoices({
            invoice_no: invoiceNo
        });
        console.log("🚀 ~ findInvoice:", findInvoice)

        dd
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.setContent(html, { waitUntil: "networkidle0" });
        await page.pdf({
            path: `./uploads/invoice_pdf/${invoiceNo}_${moment().format("DD-MM-YYYY")}.pdf`,
            format: "A4",
            printBackground: true
        });

        await browser.close();

    } catch (error) {
        console.log(`Something went wrong: controller: generateInvoicePdf: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: generateInvoicePdf`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
};