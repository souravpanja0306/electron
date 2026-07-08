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
const SettingService = require("../service/setting.service")

// DB Connection...
const { dbPath } = require("../database/connection");

const errorHandler = (res, status, message) => {
    return res.status(status).json({ status, message, body: [] });
};

module.exports.addChallanSetting = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { company_id, prefix, suffix, starting, terms, remarks } = req.body;

        let finalData = {
            company_id: company_id,
            prefix: prefix,
            suffix: suffix,
            starting: starting,
            terms: terms,
            remarks: remarks,
        };
        let isExist = await SettingService.getChallanSetting({ company_id: company_id });
        if (isExist.length) {
            const result = await SettingService.updateChallanSetting({
                id: isExist[0].id,
                data: finalData
            });
            if (result) {
                response.status = 200;
                response.message = "Challan setting updated successfully.";
                response.body = result;
            } else {
                response.status = 202;
                response.message = "Something went wrong, please try again.";
                response.body = [];
            };
        } else {
            const result = await SettingService.createChallanSetting(finalData);
            if (result) {
                response.status = 200;
                response.message = "Challan setting added successfully.";
                response.body = result;
            } else {
                response.status = 202;
                response.message = "Something went wrong, please try again.";
                response.body = [];
            };
        };
    } catch (error) {
        console.log(`Something went wrong: controller: addChallanSetting: ${error}`);
        return errorHandler(res, 500, "Internal Server Error");
    };
    return res.status(response.status).json(response);
};

module.exports.listChallanSetting = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { company_id } = req.query;

        let search_key = {};
        if (company_id) search_key["company_id"] = parseInt(company_id);

        const result = await SettingService.getChallanSetting(search_key);
        if (result.length) {
            response.status = 200;
            response.message = "Challan settings fetched successfully.";
            response.body = result;
        } else {
            response.status = 202;
            response.message = "Something went wrong, please try again.";
            response.body = [];
        };
    } catch (error) {
        console.log(`Something went wrong: controller: listChallanSetting: ${error}`);
        return errorHandler(res, 500, "Internal Server Error");
    };
    return res.status(response.status).json(response);
};

module.exports.editChallanSetting = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { id } = req.params;

        const result = await SettingService.updateChallanSetting(id, req.body);
        if (result) {
            response.status = 200;
            response.message = "Challan setting updated successfully.";
            response.body = result;
        } else {
            response.status = 202;
            response.message = "Something went wrong, please try again.";
            response.body = [];
        };
    } catch (error) {
        console.log(`Something went wrong: controller: editChallanSetting: ${error}`);
        return errorHandler(res, 500, "Internal Server Error");
    };
    return res.status(response.status).json(response);
};