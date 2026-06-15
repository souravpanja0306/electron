// Package...
const moment = require("moment");
const fs = require('fs');

// Contents...
const contents = require("../content/contents");

// Services...
const PartyService = require("../service/party.service");
const AuthService = require("../service/auth.service")
const InvoiceService = require("../service/invoice.service");
const CompanyService = require("../service/company.service");
const { generateInvoiceHtml } = require("../helper/generateInvoiceHtml");

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
            let search_key = {};
            if (t_userId) search_key["created_by"] = t_userId;

            let count = await InvoiceService.findInvoices({ ...search_key, count: true });
            while (true) {
                const invoiceNo = `${type}${(count + 1).toString().padStart(6, "0")}`;
                search_key["invoice_no"] = invoiceNo;

                const exists = await InvoiceService.findInvoices(search_key);
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
        const { t_userId, t_mobile, t_username, t_name, company_id, type, invoiceNo,
            date, data, transporter, ewayBill, billTo, shipTo, placeOfSupply, gst
        } = req.body;

        if (!billTo) return errorHandler(res, 400, "Please select Party.");
        if (!company_id) return errorHandler(res, 400, "Please select Company.");

        let search_key = {};
        if (invoiceNo) search_key["invoice_no"] = invoiceNo;

        let isInvoiceNumberExist = await InvoiceService.findInvoices(search_key);
        if (isInvoiceNumberExist.length) return errorHandler(res, 409, "Invoice Number Already Exists.");

        // Fetch company and party to get states for tax calculation
        let partyResult = await PartyService.getParty({ id: billTo });
        let companyResult = await CompanyService.getCompany({ id: company_id });

        let partyState = partyResult.length ? (partyResult[0].state || "").toLowerCase().trim() : "";
        let companyState = companyResult.length ? (companyResult[0].state || "").toLowerCase().trim() : "";

        let totalQty = 0;
        let totalValue = 0;
        let totalSGST = 0;
        let totalCGST = 0;
        let totalIGST = 0;

        if (data.length) {
            for (let item of data) {
                let qty = parseFloat(item.quantity || 0);
                let rate = parseFloat(item.rate || 0);
                let gstRate = parseFloat(item.gst || 0);
                let subtotal = qty * rate;

                totalQty += qty;
                totalValue += subtotal;

                let taxAmount = subtotal * (gstRate / 100);

                if (partyState === companyState) {
                    totalCGST += taxAmount / 2;
                    totalSGST += taxAmount / 2;
                } else {
                    totalIGST += taxAmount;
                }
            };
        };

        let finalData = {
            company_id: company_id,
            type: type,
            invoice_no: invoiceNo,
            invoice_date: date,
            transporter: transporter,
            eway_bill: ewayBill,
            party_id: billTo,
            created_by: t_userId,
            total_amount: totalValue,
            total_quantity: totalQty,
            total_cgst: totalCGST,
            total_sgst: totalSGST,
            total_igst: totalIGST,
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
        const { id, startDate, endDate, search } = req.query;

        let search_key = { startDate, endDate, search };
        if (id) search_key["id"] = id;
        if (t_userId) search_key["created_by"] = t_userId.toString();

        let result = await InvoiceService.findInvoices(search_key);
        if (result.length) {
            let finalData = [];
            for (let item of result) {

                let billTo = await PartyService.getParty({ id: item.party_id });
                let company = await CompanyService.getCompany({ id: item.company_id });
                let newData = {
                    id: item.id ? item.id : "",
                    company_id: company.length ? company[0] : "",
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
                    lorry_no: item.lorry_no ? item.lorry_no : "",
                    lr_no: item.lr_no ? item.lr_no : "",
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
            let result = await InvoiceService.deleteInvoices({ id: id });
            if (result.deleted) {
                response.status = 200;
                response.message = "Data deleted succesfully.";
                response.body = [];
            } else {
                response.status = 202;
                response.message = "Something went wrong!";
                response.body = [];
            };
        } else {
            response.status = 202;
            response.message = "Data not found.";
            response.body = [];
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
        const { id, company_id, type, invoice_no, invoice_date, transporter, eway_bill, party_id, placeOfSupply, data } = req.body;

        if (!id) return errorHandler(res, 400, "Invoice ID is required.");
        if (!party_id) return errorHandler(res, 400, "Please select Party.");
        if (!company_id) return errorHandler(res, 400, "Please select Company.");

        let items = typeof data === 'string' ? JSON.parse(data) : data;

        // Fetch company and party to get states for tax calculation
        let partyResult = await PartyService.getParty({ id: party_id });
        let companyResult = await CompanyService.getCompany({ id: company_id });

        let partyState = partyResult.length ? (partyResult[0].state || "").toLowerCase().trim() : "";
        let companyState = companyResult.length ? (companyResult[0].state || "").toLowerCase().trim() : "";

        let totalQty = 0;
        let totalValue = 0;
        let totalSGST = 0;
        let totalCGST = 0;
        let totalIGST = 0;

        if (items && items.length) {
            for (let item of items) {
                let qty = parseFloat(item.quantity || 0);
                let rate = parseFloat(item.rate || 0);
                let gstRate = parseFloat(item.gst || 0);
                let subtotal = qty * rate;

                totalQty += qty;
                totalValue += subtotal;

                let taxAmount = subtotal * (gstRate / 100);

                if (partyState === companyState) {
                    totalCGST += taxAmount / 2;
                    totalSGST += taxAmount / 2;
                } else {
                    totalIGST += taxAmount;
                }
            };
        };

        let updateData = {
            company_id: company_id,
            type: type,
            invoice_no: invoice_no,
            invoice_date: invoice_date,
            transporter: transporter,
            eway_bill: eway_bill,
            party_id: party_id,
            total_amount: totalValue,
            total_quantity: totalQty,
            total_cgst: totalCGST,
            total_sgst: totalSGST,
            total_igst: totalIGST,
            placeOfSupply: placeOfSupply,
            data: JSON.stringify(items)
        };

        let result = await InvoiceService.updateInvoiceData(id, updateData);

        if (result.changes) {
            response.status = 200;
            response.message = "Data updated successfully.";
            response.body = result;
        } else {
            response.status = 202;
            response.message = "No changes made or invoice not found.";
        }
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
        const { t_userId } = req.body;
        const { id } = req.query;
        if (!id) return errorHandler(res, 400, "Invoice ID is required.");

        let search_key = { id };
        if (t_userId) search_key["created_by"] = t_userId.toString();

        let result = await InvoiceService.findInvoices(search_key);
        if (!result.length) return errorHandler(res, 404, "Invoice not found.");
        let invoice = result[0];

        // Hydrate relations
        let party = await PartyService.getParty({ id: invoice.party_id });
        invoice.party_id = party.length ? party[0] : null;
        invoice.data = invoice.data ? JSON.parse(invoice.data) : [];

        // Get company
        let companies = await CompanyService.getCompany({});
        let company = companies.length ? companies[0] : {};

        const html = generateInvoiceHtml({ invoice, company });

        response.status = 200;
        response.message = "PDF generated successfully.";
        response.body = {
            html: html,
        };
    } catch (error) {
        console.log(`Something went wrong: controller: generateInvoicePdf: ${error}`);
        response.status = 500;
        response.message = error.message || "Something went wrong: controller: generateInvoicePdf";
    };
    return res.status(response.status).json(response);
};