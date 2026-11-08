// Services / helpers...
const InvoiceService = require("../service/invoice.service");
const ChallanService = require("../service/challan.service");
const SettingService = require("../service/setting.service");
const { generateInvoiceHtml } = require("../helper/generateInvoiceHtml");
const { errorHandler, ok, str, toId, toNumber, round2, isYmd, parseJsonArray, serverError } = require("../helper/http");
const { checkLinks, loadById, pick } = require("../helper/records");

// Parses the item rows and drops rows the user left completely empty.
const normaliseInvoiceItems = (data) => parseJsonArray(data)
    .filter((row) => row && (str(row.description) || toNumber(row.quantity) || toNumber(row.rate)))
    .map((row, index) => {
        const quantity = toNumber(row.quantity);
        const rate = toNumber(row.rate);
        const gst = toNumber(row.gst);
        const taxable = quantity * rate;
        return {
            id: row.id ?? Date.now() + index,
            sl_no: index + 1,
            description: str(row.description),
            hsn: str(row.hsn),
            quantity,
            rate,
            gst,
            total: round2(taxable * (1 + gst / 100)),
        };
    });

const validateItems = (items) => {
    if (!items.length) return "Add at least one item.";
    if (items.some((item) => !item.description)) return "Every item needs a description.";
    if (items.some((item) => item.quantity < 0 || item.rate < 0)) return "Quantity and rate must be zero or more.";
    if (items.some((item) => item.gst < 0 || item.gst > 100)) return "GST rate must be between 0 and 100.";
    return "";
};

const normState = (value) => String(value || "").toLowerCase().trim();

/**
 * CGST+SGST when company and party are in the same state, otherwise IGST. Amounts are
 * rounded to paise; CGST and SGST are each half the tax, rounded the same way.
 * The frontend mirrors this in utils/invoiceTotals.js; keep them in sync.
 */
const calculateInvoiceTotals = ({ items, company, party }) => {
    const sameState = normState(company?.state) === normState(party?.state);
    let quantity = 0;
    let taxable = 0;
    let tax = 0;
    for (const item of items) {
        const subtotal = item.quantity * item.rate;
        quantity += item.quantity;
        taxable += subtotal;
        tax += subtotal * (item.gst / 100);
    };
    const half = round2(tax / 2);
    return {
        total_quantity: round2(quantity),
        total_amount: round2(taxable),
        total_cgst: sameState ? half : 0,
        total_sgst: sameState ? half : 0,
        total_igst: sameState ? 0 : round2(tax),
    };
};

// Invoice numbers are unique per company: each company has its own series.
const numberTaken = async ({ invoice_no, company_id, userId, exceptId }) => {
    const same = await InvoiceService.findInvoices({ invoice_no, company_id, created_by: userId });
    return same.some((item) => String(item.id) !== String(exceptId));
};

// The invoice with this id, if it belongs to the signed-in user.
const findOwnInvoice = async (id, userId) => (await InvoiceService.findInvoices({ id, created_by: userId }))[0] || null;

/**
 * Validates the shared fields of create / update. Returns { error } or the clean values.
 * `existing`: the saved invoice when updating (its CHA may since have been removed from the master).
 */
const prepareInvoice = ({ userId, company_id, party_id, ship_to, invoice_no, invoice_date, data, cha }, existing = null) => {
    const companyId = toId(company_id);
    const partyId = toId(party_id);
    const shipTo = toId(ship_to) || partyId;
    const chaId = toId(cha);
    if (!companyId) return { error: "Please select Company." };
    if (!partyId) return { error: "Please select Party." };
    if (!str(invoice_no)) return { error: "Invoice Number is required." };
    if (!isYmd(invoice_date)) return { error: "Enter a valid invoice date." };

    const items = normaliseInvoiceItems(data);
    const itemError = validateItems(items);
    if (itemError) return { error: itemError };

    const linkError = checkLinks({
        userId,
        company_id: companyId,
        parties: [{ id: partyId, label: "Party" }, ...(shipTo !== partyId ? [{ id: shipTo, label: "Ship-to party" }] : [])],
        cha: existing && chaId === existing.cha ? null : chaId,
    });
    if (linkError) return { error: linkError };

    const company = pick(loadById("company", [companyId]), companyId);
    const party = pick(loadById("party", [partyId]), partyId);
    return {
        companyId, partyId, shipTo, chaId, items,
        totals: calculateInvoiceTotals({ items, company, party }),
    };
};

module.exports.generateInvoiceNo = async (req, res) => {
    try {
        const { t_userId } = req.body;
        const types = str(req.query.types);
        if (!types) return errorHandler(res, 400, "Type required");
        const company_id = toId(req.query.company_id);

        const setting = company_id ? (await SettingService.getInvoiceSetting({ company_id }))[0] : null;
        const useSetting = types === "invoice" && setting;
        const prefix = useSetting ? (setting.invoice_prefix ?? "") : (types === "proforma" ? "PRO-" : "INV-");
        const suffix = useSetting ? (setting.invoice_suffix || "") : "";
        const startNumber = useSetting ? Math.max(1, Number(setting.invoice_start_number) || 1) : 1;

        const scopeKey = { created_by: t_userId, ...(company_id ? { company_id } : {}) };
        let count = await InvoiceService.findInvoices({ ...scopeKey, count: true });
        for (let attempt = 0; attempt < 10000; attempt++) {
            const invoiceNo = `${prefix}${String(startNumber + count).padStart(6, "0")}${suffix}`;
            const exists = await InvoiceService.findInvoices({ ...scopeKey, invoice_no: invoiceNo });
            if (!exists.length) return ok(res, "Invoice Number Generate Successfully.", invoiceNo);
            count++;
        };
        return errorHandler(res, 409, "Could not find a free invoice number. Check the invoice number settings.");
    } catch (error) {
        return serverError(res, "controller: generateInvoiceNo", error, "Could not generate the invoice number.");
    };
};

module.exports.createInvoice = async (req, res) => {
    try {
        const { t_userId } = req.body;
        const body = req.body;
        const invoice_no = str(body.invoiceNo);

        const prepared = prepareInvoice({
            userId: t_userId,
            company_id: body.company_id,
            party_id: body.billTo,
            ship_to: body.shipTo,
            invoice_no,
            invoice_date: body.date,
            data: body.data,
            cha: body.cha,
        });
        if (prepared.error) return errorHandler(res, 400, prepared.error);

        if (await numberTaken({ invoice_no, company_id: prepared.companyId, userId: t_userId })) {
            return errorHandler(res, 409, "Invoice Number Already Exists.");
        };

        const challanId = toId(body.challan_id);
        if (body.challan_id && !challanId) return errorHandler(res, 400, "Invalid source challan.");
        if (challanId) {
            const challans = await ChallanService.findChallans({ id: challanId, created_by: t_userId });
            if (!challans.length) return errorHandler(res, 404, "Source challan not found.");
            const existingInvoice = await InvoiceService.findInvoices({ challan_id: challanId });
            if (existingInvoice.length) return errorHandler(res, 409, "An invoice already exists for this challan.");
        };

        const invoiceSettings = await SettingService.getInvoiceSetting({ company_id: prepared.companyId });
        const finalData = {
            company_id: prepared.companyId,
            type: str(body.type) || "tax",
            invoice_no,
            invoice_date: str(body.date),
            transporter: str(body.transporter),
            eway_bill: str(body.ewayBill),
            lorry_no: str(body.lorry_no).toUpperCase(),
            lr_no: str(body.lr_no),
            container: str(body.container),
            cha: prepared.chaId,
            ship_to: prepared.shipTo,
            party_id: prepared.partyId,
            challan_id: challanId,
            created_by: t_userId,
            ...prepared.totals,
            placeOfSupply: str(body.placeOfSupply),
            terms_and_conditions: invoiceSettings[0]?.terms_and_conditions || "",
            data: JSON.stringify(prepared.items),
        };
        const result = challanId
            ? await InvoiceService.insertInvoiceFromChallan(finalData, challanId, t_userId)
            : await InvoiceService.insertInvoiceData(finalData);
        return ok(res, "Invoice created successfully.", { ...result, id: Number(result.lastInsertRowid) });
    } catch (error) {
        if (/UNIQUE constraint failed: invoice\.challan_id/.test(String(error?.message))) {
            return errorHandler(res, 409, "An invoice already exists for this challan.");
        };
        return serverError(res, "controller: createInvoice", error, "Could not save the invoice.");
    };
};

module.exports.getAllInvoice = async (req, res) => {
    try {
        const { t_userId } = req.body;
        const search_key = {
            created_by: t_userId,
            startDate: isYmd(req.query.startDate) ? req.query.startDate : "",
            endDate: isYmd(req.query.endDate) ? req.query.endDate : "",
            search: str(req.query.search),
        };
        if (req.query.id) {
            const id = toId(req.query.id);
            if (!id) return errorHandler(res, 400, "Invalid invoice ID.");
            search_key.id = id;
        };

        const result = await InvoiceService.findInvoices(search_key);
        if (!result.length) return res.status(202).json({ status: 202, message: "Data not found.", body: [] });

        // One query per related table instead of three per invoice.
        const parties = loadById("party", result.map((item) => item.party_id));
        const companies = loadById("company", result.map((item) => item.company_id));
        const chas = loadById("cha", result.map((item) => item.cha));

        const finalData = result.map((item) => ({
            id: item.id,
            company_id: pick(companies, item.company_id) || "",
            type: item.type || "",
            invoice_no: item.invoice_no || "",
            eway_bill: item.eway_bill || "",
            party_id: pick(parties, item.party_id) || "",
            ship_to: item.ship_to || "",
            challan_id: item.challan_id || null,
            transporter: item.transporter || "",
            placeOfSupply: item.placeOfSupply || "",
            data: parseJsonArray(item.data),
            invoice_date: item.invoice_date || "",
            total_amount: toNumber(item.total_amount),
            total_quantity: toNumber(item.total_quantity),
            total_sgst: toNumber(item.total_sgst),
            total_cgst: toNumber(item.total_cgst),
            total_igst: toNumber(item.total_igst),
            lorry_no: item.lorry_no || "",
            lr_no: item.lr_no || "",
            container: item.container || "",
            cha: pick(chas, item.cha),
            created_by: item.created_by || "",
            created_at: item.created_at || "",
            is_active: item.is_active,
            is_deleted: item.is_deleted,
        }));
        return ok(res, "Data fetched successfully.", finalData);
    } catch (error) {
        return serverError(res, "controller: getAllInvoice", error, "Could not load invoices.");
    };
};

module.exports.deleteInvoice = async (req, res) => {
    try {
        const { t_userId } = req.body;
        const id = toId(req.params.id);
        if (!id) return errorHandler(res, 400, "Invoice ID is required.");

        const invoice = await findOwnInvoice(id, t_userId);
        if (!invoice) return errorHandler(res, 404, "Invoice not found.");

        const result = await InvoiceService.deleteInvoices({ id });
        if (!result?.deleted) return errorHandler(res, 404, "Invoice not found.");
        return ok(res, "Invoice deleted successfully.");
    } catch (error) {
        return serverError(res, "controller: deleteInvoice", error, "Could not delete the invoice.");
    };
};

module.exports.invoiceUpdate = async (req, res) => {
    try {
        const { t_userId } = req.body;
        const body = req.body;
        const id = toId(body.id);
        if (!id) return errorHandler(res, 400, "Invoice ID is required.");

        const existing = await findOwnInvoice(id, t_userId);
        if (!existing) return errorHandler(res, 404, "Invoice not found.");

        const invoice_no = str(body.invoice_no);
        const prepared = prepareInvoice({
            userId: t_userId,
            company_id: body.company_id,
            party_id: body.party_id,
            ship_to: body.ship_to,
            invoice_no,
            invoice_date: body.invoice_date,
            data: body.data,
            cha: body.cha,
        }, existing);
        if (prepared.error) return errorHandler(res, 400, prepared.error);

        if (await numberTaken({ invoice_no, company_id: prepared.companyId, userId: t_userId, exceptId: id })) {
            return errorHandler(res, 409, "Invoice Number Already Exists.");
        };

        const updateData = {
            company_id: prepared.companyId,
            type: str(body.type) || existing.type || "tax",
            invoice_no,
            invoice_date: str(body.invoice_date),
            transporter: str(body.transporter),
            eway_bill: str(body.eway_bill),
            party_id: prepared.partyId,
            ship_to: prepared.shipTo,
            lorry_no: str(body.lorry_no).toUpperCase(),
            lr_no: str(body.lr_no),
            container: str(body.container),
            cha: prepared.chaId,
            ...prepared.totals,
            placeOfSupply: str(body.placeOfSupply),
            data: JSON.stringify(prepared.items),
        };

        const result = await InvoiceService.updateInvoiceData(id, updateData);
        if (!result.changes) return res.status(202).json({ status: 202, message: "No changes made or invoice not found.", body: [] });
        return ok(res, "Invoice updated successfully.", result);
    } catch (error) {
        return serverError(res, "controller: invoiceUpdate", error, "Could not update the invoice.");
    };
};

module.exports.generateInvoicePdf = async (req, res) => {
    try {
        const { t_userId } = req.body;
        const id = toId(req.query.id);
        if (!id) return errorHandler(res, 400, "Invoice ID is required.");

        const invoice = await findOwnInvoice(id, t_userId);
        if (!invoice) return errorHandler(res, 404, "Invoice not found.");

        const parties = loadById("party", [invoice.party_id, invoice.ship_to]);
        const billTo = pick(parties, invoice.party_id);
        const cha = invoice.cha ? pick(loadById("cha", [invoice.cha]), invoice.cha) : null;
        const company = pick(loadById("company", [invoice.company_id]), invoice.company_id) || {};

        const html = generateInvoiceHtml({
            invoice: {
                ...invoice,
                party_id: billTo,
                ship_to: pick(parties, invoice.ship_to) || billTo,
                data: parseJsonArray(invoice.data),
                // Show the CHA's name on the print, not its numeric id.
                cha: cha?.name || "",
                // Same CHA switch as the forms (Invoice / Challan settings).
                show_cha: (await SettingService.getUserShowCha({ user_id: invoice.created_by })) ? 1 : 0,
            },
            company,
        });
        return ok(res, "PDF generated successfully.", { html });
    } catch (error) {
        return serverError(res, "controller: generateInvoicePdf", error, "Could not prepare the invoice for printing.");
    };
};
