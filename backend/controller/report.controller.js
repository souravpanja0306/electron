// Services / helpers...
const ReportService = require("../service/report.service");
const contents = require("../content/contents");
const { errorHandler, toId, isYmd, serverError } = require("../helper/http");

// An optional id filter from the query string: "" when absent, null when invalid.
const optionalId = (value) => (value === undefined || value === "" ? "" : toId(value));

module.exports.debtors = async (req, res) => {
    let response = { ...contents.defaultResponse }
    try {
        const { t_userId } = req.body;
        const company_id = optionalId(req.query.company_id);
        if (company_id === null) return errorHandler(res, 400, "Invalid company.");
        const result = await ReportService.getDebtors({ company_id, created_by: t_userId });

        response.status = 200;
        response.message = "Ledger fetched successfully";
        response.body = result;
    } catch (error) {
        return serverError(res, "controller: debtors", error, "Could not load the report.");
    };
    return res.status(response.status).json(response);
};

module.exports.customerLedger = async (req, res) => {
    let response = { ...contents.defaultResponse }
    try {
        const { t_userId } = req.body;
        const party_id = toId(req.query.party_id);
        const company_id = optionalId(req.query.company_id);
        if (!party_id) return errorHandler(res, 400, "Please select a party.");
        if (company_id === null) return errorHandler(res, 400, "Invalid company.");

        const result = await ReportService.getDebtorsDetails({ party_id, company_id, created_by: t_userId });

        response.status = 200;
        response.message = "Ledger fetched successfully";
        response.body = result;
    } catch (error) {
        return serverError(res, "controller: customerLedger", error, "Could not load the report.");
    };
    return res.status(response.status).json(response);
};

module.exports.dashboardStats = async (req, res) => {
    let response = { ...contents.defaultResponse }
    try {
        const { t_userId } = req.body;
        const company_id = optionalId(req.query.company_id);
        if (company_id === null) return errorHandler(res, 400, "Invalid company.");
        const from = isYmd(req.query.from) ? req.query.from : "";
        const to = isYmd(req.query.to) ? req.query.to : "";
        const result = await ReportService.getDashboardStats({ created_by: t_userId, company_id, from, to });

        response.status = 200;
        response.message = "Dashboard statistics fetched successfully";
        response.body = result;
    } catch (error) {
        return serverError(res, "controller: dashboardStats", error, "Could not load the report.");
    };
    return res.status(response.status).json(response);
};

module.exports.creditors = async (req, res) => {
    let response = { ...contents.defaultResponse }
    try {
        const { t_userId } = req.body;
        const company_id = optionalId(req.query.company_id);
        const result = await ReportService.getCreditors({ company_id, created_by: t_userId });

        response.status = 200;
        response.message = "Creditor ledger fetched successfully";
        response.body = result;

    } catch (error) {
        return serverError(res, "controller: creditors", error, "Could not load the report.");
    };
    return res.status(response.status).json(response);
};

module.exports.salesReports = async (req, res) => {
    try {
        const { t_userId } = req.body;
        const company_id = optionalId(req.query.company_id);
        const party_id = optionalId(req.query.party_id);
        if (company_id === null || party_id === null) return errorHandler(res, 400, "Invalid filter.");
        const from = isYmd(req.query.from) ? req.query.from : "";
        const to = isYmd(req.query.to) ? req.query.to : "";
        if (from && to && from > to) return errorHandler(res, 400, "The start date must be before the end date.");
        const result = await ReportService.getSalesRegister({ created_by: t_userId, company_id, party_id, from, to });
        return res.status(200).json({ status: 200, message: "Sales register fetched successfully", body: result });
    } catch (error) {
        console.log(`Something went wrong: controller: salesReports: ${error}`);
        return errorHandler(res, 500, "Could not load the sales register.");
    };
};
