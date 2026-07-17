// Package...
const moment = require("moment");
const fs = require("fs");
const path = require("path");
const { app } = require("electron");

// Contents...
const contents = require("../content/contents");

// Services...
const UserService = require("../service/user.service");
const AdminService = require("../service/admin.service")
const PartyService = require("../service/party.service");
const AuthService = require("../service/auth.service")
const InvoiceService = require("../service/invoice.service");

// DB Connection...
const { dbPath } = require("../database/connection");

const errorHandler = (res, status, message) => {
    return res.status(status).json({ status, message, body: [] });
};

module.exports.dumpDB = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        if (!fs.existsSync(dbPath)) {
            return errorHandler(res, 404, "Database file not found.");
        };
        res.download(dbPath, "backup.db");
        response.status = 200;
        response.message = "Database backed up Sucessfully";
        response.body = [];
    } catch (error) {
        console.log(`Something went wrong: controller: dumpDB: ${error}`);
        return errorHandler(res, 500, "Internal Server Error");
    };
    return res.status(response.status).json(response);
};

module.exports.resetAllTable = async (req, res) => {
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

module.exports.migrateTable = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        let result = await AdminService.migrateTableData(req.body);
        if (result) {
            response.status = 200;
            response.message = "Table Migrated Sucessfully";
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
        if (isExits.length) return errorHandler(res, 409, "This Data is Allready Created.");

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
                    gst_rate: item.gst_rate,
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

module.exports.updateHsnSac = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { id, code, description, gst_rate, type } = req.body;
        if (!id) return errorHandler(res, 400, "ID is required.");

        let updateData = {
            code,
            type,
            description,
            gst_rate
        };

        let result = await AdminService.updateHSNSAC(id, updateData);
        if (result.changes) {
            response.status = 200;
            response.message = "Data Updated Successfully.";
            response.body = result;
        } else {
            response.status = 202;
            response.message = "No changes made or data not found.";
        }
    } catch (error) {
        console.log(`Something went wrong: controller: updateHsnSac: ${error}`);
        response.status = 500;
        response.message = error.message || "Internal Server Error";
    }
    return res.status(response.status).json(response);
};

module.exports.deleteHsnSac = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { id } = req.params;
        if (!id) return errorHandler(res, 400, "ID is required.");

        let result = await AdminService.deleteHSNSAC(id);
        if (result.changes) {
            response.status = 200;
            response.message = "Data Deleted Successfully.";
        } else {
            response.status = 202;
            response.message = "Data not found.";
        }
    } catch (error) {
        console.log(`Something went wrong: controller: deleteHsnSac: ${error}`);
        response.status = 500;
        response.message = error.message || "Internal Server Error";
    }
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
        if (isExits.length) return errorHandler(res, 409, "This Data is Allready Created.");

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

module.exports.updateGST = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { id, title, total_rate, cgst, sgst, igst, type } = req.body;
        if (!id) return errorHandler(res, 400, "ID is required.");

        let updateData = {
            title,
            total_rate,
            cgst,
            sgst,
            igst,
            type
        };

        let result = await AdminService.updateGST(id, updateData);
        if (result.changes) {
            response.status = 200;
            response.message = "Data Updated Successfully.";
            response.body = result;
        } else {
            response.status = 202;
            response.message = "No changes made or data not found.";
        }
    } catch (error) {
        console.log(`Something went wrong: controller: updateGST: ${error}`);
        response.status = 500;
        response.message = error.message || "Internal Server Error";
    }
    return res.status(response.status).json(response);
};

module.exports.deleteGST = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { id } = req.params;
        if (!id) return errorHandler(res, 400, "ID is required.");

        let result = await AdminService.deleteGST(id);
        if (result.changes) {
            response.status = 200;
            response.message = "Data Deleted Successfully.";
        } else {
            response.status = 202;
            response.message = "Data not found.";
        }
    } catch (error) {
        console.log(`Something went wrong: controller: deleteGST: ${error}`);
        response.status = 500;
        response.message = error.message || "Internal Server Error";
    }
    return res.status(response.status).json(response);
};

module.exports.createCHA = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { t_userId, name, mobile, address } = req.body;
        if (!name) return errorHandler(res, 400, "CHA Name is required.");

        let search_key = {};
        if (t_userId) search_key["created_by"] = t_userId;
        if (name) search_key["name"] = name;

        let isExits = await AdminService.findCHA(search_key);
        if (isExits.length) return errorHandler(res, 409, "This CHA is Already Created.");

        let finalData = {
            name: name,
            mobile: mobile,
            address: address,
            created_by: t_userId,
        };
        let result = await AdminService.createCHA(finalData);
        if (result) {
            response.status = 200;
            response.message = "CHA Created Successfully.";
            response.body = result;
        } else {
            response.status = 200;
            response.message = "CHA Not Created";
            response.body = {};
        };
    } catch (error) {
        console.log(`Something went wrong: controller: createCHA: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: createCHA`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
};

module.exports.getCHA = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { t_userId } = req.body;

        let search_key = {};
        if (t_userId) search_key["created_by"] = t_userId;

        let result = await AdminService.findCHA(search_key);
        if (result.length) {
            let finalData = [];
            for (let item of result) {
                let CreateBy = await UserService.getUsers({ id: item.created_by });
                let newData = {
                    id: item.id,
                    name: item.name,
                    mobile: item.mobile,
                    address: item.address,
                    created_by: CreateBy.length ? {
                        id: CreateBy[0].id ? CreateBy[0].id : "",
                        name: CreateBy[0].company_name ? CreateBy[0].company_name : "",
                        mobile: CreateBy[0].mobile ? CreateBy[0].mobile : "",
                        email: CreateBy[0].email ? CreateBy[0].email : "",
                    } : {},
                    created_at: moment(item.created_at).format("DD-MM-YYYY"),
                    is_active: item.is_active,
                    is_deleted: item.is_deleted
                };
                finalData.push(newData);
            };
            response.status = 200;
            response.message = "CHA Get Successfully";
            response.body = finalData;
        } else {
            response.status = 202;
            response.message = "No Data Found.";
            response.body = [];
        };
    } catch (error) {
        console.log(`Something went wrong: controller: getCHA: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: getCHA`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
};

module.exports.updateCHA = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { id, name, mobile, address } = req.body;
        if (!id) return errorHandler(res, 400, "ID is required.");

        let updateData = {
            name,
            mobile,
            address
        };

        let result = await AdminService.updateCHA(id, updateData);
        if (result.changes) {
            response.status = 200;
            response.message = "CHA Updated Successfully.";
            response.body = result;
        } else {
            response.status = 202;
            response.message = "No changes made or CHA not found.";
        }
    } catch (error) {
        console.log(`Something went wrong: controller: updateCHA: ${error}`);
        response.status = 500;
        response.message = error.message || "Internal Server Error";
    }
    return res.status(response.status).json(response);
};

module.exports.deleteCHA = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { id } = req.params;
        if (!id) return errorHandler(res, 400, "ID is required.");

        let result = await AdminService.deleteCHA(id);
        if (result.changes) {
            response.status = 200;
            response.message = "CHA Deleted Successfully.";
            response.body = result;
        } else {
            response.status = 202;
            response.message = "CHA not found.";
        }
    } catch (error) {
        console.log(`Something went wrong: controller: deleteCHA: ${error}`);
        response.status = 500;
        response.message = error.message || "Internal Server Error";
    }
    return res.status(response.status).json(response);
};