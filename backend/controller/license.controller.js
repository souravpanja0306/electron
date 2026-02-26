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
const LicenseService = require("../service/license.service");

const errorHandler = (res, status, message) => {
    return res.status(status).json({ status, message, body: [] });
};

exports.keyValidate = async (req, res) => {
    let response = { ...contents.defaultResponse };
    try {
     
    } catch (error) {
        console.log(`Something went wrong: controller: keyValidate: ${error}`);
        response.status = error.status ? error.status : 500;
        response.message = error.message ? error.message : `Something went wrong: controller: keyValidate`;
        response.body = error.body ? error.body : "";
    };
    return res.status(response.status).json(response);
};