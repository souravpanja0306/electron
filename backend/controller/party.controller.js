// Package...
const moment = require("moment");

// Contents...
const contents = require("../content/contents");

// Services...
const PartyService = require("../service/party.service");
const AuthService = require("../service/auth.service")
const InvoiceService = require("../service/invoice.service");

const errorHandler = (res, status, message) => {
    return res.status(status).json({ status, message, body: [] });
};

exports.addParty = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { t_userId } = req.body;

        let isMobileExist = await PartyService.getParty({ mobile: req.body.mobile });
        if (isMobileExist.length) {
            response.status = 409;
            response.message = "Mobile number already registered.";
            response.body = [];
            return res.status(response.status).json(response);
        };
        let isEmailExist = await PartyService.getParty({ mobile: req.body.email });
        if (isEmailExist.length) {
            response.status = 409;
            response.message = "Email already registered.";
            response.body = [];
            return res.status(response.status).json(response);
        };

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

        let result = await PartyService.createParty(finalData);

        response.status = 200;
        response.message = "Data created successfully.";
        response.body = result;
    } catch (error) {
        console.log(error)
    };
    console.log(response.status)
    return res.status(response.status).json(response);
};

exports.listParty = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { id } = req.query;

        let search_key = {};
        if (id) search_key["id"] = id;

        let result = await PartyService.getParty(search_key);

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
        console.log(error);
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

        let result = await PartyService.deleteParty({ ids: ids });

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
        console.log(error);
    };
    return res.status(response.status).json(response);
};