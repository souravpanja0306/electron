const moment = require("moment");
const fs = require('fs');
const contents = require("../content/contents");
const ChallanService = require("../service/challan.service");
const PartyService = require("../service/party.service");
const CompanyService = require("../service/company.service");
const { generateChallanHtml } = require("../helper/generateChallanHtml");

const errorHandler = (res, status, message) => {
    return res.status(status).json({ status, message, body: [] });
};

exports.generateChallanPdf = async (req, res) => {
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

        // Get company
        let companies = await CompanyService.getCompany({ id: challan.company_id });
        let company = companies.length ? companies[0] : {};

        const html = generateChallanHtml({ challan, company });

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

exports.createChallan = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { t_userId, company_id, consignor_id, consignee_id, cn_no, date, from_loc, to_loc,
            invoice_no, way_bill_no, way_bill_date, container, cha, booking_number, truck_no, note, data
        } = req.body;

        if (!consignor_id || !consignee_id) return errorHandler(res, 400, "Consignor and Consignee are required.");

        if (cn_no) {
            let isCnExist = await ChallanService.findChallans({ cn_no: cn_no });
            if (isCnExist.length) return errorHandler(res, 409, "C/N Number Already Exists.");
        }

        let finalData = {
            company_id,
            consignor_id,
            consignee_id,
            cn_no,
            date,
            from_loc,
            to_loc,
            invoice_no,
            way_bill_no,
            way_bill_date,
            container,
            cha,
            booking_number,
            truck_no,
            note,
            total_amount: req.body.total_amount || 0,
            created_by: t_userId,
            data: JSON.stringify(data)
        };

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

exports.getAllChallans = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { t_userId } = req.body;
        const { id } = req.query;

        let search_key = {};
        if (id) search_key["id"] = id;
        if (t_userId) search_key["created_by"] = t_userId.toString();

        let result = await ChallanService.findChallans(search_key);
        if (result.length) {
            let finalData = [];
            for (let item of result) {
                let consignor = await PartyService.getParty({ id: item.consignor_id });
                let consignee = await PartyService.getParty({ id: item.consignee_id });
                let company = await CompanyService.getCompany({ id: item.company_id });

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
                    cha: item.cha || "--",
                    booking_number: item.booking_number || "--",
                    truck_no: item.truck_no || "--",
                    note: item.note || "--",
                    total_amount: item.total_amount || 0,
                    data: item.data ? JSON.parse(item.data) : [],
                    created_by: item.created_by,
                    created_at: item.created_at,
                    is_active: item.is_active,
                    is_deleted: item.is_deleted
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

exports.deleteChallan = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { t_userId } = req.body;
        const { id } = req.params;

        let search_key = { id };
        if (t_userId) search_key["created_by"] = t_userId.toString();

        let checkChallan = await ChallanService.findChallans(search_key);
        if (!checkChallan.length) return errorHandler(res, 404, "Challan not found.");

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

exports.updateChallan = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { t_userId } = req.body;
        const { id } = req.params;
        const { company_id, consignor_id, consignee_id, cn_no, date, from_loc, to_loc,
            invoice_no, way_bill_no, way_bill_date, container, cha, booking_number, truck_no, note, data, total_amount
        } = req.body;

        if (!consignor_id || !consignee_id) return errorHandler(res, 400, "Consignor and Consignee are required.");

        let search_key = { id };
        if (t_userId) search_key["created_by"] = t_userId.toString();

        let checkChallan = await ChallanService.findChallans(search_key);
        if (!checkChallan.length) return errorHandler(res, 404, "Challan not found.");

        let finalData = {
            company_id,
            consignor_id,
            consignee_id,
            cn_no,
            date,
            from_loc,
            to_loc,
            invoice_no,
            way_bill_no,
            way_bill_date,
            container,
            cha,
            booking_number,
            truck_no,
            note,
            total_amount: total_amount || 0,
            data: JSON.stringify(data)
        };

        let result = await ChallanService.updateChallanData(id, finalData);

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

exports.generateChallanNo = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { t_userId } = req.body;
        const { types } = req.query;
        if (!types) {
            response.status = 400;
            response.message = "Type required";
            response.body = [];
            return res.status(response.status).json(response);
        };
        let type = "";
        if (types == "challan") type = "CHA";

        const existsCheck = async ({
            type = ""
        }) => {
            let search_key = {};
            if (t_userId) search_key["created_by"] = t_userId;

            let count = await ChallanService.findChallans({ ...search_key, count: true });
            while (true) {
                const challanNo = `${type}${(count + 1).toString().padStart(6, "0")}`;
                search_key["cn_no"] = challanNo;
                const exists = await ChallanService.findChallans(search_key);
                if (!exists.length) return challanNo;
                count++;
            };
        };

        let result = await existsCheck({ type: type });
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