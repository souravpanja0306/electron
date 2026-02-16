// Package...
const moment = require("moment");

// Contents...
const contents = require("../content/contents");

// Services...
const PartyService = require("../service/party.service");
const AuthService = require("../service/auth.service");
const CompanyService = require("../service/company.service")
const InvoiceService = require("../service/invoice.service");

const errorHandler = (res, status, message) => {
    return res.status(status).json({ status, message, body: [] });
};

exports.addCompany = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { t_userId } = req.body;

        let isMobileExist = await CompanyService.getCompany({ mobile: req.body.mobile });
        if (isMobileExist.length) return errorHandler(res, 409, "Mobile number already registered.");

        let isEmailExist = await CompanyService.getCompany({ mobile: req.body.email });
        if (isEmailExist.length) return errorHandler(res, 409, "Email Id already registered.");

        let finalData = {
            company_name: req.body.company_name,
            email: req.body.email,
            mobile: req.body.mobile,
            owner: req.body.owner,
            address_1: req.body.address_1,
            address_2: req.body.address_2,
            city: req.body.city,
            state: req.body.state,
            district: req.body.district,
            pincode: req.body.pincode,
            country: req.body.country,
            gst: req.body.gst,
            pan: req.body.pan,
            trade_licence: req.body.trade_licence,
            bank: req.body.bank,
            ifse: req.body.ifse,
            branch: req.body.branch,
            account_no: req.body.account_no,
            created_by: t_userId,
        };

        let result = await CompanyService.createCompany(finalData);

        response.status = 200;
        response.message = "Data created successfully.";
        response.body = result;
    } catch (error) {
        console.log(`Something went wrong: controller: addCompany: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: addCompany`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
};

exports.getCompany = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { t_userId } = req.body;
        const { id } = req.query;

        let search_key = {};
        if (id) search_key["id"] = id;
        if (t_userId) search_key["created_by"] = t_userId;

        let result = await CompanyService.getCompany(search_key);

        if (result.length) {
            response.status = 200;
            response.message = "Data fetched succesfully.";
            response.body = result;
        } else {
            response.status = 202;
            response.message = "Data not found.";
            response.body = [];
        };
    } catch (error) {
        console.log(`Something went wrong: controller: getCompany: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: getCompany`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
};

exports.removeParty = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { ids } = req.body;
        if (!ids) {
            response.status = 400;
            response.message = "IDs are required";
            response.body = [];
            return res.status(response.status).json(response);
        };

        let result = await CompanyService.deleteParty({ ids: ids });

        if (result.length) {
            response.status = 200;
            response.message = "Data deleted succesfully.";
            response.body = result;
        } else {
            response.status = 202;
            response.message = "Data not found.";
            response.body = [];
        };
    } catch (error) {
        console.log(`Something went wrong: controller: getCompany: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: getCompany`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
};