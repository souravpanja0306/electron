// Package...
const moment = require("moment");

// Contents...
const contents = require("../content/contents");

// Services...
const ReportService = require("../service/report.service");
const PartyService = require("../service/party.service");
const AuthService = require("../service/auth.service")
const InvoiceService = require("../service/invoice.service");

const errorHandler = (res, status, message) => {
    return res.status(status).json({ status, message, body: [] });
};

exports.debtors = async (req, res) => {
    let response = { ...contents.defaultResponse }
    try {
        const { party_id } = req.query;

        const result = await ReportService.getDebtors({ party_id: party_id });

        response.status = 200;
        response.message = "Ledger fetched successfully";
        response.body = result;
    } catch (error) {
        console.log(`Something went wrong: controller: debtors: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: debtors`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
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
    return res.status(response.status).json(response);
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
    return res.status(response.status).json(response);
};