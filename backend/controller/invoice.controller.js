// Package...
const moment = require("moment");

// Contents...
const contents = require("../content/contents");

// Services...
const PartyService = require("../service/party.service");
const AuthService = require("../service/auth.service")
const InvoiceService = require("../service/invoice.service");

exports.generateInvoiceNo = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { types } = req.query;
        if (!types) {
            response.status = 400;
            response.message = "Type required";
            response.body = [];
            return res.json(response).status(response.status);
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
    return res.json(response).status(response.status);
};

exports.createInvoice = async (req, res) => {
    let response = { ...contents.defaultResponse }
    try {
        const { type, invoiceNo, date, data, transporter, ewayBill, billTo, shipTo, placeOfSupply, } = req.body;
        let search_key = {};
        if (invoiceNo) search_key["invoice_no"] = invoiceNo;
        let isInvoiceNumberExist = await InvoiceService.findInvoices(search_key);
        if (isInvoiceNumberExist.length) {
            response.status = 409;
            response.message = "Invoice Number Already Exists.";
            response.body = [];
            return res.json(response).status(response.status);
        };

        let finalData = {
            type: type,
            invoice_no: invoiceNo,
            invoice_date: date,
            transporter: transporter,
            eway_bill: ewayBill,
            party_id: billTo,
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
    return res.json(response).status(response.status);
};

exports.getAllInvoice = async (req, res) => {
    let response = { ...contents.defaultResponse }
    try {
        const { id } = req.query;

        let search_key = {};
        if (id) search_key["id"] = id;

        let result = await InvoiceService.findInvoices(search_key);
        if (result.length) {
            let finalData = [];
            for (let item of result) {

                let billTo = await PartyService.getParty({ id: item.party_id });
                console.log("🚀 ~ billTo:", billTo)
                let newData = {
                    id: item.id ? item.id : "",
                    type: item.type ? item.type : "",
                    invoice_no: item.invoice_no ? item.invoice_no : "",
                    eway_bill: item.eway_bill ? item.eway_bill : "",
                    party_id: billTo.length ? billTo[0].company_name : "",
                    transporter: item.transporter ? item.transporter : "",
                    placeOfSupply: item.placeOfSupply ? item.placeOfSupply : "",
                    data: item.data ? JSON.parse(item.data) : "",
                    invoice_date: item.invoice_date ? item.invoice_date : "",
                    total_amount: item.total_amount ? item.total_amount : "",
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
            response.status = 204;
            response.message = "Data not found.";
            response.body = [];
        };
    } catch (error) {
        console.log(`Something went wrong: controller: getAllInvoice:  ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: getAllInvoice`;
        response.body = error.body ? error.body : "";
    };
    return res.json(response).status(response.status);
};

exports.deleteInvoice = async (req, res) => {
    let response = { ...contents.defaultResponse }
    try {

    } catch (error) {
        console.log(`Something went wrong: controller: deleteInvoice: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: getAllInvoice`;
        response.body = error.body ? error.body : "";
    };
    return res.json(response).status(response.status);
};