// Package...
const moment = require("moment");

// Contents...
const contents = require("../content/contents");

// Services...
const UserService = require("../service/user.service");
const AdminService = require("../service/admin.service")
const PartyService = require("../service/party.service");
const AuthService = require("../service/auth.service")
const InvoiceService = require("../service/invoice.service");

const errorHandler = (res, status, message) => {
    return res.status(status).json({ status, message, body: [] });
};

exports.resetAllTable = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { tableNames } = req.query;
        if (!tableNames) {
            response.status = 200;
            response.message = "Please Provide Table Name";
            response.body = [];
            return res.status(response.status).json(response);
        };

        let result = await AdminService.resetTableData({ tableNames: tableNames });
        if (result) {
            response.status = 200;
            response.message = "Table Reset Sucessfully";
            response.body = result;
        };
    } catch (error) {
        console.log(`Something went wrong: controller: resetAllTable: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: resetAllTable`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
};

module.exports.createHsnSac = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { t_userId, t_mobile, t_username, t_name, code, description, gst_rate, type } = req.body;

        let search_key = {};
        if (t_userId) search_key["created_by"] = t_userId;
        if (code) search_key["code"] = code;
        if (type) search_key["type"] = type;

        let isExits = await AdminService.findHSNSAC(search_key);
        if (isExits.length) return errorHandler(res, 400, "This Data is Allready Created.");

        let finalData = {
            code: code,
            type: type,
            description: description,
            gst_rate: gst_rate,
            created_by: t_userId,
        };
        let result = await AdminService.createHSNSAC(finalData);
        if (result) {
            response.status = 200;
            response.message = "Data Created Successfully.";
            response.body = result;
        } else {
            response.status = 200;
            response.message = "Data Not Created";
            response.body = {};
        };
    } catch (error) {
        console.log(`Something went wrong: controller: createHsnSac: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: createHsnSac`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
};

module.exports.getHsnSac = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { t_userId } = req.body;

        let search_key = {};
        if (t_userId) search_key["created_by"] = t_userId;

        let result = await AdminService.findHSNSAC(search_key);
        if (result.length) {
            let finalData = [];
            for (let item of result) {
                let CreateBy = await UserService.getUsers({ id: item.created_by });
                let newData = {
                    id: item.id,
                    code: item.code,
                    type: item.type,
                    description: item.description,
                    gst_rate: 12,
                    created_by: CreateBy.length ? {
                        id: CreateBy[0].id ? CreateBy[0].id : "",
                        name: CreateBy[0].company_name ? CreateBy[0].company_name : "",
                        mobile: CreateBy[0].mobile ? CreateBy[0].mobile : "",
                        email: CreateBy[0].email ? CreateBy[0].email : "",
                    } : {},
                    created_at: moment(item.created_at).format("DD-MM-YYYY"),
                    is_active: 1,
                    is_deleted: 0
                };
                finalData.push(newData);
            };
            response.status = 200;
            response.message = "HSN - SAC Get Sucessfully";
            response.body = finalData;
        } else {
            response.status = 202;
            response.message = "No Data Found.";
            response.body = [];
        };
    } catch (error) {
        console.log(`Something went wrong: controller: getHsnSac: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: getHsnSac`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
};

module.exports.createGST = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { t_userId, t_mobile, t_username, t_name, title, total_rate, cgst, sgst, igst, type } = req.body;

        let search_key = {};
        if (t_userId) search_key["created_by"] = t_userId;
        if (total_rate) search_key["total_rate"] = total_rate;

        let isExits = await AdminService.findGST(search_key);
        if (isExits.length) return errorHandler(res, 400, "This Data is Allready Created.");

        let finalData = {
            title: title,
            total_rate: total_rate,
            cgst: cgst,
            sgst: sgst,
            igst: igst,
            type: type,
            created_by: t_userId
        };
        let result = await AdminService.createGST(finalData);
        if (result) {
            response.status = 200;
            response.message = "Data Created Successfully.";
            response.body = result;
        } else {
            response.status = 200;
            response.message = "Data Not Created";
            response.body = {};
        };
    } catch (error) {
        console.log(`Something went wrong: controller: createGST: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: createGST`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
};

module.exports.getGST = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { t_userId } = req.body;

        let search_key = {};
        if (t_userId) search_key["created_by"] = t_userId;

        let result = await AdminService.findGST(search_key);
        if (result.length) {
            let finalData = [];
            for (let item of result) {
                let CreateBy = await UserService.getUsers({ id: item.created_by });
                let newData = {
                    id: item.id ? item.id : "",
                    title: item.title ? item.title : "",
                    total_rate: item.total_rate,
                    cgst: item.cgst,
                    sgst: item.sgst,
                    igst: item.igst,
                    type: item.type ? item.type : "",
                    created_by: CreateBy.length ? {
                        id: CreateBy[0].id ? CreateBy[0].id : "",
                        name: CreateBy[0].company_name ? CreateBy[0].company_name : "",
                        mobile: CreateBy[0].mobile ? CreateBy[0].mobile : "",
                        email: CreateBy[0].email ? CreateBy[0].email : "",
                    } : {},
                    created_at: moment(item.created_at).format("DD-MM-YYYY"),
                    is_active: 1,
                    is_deleted: 0
                };
                finalData.push(newData);
            };
            response.status = 200;
            response.message = "GST Get Sucessfully";
            response.body = finalData;
        } else {
            response.status = 202;
            response.message = "No Data Found.";
            response.body = [];
        };
    } catch (error) {
        console.log(`Something went wrong: controller: getGST: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: getGST`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
};