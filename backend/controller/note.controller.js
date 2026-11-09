// Credit notes and debit notes.
// A credit note reduces what a party owes (returns, discounts, over-billing);
// a debit note increases it (under-billing, extra charges). Both use the same
// line items and GST rules as a tax invoice.

// Services / helpers...
const NoteService = require("../service/note.service");
const InvoiceService = require("../service/invoice.service");
const { generateNoteHtml } = require("../helper/generateNoteHtml");
const { errorHandler, ok, str, toId, toNumber, isYmd, parseJsonArray, serverError } = require("../helper/http");
const { checkLinks, loadById, pick } = require("../helper/records");
const { normaliseInvoiceItems, validateItems, calculateInvoiceTotals } = require("../helper/invoiceMath");

const NOTE_TYPES = {
    credit: { prefix: "CN-", label: "Credit note" },
    debit: { prefix: "DN-", label: "Debit note" },
};

const noteType = (value) => (NOTE_TYPES[str(value)] ? str(value) : null);

// Note numbers are unique per company and type: CN- and DN- each have their own series.
const numberTaken = async ({ note_no, note_type, company_id, userId, exceptId }) => {
    const same = await NoteService.findNotes({ note_no, note_type, company_id, created_by: userId });
    return same.some((item) => String(item.id) !== String(exceptId));
};

// The note with this id, if it belongs to the signed-in user.
const findOwnNote = async (id, userId) => (await NoteService.findNotes({ id, created_by: userId }))[0] || null;

/** Validates the fields shared by create / update. Returns { error } or the clean values. */
const prepareNote = async ({ userId, note_type, company_id, party_id, invoice_id, note_no, note_date, data }) => {
    const type = noteType(note_type);
    const companyId = toId(company_id);
    const partyId = toId(party_id);
    const invoiceId = toId(invoice_id);
    if (!type) return { error: "Choose credit note or debit note." };
    if (!companyId) return { error: "Please select Company." };
    if (!partyId) return { error: "Please select Party." };
    if (!str(note_no)) return { error: "Note number is required." };
    if (!isYmd(note_date)) return { error: "Enter a valid date." };
    if (invoice_id && !invoiceId) return { error: "Invalid invoice." };

    const items = normaliseInvoiceItems(data);
    const itemError = validateItems(items);
    if (itemError) return { error: itemError };

    const linkError = checkLinks({ userId, company_id: companyId, parties: [{ id: partyId, label: "Party" }] });
    if (linkError) return { error: linkError };

    // The original invoice must be the user's, for the same party and company.
    if (invoiceId) {
        const invoice = (await InvoiceService.findInvoices({ id: invoiceId, created_by: userId }))[0];
        if (!invoice) return { error: "The selected invoice was not found." };
        if (Number(invoice.party_id) !== partyId) return { error: "The selected invoice belongs to a different party." };
        if (Number(invoice.company_id) !== companyId) return { error: "The selected invoice belongs to a different company." };
    };

    const company = pick(loadById("company", [companyId]), companyId);
    const party = pick(loadById("party", [partyId]), partyId);
    return {
        type, companyId, partyId, invoiceId, items,
        totals: calculateInvoiceTotals({ items, company, party }),
    };
};

module.exports.generateNoteNo = async (req, res) => {
    try {
        const { t_userId } = req.body;
        const type = noteType(req.query.type);
        if (!type) return errorHandler(res, 400, "Note type is required.");
        const company_id = toId(req.query.company_id);
        if (!company_id) return errorHandler(res, 400, "Please select a company.");

        const scopeKey = { created_by: t_userId, note_type: type, company_id };
        let count = await NoteService.findNotes({ ...scopeKey, count: true });
        for (let attempt = 0; attempt < 10000; attempt++) {
            const noteNo = `${NOTE_TYPES[type].prefix}${String(count + 1).padStart(6, "0")}`;
            const exists = await NoteService.findNotes({ ...scopeKey, note_no: noteNo });
            if (!exists.length) return ok(res, "Note number generated.", noteNo);
            count++;
        };
        return errorHandler(res, 409, "Could not find a free note number.");
    } catch (error) {
        return serverError(res, "controller: generateNoteNo", error, "Could not generate the note number.");
    };
};

module.exports.createNote = async (req, res) => {
    try {
        const { t_userId } = req.body;
        const body = req.body;
        const note_no = str(body.note_no);

        const prepared = await prepareNote({ userId: t_userId, ...body, note_no });
        if (prepared.error) return errorHandler(res, 400, prepared.error);

        if (await numberTaken({ note_no, note_type: prepared.type, company_id: prepared.companyId, userId: t_userId })) {
            return errorHandler(res, 409, "This note number already exists.");
        };

        const result = await NoteService.insertNote({
            note_type: prepared.type,
            company_id: prepared.companyId,
            party_id: prepared.partyId,
            invoice_id: prepared.invoiceId,
            note_no,
            note_date: str(body.note_date),
            reason: str(body.reason),
            placeOfSupply: str(body.placeOfSupply),
            data: JSON.stringify(prepared.items),
            ...prepared.totals,
            created_by: t_userId,
        });
        return ok(res, `${NOTE_TYPES[prepared.type].label} created successfully.`, { ...result, id: Number(result.lastInsertRowid) });
    } catch (error) {
        return serverError(res, "controller: createNote", error, "Could not save the note.");
    };
};

module.exports.getNotes = async (req, res) => {
    try {
        const { t_userId } = req.body;
        const search_key = {
            created_by: t_userId,
            note_type: noteType(req.query.type) || "",
            startDate: isYmd(req.query.startDate) ? req.query.startDate : "",
            endDate: isYmd(req.query.endDate) ? req.query.endDate : "",
            search: str(req.query.search),
        };
        if (req.query.id) {
            const id = toId(req.query.id);
            if (!id) return errorHandler(res, 400, "Invalid note ID.");
            search_key.id = id;
        };

        const result = await NoteService.findNotes(search_key);
        if (!result.length) return res.status(202).json({ status: 202, message: "Data not found.", body: [] });

        const parties = loadById("party", result.map((item) => item.party_id));
        const companies = loadById("company", result.map((item) => item.company_id));
        const invoices = loadById("invoice", result.map((item) => item.invoice_id));

        const finalData = result.map((item) => {
            const invoice = pick(invoices, item.invoice_id);
            return {
                id: item.id,
                note_type: item.note_type,
                note_no: item.note_no || "",
                note_date: item.note_date || "",
                company_id: pick(companies, item.company_id) || "",
                party_id: pick(parties, item.party_id) || "",
                // Only the fields the screens need; a deleted invoice still shows its number.
                invoice: invoice ? { id: invoice.id, invoice_no: invoice.invoice_no, invoice_date: invoice.invoice_date, is_deleted: invoice.is_deleted } : null,
                reason: item.reason || "",
                placeOfSupply: item.placeOfSupply || "",
                data: parseJsonArray(item.data),
                total_quantity: toNumber(item.total_quantity),
                total_amount: toNumber(item.total_amount),
                total_cgst: toNumber(item.total_cgst),
                total_sgst: toNumber(item.total_sgst),
                total_igst: toNumber(item.total_igst),
                created_at: item.created_at || "",
            };
        });
        return ok(res, "Data fetched successfully.", finalData);
    } catch (error) {
        return serverError(res, "controller: getNotes", error, "Could not load notes.");
    };
};

module.exports.updateNote = async (req, res) => {
    try {
        const { t_userId } = req.body;
        const body = req.body;
        const id = toId(body.id);
        if (!id) return errorHandler(res, 400, "Note ID is required.");

        const existing = await findOwnNote(id, t_userId);
        if (!existing) return errorHandler(res, 404, "Note not found.");

        const note_no = str(body.note_no);
        // The type never changes after creation.
        const prepared = await prepareNote({ userId: t_userId, ...body, note_type: existing.note_type, note_no });
        if (prepared.error) return errorHandler(res, 400, prepared.error);

        if (await numberTaken({ note_no, note_type: prepared.type, company_id: prepared.companyId, userId: t_userId, exceptId: id })) {
            return errorHandler(res, 409, "This note number already exists.");
        };

        const result = await NoteService.updateNote(id, {
            company_id: prepared.companyId,
            party_id: prepared.partyId,
            invoice_id: prepared.invoiceId,
            note_no,
            note_date: str(body.note_date),
            reason: str(body.reason),
            placeOfSupply: str(body.placeOfSupply),
            data: JSON.stringify(prepared.items),
            ...prepared.totals,
        });
        if (!result.changes) return res.status(202).json({ status: 202, message: "No changes made or note not found.", body: [] });
        return ok(res, `${NOTE_TYPES[prepared.type].label} updated successfully.`, result);
    } catch (error) {
        return serverError(res, "controller: updateNote", error, "Could not update the note.");
    };
};

module.exports.deleteNote = async (req, res) => {
    try {
        const { t_userId } = req.body;
        const id = toId(req.params.id);
        if (!id) return errorHandler(res, 400, "Note ID is required.");

        const note = await findOwnNote(id, t_userId);
        if (!note) return errorHandler(res, 404, "Note not found.");

        const result = await NoteService.deleteNote({ id });
        if (!result.deleted) return errorHandler(res, 404, "Note not found.");
        return ok(res, `${NOTE_TYPES[note.note_type]?.label || "Note"} deleted successfully.`);
    } catch (error) {
        return serverError(res, "controller: deleteNote", error, "Could not delete the note.");
    };
};

module.exports.generateNotePdf = async (req, res) => {
    try {
        const { t_userId } = req.body;
        const id = toId(req.query.id);
        if (!id) return errorHandler(res, 400, "Note ID is required.");

        const note = await findOwnNote(id, t_userId);
        if (!note) return errorHandler(res, 404, "Note not found.");

        const party = pick(loadById("party", [note.party_id]), note.party_id);
        const company = pick(loadById("company", [note.company_id]), note.company_id) || {};
        const invoice = note.invoice_id ? pick(loadById("invoice", [note.invoice_id]), note.invoice_id) : null;

        const html = generateNoteHtml({
            note: { ...note, party_id: party, data: parseJsonArray(note.data) },
            invoice,
            company,
        });
        return ok(res, "PDF generated successfully.", { html });
    } catch (error) {
        return serverError(res, "controller: generateNotePdf", error, "Could not prepare the note for printing.");
    };
};
