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
        console.log(`Something went wrong: controller: createHsnSac: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: createHsnSac`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
}