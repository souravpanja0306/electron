// Package...
const moment = require("moment");

// Contents...
const contents = require("../content/contents");

// Services...
const PartyService = require("../service/party.service");
const AuthService = require("../service/auth.service")
const InvoiceService = require("../service/invoice.service");


exports.debtors = async (req, res) => {
    let response = { ...contents.defaultResponse }
    try {

    } catch (error) {
        console.log(`Something went wrong: controller: debtors: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: debtors`;
        response.body = error.body ? error.body : "";
    };
    return res.json(response).status(response.status);
};

exports.creditors = async (req, res) => {
    let response = { ...contents.defaultResponse }
    try {

    } catch (error) {
        console.log(`Something went wrong: controller: creditors: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: creditors`;
        response.body = error.body ? error.body : "";
    };
    return res.json(response).status(response.status);
};

exports.salesReports = async (req, res) => {
    let response = { ...contents.defaultResponse }
    try {

    } catch (error) {
        console.log(`Something went wrong: controller: salesReports: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: salesReports`;
        response.body = error.body ? error.body : "";
    };
    return res.json(response).status(response.status);
};