// Package...
const moment = require("moment");
const fs = require('fs');
const { app } = require("electron");

// Contents...
const contents = require("../content/contents");

// Services...
const PartyService = require("../service/party.service");
const AuthService = require("../service/auth.service")
const InvoiceService = require("../service/invoice.service");
const CompanyService = require("../service/company.service");
const ChallanService = require("../service/challan.service");
const SettingService = require("../service/setting.service");
const { generateInvoiceHtml } = require("../helper/generateInvoiceHtml");

const errorHandler = (res, status, message) => {
    return res.status(status).json({ status, message, body: [] });
};

const toText = (value) => (value === undefined || value === null ? "" : String(value).trim());
const toNumber = (value) => Number(value) || 0;

// Parses the item rows and drops rows the user left completely empty.
const normaliseInvoiceItems = (data) => {
    let rows = data;
    if (typeof rows === "string") {
        try { rows = JSON.parse(rows); } catch (e) { rows = []; }
    }
    if (!Array.isArray(rows)) return [];

    return rows
        .filter((row) => row && (toText(row.description) || toNumber(row.quantity) || toNumber(row.rate)))
        .map((row, index) => {
            const quantity = toNumber(row.quantity);
            const rate = toNumber(row.rate);
            const gst = toNumber(row.gst);
            const taxable = quantity * rate;
            return {
                id: row.id ?? Date.now() + index,
                sl_no: index + 1,
                description: toText(row.description),
                hsn: toText(row.hsn),
                quantity,
                rate,
                gst,
                total: Math.round(taxable * (1 + gst / 100) * 100) / 100,
            };
        });
};

// CGST+SGST when company and party are in the same state, otherwise IGST.
// The frontend mirrors this rule in utils/invoiceTotals.js; keep them in sync.
const calculateInvoiceTotals = async ({ items, company_id, party_id }) => {
    const partyResult = await PartyService.getParty({ id: party_id });
    const companyResult = await CompanyService.getCompany({ id: company_id });

    const partyState = partyResult.length ? (partyResult[0].state || "").toLowerCase().trim() : "";
    const companyState = companyResult.length ? (companyResult[0].state || "").toLowerCase().trim() : "";
    const sameState = partyState === companyState;

    const totals = { total_quantity: 0, total_amount: 0, total_cgst: 0, total_sgst: 0, total_igst: 0 };
    for (const item of items) {
        const subtotal = item.quantity * item.rate;
        const taxAmount = subtotal * (item.gst / 100);
        totals.total_quantity += item.quantity;
        totals.total_amount += subtotal;
        if (sameState) {
            totals.total_cgst += taxAmount / 2;
            totals.total_sgst += taxAmount / 2;
        } else {
            totals.total_igst += taxAmount;
        }
    }
    return totals;
};

module.exports.generateInvoiceNo = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { t_userId, t_mobile, t_username, t_name } = req.body;
        const { types, company_id } = req.query;
        if (!types) {
            response.status = 400;
            response.message = "Type required";
            response.body = [];
            return res.status(response.status).json(response);
        };
        let type = "";
        if (types == "proforma") type = "PRO-";
        if (types == "invoice") type = "INV-";
        const settings = company_id ? await SettingService.getInvoiceSetting({ company_id: Number(company_id) }) : [];
        const setting = settings[0];
        const prefix = types === "invoice" && setting ? setting.invoice_prefix : type;
        const suffix = types === "invoice" && setting ? setting.invoice_suffix : "";
        const startNumber = types === "invoice" && setting ? Math.max(1, Number(setting.invoice_start_number) || 1) : 1;

        const existsCheck = async ({
            type = ""
        }) => {
            let search_key = {};
            if (t_userId) search_key["created_by"] = t_userId;

            if (company_id) search_key["company_id"] = Number(company_id);
            let count = await InvoiceService.findInvoices({ ...search_key, count: true });
            while (true) {
                const invoiceNo = `${prefix}${(startNumber + count).toString().padStart(6, "0")}${suffix}`;
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

module.exports.createInvoice = async (req, res) => {
    let response = { ...contents.defaultResponse }
    try {
        const { t_userId, t_mobile, t_username, t_name, company_id, type, invoiceNo,
            date, data, transporter, ewayBill, billTo, shipTo, placeOfSupply, lorry_no, lr_no, challan_id
        } = req.body;

        if (!company_id) return errorHandler(res, 400, "Please select Company.");
        if (!billTo) return errorHandler(res, 400, "Please select Party.");
        if (!toText(invoiceNo)) return errorHandler(res, 400, "Invoice Number is required.");

        const items = normaliseInvoiceItems(data);
        if (!items.length) return errorHandler(res, 400, "Add at least one item.");

        let search_key = { invoice_no: toText(invoiceNo) };
        if (t_userId) search_key["created_by"] = t_userId.toString();

        let isInvoiceNumberExist = await InvoiceService.findInvoices(search_key);
        if (isInvoiceNumberExist.length) return errorHandler(res, 409, "Invoice Number Already Exists.");

        if (challan_id) {
            const challans = await ChallanService.findChallans({ id: challan_id, created_by: t_userId });
            if (!challans.length) return errorHandler(res, 404, "Source challan not found.");

            const existingInvoice = await InvoiceService.findInvoices({ challan_id });
            if (existingInvoice.length) return errorHandler(res, 409, "An invoice already exists for this challan.");
        };

        const totals = await calculateInvoiceTotals({ items, company_id, party_id: billTo });

        const invoiceSettings = await SettingService.getInvoiceSetting({ company_id: Number(company_id) });
        let finalData = {
            company_id: company_id,
            type: type || "tax",
            invoice_no: toText(invoiceNo),
            invoice_date: toText(date),
            transporter: toText(transporter),
            eway_bill: toText(ewayBill),
            lorry_no: toText(lorry_no),
            lr_no: toText(lr_no),
            ship_to: shipTo || billTo,
            party_id: billTo,
            challan_id: challan_id || null,
            created_by: t_userId,
            ...totals,
            placeOfSupply: toText(placeOfSupply),
            terms_and_conditions: invoiceSettings[0]?.terms_and_conditions || "",
            data: JSON.stringify(items)
        };
        let result = challan_id
            ? await InvoiceService.insertInvoiceFromChallan(finalData, challan_id, t_userId)
            : await InvoiceService.insertInvoiceData(finalData);

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

module.exports.getAllInvoice = async (req, res) => {
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
                    ship_to: item.ship_to ? item.ship_to : "",
                    challan_id: item.challan_id || null,
                    transporter: item.transporter ? item.transporter : "",
                    placeOfSupply: item.placeOfSupply ? item.placeOfSupply : "",
                    data: item.data ? JSON.parse(item.data) : [],
                    invoice_date: item.invoice_date ? item.invoice_date : "",
                    total_amount: toNumber(item.total_amount),
                    total_quantity: toNumber(item.total_quantity),
                    total_sgst: toNumber(item.total_sgst),
                    total_cgst: toNumber(item.total_cgst),
                    total_igst: toNumber(item.total_igst),
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

module.exports.deleteInvoice = async (req, res) => {
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

module.exports.invoiceExports = async (req, res) => {
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

module.exports.invoiceUpdate = async (req, res) => {
    let response = { ...contents.defaultResponse }
    try {
        const { t_userId } = req.body;
        const { id, company_id, type, invoice_no, invoice_date, transporter, eway_bill, party_id, ship_to,
            placeOfSupply, data, lorry_no, lr_no } = req.body;

        if (!id) return errorHandler(res, 400, "Invoice ID is required.");
        if (!company_id) return errorHandler(res, 400, "Please select Company.");
        if (!party_id) return errorHandler(res, 400, "Please select Party.");
        if (!toText(invoice_no)) return errorHandler(res, 400, "Invoice Number is required.");

        let ownerKey = { id };
        if (t_userId) ownerKey["created_by"] = t_userId.toString();
        const existing = await InvoiceService.findInvoices(ownerKey);
        if (!existing.length) return errorHandler(res, 404, "Invoice not found.");

        // Invoice number must stay unique, ignoring this invoice itself.
        let dupKey = { invoice_no: toText(invoice_no) };
        if (t_userId) dupKey["created_by"] = t_userId.toString();
        const sameNo = await InvoiceService.findInvoices(dupKey);
        if (sameNo.some((item) => String(item.id) !== String(id))) {
            return errorHandler(res, 409, "Invoice Number Already Exists.");
        }

        const items = normaliseInvoiceItems(data);
        if (!items.length) return errorHandler(res, 400, "Add at least one item.");

        const totals = await calculateInvoiceTotals({ items, company_id, party_id });

        let updateData = {
            company_id: company_id,
            type: type || existing[0].type || "tax",
            invoice_no: toText(invoice_no),
            invoice_date: toText(invoice_date),
            transporter: toText(transporter),
            eway_bill: toText(eway_bill),
            party_id: party_id,
            ship_to: ship_to || party_id,
            lorry_no: toText(lorry_no),
            lr_no: toText(lr_no),
            ...totals,
            placeOfSupply: toText(placeOfSupply),
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

module.exports.generateInvoicePdf = async (req, res) => {
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

        // Print with the invoice's own company (was always the first company)
        let companies = invoice.company_id ? await CompanyService.getCompany({ id: invoice.company_id }) : [];
        if (!companies.length) companies = await CompanyService.getCompany({});
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
