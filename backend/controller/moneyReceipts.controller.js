// Services / helpers...
const MoneyReceiptService = require("../service/moneyReceipt.service");
const { generateMoneyReceiptHtml } = require("../helper/generateMoneyReceiptHtml");
const { errorHandler, ok, str, toId, round2, isYmd, parseJsonArray, serverError } = require("../helper/http");
const { checkLinks, loadById, pick } = require("../helper/records");

const PAYMENT_MODES = ["Cash", "UPI", "Bank Transfer", "Cheque"];

// Drops empty rows and recomputes the total so a blank amount can never store "NaN".
const normaliseReceiptItems = (data) => {
    const items = parseJsonArray(data)
        .filter((row) => row && (str(row.description) || Number(row.amount)))
        .map((row, index) => ({
            id: row.id ?? Date.now() + index,
            sl_no: index + 1,
            description: str(row.description),
            amount: round2(row.amount),
        }));
    const total = items.reduce((sum, row) => sum + row.amount, 0);
    return { items, total: round2(total) };
};

/** Validates create / update input. Returns { error } or the clean values. */
const prepareReceipt = (body, userId) => {
    const companyId = toId(body.company_id);
    const partyId = toId(body.party_id);
    const receipt_no = str(body.receipt_no);
    const receipt_date = str(body.receipt_date);
    const { items, total } = normaliseReceiptItems(body.data);

    if (!companyId) return { error: "Please select Company." };
    if (!partyId) return { error: "Please select Party." };
    if (!receipt_no) return { error: "Receipt Number is required." };
    if (!isYmd(receipt_date)) return { error: "Enter a valid receipt date." };
    if (!items.length) return { error: "Add at least one payment line." };
    if (items.some((row) => row.amount < 0)) return { error: "Amounts cannot be negative." };
    if (!(total > 0)) return { error: "Enter the amount received." };

    const linkError = checkLinks({ userId, company_id: companyId, parties: [{ id: partyId, label: "Party" }] });
    if (linkError) return { error: linkError };

    // Known modes keep their spelling; anything else (older data) is kept as typed.
    const mode = str(body.payment_mode);
    const payment_mode = PAYMENT_MODES.find((m) => m.toLowerCase() === mode.toLowerCase()) || mode || "Cash";

    return {
        data: {
            company_id: companyId,
            party_id: partyId,
            receipt_no,
            receipt_date,
            data: JSON.stringify(items),
            remarks: str(body.remarks),
            total_value: total,
            payment_mode,
            reference: str(body.reference),
        },
    };
};

// Receipt numbers are unique per user (the generator counts all of the user's receipts).
const numberTaken = async (receipt_no, userId, exceptId) => {
    const same = await MoneyReceiptService.findMoneyReceipts({ receipt_no, created_by: userId });
    return same.some((item) => String(item.id) !== String(exceptId));
};

// The receipt with this id, if it belongs to the signed-in user.
const findOwnReceipt = async (id, userId) => (await MoneyReceiptService.findMoneyReceipts({ id, created_by: userId }))[0] || null;

module.exports.printMoneyReceipt = async (req, res) => {
    try {
        const { t_userId } = req.body;
        const id = toId(req.query.id);
        if (!id) return errorHandler(res, 400, "Money Receipt ID is required.");

        const receipt = await findOwnReceipt(id, t_userId);
        if (!receipt) return errorHandler(res, 404, "Money Receipt not found.");

        const party = pick(loadById("party", [receipt.party_id]), receipt.party_id) || {};
        const company = pick(loadById("company", [receipt.company_id]), receipt.company_id) || {};
        const html = generateMoneyReceiptHtml({
            receipt: { ...receipt, data: parseJsonArray(receipt.data) },
            company,
            party,
        });
        return ok(res, "HTML generated successfully.", { html });
    } catch (error) {
        return serverError(res, "controller: printMoneyReceipt", error, "Could not prepare the receipt for printing.");
    };
};

module.exports.generateMoneyReceiptNo = async (req, res) => {
    try {
        const { t_userId } = req.body;
        const types = str(req.query.types);
        if (!types) return errorHandler(res, 400, "Type required");
        const prefix = types === "moneyreceipt" ? "MR" : "";

        let count = await MoneyReceiptService.findMoneyReceipts({ created_by: t_userId, count: true });
        for (let attempt = 0; attempt < 10000; attempt++) {
            const receiptNo = `${prefix}${String(count + 1).padStart(6, "0")}`;
            if (!(await numberTaken(receiptNo, t_userId))) return ok(res, "Money Receipt Number Generate Successfully.", receiptNo);
            count++;
        };
        return errorHandler(res, 409, "Could not find a free receipt number.");
    } catch (error) {
        return serverError(res, "controller: generateMoneyReceiptNo", error, "Could not generate the receipt number.");
    };
};

module.exports.createMoneyReceipt = async (req, res) => {
    try {
        const { t_userId } = req.body;
        const prepared = prepareReceipt(req.body, t_userId);
        if (prepared.error) return errorHandler(res, 400, prepared.error);
        if (await numberTaken(prepared.data.receipt_no, t_userId)) return errorHandler(res, 409, "Receipt Number Already Exists.");

        const result = await MoneyReceiptService.insertMoneyReceipts({ ...prepared.data, created_by: t_userId });
        return ok(res, "Money Receipt Created Successfully.", { ...result, id: Number(result.lastInsertRowid) });
    } catch (error) {
        return serverError(res, "controller: createMoneyReceipt", error, "Could not save the money receipt.");
    };
};

module.exports.getMoneyReceipt = async (req, res) => {
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
            if (!id) return errorHandler(res, 400, "Invalid receipt ID.");
            search_key.id = id;
        };

        const result = await MoneyReceiptService.findMoneyReceipts(search_key);
        if (!result.length) return errorHandler(res, 202, "No money receipts created yet.");

        const parties = loadById("party", result.map((item) => item.party_id));
        const finalData = result.map((item) => {
            const party = pick(parties, item.party_id);
            return {
                id: item.id,
                company_id: item.company_id,
                party_id: party ? {
                    id: party.id,
                    name: party.company_name || "",
                    mobile: party.mobile || "",
                    email: party.email || "",
                } : "",
                receipt_no: item.receipt_no,
                receipt_date: item.receipt_date,
                data: parseJsonArray(item.data),
                remarks: item.remarks,
                payment_mode: item.payment_mode,
                reference: item.reference,
                total_value: Number(item.total_value) || 0,
                created_by: item.created_by,
            };
        });
        return ok(res, "Get Money Receipt All Successfully.", finalData);
    } catch (error) {
        return serverError(res, "controller: getMoneyReceipt", error, "Could not load money receipts.");
    };
};

module.exports.updateMoneyReceipt = async (req, res) => {
    try {
        const { t_userId } = req.body;
        const id = toId(req.body.id);
        if (!id) return errorHandler(res, 400, "Money Receipt ID is required.");

        const existing = await findOwnReceipt(id, t_userId);
        if (!existing) return errorHandler(res, 404, "Money Receipt not found.");

        const prepared = prepareReceipt(req.body, t_userId);
        if (prepared.error) return errorHandler(res, 400, prepared.error);
        if (await numberTaken(prepared.data.receipt_no, t_userId, id)) return errorHandler(res, 409, "Receipt Number Already Exists.");

        const result = await MoneyReceiptService.updateMoneyReceiptData(id, prepared.data);
        if (!result.changes) return res.status(202).json({ status: 202, message: "No changes made or Money Receipt not found.", body: [] });
        return ok(res, "Money Receipt Updated Successfully.", result);
    } catch (error) {
        return serverError(res, "controller: updateMoneyReceipt", error, "Could not update the money receipt.");
    };
};

module.exports.deleteMoneyReceipt = async (req, res) => {
    try {
        const { t_userId } = req.body;
        const id = toId(req.params.id);
        if (!id) return errorHandler(res, 400, "ID required.");

        const receipt = await findOwnReceipt(id, t_userId);
        if (!receipt) return errorHandler(res, 404, "Money Receipt Not Found");

        const result = await MoneyReceiptService.deleteMoneyReceipt({ id: receipt.id });
        if (!result.deleted) return errorHandler(res, 500, "Could not delete the money receipt.");
        return ok(res, "Money Receipt Deleted Successfully.", result);
    } catch (error) {
        return serverError(res, "controller: deleteMoneyReceipt", error, "Could not delete the money receipt.");
    };
};
