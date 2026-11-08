// Services / helpers...
const ChallanService = require("../service/challan.service");
const SettingService = require("../service/setting.service");
const { generateChallanHtml } = require("../helper/generateChallanHtml");
const { errorHandler, ok, str, toId, round2, isYmd, parseJsonArray, serverError } = require("../helper/http");
const { checkLinks, loadById, pick } = require("../helper/records");

// Rows the user left completely empty are dropped; the total is recomputed on the server
// so the stored total can never disagree with the stored lines.
const normaliseItems = (data) => {
    const items = parseJsonArray(data)
        .map((row, index) => ({
            id: row?.id ?? Date.now() + index,
            packages: str(row?.packages),
            description: str(row?.description),
            weight: str(row?.weight),
            amount: str(row?.amount),
        }))
        .filter((row) => row.description || row.packages || row.weight || row.amount);
    const total = items.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
    return { items, total: round2(total) };
};

// Fields shared by create and update.
const buildChallanFields = (body) => {
    const { items, total } = normaliseItems(body.data);
    return {
        company_id: toId(body.company_id),
        consignor_id: toId(body.consignor_id),
        consignee_id: toId(body.consignee_id),
        cn_no: str(body.cn_no),
        date: str(body.date),
        from_loc: str(body.from_loc),
        to_loc: str(body.to_loc),
        invoice_no: str(body.invoice_no),
        way_bill_no: str(body.way_bill_no),
        way_bill_date: str(body.way_bill_date),
        container: str(body.container),
        cha: toId(body.cha),
        booking_number: str(body.booking_number),
        truck_no: str(body.truck_no).toUpperCase(),
        note: str(body.note),
        total_amount: total,
        data: JSON.stringify(items),
        // Internal: not a column.
        _items: items,
    };
};

// `existing`: the saved challan when updating (its CHA may since have been removed from the master).
const validateChallanFields = (fields, userId, existing = null) => {
    if (!fields.company_id) return "Company is required.";
    if (!fields.consignor_id || !fields.consignee_id) return "Consignor and Consignee are required.";
    if (!fields.cn_no) return "C/N Number is required.";
    if (fields.date && !isYmd(fields.date)) return "Enter a valid challan date.";
    if (fields.way_bill_date && !isYmd(fields.way_bill_date)) return "Enter a valid way bill date.";
    if (fields._items.some((row) => row.amount && !(Number(row.amount) >= 0))) return "Amounts must be zero or more.";
    return checkLinks({
        userId,
        company_id: fields.company_id,
        parties: [{ id: fields.consignor_id, label: "Consignor" }, { id: fields.consignee_id, label: "Consignee" }],
        cha: existing && fields.cha === existing.cha ? null : fields.cha,
    });
};

const withoutInternal = ({ _items, ...fields }) => fields;

// The challan with this id, if it belongs to the signed-in user.
const findOwnChallan = async (id, userId) => (await ChallanService.findChallans({ id, created_by: userId }))[0] || null;

// C/N numbers are unique per user (the generator counts all of the user's challans).
const cnTaken = async (cn_no, userId, exceptId) => {
    const same = await ChallanService.findChallans({ cn_no, created_by: userId });
    return same.some((item) => String(item.id) !== String(exceptId));
};

module.exports.generateChallanPdf = async (req, res) => {
    try {
        const { t_userId } = req.body;
        const id = toId(req.query.id);
        if (!id) return errorHandler(res, 400, "Challan ID is required.");

        const challan = await findOwnChallan(id, t_userId);
        if (!challan) return errorHandler(res, 404, "Challan not found.");

        const parties = loadById("party", [challan.consignor_id, challan.consignee_id]);
        const company = pick(loadById("company", [challan.company_id]), challan.company_id) || {};
        const cha = challan.cha ? pick(loadById("cha", [challan.cha]), challan.cha) : null;
        const challanSetting = await SettingService.getChallanSetting({ company_id: challan.company_id });

        const html = generateChallanHtml({
            challan: {
                ...challan,
                consignor_id: pick(parties, challan.consignor_id),
                consignee_id: pick(parties, challan.consignee_id),
                data: parseJsonArray(challan.data),
                // Show the CHA's name on the print, not its numeric id.
                cha: cha?.name || "",
                // Same CHA switch as the forms (Invoice / Challan settings).
                show_cha: (await SettingService.getUserShowCha({ user_id: challan.created_by })) ? 1 : 0,
            },
            company,
            terms: challanSetting[0]?.terms || "",
        });
        return ok(res, "PDF generated successfully.", { html });
    } catch (error) {
        return serverError(res, "controller: generateChallanPdf", error, "Could not prepare the challan for printing.");
    };
};

module.exports.createChallan = async (req, res) => {
    try {
        const { t_userId } = req.body;
        const fields = buildChallanFields(req.body);
        const invalid = validateChallanFields(fields, t_userId);
        if (invalid) return errorHandler(res, 400, invalid);
        if (await cnTaken(fields.cn_no, t_userId)) return errorHandler(res, 409, "C/N Number Already Exists.");

        const result = await ChallanService.insertChallanData({ ...withoutInternal(fields), created_by: t_userId });
        return ok(res, "Challan created successfully.", { ...result, id: Number(result.lastInsertRowid) });
    } catch (error) {
        return serverError(res, "controller: createChallan", error, "Could not save the challan.");
    };
};

module.exports.getAllChallans = async (req, res) => {
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
            if (!id) return errorHandler(res, 400, "Invalid challan ID.");
            search_key.id = id;
        };

        const result = await ChallanService.findChallans(search_key);
        if (!result.length) return res.status(202).json({ status: 202, message: "Data not found.", body: [] });

        // One query per related table instead of four per challan.
        const parties = loadById("party", result.flatMap((item) => [item.consignor_id, item.consignee_id]));
        const companies = loadById("company", result.map((item) => item.company_id));
        const chas = loadById("cha", result.map((item) => item.cha));

        const finalData = result.map((item) => ({
            id: item.id,
            company_id: pick(companies, item.company_id),
            consignor_id: pick(parties, item.consignor_id),
            consignee_id: pick(parties, item.consignee_id),
            cn_no: item.cn_no || "",
            date: item.date || "",
            from_loc: item.from_loc || "",
            to_loc: item.to_loc || "",
            invoice_no: item.invoice_no || "",
            way_bill_no: item.way_bill_no || "",
            way_bill_date: item.way_bill_date || "",
            container: item.container || "",
            cha: pick(chas, item.cha),
            booking_number: item.booking_number || "",
            truck_no: item.truck_no || "",
            note: item.note || "",
            total_amount: Number(item.total_amount) || 0,
            data: parseJsonArray(item.data),
            created_by: item.created_by,
            created_at: item.created_at,
            is_active: item.is_active,
            is_deleted: item.is_deleted,
            invoiced: Boolean(item.invoiced),
        }));
        return ok(res, "Data fetched successfully.", finalData);
    } catch (error) {
        return serverError(res, "controller: getAllChallans", error, "Could not load challans.");
    };
};

module.exports.deleteChallan = async (req, res) => {
    try {
        const { t_userId } = req.body;
        const id = toId(req.params.id);
        if (!id) return errorHandler(res, 400, "Challan ID is required.");

        const challan = await findOwnChallan(id, t_userId);
        if (!challan) return errorHandler(res, 404, "Challan not found.");
        if (challan.invoiced) return errorHandler(res, 409, "This challan has an invoice. Delete the invoice first.");

        const result = await ChallanService.deleteChallan({ id });
        if (!result?.deleted) return errorHandler(res, 404, "Challan not found.");
        return ok(res, "Challan deleted successfully.");
    } catch (error) {
        return serverError(res, "controller: deleteChallan", error, "Could not delete the challan.");
    };
};

module.exports.updateChallan = async (req, res) => {
    try {
        const { t_userId } = req.body;
        const id = toId(req.params.id);
        if (!id) return errorHandler(res, 400, "Challan ID is required.");

        const challan = await findOwnChallan(id, t_userId);
        if (!challan) return errorHandler(res, 404, "Challan not found.");

        const fields = buildChallanFields(req.body);
        const invalid = validateChallanFields(fields, t_userId, challan);
        if (invalid) return errorHandler(res, 400, invalid);
        if (await cnTaken(fields.cn_no, t_userId, id)) return errorHandler(res, 409, "C/N Number Already Exists.");

        // `invoiced` is deliberately not touched here: it is owned by the invoice flow.
        const result = await ChallanService.updateChallanData(id, withoutInternal(fields));
        if (!result.changes) return res.status(202).json({ status: 202, message: "Challan not found or no changes made.", body: [] });
        return ok(res, "Challan updated successfully.", result);
    } catch (error) {
        return serverError(res, "controller: updateChallan", error, "Could not update the challan.");
    };
};

/** Next C/N number: prefix + (existing challans + 1 + starting offset), padded to 6, + suffix. */
module.exports.generateChallanNo = async (req, res) => {
    try {
        const { t_userId } = req.body;
        if (!str(req.query.types)) return errorHandler(res, 400, "Type required");
        const company_id = toId(req.query.company_id);

        let prefix = "";
        let suffix = "";
        let starting = 0;
        if (company_id) {
            const setting = (await SettingService.getChallanSetting({ company_id }))[0];
            if (setting) {
                prefix = setting.prefix || "";
                suffix = setting.suffix || "";
                starting = Math.max(0, parseInt(setting.starting, 10) || 0);
            };
        };

        let count = await ChallanService.findChallans({ created_by: t_userId, count: true });
        for (let attempt = 0; attempt < 10000; attempt++) {
            const challanNo = `${prefix}${String(count + 1 + starting).padStart(6, "0")}${suffix}`;
            if (!(await cnTaken(challanNo, t_userId))) return ok(res, "Challan Number Generated Successfully.", challanNo);
            count++;
        };
        return errorHandler(res, 409, "Could not find a free C/N number. Check the challan number settings.");
    } catch (error) {
        return serverError(res, "controller: generateChallanNo", error, "Could not generate the C/N number.");
    };
};
