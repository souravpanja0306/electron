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

        let invoiceCount = await InvoiceService.findInvoices({ count: true });
        let type = "";
        if (types == "proforma") type = "PRO";
        if (types == "invoice") type = "INV";
        const date = moment().format("DDMMYYYY");

        let invoiceNumber = `${type}${(invoiceCount + 1).toString().padStart(6, "0")}${date}`;
        let invoices = await InvoiceService.findInvoices({ invoice_no: invoiceNumber });
        if (!invoices.length) {
            response.status = 200;
            response.message = "Invoice Number Generate Successfully.";
            response.body = invoiceNumber;
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
        let finalData = {
            type: type,
            invoice_no: invoiceNo,
            invoice_date: date,
            transporter: transporter,
            eway_bill: ewayBill,
            party_id: 1,
            party_id: shipTo,
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
                let newData = {
                    id: item.id ? item.id : "",
                    type: item.type ? item.type : "",
                    invoice_no: item.invoice_no ? item.invoice_no : "",
                    eway_bill: item.eway_bill ? item.eway_bill : "",
                    party_id: item.party_id ? item.party_id : "",
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