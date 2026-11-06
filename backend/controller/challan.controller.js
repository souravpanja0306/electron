const moment = require("moment");
const fs = require('fs');
const { app } = require("electron");
const contents = require("../content/contents");
const ChallanService = require("../service/challan.service");
const SettingService = require("../service/setting.service");
const PartyService = require("../service/party.service");
const AdminService = require("../service/admin.service");
const CompanyService = require("../service/company.service");
const { generateChallanHtml } = require("../helper/generateChallanHtml");

const errorHandler = (res, status, message) => {
    return res.status(status).json({ status, message, body: [] });
};

const toText = (value) => (value === undefined || value === null ? "" : String(value).trim());

// Normalises the item rows and recomputes the total on the server so the stored
// total can never disagree with the stored line items.
const normaliseItems = (data) => {
    let rows = data;
    if (typeof rows === "string") {
        try { rows = JSON.parse(rows); } catch (e) { rows = []; }
    }
    if (!Array.isArray(rows)) rows = [];

    const items = rows
        .map((row, index) => ({
            id: row?.id ?? Date.now() + index,
            packages: row?.packages ?? "",
            description: toText(row?.description),
            weight: row?.weight ?? "",
            amount: row?.amount ?? "",
        }))
        .filter((row) => row.description !== "" || row.packages !== "" || row.weight !== "" || row.amount !== "");

    const total = items.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
    return { items, total: Math.round(total * 100) / 100 };
};

// Fields shared by create and update.
const buildChallanFields = (body) => {
    const { items, total } = normaliseItems(body.data);
    return {
        company_id: body.company_id,
        consignor_id: body.consignor_id,
        consignee_id: body.consignee_id,
        cn_no: toText(body.cn_no),
        date: toText(body.date),
        from_loc: toText(body.from_loc),
        to_loc: toText(body.to_loc),
        invoice_no: toText(body.invoice_no),
        way_bill_no: toText(body.way_bill_no),
        way_bill_date: toText(body.way_bill_date),
        container: toText(body.container),
        cha: body.cha ? body.cha : null,
        booking_number: toText(body.booking_number),
        truck_no: toText(body.truck_no),
        note: toText(body.note),
        total_amount: total,
        data: JSON.stringify(items),
    };
};

const validateChallanFields = (fields) => {
    if (!fields.company_id) return "Company is required.";
    if (!fields.consignor_id || !fields.consignee_id) return "Consignor and Consignee are required.";
    if (!fields.cn_no) return "C/N Number is required.";
    return null;
};

module.exports.generateChallanPdf = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { t_userId } = req.body;
        const { id } = req.query;
        if (!id) return errorHandler(res, 400, "Challan ID is required.");

        let search_key = { id };
        if (t_userId) search_key["created_by"] = t_userId;

        let challans = await ChallanService.findChallans(search_key);
        if (!challans.length) return errorHandler(res, 404, "Challan not found.");
        let challan = challans[0];

        // Hydrate relations
        let consignor = await PartyService.getParty({ id: challan.consignor_id });
        let consignee = await PartyService.getParty({ id: challan.consignee_id });
        challan.consignor_id = consignor.length ? consignor[0] : null;
        challan.consignee_id = consignee.length ? consignee[0] : null;
        challan.data = challan.data ? JSON.parse(challan.data) : [];

        // Show the CHA's name on the print, not its numeric id
        if (challan.cha) {
            let chaList = await AdminService.findCHA({ id: challan.cha });
            challan.cha = chaList.length ? chaList[0].name : "";
        }

        // Get company
        let companies = await CompanyService.getCompany({ id: challan.company_id });
        let challanSetting = await SettingService.getChallanSetting({ company_id: challan.company_id });
        let company = companies.length ? companies[0] : {};

        // Same CHA switch as the forms (Invoice / Challan settings).
        challan.show_cha = (await SettingService.getUserShowCha({ user_id: challan.created_by })) ? 1 : 0;

        const html = generateChallanHtml({ challan, company, terms: challanSetting.length ? challanSetting[0].terms : "" });

        response.status = 200;
        response.message = "PDF generated successfully.";
        response.body = {
            html: html
        };
    } catch (error) {
        console.log(`Something went wrong: controller: generateChallanPdf: ${error}`);
        response.status = 500;
        response.message = error.message || "Something went wrong: controller: generateChallanPdf";
    }
    return res.status(response.status).json(response);
};

module.exports.createChallan = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { t_userId } = req.body;

        const fields = buildChallanFields(req.body);
        const invalid = validateChallanFields(fields);
        if (invalid) return errorHandler(res, 400, invalid);

        let dupKey = { cn_no: fields.cn_no };
        if (t_userId) dupKey["created_by"] = t_userId.toString();
        let isCnExist = await ChallanService.findChallans(dupKey);
        if (isCnExist.length) return errorHandler(res, 409, "C/N Number Already Exists.");

        let finalData = { ...fields, created_by: t_userId };

        let result = await ChallanService.insertChallanData(finalData);

        response.status = 200;
        response.message = "Challan created successfully.";
        response.body = result;
    } catch (error) {
        console.log(`Something went wrong: controller: createChallan: ${error}`);
        response.status = 500;
        response.message = error.message || "Something went wrong: controller: createChallan";
    }
    return res.status(response.status).json(response);
};

module.exports.getAllChallans = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { t_userId } = req.body;
        const { id, startDate, endDate, search } = req.query;

        let search_key = { startDate, endDate, search };
        if (id) search_key["id"] = id;
        if (t_userId) search_key["created_by"] = t_userId.toString();

        let result = await ChallanService.findChallans(search_key);
        if (result.length) {
            let finalData = [];
            for (let item of result) {
                let consignor = await PartyService.getParty({ id: item.consignor_id });
                let consignee = await PartyService.getParty({ id: item.consignee_id });
                let company = await CompanyService.getCompany({ id: item.company_id });
                // findCHA() with an empty id returns every CHA, so only look up when one is set
                let cha = item.cha ? await AdminService.findCHA({ id: item.cha }) : [];

                let newData = {
                    id: item.id,
                    company_id: company.length ? company[0] : null,
                    consignor_id: consignor.length ? consignor[0] : null,
                    consignee_id: consignee.length ? consignee[0] : null,
                    cn_no: item.cn_no || "--",
                    date: item.date || "--",
                    from_loc: item.from_loc || "--",
                    to_loc: item.to_loc || "--",
                    invoice_no: item.invoice_no || "--",
                    way_bill_no: item.way_bill_no || "--",
                    way_bill_date: item.way_bill_date || "--",
                    container: item.container || "--",
                    cha: cha.length ? cha[0] : null,
                    booking_number: item.booking_number || "--",
                    truck_no: item.truck_no || "--",
                    note: item.note || "--",
                    total_amount: item.total_amount || 0,
                    data: item.data ? JSON.parse(item.data) : [],
                    created_by: item.created_by,
                    created_at: item.created_at,
                    is_active: item.is_active,
                    is_deleted: item.is_deleted,
                    invoiced: Boolean(item.invoiced)
                };
                finalData.push(newData);
            }
            response.status = 200;
            response.message = "Data fetched successfully.";
            response.body = finalData;
        } else {
            response.status = 202;
            response.message = "Data not found.";
            response.body = [];
        }
    } catch (error) {
        console.log(`Something went wrong: controller: getAllChallans: ${error}`);
        response.status = 500;
        response.message = error.message || "Something went wrong: controller: getAllChallans";
    }
    return res.status(response.status).json(response);
};

module.exports.deleteChallan = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { t_userId } = req.body;
        const { id } = req.params;

        let search_key = { id };
        if (t_userId) search_key["created_by"] = t_userId.toString();

        let checkChallan = await ChallanService.findChallans(search_key);
        if (!checkChallan.length) return errorHandler(res, 404, "Challan not found.");
        if (checkChallan[0].invoiced) {
            return errorHandler(res, 409, "This challan has an invoice. Delete the invoice first.");
        }

        let result = await ChallanService.deleteChallan({ id });
        if (result.deleted) {
            response.status = 200;
            response.message = "Challan deleted successfully.";
        } else {
            response.status = 202;
            response.message = "Something went wrong!";
        }
    } catch (error) {
        console.log(`Something went wrong: controller: deleteChallan: ${error}`);
        response.status = 500;
        response.message = error.message || "Something went wrong: controller: deleteChallan";
    }
    return res.status(response.status).json(response);
};

module.exports.updateChallan = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { t_userId } = req.body;
        const { id } = req.params;

        const fields = buildChallanFields(req.body);
        const invalid = validateChallanFields(fields);
        if (invalid) return errorHandler(res, 400, invalid);

        let search_key = { id };
        if (t_userId) search_key["created_by"] = t_userId.toString();

        let checkChallan = await ChallanService.findChallans(search_key);
        if (!checkChallan.length) return errorHandler(res, 404, "Challan not found.");

        // C/N number must stay unique, ignoring this challan itself.
        let dupKey = { cn_no: fields.cn_no };
        if (t_userId) dupKey["created_by"] = t_userId.toString();
        let sameCn = await ChallanService.findChallans(dupKey);
        if (sameCn.some((item) => String(item.id) !== String(id))) {
            return errorHandler(res, 409, "C/N Number Already Exists.");
        }

        // `invoiced` is deliberately not touched here: it is owned by the invoice flow.
        let result = await ChallanService.updateChallanData(id, fields);

        if (result.changes > 0) {
            response.status = 200;
            response.message = "Challan updated successfully.";
            response.body = result;
        } else {
            response.status = 202;
            response.message = "Challan not found or no changes made.";
        }
    } catch (error) {
        console.log(`Something went wrong: controller: updateChallan: ${error}`);
        response.status = 500;
        response.message = error.message || "Something went wrong: controller: updateChallan";
    }
    return res.status(response.status).json(response);
};

module.exports.generateChallanNo = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { t_userId } = req.body;
        const { types, company_id } = req.query;
        if (!types) {
            response.status = 400;
            response.message = "Type required";
            response.body = [];
            return res.status(response.status).json(response);
        };
        let prefix = "";
        let starting = 0;
        let suffix = "";

        let isExist = await SettingService.getChallanSetting({ company_id: company_id });
        if (isExist.length) {
            prefix = isExist[0].prefix;
            starting = isExist[0].starting;
            suffix = isExist[0].suffix;
        };

        const existsCheck = async ({
            prefix = "",
            starting = "",
            suffix = ""
        }) => {
            let search_key = {};
            if (t_userId) search_key["created_by"] = t_userId;

            let count = await ChallanService.findChallans({ ...search_key, count: true });
            while (true) {
                const challanNo = `${prefix ? prefix : ""}${(count + 1 + parseInt(starting)).toString().padStart(6, "0")}${suffix ? suffix : ""}`;
                search_key["cn_no"] = challanNo;
                const exists = await ChallanService.findChallans(search_key);
                if (!exists.length) return challanNo;
                count++;
            };
        };

        let result = await existsCheck({
            prefix: prefix,
            starting: starting,
            suffix: suffix
        });

        if (result) {
            response.status = 200;
            response.message = "Challan Number Generated Successfully.";
            response.body = result;
        };
    } catch (error) {
        console.log(`Something went wrong: controller: generateChallanNo: ${error}`);
        response.status = 500;
        response.message = error.message || "Internal Server Error";
    };
    return res.status(response.status).json(response);
};
