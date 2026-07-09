// Package...
const moment = require("moment");
const { app } = require("electron");

// Contents...
const contents = require("../content/contents");

// Services...
const PartyService = require("../service/party.service");
const AuthService = require("../service/auth.service")
const InvoiceService = require("../service/invoice.service");

const errorHandler = (res, status, message) => {
    return res.status(status).json({ status, message, body: [] });
};

module.exports.addParty = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { t_userId } = req.body;

        // let isMobileExist = await PartyService.getParty({ mobile: req.body.mobile });
        // if (isMobileExist.length) return errorHandler(res, 409, "Mobile number already registered.");

        // let isEmailExist = await PartyService.getParty({ email: req.body.email });
        // if (isEmailExist.length) return errorHandler(res, 409, "Email already registered.");

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
        console.log(`Something went wrong: controller: addParty: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: addParty`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
};

module.exports.listParty = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { t_userId } = req.body;
        const { id } = req.query;

        let search_key = {};
        if (id) search_key["id"] = id;
        if (t_userId) search_key["created_by"] = t_userId;

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
        console.log(`Something went wrong: controller: listParty: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: listParty`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
};

module.exports.removeParty = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { t_userId } = req.body;
        const { id } = req.params;
        if (!id) return errorHandler(res, 400, "ID is required.");

        let search_key = { id: id };
        if (t_userId) search_key["created_by"] = t_userId;

        let checkParty = await PartyService.getParty(search_key);
        if (!checkParty.length) return errorHandler(res, 404, "Party not found.");

        let result = await PartyService.deleteParty({ ids: [id] });
        if (result.changes > 0) {
            response.status = 200;
            response.message = "Data deleted succesfully.";
            response.body = result;
        } else {
            response.status = 202;
            response.message = "Data not found.";
            response.body = [];
        };
    } catch (error) {
        console.log(`Something went wrong: controller: removeParty: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: removeParty`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
};

module.exports.editParty = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { id } = req.params;
        const { t_userId } = req.body;

        if (!id) return errorHandler(res, 400, "ID is required.");

        let search_key = { id: id };
        if (t_userId) search_key["created_by"] = t_userId;

        let checkParty = await PartyService.getParty(search_key);
        if (!checkParty.length) return errorHandler(res, 404, "Party not found.");

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
        };

        // Remove undefined fields
        Object.keys(finalData).forEach(key => finalData[key] === undefined && delete finalData[key]);

        let result = await PartyService.updateParty(id, finalData);

        if (result.changes > 0) {
            response.status = 200;
            response.message = "Data updated successfully.";
            response.body = result;
        } else {
            response.status = 202;
            response.message = "No changes made or party not found.";
        }
    } catch (error) {
        console.log(`Something went wrong: controller: editParty: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: editParty`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
};