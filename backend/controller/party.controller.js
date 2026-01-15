// Package...
const moment = require("moment");

// Contents...
const contents = require("../content/contents");

// Services...
const PartyService = require("../service/party.service");
const AuthService = require("../service/auth.service")
const InvoiceService = require("../service/invoice.service");


exports.addParty = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        let isMobileExist = await PartyService.getParty({ mobile: req.body.mobile });
        if (isMobileExist.length) {
            response.status = 409;
            response.message = "Mobile number already registered.";
            response.body = [];
            return res.json(response).status(response.status);
        };
        let isEmailExist = await PartyService.getParty({ mobile: req.body.email });
        if (isEmailExist.length) {
            response.status = 409;
            response.message = "Email already registered.";
            response.body = [];
            return res.json(response).status(response.status);
        };

        let result = await PartyService.createParty(req.body);

        response.status = 200;
        response.message = "Data created successfully.";
        response.body = result;
    } catch (error) {
        console.log(error)
    };
    return res.json(response).status(response.status);
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
            response.status = 204;
            response.message = "Data not found.";
            response.body = [];
        };
    } catch (error) {
        console.log(error);
    };
    return res.json(response).status(response.status);
};

exports.removeParty = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
        const { ids } = req.body;
        if (!ids) {
            response.status = 400;
            response.message = "IDs are required";
            response.body = [];
            return res.json(response).status(response.status);
        };

        let result = await PartyService.deleteParty({ ids: ids });

        if (result.length) {
            response.status = 200;
            response.message = "Data deleted succesfully.";
            response.body = result;
        } else {
            response.status = 204;
            response.message = "Data not found.";
            response.body = [];
        };

    } catch (error) {
        console.log(error);
    };
    return res.json(response).status(response.status);
};